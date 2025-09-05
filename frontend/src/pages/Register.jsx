import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // ✅ Reuse same CSS for consistency

const Register = ({ setUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✨ Email/Password Register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // ✅ Create account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Update display name
      if (name) {
        await updateProfile(user, { displayName: name });
      }

      // ✅ Save new user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name || "",
        email: user.email,
        photoURL: user.photoURL || "",
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      setUser(user);
      navigate("/profile");
    } catch (err) {
      console.error("❌ Registration error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Try logging in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Registration failed. " + err.message);
      }
    }
  };

  // 🔗 Google Sign-Up
  const handleGoogleRegister = async () => {
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
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        { merge: true }
      );

      setUser(user);
      navigate("/profile");
    } catch (err) {
      console.error("❌ Google registration error:", err);
      setError("Google sign-up failed. " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Register</h2>

      <form onSubmit={handleRegister} className="login-form">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>

      <hr />

      <button className="google-btn" onClick={handleGoogleRegister}>
        Sign up with Google
      </button>
    </div>
  );
};

export default Register;
