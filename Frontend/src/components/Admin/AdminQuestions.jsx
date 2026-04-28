// // AdminQuestions.jsx
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const AdminQuestions = () => {
//   const navigate = useNavigate();

//   const [questions, setQuestions] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [selectedSubject, setSelectedSubject] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [newQuestion, setNewQuestion] = useState({
//     subject: "",
//     level: 1,
//     text: "",
//     options: ["", "", "", ""],
//     correctAnswer: "",
//   });

//   useEffect(() => {
//     fetchQuestions();
//     fetchSubjects();
//   }, []);

//   const fetchQuestions = async () => {
//     try {
//       const res = await axios.get("https://backend.virtuehire.in/admin/questions");
//       setQuestions(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load questions.");
//       setLoading(false);
//     }
//   };

//   const fetchSubjects = async () => {
//     try {
//       const res = await axios.get("https://backend.virtuehire.in/admin/questions/subjects");
//       setSubjects(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleNewQuestionChange = (e) => {
//     const { name, value } = e.target;
//     setNewQuestion(prev => ({ ...prev, [name]: value }));
//   };

//   const handleOptionChange = (index, value) => {
//     const newOptions = [...newQuestion.options];
//     newOptions[index] = value;
//     setNewQuestion(prev => ({ ...prev, options: newOptions }));
//   };

//   const handleAddQuestion = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("https://backend.virtuehire.in/admin/questions/add", newQuestion);
//       setNewQuestion({
//         subject: "",
//         level: 1,
//         text: "",
//         options: ["", "", "", ""],
//         correctAnswer: "",
//       });
//       fetchQuestions();
//     } catch (err) {
//       console.error(err);
//       setError("Failed to add question.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this question?")) return;
//     try {
//       await axios.post(`https://backend.virtuehire.in/admin/questions/delete/${id}`);
//       setQuestions(questions.filter(q => q.id !== id));
//     } catch (err) {
//       console.error(err);
//       setError("Failed to delete question.");
//     }
//   };

//   const handleFilter = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.get(`https://backend.virtuehire.in/admin/questions?subject=${selectedSubject}`);
//       setQuestions(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to filter questions.");
//     }
//   };

//   if (loading) return <div className="p-4">Loading questions...</div>;
//   if (error) return <div className="p-4 text-red-600">{error}</div>;

//   return (
//     <div className="container my-4">
//       {/* Navbar */}
//       <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
//         <div className="container">
//           <a className="navbar-brand" href="/admin/dashboard">
//             <i className="fas fa-crown me-2"></i>Admin Panel
//           </a>
//           <div className="navbar-nav ms-auto">
//             <a className="nav-link" href="/admin/dashboard">Dashboard</a>
//             <a className="nav-link" href="/admin/hrs">HR Management</a>
//             <a className="nav-link active" href="/admin/questions">Question Bank</a>
//             <a className="nav-link" href="/admin/candidates">Candidates</a>
//           </div>
//         </div>
//       </nav>

//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h1><i className="fas fa-question-circle me-2"></i>Question Bank Management</h1>
//         <button className="btn btn-secondary" onClick={() => navigate("/admin/dashboard")}>
//           <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
//         </button>
//       </div>

//       {/* Filter */}
//       <div className="card mb-4">
//         <div className="card-header bg-primary text-white">
//           <h5 className="mb-0">Filter Questions</h5>
//         </div>
//         <div className="card-body">
//           <form className="row g-3" onSubmit={handleFilter}>
//             <div className="col-md-8">
//               <label className="form-label">Filter by Subject</label>
//               <select
//                 className="form-select"
//                 value={selectedSubject}
//                 onChange={(e) => setSelectedSubject(e.target.value)}
//               >
//                 <option value="">All Subjects</option>
//                 {subjects.map((subject, idx) => (
//                   <option key={idx} value={subject}>{subject}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="col-md-4 d-flex align-items-end gap-2">
//               <button type="submit" className="btn btn-primary">Filter</button>
//               <button
//                 type="button"
//                 className="btn btn-outline-secondary"
//                 onClick={() => { setSelectedSubject(""); fetchQuestions(); }}
//               >
//                 Clear
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Add New Question */}
//       <div className="card mb-4">
//         <div className="card-header bg-success text-white">
//           <h5 className="mb-0">Add New Question</h5>
//         </div>
//         <div className="card-body">
//           <form onSubmit={handleAddQuestion}>
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">Subject *</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={newQuestion.subject}
//                     onChange={handleNewQuestionChange}
//                     name="subject"
//                     required
//                     placeholder="e.g., Java, React, Python"
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">Level *</label>
//                   <select
//                     className="form-select"
//                     value={newQuestion.level}
//                     onChange={handleNewQuestionChange}
//                     name="level"
//                     required
//                   >
//                     <option value={1}>Easy</option>
//                     <option value={2}>Medium</option>
//                     <option value={3}>Hard</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Question Text *</label>
//               <textarea
//                 className="form-control"
//                 rows="3"
//                 value={newQuestion.text}
//                 onChange={handleNewQuestionChange}
//                 name="text"
//                 required
//                 placeholder="Enter the question text..."
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Options (4 required) *</label>
//               {newQuestion.options.map((opt, idx) => (
//                 <input
//                   key={idx}
//                   type="text"
//                   className="form-control mb-2"
//                   value={opt}
//                   onChange={(e) => handleOptionChange(idx, e.target.value)}
//                   placeholder={`Option ${idx + 1}`}
//                   required
//                 />
//               ))}
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Correct Answer *</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={newQuestion.correctAnswer}
//                 onChange={handleNewQuestionChange}
//                 name="correctAnswer"
//                 required
//                 placeholder="Must match one of the options exactly"
//               />
//               <div className="form-text">
//                 Make sure this exactly matches one of the options above
//               </div>
//             </div>

