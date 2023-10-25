const { ipcRenderer } = require('electron');

document.getElementById('authForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const authToken = document.getElementById('token').value;
    
    // Send the authToken back to the main process
    ipcRenderer.send('authTokenSubmitted', authToken);
});
