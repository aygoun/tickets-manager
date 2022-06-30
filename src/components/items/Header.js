import "./styles.css";
import React, { Component } from 'react';

export class Header extends Component {
  render() {
    return (
      <div className="header-container">
        <img src="https://festival-aix.com/sites/all/themes/flaix2019/assets/img/logo.svg" className="header-img-logo-festival"/>
        <div className="header-title">| Ticket Manager</div>
      </div>
    )
  }
}

export default Header