import React, { useEffect, useState } from "react";
import "./styles.css";
import arrow from "../../assets/arrow.png";
import remove from "../../assets/remove.png";
import validate from "../../assets/validate.png";
import { db } from "../../firebase";
import { doc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function TicketDetailAdmin(props) {
  let navigate = useNavigate();
  const ticket = props.ticket;
  const isAdmin = props.isAdmin;
  const [names, setNames] = useState([]);

  let dateTmp = new Date(ticket.date.seconds * 1000);
  let dateString = dateTmp.toLocaleDateString();
  let timeString = dateTmp.toLocaleTimeString();
  const date = useState(dateString + " " + timeString);
  const theme = useTheme();
  const [adminAffectedMails, setPersonName] = useState(ticket.affectedTo);

  const getUsers = async () => {
    setNames([]);
    const q = query(collection(db, "users"), where("isAdmin", "==", true));
    const querySnapshot = await getDocs(q);
    let usersTmp = [];
    querySnapshot.forEach((doc) => {
      if (doc.data().email !== "ticketmanager@festival-aix.com") {
        names.push(doc.data().email);
        usersTmp.push(doc.data().email);
      }
    });
    setNames(usersTmp);
  };

  const handleChangeAffectation = (event) => {
    const {
      target: { value },
    } = event;
    //Get new between personName and value
    const diff = value.filter((x) => !adminAffectedMails.includes(x));
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    if (diff.length > 0) {
      //New assignation
      fetch('http://localhost:8080/affected', { //192.168.11.245
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag: ticket.tag, object: ticket.object, body: ticket.body, from: ticket.from, status: "Affecté", affectedTo: diff, id: ticket.publicID
        })
      });
      handleUpdate("Affecté");
    }
  };

  const handleUpdate = (newStatus) => {
    const docRef = doc(db, "tickets", "" + ticket.ticketID);
    console.log("AffectedTo: ", adminAffectedMails);
    updateDoc(docRef, { status: newStatus });
    fetch('http://localhost:8080/update', { //192.168.11.245
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag: ticket.tag, object: ticket.object, body: ticket.body, from: ticket.from, status: newStatus, affectedTo: adminAffectedMails, id: ticket.publicID
        })
      });
  };

  useEffect(() => {
    if (Object.entries(names).length === 0) {
      getUsers();
    }

    //Update affectedTo field in db tickets
    const docRef = doc(db, "tickets", "" + ticket.ticketID);
    if (ticket.status === "Résolu") {
      updateDoc(docRef, { affectedTo: adminAffectedMails, status: "Résolu" });
    }
    else if (adminAffectedMails.length === 0) {
      updateDoc(docRef, { affectedTo: [], status: "Ouvert" });
    }
    else{
      updateDoc(docRef, { affectedTo: adminAffectedMails, status: "Affecté" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAffectedMails]);

  return (
    <div className="ticket-preview-container">
      <div className="ticket-preview-subcontainer">
        <div className="ticket-preview-tag-container flex1">{ticket.tag}</div>

        <div className="ticket-preview-suject-date-container flex1">
          <div className="ticket-preview-subject-container flex1">
            {ticket.object}
          </div>
          <div className="ticket-preview-date-container flex1">{date}</div>
          <div className="ticket-preview-date-container flex1">{ticket.from}</div>
        </div>

        <div className="ticket-preview-info-container flex1">
          <div>
            <FormControl sx={{ m: 1, width: 250 }}>
              <InputLabel id="demo-multiple-chip-label">Affecté à :</InputLabel>
              <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={adminAffectedMails}
                onChange={handleChangeAffectation}
                input={<OutlinedInput id="select-multiple-chip" label="Assigné à" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {names.map((name) => (
                  <MenuItem
                    key={name}
                    value={name}
                    style={getStyles(name, adminAffectedMails, theme)}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="ticket-preview-info-status-maincontainer">
            <div className="ticket-preview-info-status-container">
              {ticket.status.toUpperCase()}
            </div>
            <span className="flex1 span-button" onClick={() => handleUpdate("Résolu")}>
              <img src={validate} className="ticket-preview-close-img" alt="validate" width="35" />
            </span>
            <span className="flex1 span-button" onClick={() => handleUpdate("Fermé")}>
              <img src={remove} className="ticket-preview-close-img" alt="delete" width="35" />
            </span>
            <span
              className="flex1 span-button"
              onClick={() => { isAdmin ? navigate("/view-ticket:" + ticket.ticketID + ":Y") : navigate("/view-ticket:" + ticket.ticketID + ":N") }}
            >
              <img src={arrow} className="ticket-preview-info-img"alt="preview" width="35" />
            </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailAdmin;
