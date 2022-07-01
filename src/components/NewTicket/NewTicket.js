import React from "react";
import Header from "../items/Header";
import "./NewTicket.css";
import { useNavigate } from "react-router-dom";

function NewTicket() {
  let navigate = useNavigate();

  return (
    <div>
      <Header isLogout={true} />
      <div className="newticket-maincontainer">
        <div className="newticket-subcontainer">
          <div className="newticket-header-container flex1">
            <h2>Nouveau Ticket</h2>
          </div>
          <div className="newticket-ticket-header-container flex1">
            <div className="newticket-tag-input-container">
              <input
                type="text"
                placeholder="TAG"
                className="newticket-input"
              />
            </div>
            <div className="newticket-subject-input-container">
              {" "}
              <input
                type="text"
                placeholder="Sujet du ticket"
                className="newticket-subject-input newticket-input"
              />
            </div>
          </div>

          <div className="newticket-body-input-container flex1">
            <textarea
              type="text"
              placeholder="Remarques"
              className="newticket-body-input newticket-input"
            />
          </div>
          <div className="flex1 newticket-validate-button-container">
            <div className="newticket-submit-button-container">
              <a href="" className="newticket-submit-button">
                Valider
              </a>
            </div>
            <div className="newticket-cancel-button-flex-none">
              <a href="#" className="newticket-cancel-text" onClick={() => navigate("/dashboard")}>
                Annuler
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewTicket;
