import React, { useState, useEffect } from "react";
import Header from "../items/Header";
import "./ViewTicket.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { db, auth } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

function ViewTicket(props) {
  let navigate = useNavigate();
  let idTmp = useParams().id;
  let isAdminTmp = useParams().admin;
  
  let isAdmin = false;
  if (isAdminTmp === "Y"){
    isAdmin = true;
  }
  let id = idTmp.substring(1);
  id = id.slice(0, -1);
  const [ticket, setTicket] = useState({});
  const [affectedTo, setAffectedTo] = useState([]);
  const [date, setDate] = useState("");

  const getTicket = async () => {
    console.log("ID: " +id);
    console.log("Admin:"+isAdminTmp);
    const docRef = doc(db, "tickets", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        
      console.log("Document data:", docSnap.data());
      //convert datestamp date to string
      let date = new Date(docSnap.data().date.seconds * 1000);
      let dateString = date.toLocaleDateString("fr-FR");
      let timeString = date.toLocaleTimeString("fr-FR");
      setDate("Le " + dateString + " à " + timeString);
      setTicket(docSnap.data());
      setAffectedTo(docSnap.data().affectedTo);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  useEffect(() => {
    getTicket();
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is logged in");
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
  }, [navigate]);

  return (
    <div style={{ marginBottom: "2em" }}>
      <Header isLogout={true} />
      {Object.entries(ticket).length !== 0 && (
        <div className="newticket-maincontainer">
          <div className="newticket-subcontainer">
            <div className="newticket-header-container flex1">
              <h2 className="viewticket-date">{date}</h2>
              <span className="viewticket-publicID">ID: {ticket.publicID}</span>
            </div>
            <div className="newticket-ticket-header-container flex1">
              <div className="newticket-tag-input-container">
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Sujet</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={ticket.tag}
                    label="Sujet"
                    disabled
                  >
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
              <div className="newticket-subject-input-container">
                <TextField
                  id="filled-basic"
                  label="Résumé"
                  variant="filled"
                  className="newticket-subject-input"
                  value={ticket.object}
                  disabled
                />
              </div>
            </div>

            <div className="newticket-body-input-container flex1">
              <textarea
                type="text"
                placeholder="Détails"
                className="newticket-body-input"
                value={ticket.body}
                disabled
              />
            </div>

            <div className="newticket-body-input-container flex1">
              <p>
                Le ticket est affecté à :
                {Object.entries(affectedTo).length > 0
                  ? //Ticket AssignedTo is an array, iterates on it
                    affectedTo.map((technician, index) => (
                      <span key={index} style={{ fontWeight: 600 }}>
                        {" "}
                        {technician},
                      </span>
                    ))
                  : " Aucun technicien"}
              </p>
            </div>

            <div className="newticket-body-input-container flex1">
              {ticket.file !== "" ? (
                <a href={ticket.file} target="_blank" rel="noreferrer">
                  <Button
                    variant="outlined"
                    style={{
                      borderRadius: 35,
                      backgroundColor: "#000",
                      color: "#fff",
                    }}
                    disabled
                  >
                    Voir le fichier
                  </Button>
                </a>
              ) : (
                <p>Aucune pièce jointe</p>
              )}
            </div>
            {isAdmin && (
              <div className="newticket-body-input-container flex1">
                <Button
                  variant="outlined"
                  onClick={() => 
                    window.location.href = "mailto:" +
                      ticket.from +
                      "?subject=Re:" +
                      ticket.object +
                      "&body=" +
                      ticket.body.replace("\n", "%0D%0A")
                  }
                >
                  Répondre par email
                </Button>
              </div>)}

            <div className="flex1 newticket-validate-button-container">
              <div className="flex1">
                <Button
                  variant="contained"
                  style={{
                    borderRadius: 35,
                    backgroundColor: "#000",
                    color: "#fff",
                  }}
                  disabled
                >
                  {ticket.status}
                </Button>
              </div>
              <div className="newticket-cancel-button-flex-none">
                <Button
                  variant="outlined"
                  onClick={() => {
                    isAdmin ? navigate("/admin") : navigate("/dashboard");
                  }}
                >
                  Retour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewTicket;
