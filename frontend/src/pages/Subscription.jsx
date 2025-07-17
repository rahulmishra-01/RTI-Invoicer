import "./Subscription.css";
import axios from "axios";

const Subscription = () => {

    const handleSubscribe = async (plan) => {
        try {
            const res = await axios.put("http://localhost:5000/api/users/plan",{plan},{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`,
                }
            });
            console.log(res.data)
            alert(`Subscribed to ${plan} plan!`);
        } catch (error) {
            alert("Subscription failed");
        }
    }
    return(
        <div className="subscription-page">
            <h1>Choose Your Plan</h1>
            <div className="plans">
                <div className="plan-card free">
                    <h2>Free Plan</h2>
                    <ul>
                        <li>✔ Create up to 10 invoices</li>
                        <li>✔ Download as PDF</li>
                        <li>✔ Basic Profile Options</li>
                        <li>❌ No Priority Support</li>
                        <li>❌ No Data Export</li>
                    </ul>
                    <button onClick={() => handleSubscribe("free")}>Get Started</button>
                </div>

                <div className="plan-card premium">
                    <h2>Premium Plan</h2>
                    <ul>
                        <li>✔ Unlimited Invoices</li>
                        <li>✔ Priority Support</li>
                        <li>✔ Export Data</li>
                        <li>✔ Detailed Analytics</li>
                        <li>✔ Company Branding</li>
                    </ul>
                    <button onClick={() => handleSubscribe("premium")}>Upgrade Now</button>
                </div>
            </div>
        </div>
    );
};

export default Subscription;