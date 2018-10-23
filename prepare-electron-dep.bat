REM ---------------------------
REM Obfuscator electron's files
REM ---------------------------

REM down.js
call javascript-obfuscator src/for-electron/crates/down.js --output public/for-electron/crates/down.js --compact true --control-flow-flattening true --dead-code-injection true
REM geticon.js
call javascript-obfuscator src/for-electron/crates/geticon.js --output public/for-electron/crates/geticon.js --compact true --control-flow-flattening true --dead-code-injection true
REM launch.js
call javascript-obfuscator src/for-electron/crates/httpserver.js --output public/for-electron/crates/httpserver.js --compact true --control-flow-flattening true --dead-code-injection true
REM httpserver.js
call javascript-obfuscator src/for-electron/crates/launch.js --output public/for-electron/crates/launch.js --compact true --control-flow-flattening true --dead-code-injection true
REM logging.js
call javascript-obfuscator src/for-electron/crates/logging.js --output public/for-electron/crates/logging.js --compact true --control-flow-flattening true --dead-code-injection true
REM opn-open.js
call javascript-obfuscator src/for-electron/crates/opn-open.js --output public/for-electron/crates/opn-open.js --compact true --control-flow-flattening true --dead-code-injection true
REM uplaunch.js
call javascript-obfuscator src/for-electron/crates/uplaunch.js --output public/for-electron/crates/uplaunch.js --compact true --control-flow-flattening true --dead-code-injection true
REM upversion.js
call javascript-obfuscator src/for-electron/crates/upversion.js --output public/for-electron/crates/upversion.js --compact true --control-flow-flattening true --dead-code-injection true
REM huaci_handler.js
call javascript-obfuscator src/for-electron/crates/huaci_handler.js --output public/for-electron/crates/huaci_handler.js --compact true --control-flow-flattening true --dead-code-injection true

REM main_process.js
call javascript-obfuscator main_process.js --output main_process.dist.js --compact true --control-flow-flattening true --dead-code-injection true

REM ---------------------------
REM Copy Source and Config
REM ---------------------------

REM Copy Source
rd /S /q "public/for-electron/source"
echo D | xcopy /e "src/for-electron/source" "public/for-electron/source"

REM Copy Templates
rd /S /q "public/for-electron/templates"
echo D | xcopy /e "src/for-electron/templates" "public/for-electron/templates"

REM Copy Config
echo F | xcopy /f /y "src/for-electron/config.js" "./public/for-electron/config.js"

REM ----------------------------
REM Modify electron's crates dir
REM ----------------------------

echo dist> .electron-crates.txt