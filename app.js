require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { analyzeImage } = require("./geminiAI"); // your AI module


const multer = require('multer');
const app = express();
const User = require('./models/user');
const Issue = require('./models/issue');
const methodOverride = require('method-override');
const path = require("path");


const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
        }
    }
});

main().then(()=>{
    console.log("Connected to MongoDB");

})
.catch(err=>{
    console.log("Error connecting to MongoDB:",err);
});
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/DsHack');
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.get('/',(req,res)=>{
    res.redirect('/users');
})

app.get('/users',async(req,res)=>{
    res.render('login.ejs');
})
app.post('/login',async(req,res)=>{
    try{
        console.log('Login attempt body:', req.body);
        const {email,password} = req.body;
        // Find by email and include password field (schema has select: false)
        const user = await User.findOne({ email: email }).select('+password');
        if(!user){
            console.log('No user found with email:', email);
            return res.send('Invalid email or password. Please try again.');
        }
        // Simple plaintext compare (init data uses plain passwords). If you hash passwords, use bcrypt.compare
        if(user.password === password){
            return res.redirect('/dashboard');
        } else {
            console.log('Password mismatch for user:', email);
            return res.send('Invalid email or password. Please try again.');
        }
    }catch(err){
        console.error('Login error:', err);
        res.status(500).send('Server error');
    }
})

app.get('/register',(req,res)=>{
    res.render('register.ejs');
})
app.post('/register',async(req,res)=>{
    try{
        console.log('Registration attempt body:', req.body);
        // Trim and normalize inputs to avoid validation issues (e.g. accidental spaces/newlines)
        let { name, email, password, role, phone } = req.body;
        name = typeof name === 'string' ? name.trim() : name;
        email = typeof email === 'string' ? email.trim().toLowerCase() : email;
        password = typeof password === 'string' ? password.trim() : password;
        role = typeof role === 'string' ? role.trim() : role;
        phone = typeof phone === 'string' ? phone.trim() : phone;

        console.log('Normalized registration values:', { name, email, role, phone });

        // Validate email format server-side using the same simple regex as the schema
        const emailRegex = /^\S+@\S+\.\S+$/;
        if(!email || !emailRegex.test(email)){
            return res.status(400).send('Registration validation failed: Please enter a valid email');
        }

        const newUser = new User({ name, email, password, role, phone });
        await newUser.save();
        return res.redirect('/dashboard');
    }catch(err){
        console.error('Registration error:', err);
        // Handle duplicate email (unique index)
        if(err && err.code === 11000){
            const dupKey = Object.keys(err.keyValue || {}).join(', ');
            return res.status(400).send(`Registration failed: duplicate field(s): ${dupKey}`);
        }
        // Mongoose validation error
        if(err && err.name === 'ValidationError'){
            const messages = Object.values(err.errors).map(e=>e.message).join('; ');
            return res.status(400).send(`Registration validation failed: ${messages}`);
        }
        res.status(500).send('Server error during registration');
    }
});

app.get('/account', async (req, res) => {
    try {
        // Allow testing by passing ?id=<userId> or ?email=<email>
        const { id, email } = req.query;
        let user = null;
        if (id) {
            user = await User.findById(id).lean();
        } else if (email) {
            user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
        } else {
            // Fallback: first user in DB (helpful for development only)
            user = await User.findOne().lean();
        }

        return res.render('account', { user: user || null });
    } catch (err) {
        console.error('Error rendering account page:', err);
        return res.render('account', { user: null });
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        const { id, email } = req.query;
        let user = null;
        if (id) {
            user = await User.findById(id).lean();
        } else if (email) {
            user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
        } else {
            user = await User.findOne().lean();
        }
        return res.render('dashboard', { user: user || null });
    } catch (err) {
        console.error('Error rendering dashboard:', err);
        return res.render('dashboard', { user: null });
    }
});

// Issues routes
app.get('/issues', async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 }).lean();
        return res.render('issues', { issues });
    } catch (err) {
        console.error('Error loading issues:', err);
        return res.status(500).send('Server error loading issues');
    }
});

app.get('/issues/new', (req, res) => {
    return res.render('issues_new');
});

app.post('/issues', upload.single('imageUrl'), async (req, res) => {
    try {
        // Multer will populate req.file and req.body for multipart/form-data
        const { userId, title, description, category, severity, latitude, longitude } = req.body || {};
        const location = (latitude && longitude) ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) } : undefined;

        const imagePath = req.file ? '/uploads/' + req.file.filename : undefined;

        const newIssue = new Issue({
            userId: userId || undefined,
            title,
            description,
            category,
            severity,
            location,
            imageUrl: imagePath
        });
        await newIssue.save();
        return res.redirect('/issues');
    } catch (err) {
        console.error('Create issue error:', err);
        if (err && err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message).join('; ');
            return res.status(400).send(`Validation failed: ${messages}`);
        }
        return res.status(500).send('Server error creating issue');
    }
});

app.get('/issues/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).lean();
        if (!issue) return res.status(404).send('Issue not found');
        return res.render('issue_show', { issue });
    } catch (err) {
        console.error('Error loading issue:', err);
        return res.status(500).send('Server error');
    }
});

app.get('/users/:id/edit', async (req, res) => {
    let id=req.params.id;
    const user=await User.findById(id);

   res.render('edit.ejs',{user});
});

// Update user
app.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email, phone, role, password } = req.body;
        const update = { name, email, phone, role };
        if (password && password.length > 0) update.password = password;

        const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!user) {
            console.log('User not found for update:', id);
            return res.status(404).send('User not found');
        }
        return res.redirect('/account');
    } catch (err) {
        console.error('Update error:', err);
        if (err && err.code === 11000) {
            const dupKey = Object.keys(err.keyValue || {}).join(', ');
            return res.status(400).send(`Update failed: duplicate field(s): ${dupKey}`);
        }
        if (err && err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message).join('; ');
            return res.status(400).send(`Validation failed: ${messages}`);
        }
        return res.status(500).send('Server error updating user');
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        let id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.name = name;
        user.email = email;
        user.password = password;
        user.role = role;
        user.phone = phone;
        await user.save();
        res.redirect('/account');
    } catch (err) {
        console.error('Error updating user:', err);     
        res.status(500).send('Server error while updating user');
    }
});

app.get('/issues',async(req,res)=>{
    try{
        const issues=await Issue.find().lean();
        res.render('issues.ejs',{issues});
    }catch(err){
        console.error('Error fetching issues:',err);
        res.status(500).send('Server error fetching issues');
    }
});
app.get('/upload', (req, res) => {
    res.render('upload');
});
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        // Call your AI function with the image file path
        const analysis = await analyzeImage(req.file.path);  // analyzeImage expects a file path

        // Render the EJS with filename and AI analysis
        res.render("analysis_result", {
            image: req.file.filename,
            analysis: analysis
        });

    } catch (err) {
        console.error("Error analyzing image:", err);
        res.status(500).send("Server error analyzing the image.");
    }
});

app.get('/ai', (req, res) => {
    res.render('ai_overview');
});

app.post('/ai', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        if (!prompt || prompt.trim().length === 0) {
            return res.render('ai_overview', { response: 'Please enter a prompt.' });
        }
        // Use Gemini AI to get a suggestion (correct format)
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [ { text: prompt } ]
                }
            ]
        });
        const response = result.response.text();
        res.render('ai_overview', { response });
    } catch (err) {
        console.error('AI suggestion error:', err);
        res.render('ai_overview', { response: 'Sorry, there was an error getting a suggestion from Gemini AI.' });
    }
});




app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})