const express = require('express');
const path = require('path');
const app = express();
const port = 3003;

// Serve the updated Auth.css directly from source
app.get('/static/css/Auth.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'components', 'Auth', 'Auth.css'));
});

// Serve the updated Dashboard.css directly from source
app.get('/static/css/Dashboard.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'components', 'Dashboard', 'Dashboard.css'));
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`React app serving on http://localhost:${port}`);
});
