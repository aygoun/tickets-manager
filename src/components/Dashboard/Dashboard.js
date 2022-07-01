import "./Dashboard.css";
import React, { useEffect, useState } from "react";
import Header from "../items/Header";
import { auth } from "../../firebase";
import plus from "../../assets/plus.png";
import TicketDetail from "../items/TicketDetail";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  let navigate = useNavigate();

  const userEmail = sessionStorage.getItem("userEmail");
  const [userTickets, setUserTickets] = useState([]);
  const [noTickets, setNoTickets] = useState("");

  const handleNewTicket = () => {
    navigate("/new-ticket");
  };

  useEffect(() => {
    if (userTickets.length === 0) {
      setNoTickets("Aucun ticket");
    }
  }, [userTickets]);

  return (
    <div>
      <Header isLogout={true} />
      <div className="dashboard-container">
        <div className="dashboard-header-content">
          <div className="dashboard-content-header-title">
            👋 Bonjour {userEmail} !
          </div>
          <a href="#" onClick={handleNewTicket}>
            <img
              src={plus}
              className="dashboard-content-header-newTicketButton"
            />
          </a>
        </div>
        <div className="dashboard-content-body">
          <div className="dashboard-content-title">Anciens tickets :</div>

          <div>
            {userTickets &&
              userTickets.map((ticket, index) => (
                <TicketDetail key={index} ticket={ticket} />
              ))}
            {<h3 align="center">{noTickets}</h3>}
            <hr />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;