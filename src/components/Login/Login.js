import "./Login.css";
import React, {useState} from "react";
import Header from "../items/Header";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { useNavigate } from "react-router-dom";


function Login() {
  let navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    const emailSplited = email.split("@");
    if (email.length < 17 || password.length < 6 || emailSplited.length < 2 || emailSplited[1] != "festival-aix.com" ) { 
      alert("Veuillez remplir tous les champs");
    }
    else{
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
                onClick={handleSubmit}
              >
                <div className="login-form-validate-text">Valider</div>
              </a>
            </div>
            <div>
              <a href="#" className="login-form-first-connexion-a">
                Première connexion ?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login