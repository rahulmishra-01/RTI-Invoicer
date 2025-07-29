import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, lineHeight: 1.4, position: "relative" },
  section: { marginTop: 30 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "bold"},
  heading: { fontSize: 14, marginBottom: 5 },
  tableHeader: { backgroundColor: "#eee", padding: 4, fontWeight: "bold" },
  tableCell: { padding: 4, borderBottom: "1px solid #ddd" },
  footerText: { textAlign: "center", marginTop: 30, fontSize: 9, position: "absolute", bottom: 30, left: 0, right: 0 },
  authorisedSignatory: { textAlign: "right", marginTop: 80, fontSize: 10 },
});

const InvoicePDF = ({ invoice }) => {
  const s = invoice.sellerDetails || {};
  const b = invoice.buyerDetails || {};
  const sh = invoice.shipTo || {};
  const products = invoice.products || [];
  const total = invoice.totalAmount || 0;

  const taxRate = products.length ? products[0].tax : 0;
  const subtotal = products.reduce((acc,item) => acc + (item.quantity * item.rate - ((item.discount / 100) * item.quantity * item.rate)), 0);
  const taxAmount = subtotal * (taxRate / 100);
  return (
     <Document>
      <Page style={styles.page}>
        {/* Top Section */}
        <View style={styles.row}>
          <View>
            <Text style={styles.bold}>{s.name}</Text>
            <Text>{s.address}</Text>
            <Text>{s.state}, {s.pincode}</Text>
            <Text>{s.gstin}</Text>
            <Text>{s.pan}</Text>
          </View>
          <View>
            <Text style={[styles.heading, styles.bold]}>TAX INVOICE</Text>
            <Text>Invoice #: {invoice.invoiceNumber}</Text>
            <Text>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</Text>
            <Text>Order No: {invoice.buyerOrderNumber || "N/A"}</Text>
          </View>
        </View>

        {/* Bill To / Ship To */}
        <View style={[styles.section, styles.row]}>
          <View style={{ width: "48%" }}>
            <Text style={styles.bold}>Bill To:</Text>
            <Text>{b.name}</Text>
            <Text>{b.addressLine1}</Text>
            <Text>{b.state}, {b.pincode}</Text>
            <Text>{b.phone}</Text>
            <Text>{b.email}</Text>
          </View>
          <View style={{ width: "48%" }}>
            <Text style={styles.bold}>Ship To:</Text>
            <Text>{sh.name}</Text>
            <Text>{sh.addressLine1}</Text>
            <Text>{sh.state}, {sh.pincode}</Text>
            <Text>{sh.phone}</Text>
            <Text>{sh.email}</Text>
          </View>
        </View>

        {/* Product Table */}
        <View style={[styles.section]}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={{ width: "5%" }}>SL</Text>
            <Text style={{ width: "30%" }}>Description</Text>
            <Text style={{ width: "10%" }}>HSN</Text>
            <Text style={{ width: "10%" }}>Qty</Text>
            <Text style={{ width: "10%" }}>Rate</Text>
            <Text style={{ width: "10%" }}>Disc%</Text>
            <Text style={{ width: "10%" }}>Tax%</Text>
            <Text style={{ width: "15%" }}>Amount</Text>
          </View>
          {products.map((item, i) => (
            <View style={styles.row} key={i}>
              <Text style={{ width: "5%",paddingLeft:5 }}>{i + 1}</Text>
              <Text style={{ width: "30%" }}>{item.description}</Text>
              <Text style={{ width: "10%" }}>{item.hsn}</Text>
              <Text style={{ width: "10%" }}>{item.quantity}</Text>
              <Text style={{ width: "10%" }}>{item.rate.toFixed(2)}</Text>
              <Text style={{ width: "10%" }}>{item.discount}%</Text>
              <Text style={{ width: "10%" }}>{item.tax}%</Text>
              <Text style={{ width: "15%" }}>{item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={[styles.section, { alignItems: "flex-end" }]}>
          <Text>Subtotal: {subtotal.toFixed(2)}</Text>
          <Text>Tax ({taxRate}%): {taxAmount.toFixed(2)}</Text>
          <Text>Grand Total: {total.toFixed(2)}</Text>
        </View>

        {/* Bank Details + Signatory */}
        <View style={styles.row}>
          <View style={{ width: "60%" }}>
            <Text style={styles.bold}>Bank Details:</Text>
            <Text>Bank: {s.bankName}</Text>
            <Text>Acc No: {s.accountNumber}</Text>
            <Text>Branch: {s.branch}</Text>
            <Text>IFSC: {s.ifsc}</Text>
            <Text>PAN: {s.pan}</Text>
          </View>
          <View style={{ width: "35%", textAlign: "right" }}>
            <Text style={[styles.bold, styles.authorisedSignatory]}>Authorised Signatory</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>This is a Computer Generated Invoice</Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
