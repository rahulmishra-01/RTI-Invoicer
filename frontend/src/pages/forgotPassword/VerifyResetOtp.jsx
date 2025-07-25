import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./ForgotPassword.module.css";

const VerifyResetOtp = () => {
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();
    const email = localStorage.getItem("resetEmail");

    const handleVerify = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-forgot-otp`, {email, otp});
            navigate("/reset-password");
        } catch (err) {
            toast.error("Invalid OTP")
        }
    }

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.container}>
      <h2>Verify OTP</h2>
      <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)}/>
      <button onClick={handleVerify}>Verify OTP</button>
    </div>
    </div>
  );
};

export default VerifyResetOtp
