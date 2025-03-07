import './assets/css/InstallationWizard.css';
import { Link } from "react-router-dom";
import { MdOutlineStart } from "react-icons/md";
const InstallationWizard = () => {


  return (
    <div className="wizard-container">
      <div className="wizard-Instruction">
      <h4>Welcome to the Ginger Society Installation Wizard</h4>

      <div className="section">
        <h2>This wizard guides you through installing the Ginger Society program and all required components.</h2>
        <p>Follow the instructions below to continue with the installation process.</p>
      </div>

      <p> Click Start to continue.</p>
      <div className="footer">
      
        <Link to="/policy-terms">
          <button className="primary-button">
            Start <MdOutlineStart style={{ marginTop: "2px" }} />
          </button>
        </Link>  
      </div>
      </div>
    </div>
  );
};

export default InstallationWizard;
