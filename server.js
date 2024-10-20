const express = require('express');
const mongoose = require('mongoose');
const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
