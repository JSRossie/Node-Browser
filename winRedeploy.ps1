# PowerShell script to redeploy the Node-Browser application on Windows

# Set the script to stop on any errors
$ErrorActionPreference = 'Stop'

# Get the full path of the directory where the script resides
$scriptDirectory = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

# Define the relative path to the Node-Browser directory from the script's location
# Adjust the relative path as needed. Here, it's assumed to be directly under the script's location
$relativePath = ".\Node-Browser"

# Combine the script directory path with the relative path
$nodeBrowserPath = Join-Path -Path $scriptDirectory -ChildPath $relativePath

Try {
    # Attempt to delete the Node-Browser directory if it exists
    if (Test-Path $nodeBrowserPath) {
        Write-Host "Deleting the existing Node-Browser directory..."
        Remove-Item -Path $nodeBrowserPath -Recurse -Force
    }

    # Clone the repository
    Write-Host "Cloning the Node-Browser repository..."
    git clone https://github.com/JSRossie/Node-Browser.git $nodeBrowserPath

    # Change to the cloned directory
    Set-Location -Path $nodeBrowserPath

    # Install dependencies
    Write-Host "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dependencies installed successfully."
    } else {
        Write-Host "Error installing dependencies. Exit code: $LASTEXITCODE"
    }

    # Start the application
    Write-Host "Starting the application..."
    npm start
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Application started successfully."
    } else {
        Write-Host "Error starting the application. Exit code: $LASTEXITCODE"
    }
} Catch {
    # If any error occurs, display the error message
    Write-Host "An error occurred: $_"
}