//             <div className="d-grid">
//               <button type="submit" className="btn btn-success">Add Question</button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Questions List */}
//       <div className="card">
//         <div className="card-header bg-dark text-white">
//           <h5 className="mb-0">
//             Questions List
//             <span className="badge bg-light text-dark ms-2">{questions.length}</span>
//           </h5>
//         </div>
//         <div className="card-body">
//           {questions.length === 0 ? (
//             <div className="text-center text-muted py-4">
//               <i className="fas fa-inbox fa-2x mb-2"></i>
//               <p>No questions found</p>
//               {selectedSubject && <p className="small">for subject: <strong>{selectedSubject}</strong></p>}
//             </div>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-hover">
//                 <thead>
//                   <tr>
//                     <th>ID</th>
//                     <th>Subject</th>
//                     <th>Level</th>
//                     <th>Question</th>
//                     <th>Options</th>
//                     <th>Correct Answer</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {questions.map((q) => (
//                     <tr key={q.id}>
//                       <td>{q.id}</td>
//                       <td><span className="badge bg-info">{q.subject}</span></td>
//                       <td>
//                         {q.level === 1 && <span className="badge bg-success">Easy</span>}
//                         {q.level === 2 && <span className="badge bg-warning">Medium</span>}
//                         {q.level === 3 && <span className="badge bg-danger">Hard</span>}
//                       </td>
//                       <td><small>{q.text}</small></td>
//                       <td>
//                         <ol className="small mb-0">
//                           {q.options.map((opt, idx) => <li key={idx}>{opt}</li>)}
//                         </ol>
//                       </td>
//                       <td><span className="badge bg-success">{q.correctAnswer}</span></td>
//                       <td>
//                         <div className="btn-group btn-group-sm">
//                           <button
//                             className="btn btn-outline-primary"
//                             onClick={() => navigate(`/admin/questions/edit/${q.id}`)}
//                           >
//                             <i className="fas fa-edit"></i> Edit
//                           </button>
//                           <button
//                             className="btn btn-outline-danger"
//                             onClick={() => handleDelete(q.id)}
//                           >
//                             <i className="fas fa-trash"></i> Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminQuestions;
