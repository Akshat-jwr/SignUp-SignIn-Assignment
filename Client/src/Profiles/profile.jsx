import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./profile.module.css";
import { Link } from "react-router-dom";

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [newValues, setNewValues] = useState({});
    const [passwords, setPasswords] = useState({ current: "", new: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        axios.get(`http://localhost:5055/profile/${username}`, {
            headers: { Authorization: token }
        })
            .then((res) => setProfile(res.data))
            .catch(() => navigate("/signin"));
    }, [username, navigate]);

    const updateField = async (field) => {
        if (!newValues[field] || newValues[field] === profile[field]) {
            return;
        }

        try {
            const res = await axios.put(
                `http://localhost:5055/profile/update`,
                { [field]: newValues[field] },
                { headers: { Authorization: localStorage.getItem("token") } }
            );

            setProfile((prev) => ({ ...prev, [field]: newValues[field] }));
            setEditingField(null);
            setError("");
        } catch (err) {
            if (err.response?.status === 409) {
                setError(`${field === "username" ? "Username" : "Email"} already taken!`);
            } else {
                setError("Failed to update. Try again!");
            }
        }
    };

    const changePassword = async () => {
        if (!passwords.current || !passwords.new) {
            setError("Both password fields are required!");
            return;
        }

        try {
            await axios.put(
                `http://localhost:5055/profile/change-password`,
                passwords,
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            alert("Password updated successfully!");
            setPasswords({ current: "", new: "" });
            setError("");
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Incorrect current password!");
            } else {
                setError("Failed to update password. Try again!");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };
    

    return (
        <div className={styles.container}>
            {profile ? (
                <>
                    <h1>Welcome, {profile.username}!</h1>

                    <p>
                        Username:
                        {editingField === "username" ? (
                            <>
                                <input
                                    type="text"
                                    value={newValues.username || profile.username}
                                    onChange={(e) => setNewValues({ ...newValues, username: e.target.value })}
                                />
                                <button className={styles.but} onClick={() => updateField("username")}>✔</button>
                            </>
                        ) : (
                            <>
                                {profile.username}
                                <button className={styles.but} onClick={() => setEditingField("username")}>Edit</button>
                            </>
                        )}
                    </p>

                    <p>
                        Email:
                        {editingField === "email" ? (
                            <>
                                <input
                                    type="email"
                                    value={newValues.email || profile.email}
                                    onChange={(e) => setNewValues({ ...newValues, email: e.target.value })}
                                />
                                <button className={styles.but} onClick={() => updateField("email")}>✔</button>
                            </>
                        ) : (
                            <>
                                {profile.email}
                                <button className={styles.but} onClick={() => setEditingField("email")}>Edit</button>
                            </>
                        )}
                    </p>

                    <h3>Change Password</h3>
                    <input
                        type="password"
                        placeholder="Current password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="New password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                    <button className={styles.butpas} onClick={changePassword}>Update Password</button>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <Link to="/profile-list" className={styles.link}>
                        View All Profiles
                    </Link>

                    <button className={styles.butLogout} onClick={handleLogout}>Logout</button>


                </>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Profile;
