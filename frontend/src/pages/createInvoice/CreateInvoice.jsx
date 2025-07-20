import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateInvoice.css";

const CreateInvoice = () => {
  const [invoiceCount, setInvoiceCount] = useState(0);
  const navigate = useNavigate();

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return `CPT/${year}-${String(nextYear).slice(-2)}/${random}`;
  };

  const generateBuyerOrderNumber = () => {
    return `GEMC-${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
  };

  const [form, setForm] = useState({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split("T")[0],
    buyerOrderNumber: generateBuyerOrderNumber(),
    buyerOrderDate: new Date().toISOString().split("T")[0],
    sellerDetails: {
      name: "",
      address: "",
      pincode: "",
      gstin: "",
      state: "",
      stateCode: "",
      pan: "",
      bankName: "",
      accountNumber: "",
      branch: "",
      ifsc: "",
    },
    buyerDetails: {
      name: "",
      gstin: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      email: "",
    },
    shipTo: {
      name: "",
      gstin: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      email: "",
    },
    products: [
      { description: "", hsn: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 },
    ],
    totalAmount: 0,
    status: "unpaid",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const seller = res.data;
        setForm((prev) => ({
          ...prev,
          sellerDetails: {
            name: seller.name || "",
            address: seller.address || "",
            pincode: seller.pincode || "",
            gstin: seller.gstin || "",
            state: seller.state || "",
            stateCode: seller.stateCode || "",
            pan: seller.pan || "",
            bankName: seller.bankName || "",
            accountNumber: seller.accountNumber || "",
            branch: seller.branch || "",
            ifsc: seller.ifsc || "",
          },
        }));
      } catch (error) {
        alert("Failed to fetch user profile");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/invoices/user",{
          headers:{Authorization:`Bearer ${localStorage.getItem("token")}`},
        });
        setInvoiceCount(res.data.length)
        console.log(res.data)
      } catch (error) {
        console.error("Failed to fetch invoices",error);
      }
    };
    fetchInvoices();
  },[]);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me",{
          headers:{Authorization:`Bearer ${localStorage.getItem("token")}`},
        });

        if(res.data.plan === "free" && invoiceCount >= 10){
          alert("Upgrade to premium to create more invoices");
          navigate("/subscription");
        }
      } catch (error) {
        console.error("Plan check failed",error);
      }
    };

    if(invoiceCount > 0) checkPlan();
  },[invoiceCount]);

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...form.products];
    const numericFields = ["quantity", "rate", "discount", "tax"];
    updated[index][field] = numericFields.includes(field) ? Number(value) : value;

    const { quantity, rate, discount, tax } = updated[index];
    let amount = quantity * rate;
    let discountAmount = amount * (discount / 100);
    let taxedAmount = (amount - discountAmount) * (tax / 100);
    updated[index].amount = Math.round((amount - discountAmount + taxedAmount) * 100) / 100;

    const total = updated.reduce((acc, item) => acc + item.amount, 0);
    setForm({ ...form, products: updated, totalAmount: total });
  };

  const addProduct = () => {
    setForm({
      ...form,
      products: [...form.products, { description: "", hsn: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 }],
    });
  };

  const copyBuyerToShip = (e) => {
    if (e.target.checked) {
      setForm((prev) => ({
        ...prev,
        shipTo: { ...prev.buyerDetails },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/invoices", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if(User.plan === "free" && invoiceCount >= 10){
        alert("Invoice limit reached for Free Plan. Upgrade to Premium.")
        return;
      }
      alert("Invoice created successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Failed to create invoice");
    }
  };

  return (
    <div className="invoice-form">
      <h1>🧾 Create Invoice</h1>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <label>Invoice No</label>
          <input value={form.invoiceNumber} readOnly />

          <label>Invoice Date</label>
          <input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} required />

          <label>Buyer's Order No</label>
          <input value={form.buyerOrderNumber} readOnly />

          <label>Buyer's Order Date</label>
          <input type="date" value={form.buyerOrderDate} onChange={(e) => setForm({ ...form, buyerOrderDate: e.target.value })} required />
        </div>

        <h2>🏢 Seller Details</h2>
        {Object.entries(form.sellerDetails).map(([field, value]) => (
          <div key={field}>
            <label>{field}</label>
            <input value={value} onChange={(e) => handleChange("sellerDetails", field, e.target.value)} required />
          </div>
        ))}

        <h2>📌 Bill To</h2>
        {Object.entries(form.buyerDetails).map(([field, value]) => (
          <div key={field}>
            <label>{field}</label>
            <input value={value} onChange={(e) => handleChange("buyerDetails", field, e.target.value)} required />
          </div>
        ))}

        <div>
          <label>
            <input type="checkbox" onChange={copyBuyerToShip} /> Same as Bill To
          </label>
        </div>

        <h2>🚚 Ship To</h2>
        {Object.entries(form.shipTo).map(([field, value]) => (
          <div key={field}>
            <label>{field}</label>
            <input value={value} onChange={(e) => handleChange("shipTo", field, e.target.value)} required />
          </div>
        ))}

        <h2>🛒 Products</h2>
        <div className="product-table">
          <div className="product-header">
            <div>Description</div>
            <div>HSN</div>
            <div>Qty</div>
            <div>Rate</div>
            <div>Discount %</div>
            <div>Tax %</div>
            <div>Amount</div>
          </div>

          {form.products.map((item, index) => (
            <div className="product-row" key={index}>
              <input value={item.description} onChange={(e) => handleProductChange(index, "description", e.target.value)} />
              <input value={item.hsn} onChange={(e) => handleProductChange(index, "hsn", e.target.value)} />
              <input type="number" value={item.quantity} onChange={(e) => handleProductChange(index, "quantity", e.target.value)} />
              <input type="number" value={item.rate} onChange={(e) => handleProductChange(index, "rate", e.target.value)} />
              <input type="number" value={item.discount} onChange={(e) => handleProductChange(index, "discount", e.target.value)} />
              <input type="number" value={item.tax} onChange={(e) => handleProductChange(index, "tax", e.target.value)} />
              <input type="number" value={item.amount} readOnly />
            </div>
          ))}
        </div>
        <button type="button" onClick={addProduct}>+ Add Product</button>

        <h3>Total: ₹{form.totalAmount}</h3>

        <label>Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>

        <button type="submit">💾 Save Invoice</button>
      </form>
    </div>
  );
};

export default CreateInvoice;
