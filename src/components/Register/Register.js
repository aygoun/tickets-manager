import "./Register.css";
import React, { useState } from "react";
import Header from "../items/Header";
import { auth, db } from "../../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Footer from "../items/Footer";

function Register() {
  let navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    const emailSplited = email.split("@");
    if (
      email.length < 17 ||
      password.length < 6 ||
      emailSplited.length != 2 ||
      emailSplited[1] != "festival-aix.com"
    ) {
      alert("Veuillez remplir tous les champs");
    } else {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in user
            const user = userCredential.user;
            sessionStorage.setItem("userUID", user.uid);
            sessionStorage.setItem("userEmail", email);
            // Create user profile
            const userRef = doc(db, "users", email);
            setDoc(userRef, {
              nbTickets: 0,
              email: email,
              uid: user.uid,
              accountVerified: false,
            });
            navigate("/dashboard");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("Erreur: " + errorMessage);
          });
    }
  };

  return (
    <div>
      <Header isLogout={false} />
      <div className="login-container">
        <div className="login-form">
          <div className="login-form-header">
            <h1>S'enregistrer</h1>
          </div>
          <div className="login-form-body">
            <div className="login-form-body-input">
              <input
                type="text"
                placeholder="exemple@festival-aix.com"
                className="login-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="login-form-body-input">
              <input
                type="password"
                placeholder="Mot de passe"
                className="login-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-form-button-container">
              <a
                href="#"
                className="login-form-validate-a"
                onClick={handleSubmit}
              >
                <div className="login-form-validate-text">Valider</div>
              </a>
            </div>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              className="login-first-connection-button"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;
