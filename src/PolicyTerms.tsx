import { useState } from "react";
import { Link } from "react-router-dom";
import "./assets/css/PolicyTerms.css";
import { IoIosArrowRoundBack } from "react-icons/io";

const PolicyTerms = () => {
  const [accepted, setAccepted] = useState(false);
  
  return (
    <div className="policy-container">
      <div className="header">
        <Link to="/">
          <IoIosArrowRoundBack 
            size={40} 
            color="#e65100" 
            style={{
              cursor: "pointer",
              fontWeight: "1000",
            }} 
          />
        </Link>
        <h2>License Agreement</h2>
      </div>
      
      <p className="policy-intro">Please read the following important information before continuing.</p>
      
      <div className="terms-box">
      This license applies to the Ginger Society program. Additional license 
  information can be found in our <a href="#">FAQ</a>.
  <br /><br />
  By continuing, you agree to the terms and conditions. Make sure to 
  review our <a href="#">privacy policy</a> and <a href="#">terms of use</a> carefully.
  <br /><br />
  This software is provided under a limited license, which grants you the right 
  to use, modify, and distribute it under specific conditions. Unauthorized use 
  or distribution beyond the agreed terms is strictly prohibited.
  <br /><br />
  We encourage all users to understand their rights and responsibilities when 
  using the Ginger Society program. If you have any questions or concerns, 
  please contact our support team.
      </div>
      
      <p className="license-link">
        Read the full agreement here:
        <a href="" target="_blank" rel="noopener noreferrer"> License Document</a>
      </p>
      
      <div className="radio-container">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="agreement"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
          />
          <span>I accept the agreement</span>
        </label>
      </div>
      
      <div className="footer">
        <Link to="/pre-check">
          <button className="primary-button" disabled={!accepted}>
            Next
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PolicyTerms;