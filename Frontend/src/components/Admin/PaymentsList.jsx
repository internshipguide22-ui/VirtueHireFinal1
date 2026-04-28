// // AdminPayments.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const AdminPayments = () => {
//   const [payments, setPayments] = useState([]);
//   const [stats, setStats] = useState({
//     totalPayments: 0,
//     successfulPayments: 0,
//     totalRevenue: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const fetchPayments = async () => {
//     try {
//       const res = await axios.get("https://backend.virtuehire.in/admin/payments"); // Adjust URL
//       const data = res.data;

//       setPayments(data);

//       const successful = data.filter(p => p.status === "SUCCESS").length;
//       const revenue = data.reduce((sum, p) => sum + p.amount, 0);

//       setStats({
//         totalPayments: data.length,
//         successfulPayments: successful,
//         totalRevenue: revenue,
//       });

//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load payments.");
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="p-4">Loading payments...</div>;
//   if (error) return <div className="p-4 text-red-600">{error}</div>;

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "SUCCESS":
//         return "bg-green-100 text-green-800";
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800";
//       case "FAILED":
//         return "bg-red-100 text-red-800";
//       case "CANCELLED":
//         return "bg-gray-200 text-gray-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="p-4">
//       {/* Navbar */}
//       <nav className="flex justify-between items-center bg-gray-800 text-white p-4 rounded">
//         <a href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
//           <i className="fas fa-crown"></i> Admin Panel
//         </a>
//         <div className="flex gap-4">
//           <a href="/admin/dashboard" className="hover:underline">Dashboard</a>
//           <a href="/admin/hrs" className="hover:underline">HR Management</a>
//           <a href="/admin/questions" className="hover:underline">Question Bank</a>
//           <a href="/admin/candidates" className="hover:underline">Candidates</a>
//           <a href="/admin/payments" className="hover:underline font-bold">Payments</a>
//         </div>
//       </nav>

//       <div className="mt-6">
//         <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
//           <i className="fas fa-money-bill-wave"></i> Payment Management
//         </h1>

//         {/* Statistics */}
//         <div className="grid md:grid-cols-4 gap-4 mb-4">
//           <div className="bg-blue-600 text-white p-4 rounded text-center">
//             <h5 className="text-xl font-bold">{stats.totalPayments}</h5>
//             <p>Total Payments</p>
//           </div>
//           <div className="bg-green-600 text-white p-4 rounded text-center">
//             <h5 className="text-xl font-bold">{stats.successfulPayments}</h5>
//             <p>Successful</p>
//           </div>
//           <div className="bg-yellow-600 text-white p-4 rounded text-center">
//             <h5 className="text-xl font-bold">{stats.totalPayments - stats.successfulPayments}</h5>
//             <p>Failed/Pending</p>
//           </div>
//           <div className="bg-teal-600 text-white p-4 rounded text-center">
//             <h5 className="text-xl font-bold">₹{stats.totalRevenue.toFixed(2)}</h5>
//             <p>Total Revenue</p>
//           </div>
//         </div>

//         {/* Payments Table */}
//         <div className="bg-gray-100 p-4 rounded shadow">
//           <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse">
//               <thead className="bg-gray-200">
//                 <tr>
//                   <th className="border p-2">ID</th>
//                   <th className="border p-2">HR Name</th>
//                   <th className="border p-2">Plan Type</th>
//                   <th className="border p-2">Amount</th>
//                   <th className="border p-2">Status</th>
//                   <th className="border p-2">Date</th>
//                   <th className="border p-2">Transaction ID</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {payments.length > 0 ? (
//                   payments.map(payment => (
//                     <tr key={payment.id} className="hover:bg-gray-50">
//                       <td className="border p-2">{payment.id}</td>
//                       <td className="border p-2">{payment.hr.fullName}</td>
//                       <td className="border p-2">
//                         <span className="bg-gray-300 text-gray-800 px-2 py-1 rounded">{payment.planType}</span>
//                       </td>
//                       <td className="border p-2">₹{payment.amount.toFixed(2)}</td>
//                       <td className={`border p-2 px-2 py-1 rounded ${getStatusBadge(payment.status)}`}>
//                         {payment.status}
//                       </td>
//                       <td className="border p-2">{new Date(payment.createdAt).toLocaleString()}</td>
//                       <td className="border p-2 text-gray-600"><small>{payment.paymentGatewayId}</small></td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="text-center p-4 text-gray-500">
//                       <i className="fas fa-inbox fa-2x mb-2"></i>
//                       <p>No payments found.</p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Back Button */}
//         <div className="mt-3">
//           <a href="/admin/dashboard" className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 inline-flex items-center gap-2">
//             <i className="fas fa-arrow-left"></i> Back to Dashboard
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminPayments;


// src/pages/admin/PaymentsList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/payments")
      .then((res) => {
        const data = res.data.payments || [];
        const totalPayments = data.length;
        const successfulPayments = data.filter(p => p.status === "SUCCESS").length;
        const totalRevenue = data.reduce((sum, p) => sum + (p.amount || 0), 0);

        setPayments(data);
        setStats({ totalPayments, successfulPayments, totalRevenue });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load payments.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const getStatusClass = (status) => {
    switch (status) {
      case "SUCCESS": return "status-badge status-success";
      case "PENDING": return "status-badge status-pending";
      case "FAILED": return "status-badge status-failed";
      default: return "status-badge status-cancelled";
    }
  };

  return (
    <div className="container my-4">
      <h1><i className="fas fa-money-bill-wave me-2"></i>Payment Management</h1>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">{stats.totalPayments}</h5>
              <p className="card-text">Total Payments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">{stats.successfulPayments}</h5>
              <p className="card-text">Successful</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">{stats.totalPayments - stats.successfulPayments}</h5>
              <p className="card-text">Failed/Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">₹{stats.totalRevenue.toFixed(2)}</h5>
              <p className="card-text">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">All Payments</h5>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>HR Name</th>
                <th>Plan Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.hr?.fullName || "N/A"}</td>
                    <td>
                      <span className="badge bg-secondary">{payment.planType}</span>
                    </td>
                    <td>₹{payment.amount?.toFixed(2)}</td>
                    <td>
                      <span className={getStatusClass(payment.status)}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleString()}</td>
                    <td><small className="text-muted">{payment.paymentGatewayId}</small></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    <i className="fas fa-inbox fa-2x mb-2"></i>
                    <p>No payments found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3">
        <Link to="/admin/dashboard" className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentsList;
