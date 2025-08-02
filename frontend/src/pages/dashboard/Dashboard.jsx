import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { ClipLoader } from "react-spinners";
import InvoicePDF from "../../components/InvoicePDF";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [userData, setUserData] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(res.data);
      } catch (error) {
        toast.error("Failed to fetch User Data!");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/invoices/user`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setInvoices(res.data);
      } catch (error) {
        toast.error("Failed to fetch invoices");
      }
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/invoices/user`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setInvoiceCount(res.data.length);
      } catch (error) {
        toast.error("Failed to fetch invoices");
      }
    };
    fetchInvoices();
  }, []);

  const countStatus = (status) => {
    return invoices.filter((inv) => inv.status === status).length;
  };
  
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

  return (
    <>
      {loading && <p>Loading...</p>}
      <div className={styles.dashboard}>
        <div className={styles.dashboardUpperNav}>
          <h2><span>Welcome,</span> <span>{user?.name}</span></h2>
          <h3>{userData?.plan}</h3>
        </div>

        <div className={styles.stats}>
          <div className={styles.statsBox}>
            <div className={styles.statsBoxValues}>
              <span className={styles.statsValue}>{`${invoices.length}`}</span>
              <span className={styles.statsName}>Total Invoices</span>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statsBoxValues}>
              <span className={styles.statsValue}>{countStatus("paid")}</span>
              <span className={styles.statsName}>Paid</span>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statsBoxValues}>
              <span className={styles.statsValue}>{countStatus("unpaid")}</span>
              <span className={styles.statsName}>Unpaid</span>
            </div>
          </div>
          <div className={styles.statsBox}>
            <div className={styles.statsBoxValues}>
              <span className={styles.statsValue}>
                {countStatus("overdue")}
              </span>
              <span className={styles.statsName}>Overdue</span>
            </div>
          </div>
        </div>
        <h3 className={styles.invoiceTableHeader}>Invoice List</h3>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr className={styles.tableRow}>
              <th className={styles.tableHeading}>Invoice No</th>
              <th className={styles.tableHeading}>Date</th>
              <th className={styles.tableHeading}>Buyer</th>
              <th className={styles.tableHeading}>Total</th>
              <th className={styles.tableHeading}>Status</th>
              <th className={[styles.tableHeading, styles.hideOnMobile].join(" ")}>PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td className={styles.tableData}>{inv.invoiceNumber}</td>
                <td className={styles.tableData}>
                  {new Date(inv.invoiceDate).toLocaleDateString()}
                </td>
                <td className={styles.tableData}>{inv.buyerDetails?.name}</td>
                <td className={styles.tableData}>
                  ₹{inv.totalAmount.toLocaleString("en-IN")}
                </td>
                <td className={styles.tableData}>{inv.status}</td>
                <td className={[styles.tableData, styles.tablesBtn, styles.hideOnMobile].join(" ")}>
                  <button
                    className={[styles.downloadBtn, styles.pdfBtn].join(" ")}
                    onClick={() => downloadPDF(inv)}
                  >
                    Download
                  </button>
                  <button
                    className={[styles.viewBtn, styles.pdfBtn].join(" ")}
                    onClick={() => navigate(`/invoices/${inv._id}/preview`)}
                  >
                    view
                  </button>
                  <button
                    className={[styles.viewBtn, styles.pdfBtn].join(" ")}
                    onClick={() => navigate(`/invoices/${inv._id}/edit`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Dashboard;
