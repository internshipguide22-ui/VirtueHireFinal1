// // MockPaymentGateway.jsx
// import React, { useState } from "react";

// const MockPaymentGateway = ({ payment }) => {
//   const [selectedScenario, setSelectedScenario] = useState("SUCCESS");
//   const [processing, setProcessing] = useState(false);

//   const scenarioTexts = {
//     SUCCESS: "Successful Payment",
//     FAIL_INSUFFICIENT_FUNDS: "Insufficient Funds - Transaction Failed",
//     FAIL_NETWORK_ERROR: "Network Error - Transaction Failed",
//     RANDOM: "Random Outcome (70% Success Rate)",
//   };

//   const handleScenarioSelect = (scenario) => {
//     setSelectedScenario(scenario);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setProcessing(true);

//     // Simulate processing delay
//     setTimeout(() => {
//       e.target.submit(); // actual form submission
//     }, 2000);
//   };

//   return (
//     <div className="container my-5">
//       <div className="row justify-content-center">
//         <div className="col-md-8">
//           {/* Gateway Header */}
//           <div className="gateway-header rounded-top p-4 text-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
//             <h2><i className="fas fa-shield-alt me-2"></i>Secure Payment Gateway</h2>
//             <p className="mb-0">Demo Environment - For Testing Purposes Only</p>
//           </div>

//           <div className="card border-top-0">
//             <div className="card-body">
//               {payment && (
//                 <>
//                   {/* Payment Details */}
//                   <div className="row mb-4">
//                     <div className="col-md-6">
//                       <h5>Merchant: VirtueHire</h5>
//                       <p className="mb-1"><strong>Order ID:</strong> {payment.paymentGatewayId}</p>
//                       <p className="mb-1"><strong>Amount:</strong> ₹{parseFloat(payment.amount).toFixed(2)}</p>
//                       <p className="mb-0"><strong>Plan:</strong> {payment.planType}</p>
//                     </div>
//                     <div className="col-md-6 text-end">
//                       <div className="alert alert-info">
//                         <small>
//                           <i className="fas fa-info-circle me-1"></i>
//                           This is a mock payment gateway for demonstration purposes.
//                         </small>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Test Scenarios */}
//                   <h5 className="mb-3">Select Test Scenario</h5>
//                   <div className="row g-3 mb-4">
//                     {[
//                       { id: "SUCCESS", title: "Successful Payment", icon: "check-circle", color: "success" },
//                       { id: "FAIL_INSUFFICIENT_FUNDS", title: "Insufficient Funds", icon: "times-circle", color: "danger" },
//                       { id: "FAIL_NETWORK_ERROR", title: "Network Error", icon: "wifi", color: "warning" },
//                       { id: "RANDOM", title: "Random Outcome", icon: "random", color: "secondary" },
//                     ].map((scenario) => (
//                       <div className="col-md-6" key={scenario.id}>
//                         <div
//                           className={`card scenario-card border-${scenario.color} ${selectedScenario === scenario.id ? "border-2" : ""}`}
//                           onClick={() => handleScenarioSelect(scenario.id)}
//                           style={{ cursor: "pointer", transition: "all 0.3s ease" }}
//                         >
//                           <div className="card-body text-center">
//                             <i className={`fas fa-${scenario.icon} text-${scenario.color} fa-2x mb-2`}></i>
//                             <h6>{scenario.title}</h6>
//                             <small className="text-muted">
//                               {scenario.id === "RANDOM"
//                                 ? "70% success, 30% failure"
//                                 : `Simulate ${scenario.title.toLowerCase()}`}
//                             </small>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Payment Form */}
//                   <form action="/payments/process" method="post" onSubmit={handleSubmit}>
//                     <input type="hidden" name="paymentGatewayId" value={payment.paymentGatewayId} />
//                     <input type="hidden" name="paymentMethod" value="MOCK" />
//                     <input type="hidden" name="scenario" value={selectedScenario} />

//                     <div className="mb-3">
//                       <label className="form-label">Card Number</label>
//                       <input type="text" className="form-control" value="4111 1111 1111 1111" readOnly />
//                     </div>

//                     <div className="row mb-3">
//                       <div className="col-md-6">
//                         <label className="form-label">Expiry Date</label>
//                         <input type="text" className="form-control" value="12/25" readOnly />
//                       </div>
//                       <div className="col-md-6">
//                         <label className="form-label">CVV</label>
//                         <input type="text" className="form-control" value="123" readOnly />
//                       </div>
//                     </div>

//                     <div className="mb-3">
//                       <label className="form-label">Cardholder Name</label>
//                       <input type="text" className="form-control" value="Demo User" readOnly />
//                     </div>

//                     {/* Selected Scenario Display */}
//                     <div className="alert alert-info">
//                       <strong>Selected Scenario:</strong> {scenarioTexts[selectedScenario]}
//                     </div>

//                     {/* Processing Animation */}
//                     {processing && (
//                       <div className="loading-spinner text-center my-4">
//                         <div className="spinner-border text-primary" role="status">
//                           <span className="visually-hidden">Processing...</span>
//                         </div>
//                         <p className="mt-2">Processing payment...</p>
//                       </div>
//                     )}

//                     {/* Action Buttons */}
//                     {!processing && (
//                       <div className="d-grid gap-2">
//                         <button type="submit" className="btn btn-primary btn-lg">
//                           <i className="fas fa-lock me-2"></i>Process Payment
//                         </button>
//                         <a href="/payments/plans" className="btn btn-outline-secondary">Cancel</a>
//                       </div>
//                     )}
//                   </form>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Demo Notice */}
//           <div className="alert alert-warning mt-3">
//             <h6><i className="fas fa-flask me-2"></i>Demo Environment Notice</h6>
//             <p className="mb-0">
//               This is a simulated payment gateway for testing purposes. No real money will be charged.
//               Use any of the test scenarios to see different payment outcomes.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MockPaymentGateway;
