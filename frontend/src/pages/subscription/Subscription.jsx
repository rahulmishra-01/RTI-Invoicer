import styles from "./Subscription.module.css";
import axios from "axios";

const Subscription = () => {

    const handlePayment = async () => {
        try {
            const res = await axios.post("https://rti-invoicer-production.up.railway.app/api/payment/create-order",{
                amount: 500,
                currency: "INR",
            });

            const {id:order_id, amount, currency} = res.data;

            const options = {
                key:"rzp_test_eatSqgeoJFs0at",
                amount:amount,
                currency:currency,
                name:"RTI INVOICER",
                description: "Test Transaction",
                order_id:order_id,
                handler:(response) => {
                    alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                },
                prefill:{
                    name:"Rahul",
                    email:"rahulmishramail.work@gmail.com",
                    contact:"6306249827",
                },
                theme:{
                    color:"#3399cc",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Payment initiation failed:",error);
        }
    };

    const handleSubscribe = async (plan) => {
        try {
            const res = await axios.put("https://rti-invoicer-production.up.railway.app/api/users/plan",{plan},{
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
        <div className={styles.subscriptionPageContainer}>
            <h1>Choose Your Plan</h1>
            <div className={styles.plansContainer}>
                <div className={styles.plans}>
                <div className={[styles.planCard, styles.free].join(" ")}>
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

                <div className={[styles.planCard, styles.premium].join(" ")}>
                    <h2>Premium Plan</h2>
                    <ul>
                        <li>✔ Unlimited Invoices</li>
                        <li>✔ Priority Support</li>
                        <li>✔ Export Data</li>
                        <li>✔ Detailed Analytics</li>
                        <li>✔ Company Branding</li>
                    </ul>
                    <button
                    //  onClick={handlePayment}
                    //  onClick={() => handleSubscribe("premium")}
                    onClick={() => {alert("Not available for testing server")}}
                     >
                        Upgrade Now
                     </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Subscription;