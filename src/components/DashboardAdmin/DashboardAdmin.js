import "./DashboardAdmin.css";
import React, { useEffect, useState } from "react";
import Header from "../items/Header";
import { db, auth } from "../../firebase";
import TicketDetailAdmin from "../items/TicketDetailAdmin";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  startAfter,
  limit,
  doc,
  getDoc
} from "firebase/firestore";
import users from "../../assets/users.png";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

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
  const [lastDoc, setLastDoc] = useState(null);
  const [search, setSearch] = useState("");

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

  const handleChange = () => {
    const next = query(collection(db, "tickets"), limit(50), orderBy("date", "desc"), startAfter(lastDoc));
    const querySnapshot = onSnapshot(next, (querySnapshot) => {
      const tickets = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      if (tickets.length === 0) {
        setNoTickets("Aucun autre ticket");
      } else {
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
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
    const q = query(collection(db, "tickets"), orderBy("date", "desc"), limit(50));
    const querySnapshot = onSnapshot(q, (querySnapshot) => {
      const tickets = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      if (tickets.length === 0) {
        setNoTickets("Aucun ticket");
      } else {
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
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

  const handleSearchChange = async (value) => {
    setSearch(value);
    if (value.length > 3) {
      const q = query(collection(db, "tickets"), where("object", "==", value), orderBy("date", "desc"));
      const qUsername = query(collection(db, "tickets"), where("from", "==", value), orderBy("date", "desc"));

      const querySnapshot = await getDocs(q);
      const querySnapshotUsername = await getDocs(qUsername);
      let tickets = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        tickets.push(doc.data());
      });
      querySnapshotUsername.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        //console.log("Doc: " + doc.data());
        tickets.push(doc.data());
      });
      setUserTickets(tickets);
    }
  }

  useEffect(() => {
    if (Object.entries(allUserTickets).length === 0 && noTickets === "") {
      fetchTickets();
    }
    if (userEmail !== "ticketmanager@festival-aix.com") {
      getUserPermissions();
    }
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is logged in");
      } else {
        navigate("/");
      }
    });
  }, [allUserTickets]);

  return (
    <div>
      <Header isLogout={true} />
      <div className="dashboard-container">
        <div className="dashboard-header-content">
          <div className="dashboard-content-header-title">
            <span style={{ color: 'red' }}>MODE ADMIN</span>
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
          <div className="dashboard-content-serchbar-container">
            <div className="dashboard-content-title">Tickets :</div>
            <div className="dashboard-content-title">
            <TextField id="outlined-search" label="Résumé ou mail" type="search" value={search} onChange={(e) => handleSearchChange(e.target.value)}/>
            </div>
          </div>
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
            <div className="dashboard-content-body-content-container">
              <div className="flex1 dashboard-content-body-content-subcontainer">
                {userTickets &&
                  userTickets.map((ticket, key) => {
                    return <TicketDetailAdmin ticket={ticket} key={key} isAdmin={true} />;
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

export default DashboardAdmin;