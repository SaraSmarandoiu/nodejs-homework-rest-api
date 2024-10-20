const express = require('express');
const Contact = require('../../models/contact');
const auth = require('../../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ owner: req.user._id });
    res.json(contacts);
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ message: 'Error retrieving contacts' });
  }
});

router.get('/:contactId', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.contactId, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error retrieving contact:', error);
    res.status(500).json({ message: 'Error retrieving contact' });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, email, phone, favorite } = req.body;
  const newContact = new Contact({ name, email, phone, favorite, owner: req.user._id });
  try {
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Error creating contact' });
  }
});

router.delete('/:contactId', auth, async (req, res) => {
  try {
    const deletedContact = await Contact.findOneAndDelete({ _id: req.params.contactId, owner: req.user._id });
    if (!deletedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Error deleting contact' });
  }
});

router.put('/:contactId', auth, async (req, res) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Error updating contact' });
  }
});

router.patch('/:contactId/favorite', auth, async (req, res) => {
  const { favorite } = req.body;
  if (favorite === undefined) {
    return res.status(400).json({ message: 'missing field favorite' });
  }
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner: req.user._id },
      { favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating favorite status:', error);
    res.status(500).json({ message: 'Error updating favorite status' });
  }
});

module.exports = router;
