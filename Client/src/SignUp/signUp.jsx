import React from "react";
import styles from "./signUp.module.css"
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [errorMessage, setErrorMessage] = useState("");
    const [succesMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const res = await axios.post("http://localhost:5055/profiles", formData);
            console.log("Response:", res.data);
            setSuccessMessage("Sign-up successful!");
            setTimeout(() => {
                window.location.href = "/signin"; 
              }, 1000);
        } catch (err) {
            if (err.response && err.response.data.error) {
                setErrorMessage(err.response.data.error); 
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <h2>Sign Up</h2>
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            {succesMessage && <p className={styles.success}>{succesMessage}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
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
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
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
                    Sign Up
                </button>
            </form>
            <h4>Account already exists? <Link to={"/signin"}>Sign in</Link></h4>
        </div>
    );
};

export default SignUp;