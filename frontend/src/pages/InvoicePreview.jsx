import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import InvoicePDF from "../components/InvoicePDF";
import axios from "axios";
import {useParams} from "react-router-dom";

const InvoicePreview = () => {
    const {id} = useParams();
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            const res = await axios.get(`http://localhost:5000/api/invoices/${id}`,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`,
                },
            });

            setInvoice(res.data);
        };
        fetchInvoice();
    },[id]);

    if(!invoice) return <p>Loading...</p>

    return(
        <div>
            <PDFViewer style={{width:"100vw",height:"100vh"}}>
                <InvoicePDF invoice={invoice}/>
            </PDFViewer>
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