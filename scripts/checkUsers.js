const mongoose = require('mongoose');

async function main(){
  try{
    await mongoose.connect('mongodb://127.0.0.1:27017/DsHack');
    console.log('Connected to MongoDB at mongodb://127.0.0.1:27017/DsHack');
    // require the model after connection
    const User = require('../models/user');
    const users = await User.find().lean();
    console.log('User count:', users.length);
    if(users.length > 0){
      console.log('Sample users (first 5):');
      console.log(JSON.stringify(users.slice(0,5), null, 2));
    }
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error checking users collection:', err);
    process.exit(1);
  }
}

main();
