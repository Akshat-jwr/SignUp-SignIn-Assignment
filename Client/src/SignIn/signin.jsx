import React, { useState } from "react";
import styles from "./signin.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setErrorMessage(""); 
        setSuccessMessage(""); 
    
        try {
            const res = await axios.post("http://localhost:5055/signin", formData);
    
            localStorage.setItem("token", `Bearer ${res.data.token}`);
            localStorage.setItem("username", res.data.username);
            setSuccessMessage("Sign In successful!");
    
            setTimeout(() => {
                navigate(`/profile/${res.data.username}`);
            }, 1000);
        } catch (err) {
            if (err.response && err.response.data.error === "Email not verified. A new verification link has been sent to your email.") {
                setErrorMessage("Email not verified. A new verification link has been sent to your email.");
            } else {
                setErrorMessage(err.response?.data?.error || "Login failed");
            }
        }
    };


    return (
        <div className={styles.container}>
            <h2>Sign In</h2>

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            <form onSubmit={handleSignIn} className={styles.form}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <button type="submit" className={styles.button}>
                    Sign In
                </button>
            </form>
            <h4>New here? Create Account: <Link to={"/signup"}>Sign up</Link></h4>
        </div>
    );
};

export default SignIn;
