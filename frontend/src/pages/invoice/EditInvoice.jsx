import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import styles from "./EditInvoice.module.css"; // Assuming you have a CSS module for styles
import { MdDelete, MdAdd, MdSave, MdEdit } from "react-icons/md";

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProductModal, setEditProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    description: "",
    hsn: "",
    quantity: 1,
    rate: 0,
    discount: 0,
    tax: 0,
    amount: 0,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 786);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 786);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/invoices/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setForm(res.data);
      } catch (error) {
        toast.error("Error fetching invoice");
        console.error("Fetch invoice error:", error);
      }
    };
    fetchInvoice();
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/product/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProductList(res.data);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchProduct();
  }, []);

  const handleProductModalSubmit = (e) => {
    e.preventDefault();

    if (
      !newProduct.description ||
      !newProduct.hsn ||
      !newProduct.quantity ||
      !newProduct.rate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const { quantity, rate, discount, tax } = newProduct;
    let amount = quantity * rate;
    let discountAmount = amount * (discount / 100);
    let taxedAmount = (amount - discountAmount) * (tax / 100);
    newProduct.amount =
      Math.floor((amount - discountAmount + taxedAmount) * 100) / 100;

    setForm((prevForm) => ({
      ...prevForm,
      products: [...prevForm.products, { ...newProduct }],
      totalAmount: prevForm.totalAmount + newProduct.amount,
    }));
    setShowProductModal(false);
    setNewProduct({
      description: "",
      hsn: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      tax: 0,
      amount: 0,
    });
  };

  const handleModalProductChange = (field, value) => {
    const numericFields = ["quantity", "rate", "discount", "tax"];
    let updatedProduct = {
      ...newProduct,
      [field]: numericFields.includes(field) ? Number(value) : value,
    };

    if (field === "description") {
      const matched = productList.find(
        (p) => p.description.toLowerCase() === value.toLowerCase()
      );
      if (matched) {
        updatedProduct = {
          ...updatedProduct,
          hsn: matched.hsn,
          rate: matched.rate,
          discount: matched.discount,
          tax: matched.tax,
        };
      }
    }

    const { quantity, rate, discount, tax } = updatedProduct;
    let amount = quantity * rate;
    let discountAmount = amount * (discount / 100);
    let taxedAmount = (amount - discountAmount) * (tax / 100);
    updatedProduct.amount =
      Math.floor((amount - discountAmount + taxedAmount) * 100) / 100;

    setNewProduct(updatedProduct);
  };

  const handleEditProductModalSubmit = () => {
    const updatedProducts = [...form.products];

    const index = form.products.findIndex(
      (p) => p.description === newProduct.description
    );

    updatedProducts[index] = { ...newProduct };

    const total = updatedProducts.reduce((acc, item) => acc + item.amount, 0);

    setForm((prevForm) => ({
      ...prevForm,
      products: updatedProducts,
      totalAmount: total,
    }));

    setEditProductModal(false);
    setNewProduct({
      description: "",
      hsn: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      tax: 0,
      amount: 0,
    });
  };

  const handleChange = async (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    if (field === "pincode" && value.length === 6) {
      try {
        const response = await axios.get(
          `https://api.postalpincode.in/pincode/${value}`
        );
        const data = response.data[0];

        if (data.Status === "Success") {
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
        } else {
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
    updated[index][field] = numericFields.includes(field)
      ? Number(value)
      : value;

    if (field === "description") {
      const matched = productList.find(
        (p) => p.description.toLowerCase() === value.toLowerCase()
      );
      // console.log(matched)
      if (matched) {
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
    updated[index].amount =
      Math.floor((amount - discountAmount + taxedAmount) * 100) / 100;

    const total = updated.reduce((acc, item) => acc + item.amount, 0);
    setForm({ ...form, products: updated, totalAmount: total });
  };

  const copyBuyerToShip = (e) => {
    if (e.target.checked) {
      setForm((prev) => ({
        ...prev,
        shipTo: { ...prev.buyerDetails },
      }));
    }
  };

  const addProduct = () => {
    setForm((prevForm) => {
      const newProduct = [
        ...prevForm.products,
        {
          description: "",
          hsn: "",
          quantity: 1,
          rate: 0,
          discount: 0,
          tax: 0,
          amount: 0,
        },
      ];
      const newTotal = newProduct.reduce(
        (acc, item) => acc + (item.amount || 0),
        0
      );
      return {
        ...prevForm,
        products: newProduct,
        totalAmount: newTotal,
      };
    });
  };

  const handleDeleteProduct = (indexToDelete) => {
    if (form.products.length <= 1) return;
    const updatedProducts = form.products.filter(
      (_, index) => index !== indexToDelete
    );
    const newTotal = updatedProducts.reduce(
      (acc, item) => acc + (item.amount || 0),
      0
    );
    setForm((prevForm) => ({
      ...prevForm,
      products: updatedProducts,
      totalAmount: newTotal,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/invoices/${id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newProducts = form.products.filter(
        (product) =>
          !productList.some(
            (saved) =>
              saved.description.toLowerCase() ===
              product.description.toLowerCase()
          )
      );

      if (newProducts.length > 0) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/product/bulk-save`,
          {
            userId: userId,
            products: newProducts,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      // await new Promise((resolve) => setTimeout(resolve, 10000));
      navigate("/dashboard");
      toast.success("Invoice Updated successfully!");
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally{
      setIsLoading(false);
    }
  };


  if(isLoading){
    return(
      <div className={styles.loading}>
         <ClipLoader color="#36d7b7" loading={isLoading} size={50} />
        <span>Updating Invoice...</span>
      </div>
    )
  }

  if (!form) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.invoice}>
        <h1 className={styles.invoiceTitle}>🧾 Update Invoice</h1>
        <form onSubmit={handleSubmit}>
          <div className="section">
            <div className={styles.firstSection}>
              <div className={styles.invoiceSection}>
                <div className={styles.invoiceValuesSection}>
                  <div>
                    <label htmlFor="invoiceNo">Invoice No:</label>
                    <input
                      value={form.invoiceNumber}
                      id="invoiceNo"
                      name="invoiceNo"
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="invoiceDate">Invoice Date:</label>
                    <input
                      type="date"
                      id="invoiceDate"
                      name="invoiceDate"
                      value={
                        form.invoiceDate ? form.invoiceDate.slice(0, 10) : ""
                      }
                      onChange={(e) =>
                        setForm({ ...form, invoiceDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className={styles.buyerValueSection}>
                  <div>
                    <label htmlFor="buyerOrderNo">Buyer's Order No:</label>
                    <input
                      value={form.buyerOrderNumber}
                      id="buyerOrderNo"
                      name="buyerOrderNumber"
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="buyerOrderDate">Buyer's Order Date:</label>
                    <input
                      type="date"
                      id="buyerOrderDate"
                      name="buyerOrderDate"
                      value={
                        form.buyerOrderDate
                          ? form.buyerOrderDate.slice(0, 10)
                          : ""
                      }
                      onChange={(e) =>
                        setForm({ ...form, buyerOrderDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.secondSection}>
              <div className={styles.billToSection}>
                <h2>Bill To</h2>

                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerNameInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerName">Name *</label>
                  <input
                    type="text"
                    placeholder="Name"
                    id="buyerName"
                    name="buyerName"
                    value={form.buyerDetails.name}
                    onChange={(e) =>
                      handleChange("buyerDetails", "name", e.target.value)
                    }
                    required
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerAddressLine1Input,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerAddressLine1">Address*</label>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    id="buyerAddressLine1"
                    name="buyerAddressLine1"
                    value={form.buyerDetails.addressLine1}
                    onChange={(e) =>
                      handleChange(
                        "buyerDetails",
                        "addressLine1",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerAddressLine2Input,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerAddressLine2">Address</label>
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    id="buyerAddressLine2"
                    name="buyerAddressLine2"
                    value={form.buyerDetails.addressLine2}
                    onChange={(e) =>
                      handleChange(
                        "buyerDetails",
                        "addressLine2",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerPostalCodeInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerPostalCode">Area Code *</label>
                  <input
                    type="text"
                    placeholder="Postal Code"
                    id="buyerPostalCode"
                    name="pincode"
                    value={form.buyerDetails.pincode}
                    onChange={(e) =>
                      handleChange("buyerDetails", "pincode", e.target.value)
                    }
                    required
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerCityInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerCity">City </label>
                  <input
                    type="text"
                    placeholder="City"
                    id="buyerCity"
                    name="buyerCity"
                    value={form.buyerDetails.city}
                    onChange={(e) =>
                      handleChange("buyerDetails", "city", e.target.value)
                    }
                    readOnly
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerStateInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerState">State </label>
                  <input
                    type="text"
                    placeholder="State"
                    id="buyerState"
                    name="buyerState"
                    value={form.buyerDetails.state}
                    onChange={(e) =>
                      handleChange("buyerDetails", "state", e.target.value)
                    }
                    readOnly
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerCountryInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerCountry">Country </label>
                  <input
                    type="text"
                    placeholder="Country"
                    id="buyerCountry"
                    name="buyerCountry"
                    value={form.buyerDetails.country}
                    onChange={(e) =>
                      handleChange("buyerDetails", "country", e.target.value)
                    }
                    readOnly
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerPhoneInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerPhone">Phone *</label>
                  <input
                    type="text"
                    placeholder="Phone"
                    id="buyerPhone"
                    name="buyerPhone"
                    value={form.buyerDetails.phone}
                    onChange={(e) =>
                      handleChange("buyerDetails", "phone", e.target.value)
                    }
                  />
                </div>
                <div
                  className={[
                    styles.buyerInputSection,
                    styles.buyerEmailInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="buyerEmail">Email *</label>
                  <input
                    type="email"
                    placeholder="Email"
                    id="buyerEmail"
                    name="buyerEmail"
                    value={form.buyerDetails.email}
                    onChange={(e) =>
                      handleChange("buyerDetails", "email", e.target.value)
                    }
                  />
                </div>
              </div>

              

              <div className={styles.shipToSection}>
                <div className={styles.shipToCheckbox}>
                <label>
                  <span>Copy From Bill To</span>{" "}
                  <input type="checkbox" onChange={copyBuyerToShip} />
                </label>
              </div>

                <h2>Ship To</h2>

                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToName">Name *</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={form.shipTo.name}
                    onChange={(e) =>
                      handleChange("shipTo", "name", e.target.value)
                    }
                    required
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToAddressLine1Input,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToAddressLine1">Address*</label>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={form.shipTo.addressLine1}
                    onChange={(e) =>
                      handleChange("shipTo", "addressLine1", e.target.value)
                    }
                    required
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToAddressLine2Input,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToAddressLine2">Address</label>
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={form.shipTo.addressLine2}
                    onChange={(e) =>
                      handleChange("shipTo", "addressLine2", e.target.value)
                    }
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToPostalCodeInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToPostalCode">Area Code *</label>
                  <input
                    type="text"
                    placeholder="Postal Code"
                    name="pincode"
                    value={form.shipTo.pincode}
                    onChange={(e) =>
                      handleChange("shipTo", "pincode", e.target.value)
                    }
                    required
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToCityInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToCity">City </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={form.shipTo.city}
                    onChange={(e) =>
                      handleChange("shipTo", "city", e.target.value)
                    }
                    readOnly
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToStateInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToState">State </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={form.shipTo.state}
                    onChange={(e) =>
                      handleChange("shipTo", "state", e.target.value)
                    }
                    readOnly
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToCountryInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToCountry">Country </label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.shipTo.country}
                    onChange={(e) =>
                      handleChange("shipTo", "country", e.target.value)
                    }
                    readOnly
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToPhoneInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToPhone">Phone *</label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={form.shipTo.phone}
                    onChange={(e) =>
                      handleChange("shipTo", "phone", e.target.value)
                    }
                  />
                </div>
                <div
                  className={[
                    styles.shipToInputSection,
                    styles.shipToEmailInput,
                    styles.billingInputSection,
                  ].join(" ")}
                >
                  <label htmlFor="shipToEmail">Email *</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.buyerDetails.email}
                    onChange={(e) =>
                      handleChange("shipTo", "email", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.productsSection}>
              {!isMobile && (
                <div className={styles.productsHeader}>
                  <h2>Products</h2>
                  <div className={styles.productsHeaderBtns}>
                    <div className={styles.productsHeaderStatusBtn}>
                      {/* <label>Status</label> */}
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="" hidden>
                          Select Status
                        </option>
                        <option value="draft">Draft</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <button type="submit">💾 Update Invoice</button>
                    <button type="button" onClick={addProduct}>
                      + Add Product
                    </button>
                  </div>
                </div>
              )}

              {isMobile && (
                <div className={styles.productsHeader}>
                  <div
                    className={[
                      styles.productsHeaderBtns,
                      styles.mobileProductsHeaderBtns,
                    ].join(" ")}
                  >
                    <div
                      className={[
                        styles.productsHeaderStatusBtn,
                        styles.mobileProductsHeaderStatusBtn,
                      ].join(" ")}
                    >
                      {/* <label>Status</label> */}
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value })
                        }
                      >
                        <option value="" hidden>
                          Select Status
                        </option>
                        <option value="draft">Draft</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div className={styles.productButtons}>
                      <button type="submit">
                        <MdSave size={16} />
                      </button>
                      <button type="button" onClick={() => setShowProductModal(true)}>
                        <MdAdd size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isMobile && (
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
                    {form.products.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            value={item.description}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={item.hsn}
                            onChange={(e) =>
                              handleProductChange(index, "hsn", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleProductChange(index, "rate", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "discount",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.tax}
                            onChange={(e) =>
                              handleProductChange(index, "tax", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input type="number" value={item.amount} readOnly />
                        </td>
                        {/* <td>{item.amount}</td> */}
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(index)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {isMobile && (
                <table className={styles.productTable}>
                  <thead
                    className={[
                      styles.productTableHead,
                      styles.productMobileTableHead,
                    ].join(" ")}
                  >
                    <tr className={styles.productTableRow}>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody
                    className={[
                      styles.productTableBody,
                      styles.mobileProductTableBody,
                    ].join(" ")}
                  >
                    {form.products.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            value={item.description}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <input type="number" value={item.amount} readOnly />
                        </td>
                        {/* <td>{item.amount}</td> */}
                        <td className={styles.mobileProductActions}>
                          <button
                            type="button"
                            onClick={() => {
                              setNewProduct(form.products[index]);
                              setEditProductModal(true);
                            }}
                          >
                            <MdEdit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(index)}
                          >
                            <MdDelete size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {isMobile && editProductModal && (
                <div className={styles.productModal}>
                  <div className={styles.productModalForm}>
                    <h3>Update Product</h3>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="description">Description</label>
                    <input
                      type="text"
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) =>
                        handleModalProductChange("description", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                       <label htmlFor="hsn">HSN</label>
                    <input
                      type="text"
                      placeholder="HSN"
                      value={newProduct.hsn}
                      onChange={(e) =>
                        handleModalProductChange("hsn", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="quantity">Quantity</label>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        handleModalProductChange("quantity", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="rate">Rate</label>
                    <input
                      type="number"
                      placeholder="Rate"
                      value={newProduct.rate}
                      onChange={(e) =>
                        handleModalProductChange("rate", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="discount">Discount</label>
                    <input
                      type="number"
                      placeholder="Discount %"
                      value={newProduct.discount}
                      onChange={(e) =>
                        handleModalProductChange("discount", e.target.value)
                      }
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="tax">Tax</label>
                    <input
                      type="number"
                      placeholder="Tax %"
                      value={newProduct.tax}
                      onChange={(e) =>
                        handleModalProductChange("tax", e.target.value)
                      }
                    />
                    </div>
                    <button
                      type="button"
                      onClick={handleEditProductModalSubmit}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProductModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {isMobile && showProductModal && (
                <div className={styles.productModal}>
                  <div className={styles.productModalForm}>
                    <h3>Add Product</h3>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="description">Description</label>
                    <input
                      type="text"
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) =>
                        handleModalProductChange("description", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="hsn">HSN</label>
                    <input
                      type="text"
                      placeholder="HSN"
                      value={newProduct.hsn}
                      onChange={(e) =>
                        handleModalProductChange("hsn", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="quantity">Quantity</label>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        handleModalProductChange("quantity", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="rate">Rate</label>
                    <input
                      type="number"
                      placeholder="Rate"
                      value={newProduct.rate}
                      onChange={(e) =>
                        handleModalProductChange("rate", e.target.value)
                      }
                      required
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="discount">Discount</label>
                    <input
                      type="number"
                      placeholder="Discount %"
                      value={newProduct.discount}
                      onChange={(e) =>
                        handleModalProductChange("discount", e.target.value)
                      }
                    />
                    </div>
                    <div className={[styles.productModleInputSection].join(" ")}>
                      <label htmlFor="tax">Tax</label>
                    <input
                      type="number"
                      placeholder="Tax %"
                      value={newProduct.tax}
                      onChange={(e) =>
                        handleModalProductChange("tax", e.target.value)
                      }
                    />
                    </div>
                    <button type="button" onClick={handleProductModalSubmit}>
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <h3 className={styles.totalAmount}>
                <span className={styles.totalAmountText}>Total:</span>{" "}
                <span className={styles.totalAmountValue}>
                  ₹{form.totalAmount.toLocaleString("en-IN")}
                </span>
              </h3>
            </div>
          </div>
          {/* <button type="Submit">Update Invoice</button> */}
        </form>
      </div>
    </div>
  );
};

export default EditInvoice;
