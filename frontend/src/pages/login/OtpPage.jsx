import {useLocation, useNavigate} from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import styles from "./OtpPage.module.css";
import { toast } from "react-toastify";

const OtpPage = () => {
    const {state} = useLocation();
    const navigate = useNavigate();
    const [otp,setOtp] = useState("");
    // const [email, setEmail] = useState(localStorage.getItem("loginEmail") || "");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`,{
                email: state.email,
                otp,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user",JSON.stringify(res.data.user));
            navigate("/dashboard");
            toast.success("Login Successfully");
        } catch (error) {
            // alert(error.response?.data?.message || "OTP verification failed");
            toast.error("OTP verification failed");
        }
    }

    const handleResend = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-otp`,{email: state.email})
        setMessage("OTP resent successfully");
        toast.success("OTP Sent Successfully");
      } catch (error) {
        // alert(error.response?.data?.message || "Failed to resend OTP");
        toast.error("Failed to send OTP");
      }
    };
  return (
    <div className={styles.bodyContainer}>
        <div className={styles.container}>
      <h2>Enter OTP</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" required/>
        <button type="submit">Vefiry OTP</button>
        <button onClick={handleResend}>Resend OTP</button>
      </form>
    </div>
    </div>
  )
}

export default OtpPage;
