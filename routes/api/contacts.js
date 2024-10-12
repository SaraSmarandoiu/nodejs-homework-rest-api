const express = require('express');
const Contact = require('../../models/contact');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contacts' });
  }
});

router.get('/:contactId', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contact' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: 'Error creating contact' });
  }
});

router.delete('/:contactId', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.contactId);
    if (!deletedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact' });
  }
});

router.put('/:contactId', async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(req.params.contactId, req.body, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: 'Error updating contact' });
  }
});

router.patch('/:contactId/favorite', async (req, res) => {
  const { favorite } = req.body;
  if (favorite === undefined) {
    return res.status(400).json({ message: 'missing field favorite' });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(req.params.contactId, { favorite }, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: 'Error updating contact' });
  }
});

module.exports = router;
