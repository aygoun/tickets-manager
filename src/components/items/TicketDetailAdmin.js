import React, { useEffect, useState } from "react";
import "./styles.css";
import arrow from "../../assets/arrow.png";
import remove from "../../assets/remove.png";
import validate from "../../assets/validate.png";
import { db } from "../../firebase";
import { doc, updateDoc, query, collection, where, getDocs, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import loading from "../../assets/loading-gif.gif";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MENU_PROPS = {
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
  const { isAdmin } = props;
  const { ticketID } = props;
  const [ticket, setTicket] = useState({
    affectedTo: [],
    body: "",
    date: {},
    from: "",
    object: "",
    status: "",
    tag: "",
    ticketID: "",
    publicID: "",
    file: "",
  });
  const [names, setNames] = useState([]);

  let date = "";
  const theme = useTheme();

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

  const handleUpdate = (newStatus) => {
    const docRef = doc(db, "tickets", "" + ticket.ticketID);
    updateDoc(docRef, { affectedTo: ticket.affectedTo, status: newStatus });
    fetch('http://192.168.11.245:8080/update', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag: ticket.tag,
        object: ticket.object,
        body: ticket.body,
        from: ticket.from,
        status: newStatus,
        id: ticket.publicID
      })
    });
  };

  const handleChangeAffectation = (event) => {
    const {
      target: { value },
    } = event;
    //Get new between personName and value
    const differencesBtwTicketAndNow = value.filter((x) => !ticket.affectedTo.includes(x));
    ticket.affectedTo = value;
    if (differencesBtwTicketAndNow.length > 0) {
      handleUpdate("Affecté");
      //New assignation
      fetch("http://192.168.11.245:8080/affected", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag: ticket.tag,
          object: ticket.object,
          body: ticket.body,
          from: ticket.from,
          status: "Affecté",
          diff: differencesBtwTicketAndNow,
          affectedTo: ticket.affectedTo,
          id: ticket.publicID,
          filePath: ticket.file,
        }),
      });
    }
    else if (differencesBtwTicketAndNow.length === 0 && ticket.affectedTo.length === 0) {
      handleUpdate("Ouvert");
    }
  };

  const fetchTicket = async () => {
    //Fetch ticket with id ticketID
    onSnapshot(doc(db, "tickets", ticketID), (doc) => {
      setTicket(doc.data());
    });
    let dateTmp = new Date(ticket.date.seconds * 1000);
    let dateString = dateTmp.toLocaleDateString();
    let timeString = dateTmp.toLocaleTimeString();
    date = (dateString + " " + timeString);
  };
  

  useEffect(() => {
    if (Object.entries(names).length === 0) {
      getUsers();
    }
    if (ticket.publicID === "") {
      fetchTicket();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
    {ticket.publicID === "" && (
        <div className="loading-container" style={{display: "flex", justifyContent: "center"}}>
          <img src={loading} alt="loading" width={30} style={{alignSelf: "center"}}/>
        </div>
      )}
    {ticket.publicID !== "" && (
      <div className="ticket-preview-container">
        <div className="ticket-preview-subcontainer">
          <div className="ticket-preview-tag-container flex1">{ticket.tag}</div>

          <div className="ticket-preview-suject-date-container flex1">
            <div className="ticket-preview-subject-container flex1">
              {ticket.object}
            </div>
            <div className="ticket-preview-date-container flex1">{ticket && date}</div>
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
                  value={ticket.affectedTo}
                  onChange={handleChangeAffectation}
                  input={<OutlinedInput id="select-multiple-chip" label="Assigné à" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MENU_PROPS}
                >
                  {names.map((name, index) => (
                    <MenuItem
                      key={index}
                      value={name}
                      style={getStyles(name, ticket.affectedTo, theme)}
                    >
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="ticket-preview-info-status-maincontainer">
              <div className="ticket-preview-info-status-container">
                {ticket && ticket.status.toUpperCase()}
              </div>
              <span className="flex1 span-button" onClick={() => handleUpdate("Résolu")}>
                <img src={validate} className="ticket-preview-close-img" alt="validate" width="35" />
              </span>
              <span className="flex1 span-button" onClick={() => handleUpdate("Fermé")}>
                <img src={remove} className="ticket-preview-close-img" alt="delete" width="35" />
              </span>
              <span
                className="flex1 span-button"
                onClick={() => { isAdmin ? navigate("/view-ticket:" + ticketID + ":Y") : navigate("/view-ticket:" + ticketID + ":N") }}
              >
                <img src={arrow} className="ticket-preview-info-img" alt="preview" width="35" />
              </span>
            </div>
          </div>
        </div>
      </div>)}
    </>
  );
};

export default TicketDetailAdmin;
