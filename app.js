const express = require('express');
const app = express();
const http = require('http').Server(app);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const server = http.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
