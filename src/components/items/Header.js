import "./styles.css";
import React, { Component } from 'react';
import { auth } from '../../firebase';
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import signout from "../../assets/signout.png";

function Header(props) {
  const isLogout = props.isLogout;
  let navigate = useNavigate();

  const handleLogOut = () => {
    auth.signOut();
    sessionStorage.clear();
    navigate("/");
  };
  return (
    <div className="header-container">
      <div className="header-img-logo-container">
        <img src={logo} className="header-img-logo" />
        <div className="header-title">| Ticket Manager</div>
      </div>
      {isLogout && (
        <div className="header-logout-link">
          <a className="header-logout-a" onClick={handleLogOut}>
            {/*Deconnexion*/}
            <img src={signout} className="header-logout-img" />
          </a>
        </div>
      )}
    </div>
  );
}

export default Header;