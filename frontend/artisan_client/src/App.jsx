import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Le Dashboard est la route protégée */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redirection par défaut vers la page de connexion */}
        <Route path="*" element={<Login />} /> 
      </Routes>
    </Router>
  );
}

export default App;