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
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import users from "../../assets/users.png";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { CSVLink } from "react-csv";
import Dialog  from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function DashboardAdmin() {
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [csvData, setCsvData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [myAffectation, setMyAffectation] = useState(false);
  const [tag, setTag] = useState("Tous");


  const getUserPermissions = async () => {
    const docRef = doc(db, "users", userEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (docSnap.data().isAdmin === true) {
        console.log("Existing user");
      }
      else {
        navigate("/dashboard");
      }
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  const handleCheckbox = (curr) => {
    setMyAffectation(curr);
    setTag("Tous");
    setStatus("Tous");
    console.log("Checkbox: ", curr);
    fetchTickets(curr);
  }

  const filterTickets = (tickets) => {
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
  };

  const handleChange = () => {
    let next;
    if (myAffectation)
    {
      next = query(collection(db, "tickets"), limit(50), orderBy("date", "desc"), startAfter(lastDoc), where("affectedTo", "array-contains", userEmail));
    }
    else {
      next = query(collection(db, "tickets"), limit(50), orderBy("date", "desc"), startAfter(lastDoc));
    } 
    onSnapshot(next, (querySnapshot) => {
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
        filterTickets(tickets);
      }
    }
    );
  };

  const fetchTickets = async (status) => {
    let q = query(collection(db, "tickets"), orderBy("date", "desc"), limit(50));
    
    onSnapshot(q, (querySnapshot) => {
      let tickets = querySnapshot.docs.map((doc) => {
        if (status && doc.data().affectedTo.includes(userEmail)){
          return {
            id: doc.id,
            ...doc.data(),
          };
        } else if (!status){
          return {
            id: doc.id,
            ...doc.data(),
          };
        } else {
          return {
            id: -1,
            ...doc.data(),
          };
        }
      });
      tickets = tickets.filter((ticket) => ticket.id !== -1);
      if (tickets.length === 0) {
        setNoTickets("Aucun ticket");
      } else {
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastDoc(lastVisible);
        filterTickets(tickets);
      }
    });
  };

  const handleSearchChange = async (value) => {
    setSearch(value);
    if (value.length > 3) {
      let q = query(collection(db, "tickets"), where("object", "==", value), orderBy("date", "desc"));
      let qUsername = query(collection(db, "tickets"), where("from", "==", value), orderBy("date", "desc"));
      if (tag !== "Tous") {
        q = query(collection(db, "tickets"), where("object", "==", value), where("tag", "==", tag), orderBy("date", "desc"));
        qUsername = query(collection(db, "tickets"), where("from", "==", value), where("tag", "==", tag), orderBy("date", "desc"));
      }

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
      if (value.length === 6){
        let qID = query(collection(db, "tickets"), where("publicID", "==", value));
        const querySnapshotID = await getDocs(qID);
        querySnapshotID.forEach((doc) => {
          tickets.push(doc.data());
        }
        );
      }
      setUserTickets(tickets);
      filterTickets(tickets);
    }
    else {
      if (status === "Tous") {
        fetchTickets(myAffectation);
      }
      else {
        let q;
        if (myAffectation) {
          q = query(collection(db, "tickets"), where("tag", "==", tag), where("affectedTo", "array-contains", userEmail), limit(100), orderBy("date", "desc"));
        }
        else {
          q = query(collection(db, "tickets"), where("tag", "==", tag), limit(100), orderBy("date", "desc"));
        }
        const querySnapshot = await getDocs(q);
        let tickets = [];
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          tickets.push(doc.data());
        });
        setUserTickets(tickets);
        filterTickets(tickets);
      }
    }
  };

  const handleTagChange = async (tagValue) => {
    setTag(tagValue);
    if (tagValue === "Tous") {
      fetchTickets(myAffectation);
    }
    else {
      let q;
      if (myAffectation) {
        q = query(collection(db, "tickets"), where("tag", "==", tagValue), where("affectedTo", "array-contains", userEmail), limit(100), orderBy("date", "desc"));
      }
      else {
        q = query(collection(db, "tickets"), where("tag", "==", tagValue), limit(100), orderBy("date", "desc"));
      }
      const querySnapshot = await getDocs(q);
      let tickets = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        tickets.push(doc.data());
      });
      setUserTickets(tickets);
      filterTickets(tickets);
    }
  };


  useEffect(() => {
    if (Object.entries(allUserTickets).length === 0 && noTickets === "") {
      fetchTickets(myAffectation);
    }
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        sessionStorage.setItem("userEmail", user.email);
        console.log("User is logged in");
        getUserPermissions();
      } else {
        signOut(auth).then(() => {
          // Sign-out successful.
        }).catch((error) => {
          // An error happened.
        });
        sessionStorage.clear();
        navigate("/");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      if (search.length === 0 && status === "Tous") {
        setUserTickets(allUserTickets);
        filterTickets(allUserTickets);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

  const handleClickOpen = () => {
    setOpenDialog(true);
  };
  const handleClose = () => {
    setOpenDialog(false);
  };

  const headers = [
    { label: "Expéditeur", key: "from" },
    { label: "Public ID", key: "publicID"},
    { label: "Tag", key: "tag" },
    { label: "Résumé", key: "object" },
    { label: "Détails", key: "body" },
    { label: "Statut", key: "status" },
    { label: "Date", key: "date" },
    { label: "Affecté à", key: "affectedTo" },
    { label: "ID", key: "ticketID" },
  ];

  const handleExport = () => {
    handleClickOpen();
    //get all tickets data from the database and return data
    const q = query(collection(db, "tickets"), orderBy("date", "desc"));
    getDocs(q).then((querySnapshot) => {
      var tickets = [];
      querySnapshot.forEach((doc) => {
        console.log("Doc: " + doc.data());
        tickets.push(doc.data());
      });
      setCsvData(tickets);
      console.log("TEST");
    });
  };


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
          <div className="dashboard-admin-actions-container">
            {userEmail === "ticketmanager@festival-aix.com"
              ? <span
                className="pointer-cursor flex1"
                onClick={() => navigate("/users-management")}
                style={{ marginRight: 25 }}
              >
                <img
                  src={users}
                  className="dashboard-content-header-newTicketButton"
                  alt="users"
                />
              </span>
              : ""}
            <span
              className="pointer-cursor flex1"
            >
              <Button variant="contained" onClick={handleExport}>Exporter</Button>
              <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>Veuillez attendre le téléchargement des données</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Le bouton "télécharger" sera disponible à la fin du téléchargement.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Annuler</Button>
                  <CSVLink
                    data={csvData}
                    headers={headers}
                    separator={";"}
                    filename={"tickets.csv"}
                    style={{ marginLeft: "1rem" }}
                  >
                    <Button
                      variant="contained"
                      onclick={handleClose}
                    >
                      {csvData.length > 0 ? "Télécharger" : "Chargement..."}
                    </Button>
                  </CSVLink>
                </DialogActions>
              </Dialog>

            </span>
          </div>
        </div>
        <div className="dashboard-content-body">
          <div className="dashboard-content-serchbar-container">
            <div className="dashboard-content-title">Tickets :</div>
            <div className="dashboard-content-title">
              <TextField id="outlined-search" label="ID, résumé ou mail" type="search" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
            </div>
          </div>
          <div className="dashboard-content-body-subcontainer">
            <div className="dashboard-content-body-filtermenu-main">
              <div className="dashboard-content-body-filtermenu">
                <span
                  onClick={() => 
                    {
                      setUserTickets(allUserTickets);
                      setStatus("Tous")
                    }}
                  className="dashboard-content-body-menu"
                >
                  <div 
                    className={status === "Tous" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    TOUS ({allUserTickets.length})
                  </div>
                </span>
                <span
                  onClick={() => {
                    setUserTickets(open);
                    setStatus("Ouvert")
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={status === "Ouvert" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    OUVERT ({open.length})
                  </div>
                </span>
                <span
                  onClick={() =>
                    {
                      setUserTickets(affected);
                      setStatus("Affecté")
                    }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={status === "Affecté" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    AFFECTÉ ({affected.length})
                  </div>
                </span>
                <span
                  onClick={() => {
                    setUserTickets(solved);
                    setStatus("Résolu")
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div 
                    className={status === "Résolu" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                  >
                    RÉSOLU ({solved.length})
                  </div>
                </span>
                <span
                  onClick={() => 
                    {
                      setUserTickets(closed);
                      setStatus("Fermé")
                    }}
                  className="dashboard-content-body-menu"
                >
                  <div 
                    className={status === "Fermé" ? "dashboard-content-filter-choices active" : "dashboard-content-filter-choices"}
                    style={{ borderBottom: 0 }}
                  >
                    FERMÉ ({closed.length})
                  </div>
                </span>
              </div>

              <div className="dashboard-filter-tag-container">
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Sujet</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={tag}
                    label="Sujet"
                    onChange={(e) => handleTagChange(e.target.value)}
                  >
                    <MenuItem value={"Tous"}>Tous</MenuItem>
                    <MenuItem value={"Logiciels"}>Logiciels</MenuItem>
                    <MenuItem value={"Matériels"}>Matériels</MenuItem>
                    <MenuItem value={"Prêt"}>Prêt</MenuItem>
                    <MenuItem value={"Comptes"}>Comptes</MenuItem>
                    <MenuItem value={"Réseaux"}>Réseaux</MenuItem>
                    <MenuItem value={"Déménagement"}>Déménagement</MenuItem>
                    <MenuItem value={"Autre"}>Autre</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div>
                <input type="checkbox" id="myCheck" onClick={() => handleCheckbox(!myAffectation)} />
                <label for="myCheck">Afficher mes affectations</label>
              </div>
            </div>

            <div className="dashboard-content-body-content-container">
              <div className="flex1 dashboard-content-body-content-subcontainer">
                {userTickets &&
                  userTickets.map((ticket, key) => {
                    return <TicketDetailAdmin ticket={ticket} key={ticket.ticketID} isAdmin={true} />;
                  })}
                {<h3 align="center">{noTickets}</h3>}
              </div>
              <div className="flex1"><Button onClick={handleChange} variant="outlined">Charger</Button></div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default DashboardAdmin;