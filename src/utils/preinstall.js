const { exec } = window.require('child_process');

// Check if Docker is installed
exec('docker --version', (error, stdout, stderr) => {
  if (error) {
    // Docker is not installed
    console.error('Docker is not installed. Please follow the instructions to install it.');
    // Display instructions on how to install Docker
  } else {
    // Docker is installed
    console.log('Docker is installed.');
    // Check for ngrok
    exec('ngrok --version', (ngrokError, ngrokStdout, ngrokStderr) => {
      if (ngrokError) {
        // ngrok is not installed
        console.error('ngrok is not installed. Please follow the instructions to install it.');
        // Display instructions on how to install ngrok
      } else {
        // ngrok is installed
        console.log('ngrok is installed.');
        // Launch your Electron app here
      }
    });
  }
});
