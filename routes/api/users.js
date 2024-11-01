const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Jimp = require('jimp');
const fs = require('fs/promises');
const path = require('path');
const sgMail = require('@sendgrid/mail');




const User = require('../../models/user');
const auth = require('../../middleware/auth');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();
const AVATARS_DIR = path.join(__dirname, '../../public/avatars');
const TMP_DIR = path.join(__dirname, '../../tmp');



const storage = multer.diskStorage({
  destination: TMP_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

const crypto = require('crypto');

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex'); // Generează un token
    const newUser = new User({ email, password: hashedPassword, verificationToken }); // Adaugă verificationToken
    await newUser.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: 'Error registering user' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.json({ token, user: { email: user.email, avatarURL: user.avatarURL } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

router.patch('/avatars', auth, upload.single('avatar'), async (req, res) => {
  console.log("Request received to update avatar");
  
  if (!req.file) {
    console.log("No file received");
    return res.status(400).json({ message: 'Avatar file is required' });
  }

  const { path: tempPath, filename } = req.file;
  const newAvatarPath = path.join(AVATARS_DIR, `${req.user._id}_${Date.now()}.jpg`);

  try {
    console.log(`Processing image at ${tempPath}`);

    const image = await Jimp.read(tempPath);
    await image.resize(250, 250).quality(60).writeAsync(newAvatarPath);

    await fs.unlink(tempPath);

    req.user.avatarURL = `/avatars/${path.basename(newAvatarPath)}`;
    await req.user.save();

    console.log(`Avatar updated successfully: ${req.user.avatarURL}`);
    res.status(200).json({ avatarURL: req.user.avatarURL });
  } catch (error) {
    console.error("Error processing avatar:", error);
    await fs.unlink(tempPath);
    res.status(500).json({ message: 'Error updating avatar' });
  }
});
router.get('/verify/:verificationToken', async (req, res) => {
  const { verificationToken } = req.params;
  
  try {
    const user = await User.findOne({ verificationToken });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verificationToken = null; 
    user.verify = true; 
    await user.save();

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/verify', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'missing required field email' });
  }

  const user = await User.findOne({ email });
  if (!user || user.verify) {
    return res.status(400).json({ message: 'Verification has already been passed or user not found' });
  }

  const verificationUrl = `http://localhost:${process.env.PORT}/api/users/verify/${user.verificationToken}`;
  const msg = {
    to: user.email,
    from: process.env.SENDER_EMAIL,
    subject: 'Please verify your email address',
    text: `Click the link to verify your email: ${verificationUrl}`,
    html: `<strong>Click the link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></strong>`,
  };

  await sgMail.send(msg);
  
  res.status(200).json({ message: 'Verification email sent' });
});


module.exports = router;
