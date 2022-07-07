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
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

function ViewTicket(props) {
  let navigate = useNavigate();
  let email = sessionStorage.getItem("userEmail");
  let idTmp = useParams().id;
  let isAdminTmp = useParams().admin;
  
  let isAdmin = false;
  if (isAdminTmp == "Y"){
    isAdmin = true;
  }
  let id = idTmp.substring(1);
  id = id.slice(0, -1);
  const [ticket, setTicket] = useState({});
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
      let dateString = date.toLocaleDateString();
      let timeString = date.toLocaleTimeString();
      setDate(dateString + " " + timeString);
      setTicket(docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  useEffect(() => {
    getTicket();
  }, []);

  return (
    <div>
      <Header isLogout={true} />
      {Object.entries(ticket).length !== 0 && (
        <div className="newticket-maincontainer">
          <div className="newticket-subcontainer">
            <div className="newticket-header-container flex1">
              <h2>{date}</h2>
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
                  onClick={() => {isAdmin ? navigate("/admin") : navigate("/dashboard")}}
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
