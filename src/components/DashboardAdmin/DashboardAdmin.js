import "./DashboardAdmin.css";
import React, { useEffect, useState } from "react";
import Header from "../items/Header";
import { db } from "../../firebase";
import TicketDetailAdmin from "../items/TicketDetailAdmin";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import users from "../../assets/users.png";

function DashboardAdmin() {
  let navigate = useNavigate();

  const userEmail = sessionStorage.getItem("userEmail");
  const [allUserTickets, setAllUserTickets] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [noTickets, setNoTickets] = useState("");
  const [open, setOpen] = useState([]);
  const [closed, setClosed] = useState([]);
  const [affected, setAffected] = useState([]);
  const [solved, setSolved] = useState([]);

  const getUserPermissions = async () => {
    const docRef = doc(db, "users", userEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().isAdmin == true) {
        console.log("Checked");
      }
      else {
        navigate("/dashboard");
      }
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  const fetchTickets = async () => {
    const q = query(collection(db, "tickets"), orderBy("date", "desc"));
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
          setSolved([]);
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
              case "Résolu":
                setSolved(solved => [...solved, element]);
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
    if (userEmail !== "ticketmanager@festival-aix.com") {
      getUserPermissions();
    }
  }, [allUserTickets]);

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
                onClick={() => setUserTickets(allUserTickets)}
                className="dashboard-content-body-menu"
              >
                <div className="dashboard-content-filter-choices">
                  TOUS ({allUserTickets.length})
                </div>
              </span>
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
                onClick={() => setUserTickets(solved)}
                className="dashboard-content-body-menu"
              >
                <div className="dashboard-content-filter-choices">
                  RÉSOLU ({solved.length})
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
                  return <TicketDetailAdmin ticket={ticket} key={key} isAdmin={true} />;
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