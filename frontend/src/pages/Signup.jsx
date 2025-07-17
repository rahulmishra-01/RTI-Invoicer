import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const Signup = () => {
    const [form,setForm] = useState({name:"",email:"",password:""})
    const navigate = useNavigate();

    const handleChange = (e) => setForm({...form, [e.target.name]:e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/auth/signup",form);
            alert("Signup successful! Please login.");
            navigate("/login");
        } catch (err) {
            alert(err.response.data.message || "Signup failed");
        }
    };

  return (
    <div className="auth-form">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required/>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required/>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required/>
        <button type="submit">Signup</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default Signup;
