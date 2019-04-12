/**
 * File: server.js
 * Desc: quick-n-dirty express server to serve your static react app
 */

const express = require('express');
const path = require('path');

const port = process.env.PORT || 5000;
const app = express();

// if (process.env.NODE_ENV === 'production') {
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// }

app.listen(port, () => console.log(`Server started on port: ${port}`));
