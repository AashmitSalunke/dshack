// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Issue = require('./models/issue');

async function main(){
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/DsHack';
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Create a demo user if none exists
  let user = await User.findOne({ email: 'demo@civicone.local' });
  if (!user) {
    user = new User({
      name: 'Demo User',
      email: 'demo@civicone.local',
      password: 'password123', // for dev only
      role: 'citizen',
      phone: '9999999999'
    });
    await user.save();
    console.log('Created demo user:', user._id.toString());
  } else {
    console.log('Demo user exists:', user._id.toString());
  }

  // Optionally create a sample issue if none exist
  const count = await Issue.countDocuments();
  if (count === 0) {
    await Issue.create({
      userId: user._id,
      title: 'Demo: broken streetlight',
      description: 'Demo entry: the streetlight near block A is not functioning.',
      category: 'streetlight',
      severity: 'medium',
      imageUrl: '',
      location: { latitude: 18.5204, longitude: 73.8567 }
    });
    console.log('Created demo issue.');
  }

  await mongoose.disconnect();
}
main().catch(err => {
  console.error('Seed error', err);
  process.exit(1);
});
