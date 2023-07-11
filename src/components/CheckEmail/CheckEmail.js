import React from 'react'
import "./CheckEmail.css";
import { useParams } from 'react-router-dom';
import Footer from "../items/Footer";
import Header from "../items/Header";
import MailIcon from "../../assets/email.png";


const CheckEmail = () => {
  const { email } = useParams();
  return (
    <div>
      <Header />
      <div className="check-email-container">
        <span className="check-email-icon">
          <img src={MailIcon} alt="mail-icon" />
        </span>
        <div>
          <div className="check-email-text">
            Un email de vérification a été envoyé à <span className="email-bold">{email}</span>
          </div>
        </div>
        <a className="login-redirection-button-link" href="/">
          Se connecter
        </a>
      </div>
      <Footer />
    </div>
  );
}

export default CheckEmail