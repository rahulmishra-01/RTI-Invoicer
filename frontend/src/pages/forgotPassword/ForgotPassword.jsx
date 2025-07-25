import { useState } from "react"
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSendOTP = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, {email});
            localStorage.setItem("resetEmail", email);
            navigate("/verify-reset-otp");
            toast.success("OTP send successfully");
        } catch (error) {
            toast.error("Failed to send OTP");
        }
    }
  return (
    <div className={styles.bodyContainer}>
      <div className={styles.container}>
      <h2>Forgot Password</h2>
      <input type="email" placeholder="Enter registered email" value={email} onChange={(e) => setEmail(e.target.value)}/>
      <button onClick={handleSendOTP}>Send OTP</button>
    </div>
    </div>
  )
}

export default ForgotPassword
