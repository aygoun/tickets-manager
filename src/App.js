import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Login from "./components/Login/Login";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          {/*<Route path="/admin" element={<AdminDashboard />}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-ticket" element={<NewTicket />} />*/}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
