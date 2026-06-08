const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: [
    'capacitor://localhost',      // iOS Capacitor webview
    'http://localhost',           // Android Capacitor webview
    'http://localhost:3000',      // local webpack dev server
    'https://www.atomicdiagnostics.com.au',
  ],
}));

// Serve the built React app in production
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/api/datetime', (req, res) => {
  res.json({ datetime: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
