import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [form, setForm] = useState({email:"",password:""});
    const navigate = useNavigate();

    const handleChange = (e) => setForm({...form, [e.target.name]:e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login",form);
            localStorage.setItem("token",res.data.token);
            localStorage.setItem("user",JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            alert(err.response.data.message || "Login failed");
        }
    };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required/>
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required/>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/signup">Signup</a></p>
    </div>
  );
};

export default Login;
