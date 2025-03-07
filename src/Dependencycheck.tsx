// PrerequisiteChecker.tsx
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
}

const PrerequisiteChecker: React.FC = () => {
  const navigate=useNavigate();
  const [dependencies, setDependencies] = useState<Dependency[]>([
 
    {
      name: 'Kubernetes',
      minVersion: '1.21.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://kubernetes.io/docs/setup/'
    },
    {
      name: 'Docker',
      minVersion: '20.10.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://docs.docker.com/get-docker/'
    },
    {
      name: 'Git',
      minVersion: '2.30.0',
      currentVersion: null,
      isInstalled: false,
      documentationLink: 'https://git-scm.com/book/en/v2/Getting-Started-Installing-Git'
    }
  ]);

  const [allDependenciesInstalled, setAllDependenciesInstalled] = useState(false);

  // Function to check dependency versions
  const checkDependencyVersions = async () => {
    const updatedDependencies = await Promise.all(
      dependencies.map(async (dep) => {
        try {
          // Use Tauri invoke to run shell commands to check versions
          const version = await invoke('check_dependency_version', { 
            dependencyName: dep.name.toLowerCase().replace(' ', '-') 
          }) as string;

          // Basic version parsing (you might want to make this more robust)
          const parsedVersion = version.trim().replace(/[^\d.]/g, '');

          return {
            ...dep,
            currentVersion: parsedVersion,
            isInstalled: compareVersions(parsedVersion, dep.minVersion)
          };
        } catch (error) {
         
          return {
            ...dep,
            currentVersion: null,
            isInstalled: false
          };
        }
      })
    );

    setDependencies(updatedDependencies);
    
    const allInstalled = updatedDependencies.every(dep => dep.isInstalled);
    setAllDependenciesInstalled(allInstalled);
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

  useEffect(() => {
    checkDependencyVersions();
  }, []);

  return (
    <div className="prereq-checker">
      <h2 className="prereq-title"><div>
            <IoIosArrowRoundBack
              size={40}
              color="#e65100"
              style={{
                cursor: "pointer",
                fontWeight: "1000px",
              }}
              onClick={() => navigate(-1)}
            />
          </div>System Prerequisites</h2>
      <div className="prereq-list">
        {dependencies.map((dep) => (
          <div 
            key={dep.name} 
            className={`prereq-item ${dep.isInstalled ? 'installed' : 'not-installed'}`}
          >
            <div className="prereq-content">
              <div className="prereq-details">
                <h3 className="prereq-name">{dep.name}</h3>
                <p className="prereq-status">
                  {dep.isInstalled 
                    ? `Installed (v${dep.currentVersion})` 
                    : 'Not Installed or Incompatible Version'}
                </p>
              </div>
              <div className="prereq-version-info">
                <p className="prereq-min-version">Minimum Version: {dep.minVersion}</p>
                {!dep.isInstalled && (
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

      {allDependenciesInstalled ? (
        <div className="prereq-action">
          <button 
            className="prereq-start-button"
            onClick={() => navigate("/next")}
          >
            next 
          </button>
        </div>
      ) : (
        <div className="prereq-warning">
          <p>
            Please install all prerequisites before proceeding with the installation.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrerequisiteChecker;