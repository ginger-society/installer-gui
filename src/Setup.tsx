import logo from './assets/ginger_icon.png'
import './App.css'
import InstallationWizard from './InstallationWizard'
const Setup = () => {
  return (
    <>
    <div className='setup-container'>
    <div className="sidebar">
     <div className="logo"><img src={logo} alt="Logo" width="150"/></div>
   </div>
    <div className="content">
     <InstallationWizard/>
   </div>
   </div>
   </>
  )
}

export default Setup
