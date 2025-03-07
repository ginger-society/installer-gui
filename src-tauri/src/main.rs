// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use std::process::Command;
use std::io::{Read, Write};
use std::fs::File;
use std::time::{Duration, Instant};
use reqwest::blocking::get;
use reqwest::blocking::Response;
use serde::Serialize;
use tauri::Manager;
use tauri::Emitter;

#[derive(Serialize, Clone)]
struct DownloadProgress {
    progress: f64,
    downloaded_mb: f64,
    total_mb: f64,
    speed_mbps: f64,
    filename: String,
    current_tool: String,
    current_tool_index: usize,
}

/// API Call: Get latest version of the tool
fn get_version(tool: &str) -> Result<String, String> {
    let api_url = format!(
        "https://api-staging.gingersociety.org/metadata/version/ginger-society/{}",
        tool
    );

    let response: Response = get(&api_url).map_err(|e| format!("Failed to fetch version: {}", e))?;
    let version = response.text().map_err(|e| format!("Failed to read response: {}", e))?;

    if version.is_empty() {
        return Err("Version not found!".to_string());
    }

    Ok(version.trim().to_string())
}

#[tauri::command]
fn install_selected_tools(
    selected_tools: Vec<String>, 
    install_location: String,
    window: tauri::Window
) -> Result<(), String> {
    let install_path = Path::new(&install_location);

    if !install_path.exists() {
        fs::create_dir_all(&install_path).map_err(|e| e.to_string())?;
    }

    let arch = "x86_64";
    let os = "pc-windows-gnu";

    for (index, tool) in selected_tools.iter().enumerate() {
        let version = get_version(tool)?; // Fetch latest version dynamically
        let url = construct_download_url(tool, &version, arch, os);
        download_and_install_with_progress(&url, install_path, tool, index + 1, selected_tools.len(), &window)?;
    }

    Ok(())
}

fn construct_download_url(tool: &str, version: &str, arch: &str, os: &str) -> String {
    format!(
        "https://{}-binaries.s3.ap-south-1.amazonaws.com/{}/{}/{}.exe",
        tool, version, format!("{}-{}", arch, os), tool
    )
}

fn download_and_install_with_progress(
    url: &str, 
    install_path: &Path, 
    current_tool: &str,
    current_tool_index: usize,
    total_tools: usize,
    window: &tauri::Window
) -> Result<(), String> {
    println!("Downloading from {url}");

    let filename = url.split('/').last().ok_or("Invalid URL format")?;
    let file_path = install_path.join(filename);
    let mut response = get(url).map_err(|e| format!("Failed to download file: {}", e))?;
    
    let total_size = response
        .headers()
        .get(reqwest::header::CONTENT_LENGTH)
        .and_then(|ct_len| ct_len.to_str().ok())
        .and_then(|ct_len| ct_len.parse::<u64>().ok())
        .unwrap_or(0);

    let total_mb = total_size as f64 / (1024.0 * 1024.0);
    
    let mut file = File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;
    
    let mut downloaded = 0u64;
    let mut last_update = Instant::now();
    let mut last_downloaded = 0u64;
    let mut buffer = [0u8; 8192]; 
    
    loop {
        let bytes_read = response.read(&mut buffer)
            .map_err(|e| format!("Failed to read from response: {}", e))?;
        
        if bytes_read == 0 {
            break; 
        }
        
        file.write_all(&buffer[..bytes_read])
            .map_err(|e| format!("Failed to write to file: {}", e))?;
        
        downloaded += bytes_read as u64;
        let downloaded_mb = downloaded as f64 / (1024.0 * 1024.0);
        
        let progress = if total_size > 0 {
            (downloaded as f64 / total_size as f64) * 100.0
        } else {
            -1.0
        };
        
        let now = Instant::now();
        let elapsed = now.duration_since(last_update);
        
        if elapsed >= Duration::from_millis(500) {
            let bytes_since_last_update = downloaded - last_downloaded;
            let seconds = elapsed.as_secs_f64();
            let speed_mbps = (bytes_since_last_update as f64 / seconds) / (1024.0 * 1024.0);
            window.emit("download-progress", DownloadProgress {
                progress,
                downloaded_mb,
                total_mb,
                speed_mbps,
                filename: filename.to_string(),
                current_tool: current_tool.to_string(),
                current_tool_index,
            }).map_err(|e| format!("Failed to emit event: {}", e))?;
            
            last_update = now;
            last_downloaded = downloaded;
        }
    }
    
    window.emit("download-progress", DownloadProgress {
        progress: 100.0,
        downloaded_mb: total_mb,
        total_mb,
        speed_mbps: 0.0,
        filename: filename.to_string(),
        current_tool: current_tool.to_string(),
        current_tool_index,
    }).map_err(|e| format!("Failed to emit final event: {}", e))?;

    println!("Downloaded to {}", file_path.display());

    
    if file_path.extension().unwrap_or_default() == "exe" {
        Command::new("cmd")
            .args(["/C", file_path.to_str().ok_or("Invalid file path")?])
            .output()
            .map_err(|e| format!("Failed to execute installer: {}", e))?;

        println!("Installation completed successfully");
    }

    Ok(())
}
#[tauri::command]
fn check_dependency_version(dependency_name: String) -> Result<String, String> {
    match dependency_name.to_lowercase().as_str() {
        "kubernetes" => check_kubernetes_version(),
        "docker" => check_docker_version(),
        "git" => check_git_version(),
       
        _ => Err(format!("Unsupported dependency: {}", dependency_name))
    }
}


fn check_kubernetes_version() -> Result<String, String> {
    let output = Command::new("kubectl")
        .arg("version")
        .arg("--client")
        .output()
        .map_err(|e| format!("Error running kubectl version: {}", e))?;
    
    let version_output = String::from_utf8_lossy(&output.stdout).to_string();
    
    
    let version = version_output
        .lines()
        .find(|line| line.contains("Client Version"))
        .and_then(|line| {
            line.split(':')
                .nth(1)
                .map(|v| v.trim().replace("v", ""))
        })
        .ok_or_else(|| "Could not parse Kubernetes version".to_string())?;

    Ok(version)
}


fn check_docker_version() -> Result<String, String> {
    let output = Command::new("docker")
        .arg("--version")
        .output()
        .map_err(|e| format!("Error running docker --version: {}", e))?;
    
    let version_output = String::from_utf8_lossy(&output.stdout).to_string();
    let version = version_output
        .split(',')
        .next()
        .and_then(|v| {
            v.split_whitespace()
                .nth(2)
                .map(|ver| ver.to_string())
        })
        .ok_or_else(|| "Could not parse Docker version".to_string())?;

    Ok(version)
}
fn check_git_version() -> Result<String, String> {
    let output = Command::new("git")
        .arg("--version")
        .output()
        .map_err(|e| format!("Error running git --version: {}", e))?;
    
    let version_output = String::from_utf8_lossy(&output.stdout).to_string();
    
    let version = version_output
        .split_whitespace()
        .nth(2)
        .map(|v| v.to_string())
        .ok_or_else(|| "Could not parse Git version".to_string())?;

    Ok(version)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            install_selected_tools,check_dependency_version
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}