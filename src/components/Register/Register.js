import "./Register.css";
import React, { useState } from "react";
import Header from "../items/Header";
import { auth, db } from "../../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Footer from "../items/Footer";
import Axios from "axios";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function Register() {
  let navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [tmpPassword, setTmpPassword] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    const emailSplited = email.split("@");
    if (
      email.length < 17 ||
      password.length < 6 ||
      emailSplited.length != 2 ||
      emailSplited[1] != "festival-aix.com"
    ) {
      alert("Veuillez remplir tous les champs");
    } else {
      //send api request
      const response = await Axios('http://192.168.11.245:8080/mail:' + email);
      console.log(response.data);
      if (response.data == "KO") {
        alert("Une erreur est survenue, veuillez réessayer");
      }
      else {
        setVerifiedPassword(response.data);
        handleClickOpen();
      }
      console.log("Sending request");
    }
  };

  const handleAccountCreation = () => {
    if (verifiedPassword === tmpPassword) {
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
          });
          navigate("/dashboard");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert("Erreur: " + errorMessage);
        });
    }
    else {
      alert("Le mot de passe ne correspond pas");
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
              <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Entrer le code à 4 chiffre envoyé sur : {email}</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Vous avez reçu un mail pour vérifier votre compte. <br/>Le délai d'envoi est de d'environ 1 minutes.
                    </DialogContentText>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="name"
                      label="0000"
                      type="text"
                      fullWidth
                      variant="standard"
                      value={tmpPassword}
                      onChange={(e) => setTmpPassword(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button onClick={() => handleAccountCreation()}>Valider</Button>
                  </DialogActions>
                </Dialog>
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
