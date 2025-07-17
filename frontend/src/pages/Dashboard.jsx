import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css"

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/invoices/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setInvoices(res.data);
      } catch (error) {
        alert("Failed to fetch invoices");
      }
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/invoices/user",{
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          },
        })
        setInvoiceCount(res.data.length);
        console.log(res.data.length)
      } catch (error) {
        console.error("Failed to fetch invoices",error);
      }
    }
    fetchInvoices();
  },[]);

  const countStatus = (status) => {
    invoices.filter((inv) => inv.status === status).length;
  };

  const downloadInvoicePDF = async (id, filename) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/invoices/${id}/pdf`,{
        responseType: "blob",
        headers:{
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const blob = new Blob([res.data],{type:"application/pdf"});
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Download failed");
      console.error(error);
    }
  };
  return (
    <>
      {loading && <p>Loading...</p>}
      <div className="dashboard">
        <div className="dashboard-upper-nav">
          <h2>Welcome, {user?.name}</h2>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="logout-btn"
        >
          Logout
        </button>
        </div>

        <div className="stats">
          <div><span className="stats-name">Total Invoices</span><span className="stats-value">{invoices.length}</span></div>
          <div>Paid: {countStatus("paid")}</div>
          <div>Unpaid: {countStatus("unpaid")}</div>
          <div>Overdue: {countStatus("overdue")}</div>
        </div>

        <h3>Invoice List</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Buyer</th>
              <th>Total</th>
              <th>Status</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>{inv.invoiceNumber}</td>
                <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                <td>{inv.buyerDetails?.name}</td>
                <td>₹{inv.totalAmount}</td>
                <td>{inv.status}</td>
                <td>
                  <button
                    onClick={() => downloadInvoicePDF(inv._id,`${inv.invoiceNumber}.pdf`)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          style={{
            background: "#f33",
            color: "#fff",
            padding: "0.5rem 1rem",
            marginTop: "1rem",
          }}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Dashboard;
