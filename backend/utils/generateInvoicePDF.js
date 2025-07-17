const PDFDocument = require("pdfkit");
const numberToWords = require("number-to-words");
const Invoice = require("../models/Invoice");

exports.generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on("error", reject);

    // Header
    doc.fontSize(20).text(invoice.sellerDetails.name, { align: "left" });
    doc.fontSize(10).text(invoice.sellerDetails.address);
    doc.text(`${invoice.sellerDetails.state}, ${invoice.sellerDetails.pincode}`);
    doc.text(`Phone: ${invoice.sellerDetails.phone || "N/A"}`);
    doc.text(`Email: ${invoice.sellerDetails.email || "N/A"}`);

    doc.moveUp(5).fontSize(24).text("INVOICE", 400);
    doc.fontSize(10).text(`Date: ${invoice.invoiceDate}`, 400);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 400);
    doc.text(`Customer ID: ${invoice.buyerOrderNumber}`, 400);
    doc.text(`Due Date: ${invoice.invoiceDate}`, 400);

    doc.moveDown().fontSize(12).fillColor("#000").text("BILL TO", { underline: true });
    const buyer = invoice.buyerDetails;
    doc.text(`${buyer.name}`);
    doc.text(`${buyer.addressLine1}, ${buyer.addressLine2}`);
    doc.text(`${buyer.city}, ${buyer.state}, ${buyer.postalCode}`);
    doc.text(`Phone: ${buyer.phone || "N/A"}`);
    doc.text(`Email: ${buyer.email || "N/A"}`);

    // Products Table
    doc.moveDown().fontSize(11).text(" ");
    doc.fontSize(10).text("SL", 40).text("Description", 70).text("HSN", 220).text("Qty", 270).text("Rate", 310).text("Disc", 360).text("Tax%", 400).text("Tax Amt", 450).text("Amount", 500);

    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    invoice.products.forEach((item, index) => {
      const y = doc.y + 5;
      const taxAmt = ((item.quantity * item.rate - (item.discount / 100) * (item.quantity * item.rate)) * (item.tax / 100)).toFixed(2);
      doc.fontSize(9);
      doc.text(index + 1, 40, y);
      doc.text(item.description, 70, y);
      doc.text(item.hsn, 220, y);
      doc.text(item.quantity, 270, y);
      doc.text(item.rate, 310, y);
      doc.text(item.discount + "%", 360, y);
      doc.text(item.tax + "%", 400, y);
      doc.text(taxAmt, 450, y);
      doc.text(item.amount.toFixed(2), 500, y);
    });

    doc.moveDown();

    // Summary
    const taxable = invoice.products.reduce((acc, item) => acc + (item.quantity * item.rate - ((item.discount / 100) * item.quantity * item.rate)), 0);
    const taxRate = invoice.products.length > 0 ? invoice.products[0].tax : 0;
    const taxAmount = taxable * (taxRate / 100);
    const total = invoice.totalAmount;

    doc.fontSize(10).text(`Subtotal: ₹${taxable.toFixed(2)}`, 400);
    doc.text(`Taxable: ₹${taxable.toFixed(2)}`, 400);
    doc.text(`Tax Rate: ${taxRate}%`, 400);
    doc.text(`Tax Due: ₹${taxAmount.toFixed(2)}`, 400);
    doc.font("Helvetica-Bold").text(`TOTAL: ₹${total.toFixed(2)}`, 400);

    doc.moveDown();
    doc.font("Helvetica").text(`Amount in words: ${numberToWords.toWords(total)} rupees only`, {
      width: 500,
    });

    // Bank Info
    const s = invoice.sellerDetails;
    doc.moveDown();
    doc.text("Make all checks payable to:");
    doc.font("Helvetica-Bold").text(s.name);
    doc.font("Helvetica").text(`Bank: ${s.bankName}`);
    doc.text(`Account No: ${s.accountNumber}`);
    doc.text(`Branch: ${s.branch}`);
    doc.text(`IFSC: ${s.ifsc}`);

    // Footer
    doc.moveDown();
    doc.fontSize(9).text("OTHER COMMENTS", { underline: true });
    doc.text("1. Total payment due in 30 days");
    doc.text("2. Please include the invoice number on your check");

    doc.moveDown(2);
    doc.fontSize(10).text("Authorised Signatory", { align: "right" });

    doc.moveDown(2);
    doc.fontSize(9).text("Thank you for your business!", { align: "center" });

    doc.end();
  });
};

exports.generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const serial = String(count + 1).padStart(4, "0");
  const year = "2025-26";
  return `CPT/${year}/${serial}`;
};
