import {Worker, Viewer} from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PdfViewer = ({url}) => {
  return (
    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
        <div style={{height:"750px"}}>
            <Viewer fileUrl={url}/>
        </div>
    </Worker>
  )
}

export default PdfViewer;
