import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import Loading from "./Loading";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaFolder } from "react-icons/fa";
import "./assets/css/ChooseServices.css";

interface ServiceOptions {
  "ginger-auth": boolean;
  "ginger-connector": boolean;
  "ginger-scaffolder": boolean;
  "ginger-releaser": boolean;
  "ginger-db": boolean;
}

interface DownloadProgress {
  progress: number;
  downloadedMB: number;
  totalMB: number;
  speedMBps: number;
  filename?: string;
  currentTool?: string;
  currentToolIndex?: number;
}

const initialOptions: ServiceOptions = {
  "ginger-auth": false,
  "ginger-connector": false,
  "ginger-scaffolder": false,
  "ginger-releaser": false,
  "ginger-db": false,
};

const ChooseServices: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<ServiceOptions>(initialOptions);
  const [installLocation, setInstallLocation] = useState("C:\\Program Files");
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    progress: 0,
    downloadedMB: 0,
    totalMB: 0,
    speedMBps: 0,
    currentToolIndex: 0,
    currentTool: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for download progress events from Tauri backend
    const unlistenPromise = listen("download-progress", (event:any) => {
      setDownloadProgress({
        progress: event.payload.progress,
        downloadedMB: event.payload.downloaded_mb,
        totalMB: event.payload.total_mb,
        speedMBps: event.payload.speed_mbps,
        filename: event.payload.filename,
        currentTool: event.payload.current_tool,
        currentToolIndex: event.payload.current_tool_index
      });
    });
  
    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstallLocation(event.target.value);
  };

  const handleBrowse = async () => {
    try {
      // The following is a simplified approach - in a real app with custom dialog,
      // later we can use an actual file input or custom dialog component
      const customLocation = prompt(
        "Enter installation directory path(Avoid Double quatation):", 
        installLocation
      );
      
      if (customLocation) {
        setInstallLocation(customLocation);
      }
    } catch (error) {
      console.error("Error selecting directory:", error);
    }
  };

  const hasSelectedServices = Object.values(selectedOptions).some((value) => value === true);

  const handleNext = async () => {
    const selectedTools = Object.entries(selectedOptions)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    setLoading(true);

    try {
      await invoke("install_selected_tools", { 
        selectedTools,
        installLocation 
      });
      
      navigate("/success");
    } catch (error) {
      console.log("Error: " + error);
      alert("Error starting installation: " + error);
      setLoading(false);
    }
  };

  return (
    <div className="chooseoption">
      {loading ? (
        <Loading 
          progress={downloadProgress.progress} 
          downloadedMB={downloadProgress.downloadedMB}
          totalMB={downloadProgress.totalMB}
          speedMBps={downloadProgress.speedMBps}
          filename={downloadProgress.filename}
          currentToolIndex={downloadProgress.currentToolIndex}
          totalTools={Object.values(selectedOptions).filter(Boolean).length}
          currentTool={downloadProgress.currentTool}
        />
      ) : (
        <>
          <div>
            <IoIosArrowRoundBack
              size={40}
              color="#e65100"
              style={{
                cursor: "pointer",
                fontWeight: "1000px",
              }}
              onClick={() => navigate(-1)}
            />
          </div>
          <div className="location-selection">
            <h4>Installation Location:</h4>
            <div className="location-input-container">
              <input
                type="text"
                value={installLocation}
                onChange={handleLocationChange}
                className="location-input"
                placeholder="Installation path"
              />
              <button 
                className="browse-btn"
                onClick={handleBrowse}
                title="Browse for installation location"
              >
                <FaFolder /> Browse
              </button>
            </div>
          </div>
          <p>Select the services you would like to install, then click Install.</p>

          <div className="checkbox-group">
            {Object.keys(initialOptions).map((key) => (
              <label key={key} title={`Install the ${key} component`}>
                <input
                  type="checkbox"
                  name={key}
                  checked={selectedOptions[key as keyof ServiceOptions]}
                  onChange={handleCheckboxChange}
                />
                {key}
              </label>
            ))}
          </div>

          <div className="btn-grp">
            <button
              className="btn"
              disabled={!hasSelectedServices}
              title={!hasSelectedServices ? "Please select at least one service" : ""}
              onClick={handleNext}
            >
              Install
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChooseServices;