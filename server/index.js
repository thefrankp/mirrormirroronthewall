const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/datetime', (req, res) => {
  res.json({ datetime: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
