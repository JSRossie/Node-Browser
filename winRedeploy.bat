@echo on

REM Recursively delete the folder .\Node-Browser
rmdir /s /q ".\Node-Browser"

REM Clone the repository
git clone https://github.com/JSRossie/Node-Browser.git

REM Change to the cloned directory
cd Node-Browser

REM Install dependencies
npm install

REM Start the application
npm start