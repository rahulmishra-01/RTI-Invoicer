import { useEffect, useState } from "react";
import axios from "axios";
import "../pages/Profile.css";

const UserInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/invoices/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvoices(res.data);
    } catch (err) {
      alert("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      alert("Failed to delete invoice");
    }
  };

  const handleDownload = (id) => {
    const token = localStorage.getItem("token");
    window.open(`http://localhost:5000/api/invoices/${id}/pdf?token=${token}`, "_blank");
  };

  if (loading) return <p>Loading invoices...</p>;
  if (invoices.length === 0) return <p>No invoices found.</p>;

  return (
    <div className="user-invoices">
      <h2>📄 Your Invoices</h2>
      <div className="invoice-table-wrapper">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Buyer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
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
                  <button onClick={() => handleDownload(inv._id)}>📥</button>
                  <button onClick={() => handleDelete(inv._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserInvoices;
