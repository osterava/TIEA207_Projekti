require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT

app.use(express.json());

app.get('/', (req, res) => {
  res.send('alutus');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
