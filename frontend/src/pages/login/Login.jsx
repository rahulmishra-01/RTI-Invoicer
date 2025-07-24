import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import RTILogo from "../../assets/images/RTI.png";
import {toast} from "react-toastify";

const Login = () => {
    const [form, setForm] = useState({email:"",password:""});
    const navigate = useNavigate();

    const handleChange = (e) => setForm({...form, [e.target.name]:e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,form);

            navigate("/otp", {state:{email:form.email}});
            toast.success("OTP Sent Successfully");
        } catch (err) {
            // alert(err.response?.data?.message || "Login failed");
            toast.error("Failed to send OTP");
        }
    };

  return (
    <div className={styles.container}>
      <div className={styles.authForm}>
      <Link to="/home"><img src={RTILogo} className={styles.logo}/></Link>
      <h2 className={styles.headTitle}>Login</h2>
      <form onSubmit={handleSubmit}>
        <label className={styles.inputLabel} htmlFor="email">Email</label>
        <input className={styles.inputBox} name="email" id="email" type="email" placeholder="Email" onChange={handleChange} required/>
        <label className={styles.inputLabel} htmlFor="password">Password</label>
        <input className={styles.inputBox} type="password" id="password" name="password" placeholder="Password" onChange={handleChange} required/>
        <button className={styles.button} type="submit">Login</button>
      </form>
      <p className={styles.signUp}>Don't have an account? <Link to="/signup">Signup</Link></p>
    </div>
    </div>
  );
};

export default Login;
