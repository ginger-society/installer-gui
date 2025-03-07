import { useState } from "react";
import {Link } from "react-router-dom";
import "./assets/css/PolicyTerms.css";
import { IoIosArrowRoundBack} from "react-icons/io";
const PolicyTerms = () => {
  const [accepted, setAccepted] = useState(false);
  
  return (
    <div className="policy-container">
        <Link to="/"><div >
          <IoIosArrowRoundBack  size={40} color="#e65100"  style={{
          cursor: "pointer",
          fontWeight: "1000",   
          marginTop:"10px",
        }}  />
          </div></Link>
      <h2>License Agreement</h2>
      <p>Please read the following important information before continuing.</p>

      {/* Scrollable Terms Box */}
      <div className="terms-box">
        <p>
          This license applies to the Ginger Society program. Additional license 
          information can be found in our FAQ. 
          <br /><br />
          By continuing, you agree to the terms and conditions. Make sure to 
          review our privacy policy and terms of use carefully.
        </p>
      </div>

     
      <p>
        Read the full agreement here:  
        <a href="" target="_blank" rel="noopener noreferrer"> License Document</a>
      </p>

     
      <div className="radio-container">
        <label>
          <input
            type="checkbox"
            name="agreement"
            onChange={() => setAccepted(true)}
          />
          I accept the agreement
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
