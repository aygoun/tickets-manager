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
  startAfter,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import "./DashboardAdmin.css";
import { signOut } from "firebase/auth";
import users from "../../assets/users.png";
import del_user from "../../assets/del_user.png";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { CSVLink } from "react-csv";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function DashboardAdmin() {
  let navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [allTickets, setAllTickets] = useState([]);
  const [displayedTickets, setDisplayedTickets] = useState([]);
  const [noTicketsMsg, setNoTicketsMsg] = useState("");
  const [open, setOpen] = useState(0);
  const [closed, setClosed] = useState(0);
  const [affected, setAffected] = useState(0);
  const [solved, setSolved] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [tag, setTag] = useState("Tous");
  const [csvData, setCsvData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialog2, setOpenDialog2] = useState(false);
  const [mailToDelete, setMailToDelete] = useState("");
  const [myAffectation, setMyAffectation] = useState(false);

  /* CHECK USER PERMISSIONS */
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

  /* GENERATE CSV */
  const handleClickOpen = () => {
    setOpenDialog(true);
  };
  const handleClose = () => {
    setOpenDialog(false);
  };

  const headers = [
    { label: "Expéditeur", key: "from" },
    { label: "Public ID", key: "publicID" },
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

  /* DELETE AN USER */
  const handleClose2 = () => {
    setOpenDialog2(false);
  };

  const handleDeleteUserData = async () => {
    if (mailToDelete === "") {
      alert("Veuillez saisir un mail");
    }
    else if (mailToDelete === "ticketmanager@festival-aix.com") {
	    alert("Vous ne pouvez pas supprimer le super-utilisateur...");
    }
    else {
      //Alert to confirm deletion
      if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur : " + mailToDelete + " ?")) {
        //GET UID OF THE USER TO DELETE
        const q = doc(db, "users", mailToDelete);
        await getDoc(q).then((doc) => {
          if (doc.exists()) {
            //DELETE USER FROM AUTH
            console.log(doc.data().uid);
            fetch("http://192.168.11.245:8080/delete/:" + doc.data().uid+"/:"+mailToDelete)
              .then((data) => {
                console.log(data);
                if (data.statusText === "OK") {
                  console.log("User deleted from auth");
                    alert("L'utilisateur ("+ mailToDelete +") et ses données ont été supprimé")
                    window.location.reload();
                    handleClose2();
                } else {
                  alert("Erreur lors de la suppression de l'utilisateur :" + data.statusText);
                }
              });
          } else {
            alert("Utilisateur introuvable");
          }
        })
      }
    }
  };

  const handleMailChange = (e) => {
    setMailToDelete(e.target.value);
  };

  /* GET TICKETS */
  const fetchTickets = async (statusChanged) => {
    setAllTickets([]);
    setDisplayedTickets([]);
    setNoTicketsMsg("");
    if (!statusChanged) {
      setOpen(0);
      setClosed(0);
      setAffected(0);
      setSolved(0);
    }
    var q;
    if (myAffectation) {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        orderBy("date", "desc"),
        limit(50)
      );
    }
    else {
      q = query(collection(db, "tickets"), orderBy("date", "desc"), limit(50));
    }
    if (tag !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("tag", "==", tag),
        orderBy("date", "desc"),
        limit(50)
      );
    }
    if (status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50)
      );
    }
    if (tag !== "Tous" && status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("tag", "==", tag),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50)
      );
    }
    if (myAffectation && tag !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        where("tag", "==", tag),
        orderBy("date", "desc"),
        limit(50)
      );
    }
    if (myAffectation && status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50)
      );
    }
    if (myAffectation && tag !== "Tous" && status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        where("tag", "==", tag),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50)
      );
    }
    const querySnapshot = await getDocs(q);
    var ticketsIDs = [];
    var openNb = 0;
    var closedNb = 0;
    var affectedNb = 0;
    var solvedNb = 0;
    querySnapshot.forEach((doc) => {
      ticketsIDs.push(doc.data().ticketID);
      switch (doc.data().status) {
        case "Ouvert":
          openNb = openNb + 1;
          break;
        case "Fermé":
          closedNb = closedNb + 1;
          break;
        case "Affecté":
          affectedNb = affectedNb + 1;
          break;
        case "Résolu":
          solvedNb = solvedNb + 1;
          break;
        default:
          break;
      }
    });
    if (ticketsIDs.length === 0) {
      setNoTicketsMsg("Aucun ticket ne correspond à ces critères");
    }
    else {
      if (!statusChanged) {
        setOpen(openNb);
        setClosed(closedNb);
        setAffected(affectedNb);
        setSolved(solvedNb);
      }
      setAllTickets(ticketsIDs);
      setDisplayedTickets(ticketsIDs);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      console.log("Docs: ", ticketsIDs.map((ticket) => ticket));
    }
  };

  const fetchMoreTickets = async () => {
    var q;
    if (myAffectation === true) {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        orderBy("date", "desc"),
        limit(50),
        startAfter(lastDoc)
      );
    }
    else {
      q = query(collection(db, "tickets"), orderBy("date", "desc"), limit(50), startAfter(lastDoc));
    }
    if (tag !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("tag", "==", tag),
        orderBy("date", "desc"),
        limit(50),
        startAfter(lastDoc)
      );
    }
    if (status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50),
        startAfter(lastDoc)
      );
    }
    if (tag !== "Tous" && status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("tag", "==", tag),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50),
        startAfter(lastDoc)
      );
    }
    if (myAffectation === true && tag !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        where("tag", "==", tag),
        orderBy("date", "desc"),
        limit(50),
        startAfter(lastDoc)
      );
    }
    if (myAffectation === true && status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50),
        startAfter(lastDoc)
      );
    }
    if (myAffectation === true && tag !== "Tous" && status !== "Tous") {
      q = query(
        collection(db, "tickets"),
        where("affectedTo", "array-contains", userEmail),
        where("tag", "==", tag),
        where("status", "==", status),
        orderBy("date", "desc"),
        limit(50),
        startAfter(lastDoc)
      );
    }
    const querySnapshot = await getDocs(q);
    var ticketsIDs = [];
    var openNb = open;
    var closedNb = closed;
    var affectedNb = affected;
    var solvedNb = solved;
    querySnapshot.forEach((doc) => {
      ticketsIDs.push(doc.data().ticketID);
      switch (doc.data().status) {
        case "Ouvert":
          openNb = openNb + 1;
          break;
        case "Fermé":
          closedNb = closedNb + 1;
          break;
        case "Affecté":
          affectedNb = affectedNb + 1;
          break;
        case "Résolu":
          solvedNb = solvedNb + 1;
          break;
        default:
          break;
      }
    });
    if (querySnapshot.docs.length === 0) {
      setNoTicketsMsg("Aucun ticket à afficher");
    }
    else {
      setNoTicketsMsg("");
      setOpen(openNb);
      setClosed(closedNb);
      setAffected(affectedNb);
      setSolved(solvedNb);

      setAllTickets(allTickets.concat(ticketsIDs));
      setDisplayedTickets(displayedTickets.concat(ticketsIDs));
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      console.log("Docs: ", ticketsIDs.map((ticket) => ticket));
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleTagChange = (value) => {
    setTag(value);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const handleSearch = () => {
    if (search === "") {
      fetchTickets(false);
    }
    else {
      var tickets = [];
      var q = query(
        collection(db, "tickets"),
        where("publicID", "==", search),
        orderBy("date", "desc")
      );
      getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          tickets.push(doc.data().ticketID);
        });
      });

      var q2 = query(
        collection(db, "tickets"),
        where("from", "==", search),
        orderBy("date", "desc")
      );
      getDocs(q2).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          tickets.push(doc.data().ticketID);
        });

        //Remove duplicates
        var unique = [...new Set(tickets.map((item) => item))];
        setDisplayedTickets(unique);
      });
    }
  };

  const handleMyAffectation = () => {
    setMyAffectation(!myAffectation);
    setTag("Tous");
    setStatus("Tous");
    setSearch("");
  };

  useEffect(() => {
    fetchTickets(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, myAffectation]);

  useEffect(() => {
    fetchTickets(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
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
        console.log("User is logged out");
        sessionStorage.clear();
        navigate("/");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);


  return (
    <div>
      <Header isLogout={true} />
      <div className="dashboard-container">
        <div className="dashboard-header-content">
          <div className="dashboard-content-header-title">
            <span style={{ color: "red" }}>MODE ADMIN</span>
            <br />
            Connecté en {userEmail} !
          </div>
          <div className="dashboard-admin-actions-container">
            {userEmail === "ticketmanager@festival-aix.com" ? (
              <>
                <span
                  className="pointer-cursor flex1"
                  onClick={() => setOpenDialog2(true)}
                  style={{ marginRight: 25 }}
                >
                  <img
                    src={del_user}
                    className="dashboard-content-header-newTicketButton"
                    alt="users"
                  />
                </span>
                <Dialog open={openDialog2} onClose={handleClose2}>
                  <DialogTitle>
                    Veuillez rentrer le mail de l'utilisateur à supprimer
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Cette action est irréversible !
                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Mail"
                        type="email"
                        fullWidth
                        onChange={handleMailChange}
                      />
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose2} color="primary">
                      Annuler
                    </Button>
                    <Button onClick={handleDeleteUserData} color="warning">
                      Supprimer
                    </Button>
                  </DialogActions>
                </Dialog>

                <span
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
              </>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="dashboard-content-body">
          <div className="dashboard-content-searchbar-container">
            <span className="pointer-cursor flex1">
              <Button variant="contained" onClick={handleExport}>
                Exporter
              </Button>
              <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>
                  Veuillez attendre le téléchargement des données
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Le bouton "télécharger" sera disponible à la fin du
                    téléchargement.
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
                    <Button variant="contained" onclick={handleClose}>
                      {csvData.length > 0 ? "Télécharger" : "Chargement..."}
                    </Button>
                  </CSVLink>
                </DialogActions>
              </Dialog>
            </span>
            <div className="dashboard-content-title">
              <TextField
                id="outlined-search"
                className="search-bar-textfield"
                label="ID ou mail"
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e)}
              />
            </div>
          </div>
          <div className="dashboard-content-body-subcontainer">
            <div className="dashboard-content-body-filtermenu-main">
              <div className="dashboard-content-body-filtermenu">
                <span
                  onClick={() => {
                    handleStatusChange("Tous");
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={
                      status === "Tous"
                        ? "dashboard-content-filter-choices active"
                        : "dashboard-content-filter-choices"
                    }
                  >
                    <span className="left-part-title">TOUS</span>
                    <span
                      className={
                        status === "Tous"
                          ? "right-part-number color-white"
                          : "right-part-number"
                      }
                    >
                      ({open + closed + affected + solved})
                    </span>
                  </div>
                </span>
                <span
                  onClick={() => {
                    handleStatusChange("Ouvert");
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={
                      status === "Ouvert"
                        ? "dashboard-content-filter-choices active"
                        : "dashboard-content-filter-choices"
                    }
                  >
                    <span className="left-part-title">OUVERT</span>
                    <span
                      className={
                        status === "Ouvert"
                          ? "right-part-number color-white"
                          : "right-part-number"
                      }
                    >
                      ({open})
                    </span>
                  </div>
                </span>
                <span
                  onClick={() => {
                    setStatus("Affecté");
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={
                      status === "Affecté"
                        ? "dashboard-content-filter-choices active"
                        : "dashboard-content-filter-choices"
                    }
                  >
                    <span className="left-part-title">AFFECTÉ</span>
                    <span
                      className={
                        status === "Affecté"
                          ? "right-part-number color-white"
                          : "right-part-number"
                      }
                    >
                      ({affected})
                    </span>
                  </div>
                </span>
                <span
                  onClick={() => {
                    handleStatusChange("Résolu");
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={
                      status === "Résolu"
                        ? "dashboard-content-filter-choices active"
                        : "dashboard-content-filter-choices"
                    }
                  >
                    <span className="left-part-title">RÉSOLU</span>
                    <span
                      className={
                        status === "Résolu"
                          ? "right-part-number color-white"
                          : "right-part-number"
                      }
                    >
                      ({solved})
                    </span>
                  </div>
                </span>
                <span
                  onClick={() => {
                    handleStatusChange("Fermé");
                  }}
                  className="dashboard-content-body-menu"
                >
                  <div
                    className={
                      status === "Fermé"
                        ? "dashboard-content-filter-choices active"
                        : "dashboard-content-filter-choices"
                    }
                    style={{ borderBottom: 0 }}
                  >
                    <span className="left-part-title">FERMÉ </span>
                    <span
                      className={
                        status === "Fermé"
                          ? "right-part-number color-white"
                          : "right-part-number"
                      }
                    >
                      ({closed})
                    </span>
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

              <div className="dashboard-filter-affectation-container">
                <p className="dashboard-switch-text">
                  Afficher mes affectations
                </p>
                <label for="myCheck" className="switch">
                  <input
                    type="checkbox"
                    id="myCheck"
                    onClick={() => handleMyAffectation(!myAffectation)}
                  />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>

            <div className="dashboard-content-body-content-container">
              <div className="flex1 dashboard-content-body-content-subcontainer">
                {displayedTickets &&
                  displayedTickets.map((ticket, index) => {
                    return (
                      <TicketDetailAdmin
                        ticketID={ticket}
                        key={index}
                        isAdmin={true}
                      />
                    );
                  })}
                {<h3 align="center">{noTicketsMsg}</h3>}
              </div>
              <div className="flex1">
                <Button onClick={() => fetchMoreTickets()} variant="outlined">
                  Charger
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;