// // PaymentHistory.jsx
// import React from "react";

// const PaymentHistory = ({ payments = [] }) => {

//   // Utility to calculate totals
//   const totalSpent = payments
//     .filter(p => p.status === "SUCCESS")
//     .reduce((sum, p) => sum + p.amount, 0);

//   const successfulCount = payments.filter(p => p.status === "SUCCESS").length;
//   const failedCount = payments.filter(p => p.status === "FAILED").length;

//   const formatDate = (dateString) => {
//     const options = { day: "2-digit", month: "short", year: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const formatAmount = (amount) => amount.toFixed(2);

//   return (
//     <div>
//       {/* Navigation */}
//       <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
//         <div className="container">
//           <a className="navbar-brand" href="/hrs/dashboard">
//             <i className="fas fa-gem me-2"></i>VirtueHire
//           </a>
//           <div className="navbar-nav ms-auto">
//             <a className="nav-link" href="/hrs/dashboard">Dashboard</a>
//             <a className="nav-link" href="/payments/plans">Plans</a>
//             <a className="nav-link active" href="/payments/history">Payment History</a>
//             <a className="nav-link" href="/hrs/logout">Logout</a>
//           </div>
//         </div>
//       </nav>

//       <div className="container my-5">
//         <div className="row">
//           <div className="col-12">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//               <h1><i className="fas fa-receipt me-2"></i>Payment History</h1>
//               <a href="/payments/plans" className="btn btn-primary">
//                 <i className="fas fa-plus me-2"></i>Upgrade Plan
//               </a>
//             </div>

//             {/* Stats Cards */}
//             <div className="row mb-4">
//               <div className="col-md-3">
//                 <div className="card text-white bg-primary">
//                   <div className="card-body">
//                     <h5 className="card-title">{payments.length}</h5>
//                     <p className="card-text">Total Payments</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-3">
//                 <div className="card text-white bg-success">
//                   <div className="card-body">
//                     <h5 className="card-title">₹{formatAmount(totalSpent)}</h5>
//                     <p className="card-text">Total Spent</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-3">
//                 <div className="card text-white bg-warning">
//                   <div className="card-body">
//                     <h5 className="card-title">{successfulCount}</h5>
//                     <p className="card-text">Successful</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-3">
//                 <div className="card text-white bg-danger">
//                   <div className="card-body">
//                     <h5 className="card-title">{failedCount}</h5>
//                     <p className="card-text">Failed</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Payments Table */}
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="mb-0">Recent Transactions</h5>
//               </div>
//               <div className="card-body">
//                 {payments.length === 0 ? (
//                   <div className="text-center py-5">
//                     <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
//                     <h5>No payment history found</h5>
//                     <p className="text-muted">You haven't made any payments yet.</p>
//                     <a href="/payments/plans" className="btn btn-primary">View Plans</a>
//                   </div>
//                 ) : (
//                   <div className="table-responsive">
//                     <table className="table table-hover">
//                       <thead>
//                         <tr>
//                           <th>Date</th>
//                           <th>Transaction ID</th>
//                           <th>Plan</th>
//                           <th>Amount</th>
//                           <th>Payment Method</th>
//                           <th>Status</th>
//                           <th>Action</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {payments.map(payment => {
//                           let statusClass = "";
//                           if(payment.status === "SUCCESS") statusClass = "status-badge status-success";
//                           else if(payment.status === "PENDING") statusClass = "status-badge status-pending";
//                           else if(payment.status === "FAILED") statusClass = "status-badge status-failed";

//                           return (
//                             <tr key={payment.id}>
//                               <td>{formatDate(payment.createdAt)}</td>
//                               <td><small className="text-muted">{payment.paymentGatewayId}</small></td>
//                               <td>{payment.planType}</td>
//                               <td>₹{formatAmount(payment.amount)}</td>
//                               <td>{payment.paymentMethod}</td>
//                               <td><span className={statusClass}>{payment.status}</span></td>
//                               <td>
//                                 {payment.status === "PENDING" ? (
//                                   <a href={`/payments/mock-gateway/${payment.id}`} className="btn btn-sm btn-outline-primary">Retry</a>
//                                 ) : (
//                                   <span className="text-muted">-</span>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Export Option */}
//             <div className="text-end mt-3">
//               <button className="btn btn-outline-secondary">
//                 <i className="fas fa-download me-2"></i>Export as CSV
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-dark text-white py-4 mt-5">
//         <div className="container text-center">
//           <p>&copy; 2024 VirtueHire. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default PaymentHistory;


import React, { useEffect, useState } from "react";
import axios from "axios";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get("/api/payments/history", { withCredentials: true })
      .then(res => setPayments(res.data));
  }, []);

  return (
    <div>
      <h2>Payment History</h2>
      <ul>
        {payments.map(p => (
          <li key={p.id}>
            {p.planType} - ₹{p.amount} - {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentHistory;
