const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Jimp = require('jimp');
const fs = require('fs/promises');
const path = require('path');

const User = require('../../models/user');
const auth = require('../../middleware/auth');

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

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
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
  if (!req.file) {
    return res.status(400).json({ message: 'Avatar file is required' });
  }

  const { path: tempPath, filename } = req.file;
  const newAvatarPath = path.join(AVATARS_DIR, `${req.user._id}_${filename}.jpg`);

  try {
    const image = await Jimp.read(tempPath);
    await image.resize(250, 250).quality(60).writeAsync(newAvatarPath);
    await fs.unlink(tempPath);

    req.user.avatarURL = `/avatars/${req.user._id}_${filename}.jpg`;
    await req.user.save();

    res.status(200).json({ avatarURL: req.user.avatarURL });
  } catch (error) {
    res.status(500).json({ message: 'Error updating avatar' });
  }
});

module.exports = router;
