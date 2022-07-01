import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from './components/Dashboard/Dashboard';
import NewTicket from './components/NewTicket/NewTicket';


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/*<Route path="/admin" element={<AdminDashboard />}/>*/}
          <Route path="/new-ticket" element={<NewTicket />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
