// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { analyzeImage } = require("./geminiAI"); // optional - keep as you had
const multer = require('multer');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');

const User = require('./models/user');
const Issue = require('./models/issue');

const app = express();
const port = process.env.PORT || 3000;

// Ensure upload folder exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const okMime = allowed.test(file.mimetype);
    if (okExt && okMime) cb(null, true);
    else cb(new Error('Only images (jpeg,jpg,png,gif) are allowed'));
  }
});

// Connect to Mongo
async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/DsHack', {
    
  });
}
main()
  .then(()=> console.log('Connected to MongoDB'))
  .catch(err => console.error('Mongo connection error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Basic pages ----------
app.get('/', (req, res) => res.redirect('/user'));



app.get('/user', (req, res) => res.render('login.ejs'));
app.post('/login',async(req,res)=>{
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).render('login.ejs', { error: 'Invalid email or password' });
        }
        res.render('dashboard.ejs', { user: user.toObject() });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).render('login.ejs', { error: 'Server error' });
    }
})

app.get('/register', (req, res) => res.render('register.ejs'));
app.post('/register', async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render('register.ejs', { error: 'Email already registered' });
        }
        const user = new User({ name, email, password, role, phone });
        await user.save();
        res.render('login.ejs', { user: user.toObject() });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).render('register.ejs', { error: 'Server error' });
    }
});
// Dashboard/account pages — for dev we allow ?id=<userId> to simulate login
app.get('/dashboard', async (req, res) => {
  try {
    let user = null;
    if (req.query.id) user = await User.findById(req.query.id).lean();
    else user = await User.findOne().lean();
    res.render('dashboard.ejs', { user: user || null });
  } catch (err) {
    console.error(err);
    res.render('dashboard.ejs', { user: null });
  }
});

app.get('/account', async (req, res) => {
  try {
    let user = null;
    if (req.query.id) user = await User.findById(req.query.id).lean();
    else user = await User.findOne().lean();
    res.render('account.ejs', { user: user || null });
  } catch (err) {
    console.error(err);
    res.render('account.ejs', { user: null });
  }
});

// ---------- Issues ----------
app.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).lean();
    res.render('issues.ejs', { issues });
  } catch (err) {
    console.error('Error loading issues:', err);
    res.status(500).send('Error loading issues');
  }
});

// Render new issue form. To simulate a logged-in user in dev,
// pass ?id=<userId> (seed created id) or it will pick first user in DB.
app.get('/issues/new', async (req, res) => {
  try {
    let user = null;
    if (req.query.id) user = await User.findById(req.query.id).lean();
    else user = await User.findOne().lean();
    res.render('issues_new.ejs', { user: user || null, error: null, formData: {} });
  } catch (err) {
    console.error('Error rendering new issue page:', err);
    res.render('issues_new.ejs', { user: null, error: 'Server error', formData: {} });
  }
});

// Create issue
app.post('/issues', upload.single('image'), async (req, res) => {
  try {
    // Validate and coerce inputs
    const { userId, title, description, category, severity, latitude, longitude } = req.body;

    // Basic server-side checks
    if (!userId) throw new Error('userId is required. Provide ?id=<userId> or login first.');
    // Ensure userId looks like ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) throw new Error('Invalid userId format. Must be 24 hex chars.');

    if (!title || title.trim().length < 5) throw new Error('Title required (min 5 chars).');
    if (!description || description.trim().length < 10) throw new Error('Description required (min 10 chars).');

    // Category must match schema enums:
    const allowedCategories = [
      "pothole",
      "garbage",
      "water_leakage",
      "streetlight",
      "public_safety",
      "infrastructure_damage",
      "other"
    ];
    if (!allowedCategories.includes(category)) throw new Error('Invalid category selected.');

    const allowedSeverity = ['low','medium','high'];
    if (!allowedSeverity.includes(severity)) throw new Error('Invalid severity selected.');

    // location check
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) throw new Error('Location required. Click "Get Location" to capture coordinates.');

    // image url: store a web-usable path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const issue = new Issue({
      userId,
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      imageUrl,
      location: { latitude: lat, longitude: lon }
    });

    await issue.save();
    res.redirect('/issues');
  } catch (err) {
    console.error('Create issue error:', err);
    // Render the form again with error and form data to help user correct
    // Try to pass back a valid user if available
    let user = null;
    if (req.body.userId && /^[0-9a-fA-F]{24}$/.test(req.body.userId)) {
      try { user = await User.findById(req.body.userId).lean(); } catch(e){}
    } else {
      user = await User.findOne().lean();
    }
    res.status(400).render('issues_new.ejs', {
      user: user || null,
      error: err.message || 'Validation error',
      formData: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        severity: req.body.severity,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      }
    });
  }
});

app.get('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).lean();
    if (!issue) return res.status(404).send('Issue not found');
    res.render('issue_show.ejs', { issue });
  } catch (err) {
    console.error('Error loading issue:', err);
    res.status(500).send('Error loading issue');
  }
});

// ---------- Image analysis & AI routes (kept similar to your original) ----------
app.get('/upload', (req, res) => res.render('upload.ejs'));
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');
    const analysis = await analyzeImage(req.file.path); // keep your function contract
    res.render('analysis_result.ejs', { image: req.file.filename, analysis });
  } catch (err) {
    console.error('Image analysis error:', err);
    res.status(500).send('Error analyzing image');
  }
});

app.get('/ai', (req, res) => res.render('ai_overview.ejs'));
app.post('/ai', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt || !prompt.trim()) return res.render('ai_overview.ejs', { response: 'Please enter prompt' });

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const response = result.response.text();
    res.render('ai_overview.ejs', { response });
  } catch (err) {
    console.error('AI error:', err);
    res.render('ai_overview.ejs', { response: 'AI error' });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
