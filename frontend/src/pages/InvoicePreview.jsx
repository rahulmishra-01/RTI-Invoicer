import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useState,useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import InvoicePDF from "../components/InvoicePDF";
import axios from "axios";
import { toast } from "react-toastify";


const InvoicePreview = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/${id}`,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`,
                },
            });
            setInvoice(res.data);
            } catch (error) {
                toast.error("Error fetching invoice");
            }
        };
        fetchInvoice();
    },[id]);

    if(!invoice) return <p>Loading...</p>

    return(
        <div style={{display: "flex", height:"100vh"}}>
            {/* Left: PDF Viewer */}
            <div style={{flex:2, borderRight:"1px solid #ccc"}}>
            <PDFViewer style={{width:"100%",height:"100%"}}>
                <InvoicePDF invoice={invoice}/>
                {console.log(invoice)}
            </PDFViewer>
            </div>

            {/* Right: Action Buttons */}
            <div style={{flex:1, padding:"2rem", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:"1rem"}}>
                <h2>Invoice Actions</h2>

                <PDFDownloadLink document={<InvoicePDF invoice={invoice}/>} fileName={`${invoice.invoiceNumber}.pdf`} style={{textDecoration:"none", padding:"0.6rem 1.2rem", backgroundColor:"#4CAF50", color:"#fff", borderRadius:"5px", fontWeight:"bold"}}>
                    Download PDF
                </PDFDownloadLink>

                {/* <button style={{padding:"0.6rem 1.2rem", backgroundColor: "#2196F3", color:"#fff", border:"none", borderRadius:"5px", cursor:"pointer", fontWeight:"bold"}}>Send to Email</button> */}

                <button onClick={() => navigate("/dashboard")} style={{padding:"0.6rem 1.2rem", backgroundColor:"#777", color:"#fff", border:"none", borderRadius:"5px", cursor:"pointer", fontWeight:"bold"}}>Back to Dashboard</button>
            </div>
            {/* <PDFDownloadLink
                document={<InvoicePDF invoice={invoice}/>}
                fileName={`${invoice.invoiceNumber}.pdf`}
                style={{marginTop:10,display:"block",textAlign:"center"}} 
            >
                {({loading}) => (loading ? "Preparing document..." : "Download PDF")}
            </PDFDownloadLink> */}
        </div>
    )
}

export default InvoicePreview;