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

  //CHECK IF USER ADMIN

  const userEmail = sessionStorage.getItem("userEmail");
  const [allUserTickets, setAllUserTickets] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [noTickets, setNoTickets] = useState("");
  const [open, setOpen] = useState([]);
  const [closed, setClosed] = useState([]);
  const [affected, setAffected] = useState([]);
  const [suspended, setSuspended] = useState([]);

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
          setAllUserTickets(tickets);
          setUserTickets(tickets);
          setOpen([]);
          setClosed([]);
          setAffected([]);
          setSuspended([]);
          tickets.forEach(element => {
            switch (element.status) {
              case "Ouvert":
                setOpen(open => [...open, element]);
                break;
              case "Fermé":
                setClosed(closed => [...closed, element]);
                break;
              case "Affecté":
                setAffected(affected => [...affected, element]);
                break;
              case "Suspendu":
                setSuspended(suspended => [...suspended, element]);
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
    if (Object.entries(allUserTickets).length === 0 && noTickets === "") {
      fetchTickets();
    }
  }, [userTickets]);

  return (
    <div>
      <Header isLogout={true} />
      <div className="dashboard-container">
        <div className="dashboard-header-content">
          <div className="dashboard-content-header-title">
            <span style={{color: 'red'}}>MODE ADMIN</span>
            <br />
            Connecté en {userEmail} !
          </div>
          <a
            href=""
            onClick={() => navigate("/users-management")}
            style={{ marginRight: 25 }}
          >
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
              <span
                onClick={() => setUserTickets(open)}
                className="dashboard-content-body-menu"
              >
                <div className="dashboard-content-filter-choices">
                  OUVERT ({open.length})
                </div>
              </span>
              <span
                onClick={() => setUserTickets(affected)}
                className="dashboard-content-body-menu"
              >
                <div className="dashboard-content-filter-choices">
                  AFFECTÉ ({affected.length})
                </div>
              </span>
              <span
                onClick={() => setUserTickets(suspended)}
                className="dashboard-content-body-menu"
              >
                <div className="dashboard-content-filter-choices">
                  SUSPENDU ({suspended.length})
                </div>
              </span>
              <span
                onClick={() => setUserTickets(closed)}
                className="dashboard-content-body-menu"
              >
                <div
                  className="dashboard-content-filter-choices"
                  style={{ borderBottom: "0px solid" }}
                >
                  FERMÉ ({closed.length})
                </div>
              </span>
            </div>
            <div className=" dashboard-content-body-content-container">
              {userTickets &&
                userTickets.map((ticket, key) => {
                  return <TicketDetail ticket={ticket} key={key} isAdmin={true} />;
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