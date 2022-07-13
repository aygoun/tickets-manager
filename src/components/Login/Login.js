import "./Login.css";
import React, { useState } from "react";
import Header from "../items/Header";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Footer from "../items/Footer";

function Login() {
  let navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [passwordForgotten, setPasswordForgotten] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClickOpen2 = () => {
    setOpen2(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleClose2 = () => {
    setOpen2(false);
  };

  const handleSubmit = () => {
    console.log("Button pressed")
    const emailSplited = email.split("@");
    if (
      email.length < 17 ||
      password.length < 6 ||
      emailSplited.length != 2 ||
      emailSplited[1] != "festival-aix.com"
    ) {
      alert("Veuillez remplir tous les champs");
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          sessionStorage.setItem("userUID", user.uid);
          sessionStorage.setItem("userEmail", email);
          navigate("/dashboard");
          console.log("USER SIGN IN AS: " + email);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert("An error occured: " + errorMessage);
        });
    }
  };

  const handleForgottenPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, passwordForgotten)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode);
      });
  };
  return (
    <div>
      <Header isLogout={false} />
      <div className="login-container">
        <div className="login-form">
          <div className="login-form-header">
            <h1>Connexion</h1>
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
                onClick={() => handleSubmit()}
              >
                <div className="login-form-validate-text">Valider</div>
              </a>
            </div>
            <div>
              <a
                href="#"
                className="login-form-first-connexion-a login-form-validate-a"
                onClick={handleClickOpen}
              >
                Mot de passe oublié ?
              </a>
              <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Entrer votre email</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Vous recevrez un mail pour modifier votre mot de passe.
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="exemple@festival-aix.com"
                    type="email"
                    fullWidth
                    variant="standard"
                    value={passwordForgotten}
                    onChange={(e) => setPasswordForgotten(e.target.value)}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Annuler</Button>
                  <Button onClick={handleForgottenPassword}>Valider</Button>
                </DialogActions>
              </Dialog>
            </div>
            <div>
              <Button
                variant="outlined"
                onClick={() => navigate("/register")}
                className="login-first-connection-button"
              >
                Première connexion ?
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
