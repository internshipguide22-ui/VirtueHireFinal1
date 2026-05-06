import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HrPaymentPlans = () => {
  const navigate = useNavigate();

  // Example prices, can be fetched from API
  const [prices] = useState({
    monthlyPrice: 4999,
    tenPrice: 1999,
    singlePrice: 299,
  });

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Choose Your Plan</h2>
      <p className="text-center text-muted mb-5">
        Select the plan that best fits your recruitment needs
      </p>

      <div className="row">
        {/* Monthly Unlimited Plan */}
        <div className="col-md-4 mb-4">
          <div
            className="card text-center h-100"
            style={{
              position: "relative",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-10px",
                right: "20px",
                background: "#ff6b6b",
                color: "white",
                padding: "5px 15px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              MOST POPULAR
            </span>
            <div className="card-header bg-success text-white py-4">
              <h3>Monthly Unlimited</h3>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="mb-4">
                <h1 className="display-4">₹{prices.monthlyPrice}</h1>
                <p className="text-muted">per month</p>
              </div>

              <ul className="list-unstyled text-start mb-4">
                <li className="mb-2">
                  ✓ <strong>Unlimited</strong> candidate views
                </li>
                <li className="mb-2">
                  ✓ Valid for <strong>30 days</strong>
                </li>
                <li className="mb-2">✓ Best for active recruiters</li>
                <li className="mb-2">✓ Download all resumes</li>
                <li className="mb-2">✓ Access candidate contact info</li>
                <li className="mb-2">✓ Priority support</li>
              </ul>

              <button className="btn btn-success btn-lg w-100 mt-auto">
                Buy Now
              </button>
            </div>
            <div className="card-footer text-muted">
              <small>Best value for high-volume hiring</small>
            </div>
          </div>
        </div>

        {/* Ten Candidates Plan */}
        <div className="col-md-4 mb-4">
          <div className="card plan-card text-center h-100">
            <div className="card-header bg-primary text-white py-4">
              <h3>10 Candidates</h3>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="mb-4">
                <h1 className="display-4">₹{prices.tenPrice}</h1>
                <p className="text-muted">one-time payment</p>
              </div>

              <ul className="list-unstyled text-start mb-4">
                <li className="mb-2">
                  ✓ View <strong>10 candidates</strong>
                </li>
                <li className="mb-2">
                  ✓ <strong>No expiry date</strong>
                </li>
                <li className="mb-2">✓ Use views anytime</li>
                <li className="mb-2">✓ Download resumes</li>
                <li className="mb-2">✓ Access contact information</li>
                <li className="mb-2">✓ Perfect for project hiring</li>
              </ul>

              <button className="btn btn-primary btn-lg w-100 mt-auto">
                Buy Now
              </button>
            </div>
            <div className="card-footer text-muted">
              <small>Great for medium-scale hiring</small>
            </div>
          </div>
        </div>

        {/* Single Candidate Plan */}
        <div className="col-md-4 mb-4">
          <div className="card plan-card text-center h-100">
            <div className="card-header bg-info text-white py-4">
              <h3>Single Candidate</h3>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="mb-4">
                <h1 className="display-4">₹{prices.singlePrice}</h1>
                <p className="text-muted">per view</p>
              </div>

              <ul className="list-unstyled text-start mb-4">
                <li className="mb-2">
                  ✓ View <strong>1 candidate</strong>
                </li>
                <li className="mb-2">✓ Instant access</li>
                <li className="mb-2">✓ No commitment</li>
                <li className="mb-2">✓ Download resume</li>
                <li className="mb-2">✓ Get contact details</li>
                <li className="mb-2">✓ Try before you buy</li>
              </ul>

              <button className="btn btn-info btn-lg w-100 mt-auto">
                Buy Now
              </button>
            </div>
            <div className="card-footer text-muted">
              <small>Perfect for one-time hiring</small>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => navigate("/hr/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="mt-5 p-4 bg-light rounded">
        <h4>Frequently Asked Questions</h4>
        <div className="accordion" id="faqAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq1"
              >
                What happens when my Monthly Unlimited plan expires?
              </button>
            </h2>
            <div
              id="faq1"
              className="accordion-collapse collapse show"
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">
                Your plan will automatically expire after 30 days. You'll need
                to purchase a new plan to continue viewing candidate details.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq2"
              >
                Can I purchase multiple plans?
              </button>
            </h2>
            <div
              id="faq2"
              className="accordion-collapse collapse"
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">
                Yes! If you purchase 10 Candidates or Single Candidate plans,
                the views will be added to your account. However, Monthly
                Unlimited will replace any existing plan.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq3"
              >
                Do the 10 Candidates views expire?
              </button>
            </h2>
            <div
              id="faq3"
              className="accordion-collapse collapse"
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">
                No! The 10 Candidates and Single Candidate plans never expire.
                Use your views whenever you need them.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrPaymentPlans;
