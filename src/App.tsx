import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Success from './Success';
import Setup from './Setup';
import ChooseServices from './ChooseServices';
import Installlocation from './Installlocation';
import PolicyTerms from "./PolicyTerms";
import InstallationProgress from './InstallationProgress';
import Dependencycheck from "./Dependencycheck";
function App() {
   

  return (
    <>
    <Router>
      <Routes>
      <Route path="/" element={<Setup/>}/>
        <Route path="/next" element={<ChooseServices/>} />
        <Route path="/installlocation" element={<Installlocation/>}/>
        <Route path="/policy-terms" element={<PolicyTerms />} />
        <Route path="/progress" element={<InstallationProgress/>}/>
        <Route path="/success" element={<Success />} />
        <Route path="/pre-check" element={<Dependencycheck/>} />
      </Routes>
    </Router>
    
    </>
  )
}

export default App
