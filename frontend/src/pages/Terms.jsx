import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import "./Terms.css";

const Terms = () => {
    return (
        <div className="terms-container">
            <h1 className="terms-title">Terms of Service</h1>
            <div className="terms-doc">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer fileUrl="/assets/terms.pdf" />
                </Worker>
            </div>
        </div>
    );
};

export default Terms;
