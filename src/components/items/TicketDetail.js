import React from "react";
import "./styles.css";
import arrow from "../../assets/arrow.png";
import remove from "../../assets/remove.png";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function TicketDetail(props) {
  let navigate = useNavigate();
  const ticket = props.ticket;
  const isAdmin = props.isAdmin;

  let dateTmp = new Date(ticket.date.seconds * 1000);
  let dateString = dateTmp.toLocaleDateString();
  let timeString = dateTmp.toLocaleTimeString();
  const date = dateString + " " + timeString;
  const handleDelete = () => {
    const docRef = doc(db, "tickets", "" + ticket.ticketID);
    updateDoc(docRef, { status: "Fermé" });
  };
  
  return (
    <div className="ticket-preview-container">
      <div className="ticket-preview-subcontainer">
        <div className="ticket-preview-tag-container flex1">{ticket.tag}</div>

        <div className="ticket-preview-suject-date-container flex1">
          <div className="ticket-preview-subject-container flex1">
            {ticket.object}
          </div>
          <div className="ticket-preview-date-container flex1">{date}</div>
        </div>

        <div className="ticket-preview-info-container flex1">
          <div className="ticket-preview-info-status-container">
            {ticket.status.toUpperCase()}
          </div>
          <span className="flex1 span-button" onClick={() => handleDelete()}>
            <img src={remove} alt="close" className="ticket-preview-close-img" width="35" />
          </span>
          <span
            className="flex1 span-button"
            onClick={() => {isAdmin ? navigate("/view-ticket:" + ticket.ticketID + ":Y") : navigate("/view-ticket:" + ticket.ticketID + ":N")}}
          >
            <img src={arrow} alt="preview" className="ticket-preview-info-img" width="35" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
