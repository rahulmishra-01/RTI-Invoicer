import React from "react";
import {ToWords} from "to-words";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import Roboto from "../fonts/Roboto-Regular.ttf";
import RobotoBold from "../fonts/Roboto-Bold.ttf";

Font.register({
  family: "Roboto",
  src: Roboto,
  fontWeight: "normal",
});

Font.register({
  family: "Roboto",
  src: RobotoBold,
  fontWeight: "bold",
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Roboto", fontSize: 10 },
  section: {
    marginBottom: 20,
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bold: {
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontSize: 10,
    marginBottom: 5,
    textTransform: "uppercase",
    color: "#333",
    letterSpacing: 0.5,
    marginTop: 5,
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    color: "#333",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 20,
    fontFamily: "Roboto",
    borderBottom: "2px solid #ddd",
    paddingBottom: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    padding: 5,
    borderBottom: "2px solid #ddd",
    marginBottom: 5,
    fontFamily: "Roboto",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderBottom: "1px solid #ddd",
    fontFamily: "Roboto",
    fontSize: 10,
    textAlign: "left",
  },
  footerText: {
    textAlign: "center",
    fontSize: 8,
    color: "#777",
    marginTop: 20,
    fontFamily: "Roboto",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  authorisedSignatory: {
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 40,
    fontFamily: "Roboto",
    color: "#333",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  totalsSection: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 20,
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    fontFamily: "Roboto",
    fontSize: 10,
  },
  totalInWords: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#333",
    letterSpacing: 0.5,
    marginTop: 5,
    fontFamily: "Roboto",
    marginBottom: 10,
  },
  totalSection: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 10,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.5,
    marginBottom: 10,
    // alignItems: "flex-end",
  },
  subTotalSection:{
    justifyContent: "flex-end",
  },
  invoiceDetails:{
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    marginTop: 10,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  buyerOrderDetails:{
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    marginTop: 10,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.5,
    marginBottom: 10
  },
  sellerDetails:{
    width: "50%",
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingRight: 20,
    textTransform: "uppercase",
  },
  billToDetails:{
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingRight: 20,
    textTransform: "uppercase",
  },
  shipToDetails:{
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: "uppercase",
    paddingRight: 20,
  },
  buyerSections:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "flex-start",
    flexWrap: "wrap",
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.5,
    marginTop: 10,
  },
  Watermark:{
    marginTop:5,
  },
});

const InvoicePDF = ({ invoice }) => {
  const s = invoice.sellerDetails || {};
  const b = invoice.buyerDetails || {};
  const sh = invoice.shipTo || {};
  const products = invoice.products || [];
  const total = invoice.totalAmount || 0;

  const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: false, // <--- IMPORTANT: set to false for lakh/crore
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: true,
  },
});

  const taxRate = products.length ? products[0].tax : 0;
  const subtotal = products.reduce(
    (acc, item) =>
      acc +
      (item.quantity * item.rate -
        (item.discount / 100) * item.quantity * item.rate),
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  return (
    <Document>
      <Page style={styles.page}>
        {/* Top Section */}
        <View style={styles.row}>
          <View style={styles.sellerDetails}>
            <Text style={styles.bold}>{s.name}</Text>
            <Text>{s.address}</Text>
            <Text>
              {s.state}, {s.pincode}
            </Text>
            <Text>GSTIN: {s.gstin}</Text>
            <Text>PAN: {s.pan}</Text>
          </View>
          <View>
            <Text style={[styles.heading, styles.bold]}>TAX INVOICE</Text>
            <View style={styles.invoiceDetails}>
              <Text>Invoice #: {invoice.invoiceNumber}</Text>
            <Text>
              Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
            </Text>
            </View>
            <View style={styles.buyerOrderDetails}>
              <Text>Order No: {invoice.buyerOrderNumber || "N/A"}</Text>
            <Text>
              Date: {new Date(invoice.buyerOrderDate).toLocaleDateString()}
            </Text>
            </View>
          </View>
        </View>

        {/* Bill To / Ship To */}
        <View style={[styles.section, styles.row, styles.buyerSections]}>
          <View style={styles.billToDetails}>
            <Text style={styles.bold}>Bill To:</Text>
            <Text>{b.name}</Text>
            <Text>{b.addressLine1}</Text>
            <Text>
              {b.state}, {b.pincode}
            </Text>
            <Text>{b.phone}</Text>
            <Text>{b.email}</Text>
          </View>
          <View style={styles.shipToDetails}>
            <Text style={styles.bold}>Ship To:</Text>
            <Text>{sh.name}</Text>
            <Text>{sh.addressLine1}</Text>
            <Text>
              {sh.state}, {sh.pincode}
            </Text>
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
              <Text style={{ width: "5%", paddingLeft: 5 }}>{i + 1}</Text>
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
        <View style={[styles.section, styles.totalsSection]}>
          <View>
            <Text>Grand Total (in words)</Text>
            <Text style={styles.totalInWords}>INR {toWords.convert(total)} Only</Text>
          </View>
          <View style={styles.totalSection}>
            {/* Bank Details + Signatory */}
          <View>
            <Text style={styles.bold}>Bank Details:</Text>
            <Text>Bank: {s.bankName}</Text>
            <Text>Acc No: {s.accountNumber}</Text>
            <Text>Branch: {s.branch}</Text>
            <Text>IFSC: {s.ifsc}</Text>
            <Text>PAN: {s.pan}</Text>
          </View>
            <View style={styles.subTotalSection}>
              <Text>
              Subtotal: ₹
              {subtotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text>
              Tax ({taxRate}%): ₹
              {taxAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text>
              Grand Total: ₹
              {total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            </View>
          </View>
        </View>

        
        <View style={styles.authorisedSignatory}>
            <Text style={[styles.bold]}>
              Authorised Signatory
            </Text>
          </View>
        {/* Footer */}
        <Text style={styles.footerText}>
          This is a Computer Generated Invoice
        </Text>
        <Text style={[styles.footerText, styles.Watermark]}>
          Made by RTI Invoicer
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
