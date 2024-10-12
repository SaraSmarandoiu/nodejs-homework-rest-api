const express = require('express');
const mongoose = require('mongoose');
const contactsRouter = require('./routes/api/contacts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const MONGO_URI = 'mongodb+srv://sarasmarandoiu:sara@cluster0.ts6q8.mongodb.net/db-contacts?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

app.use('/api/contacts', contactsRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
