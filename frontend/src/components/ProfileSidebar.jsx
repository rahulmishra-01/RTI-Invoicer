const ProfileSidebar = ({activeTab, setActiveTab}) => {
    return (
        <div className="profile-sidebar">
            <h2>👤 Profile</h2>
            <ul>
                <li className={activeTab === "info" ? "active":""} onClick={() => setActiveTab("info")}>📝 User Info</li>

                <li className={activeTab === "invoices" ? "active":""} onClick={() => setActiveTab("invoices")}>📄 Invoices</li>
            </ul>
        </div>
    )
}

export default ProfileSidebar;