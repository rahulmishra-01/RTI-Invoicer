import {Routes, Route, Navigate} from "react-router-dom";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateInvoice from "./pages/createInvoice/CreateInvoice";
import Navbar from "./components/Navbar";
import Profile from "./pages/profile/Profile";
import Subscription from "./pages/subscription/Subscription";
import "./App.css"
// import InvoicePage from "./pages/InvoicePage";
import InvoicePreview from "./pages/InvoicePreview";
import HomePage from "./pages/home/HomePage";

const PrivateRoute = ({children}) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login"/>;
}

const RedirectIfLoggedIn = ({children}) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard"/> : children
};

const App = () => {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="dashboard"/>:<Login/>}/>
      <Route path="/home" element={<HomePage/>}/>
      <Route path="/login" element={<RedirectIfLoggedIn><Login/></RedirectIfLoggedIn>} />
      <Route path="/signup" element={<RedirectIfLoggedIn><Signup/></RedirectIfLoggedIn>}/>
      <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
      <Route path="/create" element={<PrivateRoute><CreateInvoice/></PrivateRoute>}/>
      <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
      <Route path="/subscription" element={<PrivateRoute><Subscription/></PrivateRoute>}/>
      <Route path="/invoices/:id/preview" element={<PrivateRoute><InvoicePreview/></PrivateRoute>}/>
      <Route path="*" element={<h2 style={{textAlign:"center", marginTop:"2rem"}}>404 - Page Not Found</h2>}/>
    </Routes>
    </>
  )
}

export default App;
