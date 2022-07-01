import React, { useState } from "react";
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

function NewTicket() {
  let navigate = useNavigate();

  const [tag, setTag] = useState("");

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
                <InputLabel id="demo-simple-select-label">Tag</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={tag}
                  label="Tag"
                  onChange={(e) => setTag(e.target.value)}
                >
                  <MenuItem value={"Teams"}>Teams</MenuItem>
                  <MenuItem value={"SecuTix"}>SecuTix</MenuItem>
                  <MenuItem value={"Autre"}>Autre</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="newticket-subject-input-container">
              <TextField
                id="filled-basic"
                label="Sujet"
                variant="filled"
                className="newticket-subject-input"
              />
            </div>
          </div>

          <div className="newticket-body-input-container flex1">
            <textarea
              type="text"
              placeholder="Remarques"
              className="newticket-body-input"
            />
          </div>
          <div className="flex1 newticket-validate-button-container">
            <div className="flex1">
              <Button variant="contained">Envoyer</Button>
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
