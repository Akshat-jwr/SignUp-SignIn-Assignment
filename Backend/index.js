const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const profileModel = require("./Profiles/profiles");
require("dotenv").config();
const generateVerificationToken = require('./utils/tokenGenerator');
const sendVerificationEmail = require('./utils/emailSender');

const PORT = process.env.PORT || 5055;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

    
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; 
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        req.user = decoded;
        next();
    });
};


app.post('/profiles', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields (username, email, password) are required." });
        }
        
        const existingUser = await profileModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: existingUser.username === username ? "Username already exists!" : "Email already registered!" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = Date.now() + 300000;

        const profile = await profileModel.create({ 
            username, 
            email, 
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires
        });

        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: "Profile created successfully. Please check your email to verify your account.", profile });
    } catch (err) {
        console.error("Error saving profile:", err.message || err);
        res.status(500).json({ error: "Server error. Please try again." });
    }
});


app.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        const user = await profileModel.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token." });
        }

        if (user.verificationTokenExpires < Date.now()) {
            return res.status(400).json({ error: "Token has expired. Please request a new verification email." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: "Email verified successfully!" });
    } catch (err) {
        console.error("Email verification error:", err);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});


app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await profileModel.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "User not found. Please check your username." });
        }

        if (!user.isVerified) {
            const verificationToken = generateVerificationToken();
            user.verificationToken = verificationToken;
            user.verificationTokenExpires = Date.now() + 300000; 
            await user.save();

            await sendVerificationEmail(user.email, verificationToken);

            return res.status(400).json({ error: "Email not verified. A new verification link has been sent to your email." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password. Please try again." });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Sign In complete", token, username: user.username });
    } catch (err) {
        console.error("Sign-in error:", err);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});


app.get("/profile/:username", authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== req.params.username) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        
        const userProfile = await profileModel.findOne({ username: req.params.username }).select("-password");
        if (!userProfile) {
            return res.status(404).json({ error: "Profile not found" });
        }
        
        res.json(userProfile);
    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});


app.put("/profile/update", authenticateToken, async (req, res) => {
    const { username, email } = req.body;
    const userId = req.user.id;

    const existingUser = await profileModel.findOne({ 
        $or: [{ username }, { email }], 
        _id: { $ne: userId }
    });

    if (existingUser) {
        return res.status(409).json({ message: "Username or email already exists" });
    }

    await profileModel.findByIdAndUpdate(userId, { username, email });
    res.json({ message: "Updated successfully!" });
});


app.put("/profile/change-password", authenticateToken, async (req, res) => {
    const { current, new: newPassword } = req.body;
    const user = await profileModel.findById(req.user.id);

    if (!user || !(await bcrypt.compare(current, user.password))) {
        return res.status(401).json({ message: "Incorrect current password!" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated!" });
});


app.get("/profiles", async (req, res) => {
    try {
        const profiles = await profileModel.find({ isVerified: true }, "username");
        res.json(profiles);
    } catch (err) {
        console.error("Error fetching profiles:", err);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});


app.listen(PORT, () => {
    console.log("Server is running on port 5055");
});
