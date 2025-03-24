import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import "./assets/css/Dependency.css";
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";

interface Dependency {
  name: string;
  minVersion: string;
  currentVersion: string | null;
  isInstalled: boolean;
  documentationLink: string;
  manualConfirmation?: boolean;
  requiresManualCheck?: boolean;
}

const PrerequisiteChecker: React.FC = () => {
  const navigate = useNavigate();
  const [dependencies, setDependencies] = useState<Dependency[]>([
    {
      name: 'OpenAPI Generator',
      minVersion: '5.0.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://openapi-generator.tech/docs/installation/'
    },
    {
      name: 'Java',
      minVersion: '11.0.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://www.oracle.com/java/technologies/javase-downloads.html'
    },
 
    {
      name: 'Docker Desktop',
      minVersion: '4.0.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://docs.docker.com/desktop/install/windows-install/'
    },
    {
      name: 'Git',
      minVersion: '2.30.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://git-scm.com/book/en/v2/Getting-Started-Installing-Git'
    },
  
    {
      name: 'VS Code',
      minVersion: '0.00.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://code.visualstudio.com/download',
      requiresManualCheck: true,
      manualConfirmation: false
    }
  ]);

  const [allDependenciesInstalled, setAllDependenciesInstalled] = useState(false);

  // Function to check dependency versions
  const checkDependencyVersions = async () => {
    const updatedDependencies = await Promise.all(
      dependencies.map(async (dep) => {
        // Skip automatic check for dependencies that require manual confirmation
        if (dep.requiresManualCheck) {
          return dep;
        }
        
        try {
          // Use Tauri invoke to run shell commands to check versions
          const version = await invoke('check_dependency_version', { 
            dependencyName: dep.name.toLowerCase().replace(/\s+/g, '-') 
          }) as string;

          // Basic version parsing (you might want to make this more robust)
          const parsedVersion = version.trim().replace(/[^\d.]/g, '');

          return {
            ...dep,
            currentVersion: parsedVersion,
            isInstalled: compareVersions(parsedVersion, dep.minVersion)
          };
        } catch (error) {
          console.error(`Error checking ${dep.name}:`, error);
          return {
            ...dep,
            currentVersion: null,
            isInstalled: false
          };
        }
      })
    );

    setDependencies(updatedDependencies);
    updateAllInstalledStatus(updatedDependencies);
  };

  const compareVersions = (current: string | null, minimum: string): boolean => {
    if (!current) return false;

    const currentParts = current.split('.').map(Number);
    const minParts = minimum.split('.').map(Number);

    for (let i = 0; i < Math.min(currentParts.length, minParts.length); i++) {
      if (currentParts[i] > minParts[i]) return true;
      if (currentParts[i] < minParts[i]) return false;
    }

    return currentParts.length >= minParts.length;
  };

  const handleManualConfirmation = (name: string, isConfirmed: boolean) => {
    const updatedDependencies = dependencies.map(dep => {
      if (dep.name === name) {
        return {
          ...dep,
          manualConfirmation: isConfirmed,
          isInstalled: isConfirmed
        };
      }
      return dep;
    });
    
    setDependencies(updatedDependencies);
    updateAllInstalledStatus(updatedDependencies);
  };

  const updateAllInstalledStatus = (deps: Dependency[]) => {
    const allInstalled = deps.every(dep => {
      // For dependencies that require manual check, use manualConfirmation
      return dep.requiresManualCheck ? dep.manualConfirmation : dep.isInstalled;
    });
    
    setAllDependenciesInstalled(allInstalled);
  };

  useEffect(() => {
    checkDependencyVersions();
  }, []);

 

  return (
    <div className="prereq-checker">
      <h2 className="prereq-title">
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
        System Prerequisites
      </h2>
      <div className="prereq-list">
        {dependencies.map((dep) => (
          <div 
            key={dep.name} 
            className={`prereq-item ${dep.isInstalled ? 'installed' : 'not-installed'}`}
          >
            <div className="prereq-content">
              <div className="prereq-details">
                <h3 className="prereq-name">{dep.name}</h3>
                {dep.requiresManualCheck ? (
                  <div className="manual-confirmation">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={dep.manualConfirmation || false}
                        onChange={(e) => handleManualConfirmation(dep.name, e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Confirm {dep.name} is installed
                    </label>
                  </div>
                ) : (
                  <p className="prereq-status">
                    {dep.isInstalled 
                      ? `Installed (v${dep.currentVersion})` 
                      : 'Not Installed or Incompatible Version'}
                  </p>
                )}
              </div>
              <div className="prereq-version-info">
                <p className="prereq-min-version">Minimum Version: {dep.minVersion}</p>
                {!dep.isInstalled && !dep.manualConfirmation && (
                  <a 
                    href={dep.documentationLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="prereq-docs-link"
                  >
                    Installation Guide
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="prereq-actions">
        
        
        {allDependenciesInstalled ? (
          <button 
            className="prereq-start-button"
            onClick={() => navigate("/next")}
          >
            Next
          </button>
        ) : (
          <div className="prereq-warning">
            <p>
              Please install all prerequisites before proceeding with the installation.
              {dependencies.some(dep => dep.requiresManualCheck && !dep.manualConfirmation) &&
                " Make sure to confirm VS Code installation by checking the box."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrerequisiteChecker;