import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./assets/css/Installlocation.css";

const GingerSetup: React.FC = () => {
  const navigate = useNavigate();
  const [installLocation, setInstallLocation] = useState(
    "C:\\Program Files\\GingerSociety"
  );

  const handleBack = () => {
    navigate(-1); 
  };

  const handleSelectFolder = async () => {
    
  };

  return (
    <div className="Install-container">
      <h2>Setup - Ginger Installation</h2>

      <div className="install-location">
        <label>Customize Install Location:</label>
        <input
          type="text"
          value={installLocation}
          onChange={(e) => setInstallLocation(e.target.value)}
        />
        <button className="browse-btn" onClick={handleSelectFolder}>
          Browse
        </button>
      </div>

      <div className="button-group1">
        <button className="btn" onClick={handleBack}>Back</button>
        <Link to="/progress"><button className="btn primary">Install</button></Link>
        <button className="btn">Cancel</button>
      </div>
    </div>
  );
};

export default GingerSetup;
