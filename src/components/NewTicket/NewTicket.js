import React, { useEffect, useState } from "react";
import Header from "../items/Header";
import "./NewTicket.css";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { db, auth } from "../../firebase";
import { doc, addDoc, collection, setDoc, updateDoc, increment } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import Axios from "axios";


function NewTicket() {
  let navigate = useNavigate();
  let email = sessionStorage.getItem("userEmail");

  const [tag, setTag] = useState("");
  const [resume, setResume] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    console.log("TAG: " + tag);
    console.log("Resume: " + resume);
    console.log("Description: " + description);
    if (tag !== "" && resume !== "" && description !== "") {
      //SEND API REQUEST:
      fetch('http://localhost:8080/ticket', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag: tag, object: resume, body: description, from: email
        })
      });
        let id = uuidv4();
        let data = {
          tag: tag,
          object: resume,
          body: description,
          date: new Date(),
          status: "Ouvert",
          from: email,
          ticketID: id,
          affectedTo: [],
        };
        await setDoc(doc(db, "tickets", id), data);

        //Incremente the number of tickets in the user profile
        const userRef = doc(db, "users", email);
        await updateDoc(userRef, {
          nbTickets: increment(1)
        });
        navigate("/dashboard");
    } else {
      alert("Veuillez remplir tous les champs");
    }
  };
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is logged in");
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div>
      <Header isLogout={true} />
      <div className="newticket-maincontainer">
        <div className="newticket-subcontainer">
          <div className="newticket-header-container flex1">
            <h2>Nouveau Ticket</h2>
          </div>
          <div className="newticket-ticket-header-container flex1">
            <div className="newticket-tag-input-container">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Sujet</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={tag}
                  label="Sujet"
                  onChange={(e) => setTag(e.target.value)}
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
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </div>
          </div>

          <div className="newticket-body-input-container flex1">
            <textarea
              type="text"
              placeholder="Détails"
              className="newticket-body-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex1 newticket-validate-button-container">
            <div className="flex1">
              <Button variant="contained" onClick={handleSubmit}>Envoyer</Button>
            </div>
            <div className="newticket-cancel-button-flex-none">
              <Button variant="outlined" onClick={() => navigate("/dashboard")}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewTicket;
