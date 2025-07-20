import PdfViewer from "../components/PdfViewer";
import {useParams} from "react-router-dom";

const InvoicePage = () => {
    const {id} = useParams();
    const pdfUrl = `http://localhost:5000/api/invoices/${id}/pdf`;

  return (
    <div>
      <h1>Invoice Preview</h1>
      <PdfViewer pdfUrl={pdfUrl}/>
    </div>
  )
}

export default InvoicePage
