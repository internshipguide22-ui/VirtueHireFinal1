// // CheckoutPage.jsx
// import React, { useState } from "react";

// const CheckoutPage = ({ payment }) => {
//   const [selectedMethod, setSelectedMethod] = useState("CREDIT_CARD");
//   const [termsChecked, setTermsChecked] = useState(false);

//   const paymentMethods = [
//     {
//       id: "CREDIT_CARD",
//       title: "Credit/Debit Card",
//       icon: "credit-card",
//       color: "primary",
//       description: "Pay securely with your card",
//     },
//     {
//       id: "UPI",
//       title: "UPI Payment",
//       icon: "mobile-alt",
//       color: "success",
//       description: "Instant payment using UPI",
//     },
//     {
//       id: "NETBANKING",
//       title: "Net Banking",
//       icon: "university",
//       color: "info",
//       description: "Transfer from your bank account",
//     },
//     {
//       id: "MOCK",
//       title: "Mock Payment (Demo)",
//       icon: "code",
//       color: "warning",
//       description: "Test payment simulation",
//     },
//   ];

//   const handleMethodSelect = (id) => {
//     setSelectedMethod(id);
//   };

//   const handleSubmit = (e) => {
//     if (!termsChecked) {
//       e.preventDefault();
//       alert("Please accept Terms of Service and Privacy Policy.");
//     }
//     // form submission handled normally
//   };

//   return (
//     <div className="container my-5">
//       <div className="row justify-content-center">
//         <div className="col-md-8">
//           {/* Card */}
//           <div className="card">
//             <div className="card-header bg-primary text-white">
//               <h4 className="mb-0">Complete Your Purchase</h4>
//             </div>
//             <div className="card-body">
//               {/* Order Summary */}
//               <div className="row mb-4">
//                 <div className="col-md-6">
//                   <h5>Order Summary</h5>
//                   {payment && (
//                     <>
//                       <p><strong>Plan:</strong> {payment.planType}</p>
//                       <p><strong>Amount:</strong> ₹{parseFloat(payment.amount).toFixed(2)}</p>
//                       <p><strong>Description:</strong> {payment.description}</p>
//                     </>
//                   )}
//                 </div>
//                 <div className="col-md-6">
//                   <div className="card bg-light">
//                     <div className="card-body">
//                       <h6>Total Amount</h6>
//                       <h3 className="text-primary">₹{payment ? parseFloat(payment.amount).toFixed(2) : 0}</h3>
//                       <small className="text-muted">Inclusive of all taxes</small>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Methods */}
//               <h5 className="mb-3">Select Payment Method</h5>
//               <form action="/payments/process" method="post" onSubmit={handleSubmit}>
//                 <input type="hidden" name="paymentGatewayId" value={payment?.paymentGatewayId || ""} />
//                 <input type="hidden" name="paymentMethod" value={selectedMethod} />

//                 {paymentMethods.map((method) => (
//                   <div
//                     key={method.id}
//                     className={`payment-method ${selectedMethod === method.id ? "selected" : ""}`}
//                     onClick={() => handleMethodSelect(method.id)}
//                     style={{
//                       border: "2px solid #e0e0e0",
//                       borderRadius: "10px",
//                       padding: "15px",
//                       margin: "10px 0",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                       backgroundColor: selectedMethod === method.id ? "#f8f9ff" : "white",
//                       borderColor: selectedMethod === method.id ? "#007bff" : "#e0e0e0",
//                     }}
//                   >
//                     <div className="form-check">
//                       <input
//                         className="form-check-input"
//                         type="radio"
//                         name="paymentMethod"
//                         id={method.id}
//                         value={method.id}
//                         checked={selectedMethod === method.id}
//                         readOnly
//                       />
//                       <label className="form-check-label d-flex align-items-center" htmlFor={method.id}>
//                         <i className={`fas fa-${method.icon} payment-icon text-${method.color}`} style={{ fontSize: "2rem", marginRight: "15px" }}></i>
//                         <div>
//                           <h6 className="mb-1">{method.title}</h6>
//                           <small className="text-muted">{method.description}</small>
//                         </div>
//                       </label>
//                     </div>
//                   </div>
//                 ))}

//                 <div className="mt-4">
//                   <div className="form-check mb-3">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="terms"
//                       checked={termsChecked}
//                       onChange={(e) => setTermsChecked(e.target.checked)}
//                     />
//                     <label className="form-check-label" htmlFor="terms">
//                       I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
//                     </label>
//                   </div>

