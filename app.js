const express = require('express');
const mongoose = require('mongoose');
const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');

const app = express();
app.use(express.json());

const MONGO_URI = 'mongodb+srv://sarasmarandoiu:sara@cluster0.ts6q8.mongodb.net/db-contacts?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Database connection successful'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter);

module.exports = app;
