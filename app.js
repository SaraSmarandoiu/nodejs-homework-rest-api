const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Joi = require('joi');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const contacts = require('./models/contacts.json');

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required()
});

function saveContactsToFile(contacts) {
  fs.writeFileSync('./contacts.json', JSON.stringify(contacts, null, 2));
}

app.get('/api/contacts', (req, res) => {
  res.json(contacts);
});

app.get('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const contact = contacts.find(c => c.id === parseInt(id));
  if (contact) {
    res.json(contact);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

app.post('/api/contacts', (req, res) => {
  const { name, email, phone } = req.body;

  const { error } = schema.validate({ name, email, phone });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newContact = {
    id: contacts.length + 1,
    name,
    email,
    phone
  };

  contacts.push(newContact);
  saveContactsToFile(contacts);

  res.status(201).json(newContact);
});

app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const index = contacts.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    contacts.splice(index, 1);
    saveContactsToFile(contacts);
    res.json({ message: 'Contact deleted' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

app.put('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const index = contacts.findIndex(c => c.id === parseInt(id));
  if (index !== -1) {
    contacts[index] = { id: parseInt(id), name, email, phone };
    saveContactsToFile(contacts);
    res.json(contacts[index]);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
