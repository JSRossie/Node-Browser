@echo on
REM This file must be copied up one level from the Node-Browser directory for future use.

REM Recursively delete the folder .\Node-Browser
rmdir /s /q "C:\path\to\Node-Browser"
pause

REM Clone the repository
git clone https://github.com/JSRossie/Node-Browser.git
pause

REM Change to the cloned directory
cd C:\path\to\Node-Browser
pause

REM Install dependencies
npm install
echo %errorlevel%
pause

REM Start the application
npm start
echo %errorlevel%
pause