import React, { useState } from "react";
import "./styles.css";
import arrow from "../../assets/arrow.png";
import remove from "../../assets/remove.png";
import { db } from "../../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";



function TicketDetail(props) {
  let navigate = useNavigate();
  const ticket = props.ticket;

  const handleDelete = () => {
    console.log("HELLO: " + ticket.ticketID);
    const docRef = doc(db, "tickets", "" + ticket.ticketID);
    updateDoc(docRef, { status: "closed" });
  };

  return (
    <div className="ticket-preview-container">
      <div className="ticket-preview-subcontainer">
        <div className="ticket-preview-tag-container flex1">{ticket.tag}</div>
        <div className="ticket-preview-subject-container flex1">
          {ticket.object}
        </div>
        <div className="ticket-preview-info-container flex1">
          <div className="ticket-preview-info-status-container">
            {ticket.status.toUpperCase()}
          </div>
          <span className="flex1 span-button" onClick={() => handleDelete()}>
            <img src={remove} className="ticket-preview-close-img" width="35" />
          </span>
          <span className="flex1 span-button" onClick={() => navigate("/view-ticket:"+ ticket.ticketID)}>
            <img src={arrow} className="ticket-preview-info-img" width="35" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
