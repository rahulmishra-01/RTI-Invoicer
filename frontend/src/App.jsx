import {Routes, Route, Navigate} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import "./App.css"

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
      <Route path="/login" element={<RedirectIfLoggedIn><Login/></RedirectIfLoggedIn>} />
      <Route path="/signup" element={<RedirectIfLoggedIn><Signup/></RedirectIfLoggedIn>}/>
      <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
      <Route path="/create" element={<PrivateRoute><CreateInvoice/></PrivateRoute>}/>
      <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
      <Route path="/subscription" element={<PrivateRoute><Subscription/></PrivateRoute>}/>
      <Route path="*" element={<h2 style={{textAlign:"center", marginTop:"2rem"}}>404 - Page Not Found</h2>}/>
    </Routes>
    </>
  )
}

export default App;
