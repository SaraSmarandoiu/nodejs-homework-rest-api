const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const userRoutes = require('./routes/api/users');
const contactRoutes = require('./routes/api/contacts');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
