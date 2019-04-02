// quick express server to serve static index.html

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT);
