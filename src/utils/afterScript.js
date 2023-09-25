const path = require('path');
const fs = require('fs-extra');

exports.default = async function (context) {
  // Debug logs
  console.log('context.appOutDir:', context.appOutDir);
  // console.log('context.projectDir:', context.projectDir);
  const projectDir = "/home/shireen/Desktop/qcloud1.0/qCloud-electron-app";
  const appDir = context.appOutDir;
  const unpackedDir = path.join(appDir, 'resources', 'app.asar.unpacked', 'src', 'server');
  
  // Ensure the directory exists or create it
  fs.ensureDirSync(unpackedDir);

  // Copy the src/server directory to app.asar.unpacked/src/server
  fs.copySync(path.join(projectDir, 'src', 'server'), unpackedDir);
};
