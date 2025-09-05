// src/pages/Login.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔑 Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setUser(user);

      // ✅ Save/update user in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email,
          photoURL: user.photoURL || "",
          lastLogin: new Date(),
        },
        { merge: true }
      );

      navigate("/profile");
    } catch (err) {
      console.error("❌ Email login error:", err);

      // ✅ Better error messages
      if (err.code === "auth/wrong-password") {
        setError("Wrong password. Try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else {
        setError("Login failed. " + err.message);
      }
    }
  };

  // 🔗 Google Sign-In
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ✅ Save Google user in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email,
          photoURL: user.photoURL || "",
          lastLogin: new Date(),
        },
        { merge: true }
      );

      setUser(user);
      navigate("/profile");
    } catch (err) {
      console.error("❌ Google login error:", err);
      setError("Google login failed. " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit">Login</button>
      </form>

      <p>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>

      <hr />

      <button className="google-btn" onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
