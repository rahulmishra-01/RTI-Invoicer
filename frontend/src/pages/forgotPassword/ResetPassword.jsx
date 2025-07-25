import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./ForgotPassword.module.css";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const email = localStorage.getItem("resetEmail");
    const navigate = useNavigate();

    const handleReset = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {email, newPassword});
            navigate("/login")
            toast.success("Password reset successfully. Please login.");
        } catch (error) {
            toast.error("Error resetting password");
        }
    }

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.container}>
      <h2>Reset Password</h2>
      <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
      <button onClick={handleReset}>Reset Password</button>
    </div>
    </div>
  )
}

export default ResetPassword
