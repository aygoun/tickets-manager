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
import { db, auth, storage } from "../../firebase";
import { doc, setDoc, updateDoc, increment, query, where, getDocs, collection } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

function NewTicket() {
  let navigate = useNavigate();
  let email = sessionStorage.getItem("userEmail");

  const [tag, setTag] = useState("");
  const [resume, setResume] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");

  const checkIfIDExists = async (id) => {
    const ticketsRef = collection(db, "tickets");
    const ticketsQuery = query(ticketsRef, where("ticketID", "==", id));
    const ticketsQuerySnapshot = await getDocs(ticketsQuery);
    const ticketsDocs = ticketsQuerySnapshot.docs;
    return ticketsDocs.length;
  };

  const uploadFile = async (id) => {
    const fileRef = ref(storage, `${id}/${file.name}`);
    await uploadBytes(fileRef, file)
    .then((snapshot) => {
      console.log('Uploaded a blob or file!');
    });
    const url = await getDownloadURL(fileRef);
    return url;
  };

  const handleSubmit = async () => {
    if (tag !== "" && resume !== "" && description !== "") {
      let id = uuidv4();
      //Get 6 first char of id:
      let id6 = id.slice(0, 6);
      
      //Check if id already exists in the database with where ticketID = id4 ?
      //If yes, generate a new id and check again
      //If no, set the ticket with the id4
      let idExists = await checkIfIDExists(id6);
      while (idExists !== 0) {
        id = uuidv4();
        id6 = id.slice(0, 6);
        idExists = await checkIfIDExists(id6);
      };

      let filePath = "";
      if (file !== "") {
        filePath = await uploadFile(id);
      }
      
      let data = {
        tag: tag,
        object: resume,
        body: description,
        date: new Date(),
        status: "Ouvert",
        from: email,
        ticketID: id,
        affectedTo: [],
        publicID: id6,
        file: filePath,
      };
      await setDoc(doc(db, "tickets", id), data);

      //Incremente the number of tickets in the user profile
      const userRef = doc(db, "users", email);
      await updateDoc(userRef, {
        nbTickets: increment(1)
      });
      //SEND API REQUEST:
      fetch('http://localhost:8080/ticket', { //http://192.168.11.245:8080/ticket
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag: tag, object: resume, body: description, from: email, id: id6
        })
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
        signOut(auth).then(() => {
          // Sign-out successful.
        }).catch((error) => {
          // An error happened.
        });
        sessionStorage.clear();
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

          <div className="newticket-file-input-container flex1">
            <label for="file" className="newticket-file-input-label">
              Ajouter un fichier (optionel)
            </label>
            <input
              type="file"
              accept="*"
              className="newticket-file-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          
          <div className="flex1 newticket-validate-button-container">
            <div className="flex1">
              <Button variant="outlined" onClick={() => navigate("/dashboard")}>
                Annuler
              </Button>
            </div>
            <div className="alignEnd">
              <Button variant="contained" onClick={handleSubmit}>Envoyer</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewTicket;
