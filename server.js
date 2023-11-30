const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('<h1>My first server!</h1>');
  });
  
app.listen(9000, () => {
  console.log('Server is running on port: 9000');
});