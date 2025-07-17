import { useEffect, useState } from "react";
import axios from "axios";
import "../pages/Profile.css"; // Reuse same CSS

const UserInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    gstin: "",
    pan: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = res.data;

        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          company: data.company || "",
          gstin: data.gstin || "",
          pan: data.pan || "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifsc: data.ifsc || "",
          branch: data.branch || "",
        });

        setLoading(false);
      } catch (err) {
        alert("Failed to load user data");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/users/me", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading user info...</p>;

  return (
    <div className="user-info-card">
      <h2>📝 Edit Your Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {[
            ["name", "Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["address", "Address"],
            ["company", "Company Name"],
            ["gstin", "GSTIN"],
            ["pan", "PAN"],
            ["bankName", "Bank Name"],
            ["accountNumber", "Account Number"],
            ["ifsc", "IFSC Code"],
            ["branch", "Branch"],
          ].map(([field, label]) => (
            <div key={field}>
              <label>{label}</label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit">💾 Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default UserInfo;
