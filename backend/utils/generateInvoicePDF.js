const PDFDocument = require("pdfkit");
const numberToWords = require("number-to-words");
const Invoice = require("../models/Invoice");

exports.generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const { sellerDetails: s, buyerDetails: b, products } = invoice;
    const today = new Date(invoice.invoiceDate).toLocaleDateString();

    // ---------- HEADER ----------
    doc.fontSize(20).text(s.name, { align: "left" });
    doc.fontSize(10).text(s.address);
    doc.text(`${s.state}, ${s.pincode}`);
    doc.text(`Phone: ${s.phone || "N/A"}`);
    doc.text(`Email: ${s.email || "N/A"}`);

    doc.moveUp(5).fontSize(24).text("INVOICE", 400);
    doc.fontSize(10).text(`Date: ${today}`, 400);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 400);
    doc.text(`Customer ID: ${invoice.buyerOrderNumber || "N/A"}`, 400);
    doc.text(`Due Date: ${today}`, 400);

    // ---------- BILL TO ----------
    doc.moveDown().fontSize(12).text("BILL TO", { underline: true });
    doc.fontSize(10).text(b.name || "N/A");
    if (b.addressLine1 || b.addressLine2)
      doc.text(`${b.addressLine1 || ""} ${b.addressLine2 || ""}`);
    if (b.city || b.state || b.postalCode)
      doc.text(`${b.city || ""}, ${b.state || ""}, ${b.postalCode || ""}`);
    doc.text(`Phone: ${b.phone || "N/A"}`);
    doc.text(`Email: ${b.email || "N/A"}`);

    // ---------- PRODUCT TABLE HEADER ----------
    doc.moveDown().moveDown();
    const startY = doc.y;

    doc
      .fontSize(10)
      .text("SL", 40, startY)
      .text("Description", 70, startY)
      .text("HSN", 220, startY)
      .text("Qty", 270, startY)
      .text("Rate", 310, startY)
      .text("Disc", 360, startY)
      .text("Tax%", 400, startY)
      .text("Tax Amt", 450, startY)
      .text("Amount", 500, startY);
    doc.moveTo(40, startY + 15).lineTo(550, startY + 15).stroke();

    // ---------- PRODUCT ROWS ----------
    let currentY = startY + 20;
    products.forEach((item, index) => {
      const taxAmt = ((item.quantity * item.rate - (item.discount / 100) * (item.quantity * item.rate)) * (item.tax / 100)).toFixed(2);
      doc
        .fontSize(9)
        .text(index + 1, 40, currentY)
        .text(item.description, 70, currentY)
        .text(item.hsn, 220, currentY)
        .text(item.quantity, 270, currentY)
        .text(item.rate.toFixed(2), 310, currentY)
        .text(item.discount + "%", 360, currentY)
        .text(item.tax + "%", 400, currentY)
        .text(taxAmt, 450, currentY)
        .text(item.amount.toFixed(2), 500, currentY);
      currentY += 18;
    });

    // ---------- SUMMARY ----------
    const taxable = products.reduce((acc, item) => acc + (item.quantity * item.rate - ((item.discount / 100) * item.quantity * item.rate)), 0);
    const taxRate = products.length > 0 ? products[0].tax : 0;
    const taxAmount = taxable * (taxRate / 100);
    const total = invoice.totalAmount;

    doc.moveDown(2);
    doc
      .fontSize(10)
      .text(`Subtotal: ₹${taxable.toFixed(2)}`, 400)
      .text(`Taxable: ₹${taxable.toFixed(2)}`, 400)
      .text(`Tax Rate: ${taxRate}%`, 400)
      .text(`Tax Due: ₹${taxAmount.toFixed(2)}`, 400)
      .font("Helvetica-Bold")
      .text(`TOTAL: ₹${total.toFixed(2)}`, 400);

    // ---------- AMOUNT IN WORDS ----------
    doc.moveDown();
    doc
      .font("Helvetica")
      .text(`Amount in words: ${numberToWords.toWords(total)} rupees only`, { width: 500 });

    // ---------- BANK DETAILS ----------
    doc.moveDown();
    doc.text("Make all checks payable to:");
    doc.font("Helvetica-Bold").text(s.name);
    doc.font("Helvetica").text(`Bank: ${s.bankName}`);
    doc.text(`Account No: ${s.accountNumber}`);
    doc.text(`Branch: ${s.branch}`);
    doc.text(`IFSC: ${s.ifsc}`);

    // ---------- FOOTER ----------
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
