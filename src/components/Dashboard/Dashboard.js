import "./Dashboard.css";
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
  orderBy,
  onSnapshot,
  startAfter,
  limit,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import Button from "@mui/material/Button";

function Dashboard() {
  let navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(sessionStorage.getItem("userEmail"));
  const [allUserTickets, setAllUserTickets] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [noTickets, setNoTickets] = useState("");
  const [open, setOpen] = useState([]);
  const [closed, setClosed] = useState([]);
  const [affected, setAffected] = useState([]);
  const [solved, setSolved] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [tag, setTag] = useState("Tous");

  const handleNewTicket = () => {
    navigate("/new-ticket");
  };
  
  const handleChange = () => {
    const next = query(collection(db, "tickets"), limit(25), orderBy("date", "desc"), startAfter(lastDoc));
    onSnapshot (next, (querySnapshot) => {
      const tickets = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      if (tickets.length === 0) {
        setNoTickets("Aucun autre ticket");
      }else{
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
        setLastDoc(lastVisible);
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

  const fetchTickets = async () => {
    const q = query(collection(db, "tickets"), limit(25), where("from", "==", userEmail), orderBy("date", "desc")) ;
     onSnapshot(q, (querySnapshot) => {
      const tickets = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      if (tickets.length === 0) {
        setNoTickets("Aucun ticket");
      } else {
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
              setOpen((open) => [...open, element]);
              break;
            case "Fermé":
              setClosed((closed) => [...closed, element]);
              break;
            case "Affecté":
              setAffected((affected) => [...affected, element]);
              break;
            case "Résolu":
              setSolved((solved) => [...solved, element]);
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
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        sessionStorage.setItem("userEmail", user.email);
        console.log("User is logged in");
      } else {
        signOut(auth).then(() => {
          // Sign-out successful.
        }).catch((error) => {
          // An error happened.
        });
        console.log("User is logged out");
        sessionStorage.clear();
        navigate("/");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTickets, navigate]);

  return (
    <div>
      <Header isLogout={true} />
      <div className="dashboard-container">
        <div className="dashboard-header-content">
          <div className="dashboard-content-header-title">
            Bonjour {userEmail} !
          </div>
          <span 
          className="pointer-cursor" onClick={handleNewTicket}>
            <img
              src={plus}
              alt="plus"
              className="dashboard-content-header-newTicketButton"
            />
          </span>
        </div>
        <div className="dashboard-content-body">
          <div className="dashboard-content-title">Mes tickets :</div>
          <div className="dashboard-content-body-subcontainer">
            <div className="dashboard-content-body-filtermenu">
            <span
                  onClick={() => 
                    {
                      setUserTickets(allUserTickets);
                      setTag("Tous")
                    }}
                  className="dashboard-content-body-menu"
                >
                  <div 
                    className={tag === "Tous" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    TOUS ({allUserTickets.length})
                  </div>
                </span>
                <span
                  onClick={() => {
                    setUserTickets(open);
                    setTag("Ouvert")
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={tag === "Ouvert" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    OUVERT ({open.length})
                  </div>
                </span>
                <span
                  onClick={() =>
                    {
                      setUserTickets(affected);
                      setTag("Affecté")
                    }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={tag === "Affecté" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    AFFECTÉ ({affected.length})
                  </div>
                </span>
                <span
                  onClick={() => {
                    setUserTickets(solved);
                    setTag("Résolu")
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div 
                    className={tag === "Résolu" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    RÉSOLU ({solved.length})
                  </div>
                </span>
                <span
                  onClick={() => 
                    {
                      setUserTickets(closed);
                      setTag("Fermé")
                    }}
                  className="dashboard-content-body-menu"
                >
                  <div 
                    className={tag === "Fermé" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                    style={{ borderBottom: 0 }}
                  >
                    FERMÉ ({closed.length})
                  </div>
                </span>
            </div>
            <div className="dashboard-content-body-content-container">
              <div className="flex1 dashboard-content-body-content-subcontainer">
                {userTickets &&
                  userTickets.map((ticket, key) => {
                    return <TicketDetail ticket={ticket} key={key} />;
                  })}
                {<h3 align="center">{noTickets}</h3>}
              </div>
              <div className="flex1"><Button onClick={handleChange} variant="outlined">Charger</Button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;