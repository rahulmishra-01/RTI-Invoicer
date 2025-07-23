import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import styles from "./Signup.module.css";
import RTILogo from "../../assets/images/RTI.png";

const Signup = () => {
    const [form,setForm] = useState({name:"",email:"",password:""})
    const navigate = useNavigate();

    const handleChange = (e) => setForm({...form, [e.target.name]:e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("https://rti-invoicer-production.up.railway.app/api/auth/signup",form);
            alert("Signup successful! Please login.");
            navigate("/login");
        } catch (err) {
            alert(err.response.data.message || "Signup failed");
        }
    };

  return (
    <div className={styles.container}>
      <div className={styles.authForm}>
      <Link to="/home"><img src={RTILogo} className={styles.logo}/></Link>
      <h2 className={styles.headTitle}>Signup</h2>
      <form onSubmit={handleSubmit}>
        <label className={styles.inputLabel} htmlFor="name">Name</label>
        <input className={styles.inputBox}  name="name" id="name" placeholder="Name" onChange={handleChange} required/>
        <label className={styles.inputLabel} htmlFor="email">Email</label>
        <input className={styles.inputBox}  name="email" id="email" type="email" placeholder="Email" onChange={handleChange} required/>
        <label className={styles.inputLabel} htmlFor="password">Password</label>
        <input className={styles.inputBox}  name="password" id="password" type="password" placeholder="Password" onChange={handleChange} required/>
        <button className={styles.button}  type="submit">Signup</button>
      </form>
      <p className={styles.login}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
    </div>
  );
};

export default Signup;
