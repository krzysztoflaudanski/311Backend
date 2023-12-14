const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');


const adsRoutes = require('./routes/ads.routes');
const usersRoutes = require('./routes/users.routes')
const authRoutes = require('./routes/auth.routes')

const app = express();

mongoose.connect('mongodb+srv://laudanskikrzysztof86:Password100@cluster0.c8kjc4z.mongodb.net/annDB?retryWrites=true&w=majority', { useNewUrlParser: true });
const db = mongoose.connection;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/img')));
app.use(session({ secret: 'xyz567', store: MongoStore.create(mongoose.connection), resave: false, saveUninitialized: false}));

app.use('/api', adsRoutes);
app.use('/api', usersRoutes);
app.use('/auth', authRoutes)

app.get('/', (req, res) => {
  res.send('<h1>My first server!</h1>');
});

app.use((err, req, res, next) => {
  if (err) {
    console.error(err.stack);
    res.status(500).send({
      message: 'Internal Server Error',
      error: err.message || 'Something went wrong on the server side.'
    });
  } else {
    res.status(404).send({ message: 'Not found...' });
  }
});

db.once('open', () => {
  console.log('Connected to the database');
});
db.on('error', err => console.log('Error ' + err));

const server = app.listen(9000, () => {
  console.log('Server is running on port: 9000');
});

module.exports = server;
