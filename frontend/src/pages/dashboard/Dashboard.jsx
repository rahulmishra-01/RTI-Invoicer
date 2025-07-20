import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./dashboard.module.css"

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

  console.log(invoices)

  const countStatus = (status) => {
    return invoices.filter((inv) => inv.status === status).length;
  };

  console.log(countStatus("unpaid"))

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
      <div className={styles.dashboard}>
        <div className={styles.dashboardUpperNav}>
          <h2>Welcome, {user?.name}</h2>
        {/* <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="logout-btn"
        >
          Logout
        </button> */}
        </div>

        <div className={styles.stats}>
          <div className={styles.statsBox}><div className={styles.statsBoxValues}><span className={styles.statsValue}>{`${invoices.length}`}</span><span className={styles.statsName}>Total Invoices</span></div></div>
          <div className={styles.statsBox}><div className={styles.statsBoxValues}><span className={styles.statsValue}>{countStatus("paid")}</span><span className={styles.statsName}>Paid</span></div></div>
          <div className={styles.statsBox}><div className={styles.statsBoxValues}><span className={styles.statsValue}>{countStatus("unpaid")}</span><span className={styles.statsName}>Unpaid</span></div></div>
          <div className={styles.statsBox}><div className={styles.statsBoxValues}><span className={styles.statsValue}>{countStatus("overdue")}</span><span className={styles.statsName}>Overdue</span></div></div>
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
              <th className={styles.tableHeading}>PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td className={styles.tableData}>{inv.invoiceNumber}</td>
                <td className={styles.tableData}>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                <td className={styles.tableData}>{inv.buyerDetails?.name}</td>
                <td className={styles.tableData}>₹{Math.floor(inv.totalAmount)}</td>
                <td className={styles.tableData}>{inv.status}</td>
                <td className={[styles.tableData,styles.tablesBtn].join(" ")}>
                  <button className={[styles.downloadBtn,styles.pdfBtn].join(" ")}
                    onClick={() => downloadInvoicePDF(inv._id,`${inv.invoiceNumber}.pdf`)}
                  >
                    Download
                  </button>
                  <button className={[styles.viewBtn,styles.pdfBtn].join(" ")} onClick={() => {
                    console.log(inv)
                  }}>
                    view
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <button
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
        </button> */}
      </div>
    </>
  );
};

export default Dashboard;
