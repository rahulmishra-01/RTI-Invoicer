import {useLocation, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./OtpPage.module.css";
import { toast } from "react-toastify";

const OtpPage = () => {
    const {state} = useLocation();
    const navigate = useNavigate();
    const [otp,setOtp] = useState("");
    const [cooldown, setCooldown] = useState(60);
    const [loading, setLoading] = useState(false);
    // const [email, setEmail] = useState(localStorage.getItem("loginEmail") || "");
    const [message, setMessage] = useState("");

    useEffect(() => {
      let timer;
      if(cooldown > 0){
        timer = setInterval(() => {
          setCooldown(prev => prev -1);
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [cooldown]);


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
            const msg = error.response?.data?.message || "OTP verificatin failed";
            toast.error(msg);
        }finally{
          setLoading(false);
        }
    }

    const handleResend = async () => {
      if(cooldown > 0) return;

      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-otp`,{email: state.email})
        setMessage("OTP resent successfully");
        toast.success("OTP Sent Successfully");
        setCooldown(60);
      } catch (error) {
        const msg = error.response?.data?.message || "Failed to resend OTP";
        toast.error(msg);
      }
    };

  return (
    <div className={styles.bodyContainer}>
        <div className={styles.container}>
      <h2>Enter OTP</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g,"").slice(0, 7))} placeholder="Enter 6-digit OTP" required/>
        <p className={styles.resendOtpBtn}>
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ): (
            <span onClick={handleResend}>Resend OTP</span>
          )}
        </p>
        <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
      </form>
    </div>
    </div>
  )
}

export default OtpPage;
