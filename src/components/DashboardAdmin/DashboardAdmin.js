import "./DashboardAdmin.css";
import React, { useEffect, useState } from "react";
import Header from "../items/Header";
import { auth, db } from "../../firebase";
import plus from "../../assets/plus.png";
import TicketDetail from "../items/TicketDetail";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import users from "../../assets/users.png";


function DashboardAdmin() {
  let navigate = useNavigate();

  const userEmail = sessionStorage.getItem("userEmail");
  const [userTickets, setUserTickets] = useState([]);
  const [noTickets, setNoTickets] = useState("");
  const [openNb, setOpenNb] = useState([]);
  const [closedNb, setClosedNb] = useState([]);
  const [affectedNb, setAffectedNb] = useState([]);
  const [suspendedNb, setSuspendedNb] = useState([]);

  const fetchTickets = async () => {
    const q = query(collection(db, "tickets"), where("from", "==", userEmail), orderBy("date", "desc"));
      const querySnapshot = onSnapshot (q, (querySnapshot) => {
        const tickets = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        if (tickets.length === 0) {
          setNoTickets("Aucun ticket");
        }else{
          setNoTickets("");
          setUserTickets(tickets);
          setOpenNb([]);
          setClosedNb([]);
          setAffectedNb([]);
          setSuspendedNb([]);
          tickets.forEach(element => {
            switch (element.status) {
              case "open":
                setOpenNb(openNb => [...openNb, element]);
                break;
              case "closed":
                setClosedNb(closedNb => [...closedNb, element]);
                break;
              case "affected":
                setAffectedNb(affectedNb => [...affectedNb, element]);
                break;
              case "suspended":
                setSuspendedNb(suspendedNb => [...suspendedNb, element]);
                break;
              default:
                break;
            }
          });
        }
      }
      );
  };

  useEffect(() => {
    if (Object.entries(userTickets).length === 0 && noTickets === "") {
      fetchTickets();
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
          <a href="" onClick={() => navigate("/users-management")} style={{marginRight: 25}}>
            <img
              src={users}
              className="dashboard-content-header-newTicketButton"
            />
          </a>
        </div>
        <div className="dashboard-content-body">
          <div className="dashboard-content-title">Tickets :</div>
          <div className="dashboard-content-body-subcontainer">
            <div className="dashboard-content-body-filtermenu">
              <span onClick={() => setUserTickets(openNb)} className="dashboard-content-body-menu">
                <div className="dashboard-content-filter-choices">OUVERT ({openNb.length})</div>
              </span>
              <span onClick={() => setUserTickets(affectedNb)} className="dashboard-content-body-menu">
                <div className="dashboard-content-filter-choices">
                  AFFECTÉ ({affectedNb.length})
                </div>
              </span>
              <span onClick={() => setUserTickets(suspendedNb)} className="dashboard-content-body-menu">
                <div className="dashboard-content-filter-choices">SUSPENDU ({suspendedNb.length})</div>
              </span>
              <span onClick={() => setUserTickets(closedNb)} className="dashboard-content-body-menu">
                <div className="dashboard-content-filter-choices" style={{borderBottom: '0px solid'}}>FERMÉ ({closedNb.length})</div>
              </span>
            </div>
            <div className=" dashboard-content-body-content-container">
              {userTickets &&
                userTickets.map((ticket, key) => {
                  return <TicketDetail ticket={ticket} key={key} />;
                })}
              {<h3 align="center">{noTickets}</h3>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;