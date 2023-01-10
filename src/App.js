import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from './components/Dashboard/Dashboard';
import NewTicket from './components/NewTicket/NewTicket';
import ViewTicket from './components/ViewTicket/ViewTicket';
import Register from './components/Register/Register';
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin';
import UserManagementAdmin from './components/UserManagementAdmin/UserManagementAdmin';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/*USER ROUTES*/}
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/view-ticket:id:admin" element={<ViewTicket />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new-ticket" element={<NewTicket />} />
          {/*ADMIN ROUTES*/}
          <Route path="/admin" element={<DashboardAdmin />}/>
          <Route path="/users-management" element={<UserManagementAdmin />}/>
          {/*ERROR PAGE*/}
          <Route path="*" element={<h1 style={{textAlign: "center"}}>Erreur 404: Page inconnue !</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
