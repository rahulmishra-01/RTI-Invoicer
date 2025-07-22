import { useState } from "react";
import ProfileSidebar from "../../components/ProfileSidebar.jsx";
import UserInfo from "../../components/UserInfo.jsx";
import UserInvoices from "../../components/UserInvoices.jsx";
import styles from "./Profile.module.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("info");

  return(
    <div className={styles.profileContainer}>
      <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab}/>
      <div className="profile-content">
        {activeTab === "info" && <UserInfo/>}
        {activeTab === "invoices" && <UserInvoices/>}
      </div>
    </div>
  );
};

export default Profile;