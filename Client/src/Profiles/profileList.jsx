import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileList.module.css";

const ProfileList = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/signin");
                    return;
                }

                const response = await axios.get("http://localhost:5055/profiles", {
                    headers: { Authorization: token },
                });
                setProfiles(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch profiles. Please try again.");
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [navigate]);

    if (loading) {
        return <div className={styles.container}>Loading profiles...</div>;
    }

    if (error) {
        return <div className={styles.container}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Profile List</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Usernames</th>
                    </tr>
                </thead>
                <tbody>
                    {profiles.map((profile, index) => (
                        <tr key={index}>
                            <td>{profile.username}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProfileList;