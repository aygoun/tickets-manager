import React, { useState } from "react";
import "./styles.css";
import arrow from "../../assets/arrow.png";


function TicketDetail() {
  return (
    <div className="ticket-preview-container">
      <div className="ticket-preview-subcontainer">
        <div className="ticket-preview-tag-container flex1">
          Logiciels
        </div>
        <div className="ticket-preview-subject-container flex1">
          SecuTix problème de connexion
        </div>
        <div className="ticket-preview-info-container flex1">
          <a href=""><img src={arrow} className="ticket-preview-info-img" width="35" /></a>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
