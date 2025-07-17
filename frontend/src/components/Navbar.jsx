import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  //hide navbar on Login/Signup
  if (location.pathname === "/login" || location.pathname === "/signup")
    return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="brand">
          RTI Invoicer
        </Link>
      </div>

      <div className={`navbar-right ${menuOpen ? "open" : ""}`}>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
          Dashboard
        </Link>
        <Link to="/create" onClick={() => setMenuOpen(false)}>
          Create Invoice
        </Link>
        <Link
          to="/profile"
          className="profile-btn"
          onClick={() => setMenuOpen(false)}
        >
          Profile
        </Link>
      </div>

      <div className="navbar-profile" onClick={() => setMenuOpen(!menuOpen)}>
        {/* <img src="/profile.jpg" alt="Profile" className="profile-pic" /> */}
        <div className="hamburger">☰</div>
      </div>
    </nav>
  );
};

export default Navbar;
