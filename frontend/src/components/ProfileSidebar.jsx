import styles from "../pages/profile/Profile.module.css";

const ProfileSidebar = ({activeTab, setActiveTab}) => {
    return (
        <div className={styles.profileHeader}>
            <h2>👤 Profile</h2>
            <ul>
                <li className={activeTab === "info" ? "active":""} onClick={() => setActiveTab("info")}>📝 User Info</li>

                <li className={activeTab === "invoices" ? "active":""} onClick={() => setActiveTab("invoices")}>📄 Invoices</li>
            </ul>
        </div>
    )
}

export default ProfileSidebar;