//                   <div className="d-grid gap-2">
//                     <button type="submit" className="btn btn-primary btn-lg">
//                       <i className="fas fa-lock me-2"></i>Pay ₹{payment ? parseFloat(payment.amount).toFixed(2) : 0}
//                     </button>
//                     <a href="/payments/plans" className="btn btn-outline-secondary">Cancel</a>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>

//           {/* Security Notice */}
//           <div className="alert alert-info mt-3">
//             <i className="fas fa-shield-alt me-2"></i>
//             <strong>Secure Payment:</strong> Your payment information is encrypted and secure.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;


// src/pages/CheckoutPage.jsx
import React, { useState } from "react";
import { useAppDialog } from "../common/AppDialog";

const CheckoutPage = ({ payment }) => {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { showAlert, dialogNode } = useAppDialog();

  const handlePaymentMethodClick = (method) => {
    setSelectedMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      await showAlert({
        title: "Accept Terms",
        message: "Please accept the terms and conditions.",
        tone: "warning"
      });
      return;
    }
    // Call your API to process payment
    console.log("Payment submitted:", selectedMethod, payment.paymentGatewayId);
  };

  return (
    <div>
      {dialogNode}
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/hrs/dashboard">
            <i className="fas fa-gem me-2"></i>VirtueHire
          </a>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Complete Your Purchase</h4>
              </div>
              <div className="card-body">
                {/* Order Summary */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h5>Order Summary</h5>
                    {payment && (
                      <>
                        <p>
                          <strong>Plan:</strong> {payment.planType}
                        </p>
                        <p>
                          <strong>Amount:</strong> ₹
                          {Number(payment.amount).toFixed(2)}
                        </p>
                        <p>
                          <strong>Description:</strong> {payment.description}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>Total Amount</h6>
                        <h3 className="text-primary">
                          ₹{Number(payment?.amount || 0).toFixed(2)}
                        </h3>
                        <small className="text-muted">
                          Inclusive of all taxes
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <h5 className="mb-3">Select Payment Method</h5>

                <form onSubmit={handleSubmit}>
                  <input
                    type="hidden"
                    name="paymentGatewayId"
                    value={payment?.paymentGatewayId}
                  />

                  {[
                    {
                      id: "card",
                      value: "CREDIT_CARD",
                      icon: "fas fa-credit-card text-primary",
                      title: "Credit/Debit Card",
                      description: "Pay securely with your card",
                    },
                    {
                      id: "upi",
                      value: "UPI",
                      icon: "fas fa-mobile-alt text-success",
                      title: "UPI Payment",
                      description: "Instant payment using UPI",
                    },
                    {
                      id: "netbanking",
                      value: "NETBANKING",
                      icon: "fas fa-university text-info",
                      title: "Net Banking",
                      description: "Transfer from your bank account",
                    },
                    {
                      id: "mock",
                      value: "MOCK",
                      icon: "fas fa-code text-warning",
                      title: "Mock Payment (Demo)",
                      description: "Test payment simulation",
                    },
                  ].map((method) => (
                    <div
                      key={method.id}
                      className={`payment-method mb-2 ${
                        selectedMethod === method.id ? "selected" : ""
                      }`}
                      style={{
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        padding: "15px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backgroundColor:
                          selectedMethod === method.id ? "#f8f9ff" : "white",
                        borderColor:
                          selectedMethod === method.id ? "#007bff" : "#e0e0e0",
                      }}
                      onClick={() => handlePaymentMethodClick(method.id)}
                    >
                      <div className="form-check d-flex align-items-center">
                        <input
                          className="form-check-input me-3"
                          type="radio"
                          name="paymentMethod"
                          id={method.id}
                          value={method.value}
                          checked={selectedMethod === method.id}
                          readOnly
                        />
                        <label
                          className="form-check-label d-flex align-items-center"
                          htmlFor={method.id}
                        >
                          <i className={`${method.icon} payment-icon me-3`} style={{ fontSize: "2rem" }}></i>
                          <div>
                            <h6 className="mb-1">{method.title}</h6>
                            <small className="text-muted">{method.description}</small>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        required
                      />
                      <label className="form-check-label" htmlFor="terms">
                        I agree to the{" "}
                        <a href="#">Terms of Service</a> and{" "}
                        <a href="#">Privacy Policy</a>
                      </label>
                    </div>

                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary btn-lg">
                        <i className="fas fa-lock me-2"></i>Pay ₹
                        {Number(payment?.amount || 0).toFixed(2)}
                      </button>
                      <a href="/payments/plans" className="btn btn-outline-secondary">
                        Cancel
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Security Notice */}
            <div className="alert alert-info mt-3">
              <i className="fas fa-shield-alt me-2"></i>
              <strong>Secure Payment:</strong> Your payment information is encrypted
              and secure.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
