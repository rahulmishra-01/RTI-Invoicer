import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../pages/profile/Profile.module.css";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "../components/InvoicePDF";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { MdDelete, MdDownload, MdEdit, MdPageview } from "react-icons/md";

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

  const downloadPDF = async (invoice) => {
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("PDf Downloaded");
  };

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
              <th className={styles.hideOnMobile}>Invoice #</th>
              <th className={styles.hideOnMobile}>Date</th>
              <th>Buyer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td className={styles.hideOnMobile}>{inv.invoiceNumber}</td>
                <td className={styles.hideOnMobile}>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                <td>{inv.buyerDetails?.name}</td>
                <td>₹{inv.totalAmount.toLocaleString("en-IN")}</td>
                <td>{inv.status}</td>
                <td className={[styles.tablesBtn].join(" ")}>
                  {/* <button  onClick={() => handleDownload(inv._id)}>Download</button> */}
                  <button className={styles.deleteBtnDesktop}  onClick={() => handleDelete(inv._id)}>Delete</button>
                   <button className={styles.deleteBtnMobile}  onClick={() => handleDelete(inv._id)}>
                   <MdDelete size={14} />
                   </button>

                  <button className={styles.viewBtnDesktop}  onClick={() => navigate(`/invoices/${inv._id}/preview`)}>View</button>
                  {/* <button className={styles.viewBtnMobile}  onClick={() => navigate(`/invoices/${inv._id}/preview`)}>
                    <MdPageview size={14}/>
                  </button> */}

                  <button className={styles.editBtnDesktop}  onClick={() => navigate(`/invoices/${inv._id}/edit`)}>Edit</button>
                  <button className={styles.editBtnMobile}  onClick={() => navigate(`/invoices/${inv._id}/edit`)}>
                    <MdEdit size={14}/>
                  </button>

                  <button className={styles.editBtnMobile}  onClick={() => downloadPDF(inv)}>
                    <MdDownload size={14}/>
                  </button>
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
