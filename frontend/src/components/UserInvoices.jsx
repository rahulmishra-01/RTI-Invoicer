import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../pages/profile/Profile.module.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const UserInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvoices(res.data);
    } catch (err) {
      // alert("Failed to fetch invoices");
      toast.error("Failed to fetch invoices");
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
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      toast.success("Invoice Deleted Successfully");
    } catch (err) {
      toast.error("Failed to delete invoice");
    }
  };

  const handleDownload = (id) => {
    const token = localStorage.getItem("token");
    window.open(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/${id}/pdf?token=${token}`);
  };

  if (loading) return <p>Loading invoices...</p>;
  if (invoices.length === 0) return <p>No invoices found.</p>;

  return (
    <div className="user-invoices">
      <h2>📄 Your Invoices</h2>
      <div className="invoice-table-wrapper">
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr className={styles.tableRow}>
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
                <td>₹{inv.totalAmount.toLocaleString("en-IN")}</td>
                <td>{inv.status}</td>
                <td className={styles.tablesBtn}>
                  {/* <button  onClick={() => handleDownload(inv._id)}>Download</button> */}
                  <button  onClick={() => handleDelete(inv._id)}>Delete</button>
                  <button  onClick={() => navigate(`/invoices/${inv._id}/preview`)}>View</button>
                  <button  onClick={() => navigate(`/invoices/${inv._id}/edit`)}>Edit</button>
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
