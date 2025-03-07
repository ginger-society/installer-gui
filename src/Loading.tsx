import React from "react"; 
import "./assets/css/Loading.css"; 
 
interface LoadingProps { 
  progress: number; 
  downloadedMB?: number; 
  totalMB?: number; 
  speedMBps?: number; 
  filename?: string;
  currentToolIndex?: number;
  totalTools?: number;
  currentTool?: string;
} 
 
const Loading: React.FC<LoadingProps> = ({ 
  progress, 
  downloadedMB = 0, 
  totalMB = 0, 
  speedMBps = 0, 
  currentToolIndex = 0,
  totalTools = 0,
  currentTool = ""
}) => { 
  return ( 
    <div className="loading-container"> 
      <h2>Installing Services......</h2> 
      {currentToolIndex > 0 && totalTools > 0 && (
       <div className="Cur_download">
       <h4 >
          Downloading {currentToolIndex}/{totalTools}: {currentTool}
        </h4>
        </div>
      )}
      
       
      <div className="progress-container"> 
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }} 
        ></div> 
      </div> 
       
      <div className="linear-progress-container"> 
         
      </div> 
       
      <div className="download-stats"> 
        <p>{progress.toFixed(1)}% Complete</p> 
        <p> 
          {downloadedMB.toFixed(2)} MB / {totalMB.toFixed(2)} MB 
          {totalMB > 0 ? ` (${speedMBps.toFixed(2)} MB/s)` : ''} 
        </p> 
      </div> 
      <p className="loading-message"> 
        Please wait while we install your selected services... 
      </p> 
    </div> 
  ); 
}; 
 
export default Loading;