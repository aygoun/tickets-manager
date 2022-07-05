import React, { useEffect, useState } from "react";
import Header from "../items/Header";
import { auth, db } from "../../firebase";
import plus from "../../assets/plus.png";
import remove from "../../assets/remove.png";
import { useNavigate } from "react-router-dom";
import "./UserManagementAdmin.css";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, } from "firebase/firestore";

function UserManagementAdmin() {
    let navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [userMail, setUserMail] = useState("");

    const getUsers = async () => {
        const q = query(collection(db, "users"), where("isAdmin", "==", true));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            setUsers(users => [...users, doc.data()]);
        });
    };

    const addUser = async () => {
        const userDoc = doc(db, "users", userMail);
        await updateDoc(userDoc, {
            isAdmin: false,
        });
    }

    const deleteUser = async () => {
        const userDoc = doc(db, "users", userMail);
        await updateDoc(userDoc, {
            isAdmin: false,
        });
    }

    useEffect(() => {
        if (Object.entries(users).length === 0) {
            setUserMail("");
            getUsers();
        }
    }
    , [users]);

    return (
        <div>
            <Header isLogout={true} />
            <div className="user-management-admin-container">
                <h2>Vos admins :</h2>
                <div className="user-management-admin-sub-container">
                    {users.map((user) => {
                        return (
                            <div style={{width: "100%"}}>
                            <div className="user-management-admin-items">
                                <div className="user-management-admin-item-mail">
                                    {user.email}
                                </div>
                                <div className="user-management-admin-item-delete">
                                    <img src={remove} alt="remove" onClick={() => deleteUser(user.email)} width={30} onClick={() => console.log("Delete: " + user.email)}/>
                                </div>
                            </div>
                            <hr />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UserManagementAdmin;