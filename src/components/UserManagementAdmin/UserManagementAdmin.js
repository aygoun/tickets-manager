import React, { useEffect, useState } from "react";
import Header from "../items/Header";
import { auth, db } from "../../firebase";
import remove from "../../assets/remove.png";
import { useNavigate } from "react-router-dom";
import "./UserManagementAdmin.css";
import {
  signOut,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function UserManagementAdmin() {
  let navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userMail, setUserMail] = useState("");
  const [open, setOpen] = useState(false);

  const getUsers = async () => {
    const q = query(collection(db, "users"), where("isAdmin", "==", true));
    const querySnapshot = await getDocs(q);
    let usersTmp = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      if (doc.data().email !== "ticketmanager@festival-aix.com") {
        usersTmp.push(doc.data());
      }
    });
    setUsers(usersTmp);
  };

  const addUser = async () => {
    const userDoc = doc(db, "users", userMail);
    await updateDoc(userDoc, {
      isAdmin: true,
    });
    handleClose();
    getUsers();
  };

  const deleteUser = async (mail) => {
    const userDocDelete = doc(db, "users", mail);
    await updateDoc(userDocDelete, {
      isAdmin: false,
    });
    getUsers();
    navigate("/admin");
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (Object.entries(users).length === 0) {
      getUsers();
    }
    auth.onAuthStateChanged((user) => {
      if (user && user.email === sessionStorage.getItem("userEmail") && user.email === "ticketmanager@festival-aix.com") {
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
  }, [users, navigate]);

  return (
    <div>
      <Header isLogout={true} />
      <div className="user-management-admin-container">
        <h2>Vos admins :</h2>
        <div className="user-management-admin-sub-container">
          {users.map((user, index) => {
            return (
              <div style={{ width: "100%" }} key={index}>
                <div className="user-management-admin-items">
                  <div className="user-management-admin-item-mail">
                    {user.email}
                  </div>
                  <div className="user-management-admin-item-delete">
                    <img
                      src={remove}
                      alt="remove"
                      width={30}
                      height={30}
                      onClick={() => deleteUser(user.email)}
                    />
                  </div>
                </div>
                <hr />
              </div>
            );
          })}
          <Button onClick={() => handleClickOpen()} variant="contained">
            Ajouter
          </Button>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Entrer l'email</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Entrer l'email du nouvel admin :
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="exemple@festival-aix.com"
                type="email"
                fullWidth
                variant="standard"
                value={userMail}
                onChange={(e) => setUserMail(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Annuler</Button>
              <Button onClick={addUser}>Valider</Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default UserManagementAdmin;
