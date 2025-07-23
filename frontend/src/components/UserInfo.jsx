import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../pages/profile/Profile.module.css"; // Reuse same CSS

const UserInfo = () => {
  // const isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pinCode:"",
    state:"",
    district:"",
    stateCode:"",
    country:"",
    company: "",
    gstin: "",
    pan: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
  });
  const [panError, setPanError] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("https://rti-invoicer-production.up.railway.app/api/users/me", {
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
          pinCode: data.pinCode || "",
          state: data.state || "",
          district: data.state || "",
          stateCode: data.stateCode || "",
          country: data.country || "",
          company: data.company || "",
          gstin: data.gstin || "",
          pan: data.pan || "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifsc: data.ifsc || "",
          branch: data.branch || "",
        });
        {console.log(res)}
        setLoading(false);
      } catch (err) {
        alert("Failed to load user data");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = async (e) => {
    // const {name, value} = e.target;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    if(e.target.name === "pinCode" && e.target.value.length === 6){
      try {
        const res = await axios.get(`httpss://api.postalpincode.in/pincode/${e.target.value}`);
        const data = res.data[0];

        if(data.Status === "Success"){
          const place = data.PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: place.District || "",
            state: place.State || "",
            district: place.District || "",
            country: place.Country || "",
          }));
        } else{
          alert("Invalid PIN Code");
        }
      } catch (error) {
        console.error(error);
        alert("Error fetching location info");
      }
    }

    if(e.target.name === "pan"){
      const isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(e.target.value.toUpperCase());
      setPanError(isValid || e.target.value === ""? "":"Invald PAN Number");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("https://rti-invoicer-production.up.railway.app/api/users/me", formData, {
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
    <div className={styles.userInfoCard}>
      <h2>📝 Edit Your Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* {[
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
          ))} */}

          <div className={styles.profileUserInfoSection}>
            <div className={[styles.ProfileNameInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileName">Name</label>
            <input type="text" id="profileName" name="name" placeholder="Name" value={formData.name} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfileEmailInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileEmail">Email</label>
            <input type="email" id="profileEmail" name="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfilePhoneInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profilePhone">Phone</label>
            <input type="text" id="profilePhone" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfileAddressInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileAddress">Address</label>
            <input type="text" id="profileAddress" name="address" placeholder="Address" value={formData.address} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfilePinCodeInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profilePinCode">Pin Code</label>
            <input type="text" id="profilePinCode" name="pinCode" placeholder="Pin Code" value={formData.pinCode} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfileStateInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileState">State</label>
            <input type="text" id="profileState" name="state" placeholder="State" value={formData.state} onChange={handleChange} readOnly/>
          </div>
          <div className={[styles.ProfileDistrictInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileDistrict">District</label>
            <input type="text" id="profileDistrict" name="district" placeholder="District" value={formData.district} onChange={handleChange} readOnly/>
          </div>
          {/* <div className={styles.ProfileUserInfoInputSection}>
            <label htmlFor="profileStateCode">State Code</label>
            <input type="text" id="profileStateCode" name="stateCode" placeholder="State Code" value={formData.stateCode} onChange={handleChange}/>
          </div> */}
          <div className={[styles.ProfileCountryInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileCountry">Country</label>
            <input type="text" id="profileCountry" name="country" placeholder="Country" value={formData.country} onChange={handleChange} readOnly/>
          </div>
          <div className={[styles.ProfilecompanyInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileCompany">Company</label>
            <input type="text" id="profileCompany" name="company" placeholder="Company" value={formData.company} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfileGstinInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileGstin">GSTIN</label>
            <input type="text" id="profileGstin" name="gstin" placeholder="GSTIN" value={formData.gstin} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfilePanInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profilePan">PAN</label>
            <input type="text" id="profilePan" name="pan" placeholder="PAN" value={formData.pan} onChange={handleChange} maxLength={10} style={{borderColor: panError ? "red" : ""}}/>
            {panError && (
              <p style={{color:"red",marginBottom:"5px",fontSize:"0.85rem"}}>{panError}</p>
            )}
          </div>
          <div className={[styles.ProfileBankNameInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileBankName">Bank Name</label>
            <input type="text" id="profileBankName" name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfileAccountNumberInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileAccountNumber">Account Number</label>
            <input type="text" id="profileAccountNumber" name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfileIfscCodeInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileIfscCode">IFSC Code</label>
            <input type="text" id="profileIfscCode" name="ifscCode" placeholder="IFSC Code" value={formData.ifsc} onChange={handleChange}/>
          </div>
          <div className={[styles.ProfileBranchInput,styles.ProfileUserInfoInputSection].join(" ")}>
            <label htmlFor="profileBranch">Branch</label>
            <input type="text" id="profileBranch" name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange}/>
          </div>
          </div>
        </div>

        <div className={styles.saveChangesBtn}>
          <button type="submit">💾 Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default UserInfo;
