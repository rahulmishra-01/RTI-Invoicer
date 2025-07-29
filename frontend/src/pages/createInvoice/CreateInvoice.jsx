import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./CreateInvoice.module.css";
import { toast } from "react-toastify";

const CreateInvoice = () => {
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [userData,setUserData] = useState([]);
  const [productList, setProductList] = useState([]);
  const navigate = useNavigate();

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

   useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`,{
          headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}
        });
        setUserData(res.data);
      } catch (error) {
        alert("Failed to fetch userData");
      }
    };
    fetchUserData();
  },[]);

  const generateBuyerOrderNumber = () => {
    return `GEMC-${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
  };

  const [form, setForm] = useState({
    invoiceNumber: "",
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
      // gstin: "",
      addressLine1: "",
      addressLine2: "",
      pincode: "",
      city: "",
      state: "",
      country: "",
      phone: "",
      email: "",
    },
    shipTo: {
      name: "",
      // gstin: "",
      addressLine1: "",
      addressLine2: "",
      pincode: "",
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
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
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
            pincode: seller.pinCode || "",
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
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/user`,{
          headers:{Authorization:`Bearer ${localStorage.getItem("token")}`},
        });
        setInvoiceCount(res.data.length)
      } catch (error) {
        console.error("Failed to fetch invoices",error);
      }
    };
    fetchInvoices();
  },[]);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`,{
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

  useEffect(() => {
    const InvoiceNumber = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/new-invoice-number`);
        setForm((prevForm) => ({
          ...prevForm,
          invoiceNumber: res.data.invoiceNumber,
        }));
        // console.log(userId)
      } catch (error) {
        console.error("Failed to fetch invoice number:", error)
      }
    };
    InvoiceNumber();
  },[]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/product/all`,{
          headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}, 
        });
        setProductList(res.data);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchProduct();
  }, [])

  useEffect(() => {
    // console.log(productList);
  }, [productList]);

  const handleChange = async (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    if (field === "pincode" && value.length === 6){
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${value}`);
        const data = response.data[0];

        if(data.Status === "Success") {
          const postOffice = data.PostOffice[0];
          setForm((prev) => ({
            ...prev,
            [section]: {
              ...prev[section],
              city: postOffice.District || "",
              state: postOffice.State || "",
              district: postOffice.District || "",
              country: postOffice.Country || "",
            },
          }));
        }else {
          toast.error("Invalid Pincode");
        }
      } catch (error) {
        toast.error("Failed to fetch pincode details");
      }
    }
  };

  const handleProductChange = async (index, field, value) => {
    const updated = [...form.products];
    const numericFields = ["quantity", "rate", "discount", "tax"];
    updated[index][field] = numericFields.includes(field) ? Number(value) : value;

    if (field === "description"){
      const matched = productList.find(
        (p) => p.description.toLowerCase() === value.toLowerCase()
      );
      // console.log(matched)
      if(matched){
        updated[index].hsn = matched.hsn;
        updated[index].rate = matched.rate;
        updated[index].discount = matched.discount;
        updated[index].tax = matched.tax;
      }
    }

    const { quantity, rate, discount, tax } = updated[index];
    let amount = quantity * rate;
    let discountAmount = amount * (discount / 100);
    let taxedAmount = (amount - discountAmount) * (tax / 100);
    updated[index].amount = Math.floor((amount - discountAmount + taxedAmount) * 100) / 100;

    const total = updated.reduce((acc, item) => acc + item.amount, 0);
    setForm({ ...form, products: updated, totalAmount: total });
  };

  const addProduct = () => {
  setForm((prevForm) => ({
    ...prevForm,
    products: [
      ...prevForm.products,
      { description: "", hsn: "", quantity: 1, rate: 0, discount: 0, tax: 0, amount: 0 },
    ],
  }));
};

  const copyBuyerToShip = (e) => {
    if (e.target.checked) {
      setForm((prev) => ({
        ...prev,
        shipTo: { ...prev.buyerDetails },
      }));
    }
  };

  const handleDeleteProduct = (indexToDelete) => {
    if(form.products.length <= 1) return;
    const updatedProducts = form.products.filter((_,index) => index !== indexToDelete);

    setForm((prevForm) => ({
      ...prevForm,
      products: updatedProducts,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(userData.plan === "free" && invoiceCount >= 3){
        alert("Invoice limit reached for Free Plan. Upgrade to Premium.")
        return;
      }
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/invoices`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const newProducts = form.products.filter((product) => !productList.some((saved) => saved.description.toLowerCase() === product.description.toLowerCase()));

      if(newProducts.length > 0) {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/product/bulk-save`,{
          userId: userId,
          products:newProducts,
        });
      }
      navigate("/dashboard");
      toast.success("Invoice created successfully!");
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.invoice}>
      <h1 className={styles.invoiceTitle}>🧾 Create Invoice</h1>
      <form onSubmit={handleSubmit}>
        <div className="section">
         <div className={styles.firstSection}>
          <div className={styles.sellerSection}>
          <h2>Seller Details</h2>
        <div>
          <div className={[styles.sellerInputSection, styles.sellerNameInput].join(" ")}>
            <label htmlFor="name">Name *</label>
          <input type="text" placeholder="Name" id="name" name="name" value={form.sellerDetails.name} onChange={(e) => handleChange("sellerDetails","name",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerAddressInput].join(" ")}>
            <label htmlFor="address">Address *</label>
          <input type="text" placeholder="Address" id="address" name="address" value={form.sellerDetails.address} onChange={(e) => handleChange("sellerDetails","address",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerPincodeInput].join(" ")}>
            <label htmlFor="pincode">Pincode *</label>
          <input type="text" placeholder="Pincode" id="pincode" name="pincode" value={form.sellerDetails.pincode} onChange={(e) => handleChange("sellerDetails","pincode",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerGstinInput].join(" ")}>
            <label htmlFor="gstin">GSTIN *</label>
          <input type="text" placeholder="GSTIN" id="gstin" name="gstin" value={form.sellerDetails.gstin} onChange={(e) => handleChange("sellerDetails","gstin",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerStateInput].join(" ")}>
            <label htmlFor="state">State *</label>
          <input type="text" placeholder="State" id="state" name="state" value={form.sellerDetails.state} onChange={(e) => handleChange("sellerDetails","state",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerPanInput].join(" ")}>
            <label htmlFor="pan">PAN *</label>
          <input type="text" placeholder="PAN" id="pan" name="pan" value={form.sellerDetails.pan} onChange={(e) => handleChange("sellerDetails","pan",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerBankNameInput].join(" ")}>
            <label htmlFor="bankName">Bank Name *</label>
          <input type="text" placeholder="Bank Name" id="bankName" name="bankName" value={form.sellerDetails.bankName} onChange={(e) => handleChange("sellerDetails","bankName",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerAccountNumberInput].join(" ")}>
            <label htmlFor="accountNumber">Account Number *</label>
          <input type="text" placeholder="Account Number" id="accountNumber" name="accountNumber" value={form.sellerDetails.accountNumber} onChange={(e) => handleChange("sellerDetails","accountNumber",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerBranchInput].join(" ")}>
            <label htmlFor="branch">Branch *</label>
          <input type="text" placeholder="Branch" id="branch" name="branch" value={form.sellerDetails.branch} onChange={(e) => handleChange("sellerDetails","branch",e.target.value)} required/>
          </div>
          <div className={[styles.sellerInputSection, styles.sellerIfscInput].join(" ")}>
            <label htmlFor="ifsc">IFSC *</label>
          <input type="text" placeholder="IFSC" id="ifsc" name="ifsc" value={form.sellerDetails.ifsc} onChange={(e) => handleChange("sellerDetails","ifsc",e.target.value)} required/>
          </div>
        </div>
        </div>

           <div className={styles.invoiceSection}>
            <div className={styles.invoiceValuesSection}>
              <div>
                <label htmlFor="invoiceNo">Invoice No:</label>
              <input value={form.invoiceNumber} id="invoiceNo" name="invoiceNo" readOnly />
              </div>
              <div>
                <label htmlFor="invoiceDate">Invoice Date:</label>
          <input type="date" id="invoiceDate" name="invoiceDate" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} required />
              </div>
            </div>
          <div className={styles.buyerValueSection}>
            <div>
              <label htmlFor="buyerOrderNo">Buyer's Order No:</label>
          <input value={form.buyerOrderNumber} id="buyerOrderNo" name="buyerOrderNo" readOnly />
            </div>
          <div>
            <label htmlFor="buyerOrderDate">Buyer's Order Date:</label>
          <input type="date" id="buyerOrderDate" name="buyerOrderDate" value={form.buyerOrderDate} onChange={(e) => setForm({ ...form, buyerOrderDate: e.target.value })} required />
          </div>
          </div>
           </div>
          </div>
         </div>

         <div className={styles.secondSection}>
          <div className={styles.billToSection}>
            <h2>Bill To</h2>

        <div className={[styles.buyerInputSection, styles.buyerNameInput].join(" ")}>
          <label htmlFor="buyerName">Name *</label>
          <input type="text" placeholder="Name" id="buyerName" name="buyerName" value={form.buyerDetails.name} onChange={(e) => handleChange("buyerDetails","name",e.target.value)} required/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerAddressLine1Input].join(" ")}>
          <label htmlFor="buyerAddressLine1">Address*</label>
          <input type="text" placeholder="Address Line 1" id="buyerAddressLine1" name="buyerAddressLine1" value={form.buyerDetails.addressLine1} onChange={(e) => handleChange("buyerDetails","addressLine1",e.target.value)} required/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerAddressLine2Input].join(" ")}>
          <label htmlFor="buyerAddressLine2">Address</label>
          <input type="text" placeholder="Address Line 2" id="buyerAddressLine2" name="buyerAddressLine2" value={form.buyerDetails.addressLine2} onChange={(e) => handleChange("buyerDetails","addressLine2",e.target.value)}/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerPostalCodeInput].join(" ")}>
          <label htmlFor="buyerPostalCode">Area Code *</label>
          <input type="text" placeholder="Postal Code" id="buyerPostalCode" name="pincode" value={form.buyerDetails.pincode} onChange={(e) => handleChange("buyerDetails","pincode",e.target.value)} required/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerCityInput].join(" ")}>
          <label htmlFor="buyerCity">City </label>
          <input type="text" placeholder="City" id="buyerCity" name="buyerCity" value={form.buyerDetails.city} onChange={(e) => handleChange("buyerDetails","city",e.target.value)} readOnly/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerStateInput].join(" ")}>
          <label htmlFor="buyerState">State </label>
          <input type="text" placeholder="State" id="buyerState" name="buyerState" value={form.buyerDetails.state} onChange={(e) => handleChange("buyerDetails","state",e.target.value)} readOnly/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerCountryInput].join(" ")}>
          <label htmlFor="buyerCountry">Country </label>
          <input type="text" placeholder="Country" id="buyerCountry" name="buyerCountry" value={form.buyerDetails.country} onChange={(e) => handleChange("buyerDetails","country",e.target.value)} readOnly/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerPhoneInput].join(" ")}>
          <label htmlFor="buyerPhone">Phone *</label>
          <input type="text" placeholder="Phone" id="buyerPhone" name="buyerPhone" value={form.buyerDetails.phone} onChange={(e) => handleChange("buyerDetails","phone",e.target.value)}/>
        </div>
        <div className={[styles.buyerInputSection, styles.buyerEmailInput].join(" ")}>
          <label htmlFor="buyerEmail">Email *</label>
          <input type="email" placeholder="Email" id="buyerEmail" name="buyerEmail" value={form.buyerDetails.email} onChange={(e) => handleChange("buyerDetails","email",e.target.value)}/>
        </div>
          </div>

        <div className={styles.shipToCheckbox}>
          <label>
            <input type="checkbox" onChange={copyBuyerToShip} /> Copy From Bill To
          </label>
        </div>

        <div className={styles.shipToSection}>
          <h2>Ship To</h2>

         <div className={[styles.shipToInputSection, styles.shipToInput].join(" ")}>
          <label htmlFor="shipToName">Name *</label>
          <input type="text" placeholder="Name" value={form.shipTo.name} onChange={(e) => handleChange("shipTo","name",e.target.value)} required/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToAddressLine1Input].join(" ")}>
          <label htmlFor="shipToAddressLine1">Address*</label>
          <input type="text" placeholder="Address Line 1" value={form.shipTo.addressLine1} onChange={(e) => handleChange("shipTo","addressLine1",e.target.value)} required/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToAddressLine2Input].join(" ")}>
          <label htmlFor="shipToAddressLine2">Address</label>
          <input type="text" placeholder="Address Line 2" value={form.shipTo.addressLine2} onChange={(e) => handleChange("shipTo","addressLine2",e.target.value)}/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToPostalCodeInput].join(" ")}>
          <label htmlFor="shipToPostalCode">Area Code *</label>
          <input type="text" placeholder="Postal Code" name="pincode" value={form.shipTo.pincode} onChange={(e) => handleChange("shipTo","pincode",e.target.value)} required/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToCityInput].join(" ")}>
          <label htmlFor="shipToCity">City </label>
          <input type="text" placeholder="City" value={form.shipTo.city} onChange={(e) => handleChange("shipTo","city",e.target.value)} readOnly/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToStateInput].join(" ")}>
          <label htmlFor="shipToState">State </label>
          <input type="text" placeholder="State" value={form.shipTo.state} onChange={(e) => handleChange("shipTo","state",e.target.value)} readOnly/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToCountryInput].join(" ")}>
          <label htmlFor="shipToCountry">Country </label>
          <input type="text" placeholder="Country" value={form.shipTo.country} onChange={(e) => handleChange("shipTo","country",e.target.value)} readOnly/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToPhoneInput].join(" ")}>
          <label htmlFor="shipToPhone">Phone *</label>
          <input type="text" placeholder="Phone" value={form.shipTo.phone} onChange={(e) => handleChange("shipTo","phone",e.target.value)}/>
        </div>
        <div className={[styles.shipToInputSection, styles.shipToEmailInput].join(" ")}>
          <label htmlFor="shipToEmail">Email *</label>
          <input type="email" placeholder="Email" value={form.buyerDetails.email} onChange={(e) => handleChange("shipTo","email",e.target.value)}/>
        </div>
        </div>
         </div>

        <div className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h2>Products</h2>
            <div className={styles.productsHeaderBtns}>
              
              <div className={styles.productsHeaderStatusBtn}>
                {/* <label>Status</label> */}
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
              </div>
              <button type="submit">💾 Save Invoice</button>
              <button type="button" onClick={addProduct}>+ Add Product</button>
            </div>
          </div>

          <table className={styles.productTable}>
            <thead className={styles.productTableHead}>
              <tr className={styles.productTableRow}>
                <th>Description</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Discount %</th>
                <th>Tax %</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className={styles.productTableBody}>
              {form.products.map((item,index) => (
                <tr key={index}>
                <td><input value={item.description} onChange={(e) => handleProductChange(index, "description", e.target.value)} /></td>
                <td><input value={item.hsn} onChange={(e) => handleProductChange(index, "hsn", e.target.value)} /></td>
                <td><input type="number" value={item.quantity} onChange={(e) => handleProductChange(index, "quantity", e.target.value)} /></td>
                <td><input type="number" value={item.rate} onChange={(e) => handleProductChange(index, "rate", e.target.value)} /></td>
                <td><input type="number" value={item.discount} onChange={(e) => handleProductChange(index, "discount", e.target.value)} /></td>
                <td><input type="number" value={item.tax} onChange={(e) => handleProductChange(index, "tax", e.target.value)} /></td>
                <td><input type="number" value={item.amount} readOnly /></td>
                {/* <td>{item.amount}</td> */}
                <td>
                  <button onClick={() => handleDeleteProduct(index)}>Delete</button>
                  </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
        

        <h3 className={styles.totalAmount}><span className={styles.totalAmountText}>Total:</span> <span className={styles.totalAmountValue}>₹{form.totalAmount.toLocaleString("en-IN")}</span></h3>
      </form>
    </div>
    </div>
  );
};

export default CreateInvoice;
