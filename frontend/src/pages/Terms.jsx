import React from "react";
import "./Terms.css";

const Terms = () => {
    return (
        <div className="terms-container">
            <h1 className="terms-title">Terms of Service</h1>
            <div className="terms-doc">
                <p><strong>Last Updated:</strong> [Insert Date]</p>
                <p>
                    Welcome to <strong>RIG360 Media</strong> (“Company,” “we,” “our,” or “us”). 
                    These Terms and Conditions (“Terms”) govern your use of our website 
                    <a href="https://www.rig360media.com" target="_blank" rel="noreferrer"> www.rig360media.com</a> 
                    (“Site”) and any services, content, or materials made available by us 
                    (collectively, the “Services”). By accessing or using our Site and Services, you 
                    agree to be bound by these Terms. If you do not agree, please discontinue use immediately.
                </p>

                <h2>1. Use of Our Services</h2>
                <ul>
                    <li>You must be at least 18 years old to use our Services.</li>
                    <li>You agree to use our Site and Services only for lawful purposes and in compliance with all applicable laws and regulations.</li>
                    <li>You agree not to misuse, copy, distribute, or modify the Site content without prior written consent from RIG360 Media.</li>
                </ul>

                <h2>2. Intellectual Property Rights</h2>
                <ul>
                    <li>All content on this Site, including but not limited to images, videos, designs, logos, trademarks, and written material, is the intellectual property of RIG360 Media or our licensors.</li>
                    <li>You are granted a limited, non-transferable, and non-exclusive license to access and use the Site for personal and business purposes directly related to the Services we provide.</li>
                    <li>Any unauthorized reproduction, redistribution, or commercial exploitation of our content is strictly prohibited.</li>
                </ul>

                <h2>3. Client Engagement & Deliverables</h2>
                <ul>
                    <li>All services, deliverables, timelines, and fees are defined in individual contracts, proposals, or project agreements with each client.</li>
                    <li>Creative work produced by RIG360 Media remains our property until full payment has been received, at which point ownership may be transferred as per the project agreement.</li>
                    <li>We reserve the right to showcase completed projects in our portfolio, case studies, or marketing materials unless otherwise agreed in writing.</li>
                </ul>

                <h2>4. Payments & Refunds</h2>
                <ul>
                    <li>Payment terms will be outlined in individual contracts or invoices.</li>
                    <li>All agreed fees must be paid within the specified timeline.</li>
                    <li>Refunds, if applicable, will be handled on a case-by-case basis as per the terms in the client’s project agreement.</li>
                </ul>

                <h2>5. Third-Party Services</h2>
                <ul>
                    <li>Our Services may involve third-party platforms, software, or technologies (e.g., AR/VR platforms, payment providers, etc.).</li>
                    <li>We are not responsible for the performance, content, or policies of these third parties.</li>
                </ul>

                <h2>6. Limitation of Liability</h2>
                <ul>
                    <li>While we strive to deliver high-quality creative services, we do not warrant that the Site or Services will be error-free, uninterrupted, or always available.</li>
                    <li>RIG360 Media will not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our Site or Services.</li>
                </ul>

                <h2>7. Privacy</h2>
                <p>Your use of our Site is also governed by our Privacy Policy, which explains how we collect, use, and protect your data.</p>

                <h2>8. Termination</h2>
                <p>We reserve the right to suspend, restrict, or terminate your access to the Site and Services if you violate these Terms.</p>

                <h2>9. Changes to Terms</h2>
                <p>RIG360 Media may update these Terms from time to time. Changes will be effective upon posting on the Site with a new “Last Updated” date.</p>

                <h2>10. Governing Law</h2>
                <p>These Terms shall be governed by and construed under the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi.</p>

                <h2>11. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact us at:<br/>
                    <strong>RIG360 Media</strong><br/>
                    Email: <a href="mailto:rig360media@gmail.com">rig360media@gmail.com</a><br/>
                    Phone: +91 98110 45016<br/>
                    Address: Sector A, Pocket A, 1022, Vasant Kunj, New Delhi
                </p>
            </div>
        </div>
    );
};

export default Terms;
