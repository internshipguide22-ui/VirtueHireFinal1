// // EditQuestion.jsx
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// const EditQuestion = () => {
//   const { id } = useParams(); // get question ID from route
//   const navigate = useNavigate();

//   const [question, setQuestion] = useState({
//     subject: "",
//     level: 1,
//     text: "",
//     options: ["", "", "", ""],
//     correctAnswer: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetchQuestion();
//   }, []);

//   const fetchQuestion = async () => {
//     try {
//       const res = await axios.get(`https://backend.virtuehire.in/admin/questions/${id}`);
//       setQuestion(res.data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch question data.");
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setQuestion(prev => ({ ...prev, [name]: value }));
//   };

//   const handleOptionChange = (index, value) => {
//     const newOptions = [...question.options];
//     newOptions[index] = value;
//     setQuestion(prev => ({ ...prev, options: newOptions }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(`https://backend.virtuehire.in/admin/questions/update/${id}`, question);
//       setMessage("Question updated successfully!");
//       setTimeout(() => navigate("/admin/questions"), 1500); // redirect after 1.5s
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update question.");
//     }
//   };

//   if (loading) return <div className="p-4">Loading question...</div>;
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
//         <h1><i className="fas fa-edit me-2"></i> Edit Question</h1>
//         <button className="btn btn-secondary" onClick={() => navigate("/admin/questions")}>
//           <i className="fas fa-arrow-left me-2"></i> Back to Questions
//         </button>
//       </div>

//       {message && <div className="alert alert-success">{message}</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="card">
//         <div className="card-header bg-primary text-white">
//           <h5 className="mb-0">Edit Question Details</h5>
//         </div>
//         <div className="card-body">
//           <form onSubmit={handleSubmit}>
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">Subject *</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     name="subject"
//                     value={question.subject}
//                     onChange={handleChange}
//                     placeholder="e.g., Java, React, Python"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label">Level *</label>
//                   <select
//                     className="form-select"
//                     name="level"
//                     value={question.level}
//                     onChange={handleChange}
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
//                 name="text"
//                 rows="3"
//                 value={question.text}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Options (4 required) *</label>
//               {question.options.map((opt, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   className="form-control mb-2"
//                   value={opt}
//                   onChange={(e) => handleOptionChange(index, e.target.value)}
//                   placeholder={`Option ${index + 1}`}
//                   required
//                 />
//               ))}
//             </div>

//             <div className="mb-3">
//               <label className="form-label">Correct Answer *</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="correctAnswer"
//                 value={question.correctAnswer}
//                 onChange={handleChange}
//                 required
//                 placeholder="Must match one of the options exactly"
//               />
//               <div className="form-text">
//                 Make sure this exactly matches one of the options above
//               </div>
//             </div>

//             <div className="d-grid gap-2 d-md-flex justify-content-md-end">
//               <button type="button" className="btn btn-secondary me-md-2" onClick={() => navigate("/admin/questions")}>
//                 Cancel
//               </button>
//               <button type="submit" className="btn btn-primary">
//                 Update Question
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditQuestion;

// src/pages/admin/EditQuestion.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState({
    subject: "",
    level: "1",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch question by ID
  useEffect(() => {
    api
      .get(`/admin/questions/${id}`)
      .then((res) => {
        const q = res.data;
        setQuestion({
          subject: q.subject || "",
          level: q.level?.toString() || "1",
          text: q.text || "",
          options: q.options || ["", "", "", ""],
          correctAnswer: q.correctAnswer || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load question.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === "options" && index !== null) {
      const updatedOptions = [...question.options];
      updatedOptions[index] = value;
      setQuestion({ ...question, options: updatedOptions });
    } else {
      setQuestion({ ...question, [name]: value });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    api
      .put(`/admin/questions/update/${id}`, question)
      .then((res) => {
        setMessage("Question updated successfully!");
        setTimeout(() => navigate("/admin/questions"), 1500); // Redirect after success
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to update question.");
      });
  };

  if (loading) return <p>Loading question...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-edit me-2"></i>Edit Question
        </h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/questions")}
        >
          <i className="fas fa-arrow-left me-2"></i>Back to Questions
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Edit Question Details</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdate}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  name="subject"
                  value={question.subject}
                  onChange={handleChange}
                  placeholder="e.g., Java, React, Python"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Level *</label>
                <select
                  className="form-select"
                  name="level"
                  value={question.level}
                  onChange={handleChange}
                  required
                >
                  <option value="1">Easy</option>
                  <option value="2">Medium</option>
                  <option value="3">Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Question Text *</label>
              <textarea
                className="form-control"
                name="text"
                rows="3"
                value={question.text}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Options (4 required) *</label>
              {question.options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="form-control mb-2"
                  name="options"
                  value={opt}
                  onChange={(e) => handleChange(e, idx)}
                  placeholder={`Option ${idx + 1}`}
                  required
                />
              ))}
            </div>

            <div className="mb-3">
              <label className="form-label">Correct Answer *</label>
              <input
                type="text"
                className="form-control"
                name="correctAnswer"
                value={question.correctAnswer}
                onChange={handleChange}
                placeholder="Must match one of the options exactly"
                required
              />
              <div className="form-text">
                Make sure this exactly matches one of the options above
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-secondary me-md-2"
                onClick={() => navigate("/admin/questions")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuestion;
