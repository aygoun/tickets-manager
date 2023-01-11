import "./styles.css";
import React from 'react';
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
      <a href="/dashboard" className="header-left-container">
        <div className="header-img-logo-container">
            <img src={logo} alt="logo" className="header-img-logo" />
            <div className="header-title">| Ticket Manager</div>
        </div>
      </a>
      {isLogout && (
        <div className="header-logout-link">
          <span className="header-logout-a cursor-pointer" onClick={handleLogOut}>
            <img src={signout} alt="logout" className="header-logout-img" />
          </span>
        </div>
      )}
    </div>
  );
}

export default Header;