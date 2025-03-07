import React from "react";
import { Link } from "react-router-dom";
import "./assets/css/success.css"
const Success: React.FC = () => {
  return (
    <div className="success-container">
      <div className="success-card">
        <h2>🎉 Installation Completed Successfully!</h2>
        <p>All selected tools have been installed and are ready to use.</p>
        <Link to="/">
          <button className="success-btn">Go to Home</button>
        </Link>
      </div>
    </div>
  );
};

export default Success;

