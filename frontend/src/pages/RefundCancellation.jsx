import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./RefundCancellation.css"; // import css

const RefundCancellation = () => {
  return (
    <div className="flex flex-col min-h-screen refund-page">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow p-8 max-w-4xl mx-auto">
        <h1 className="text-center">Refund & Cancellation Policy</h1>

        <p>
          At <strong>ChildSafeEnviors</strong>, we value your trust and are committed
          to providing high-quality services that prioritize the safety and well-being
          of children. This Refund & Cancellation Policy explains the terms and
          conditions related to subscription cancellations and refunds.
        </p>

        {/* Cancellation Policy */}
        <h2>1. Cancellation Policy</h2>
        <ul>
          <li>You may cancel your subscription at any time through your account settings.</li>
          <li>Cancellations will only take effect at the end of your current billing cycle.</li>
          <li>You will retain access until the subscription period expires.</li>
          <li>No partial cancellations or refunds for unused time.</li>
        </ul>

        {/* Refund Policy */}
        <h2>2. Refund Policy</h2>
        <ul>
          <li>All subscription purchases are <strong>final and non-refundable</strong>.</li>
          <li>
            Once a payment is completed, your reports and premium features are instantly
            available, meaning <strong>refunds cannot be issued</strong>.
          </li>
          <li>Refunds only apply to duplicate/incorrect charges or transaction errors.</li>
          <li>Claims must be made within <strong>7 days</strong> of payment.</li>
          <li>Approved refunds (if any) will be processed within 5–10 business days.</li>
        </ul>

        {/* Access */}
        <h2>3. Access to Reports</h2>
        <p>
          Upon payment, reports and premium features are immediately unlocked. Since
          services are delivered digitally and instantly, <strong>no refunds</strong>{" "}
          will be granted after access.
        </p>

        {/* Contact */}
        <h2>4. Contact Us</h2>
        <p>If you have questions about this policy, please contact us at:</p>
        <p className="contact">📧 Rig360media@gmail.com</p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RefundCancellation;
