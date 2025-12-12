const mongoose=require('mongoose');
const express = require('express');
const User = require('../models/user');
const initUsers=require('./initUser');

const initDBUser= async()=>{
    await mongoose.connect('mongodb://127.0.0.1:27017/DsHack');
    console.log("Connected to MongoDB");

    const existing = await User.countDocuments();
    if(existing > 0){
        console.log(`Users collection already has ${existing} documents — skipping seed.`);
        return;
    }

    try{
        // Use ordered:false to continue on duplicates if any, but we already checked for existing docs
        const res = await User.insertMany(initUsers.data, { ordered: false });
        console.log(`Inserted ${res.length} users`);
    }catch(err){
        console.error('Error inserting users:', err);
        // show MongoServerError details if present
        if(err.writeErrors) console.error('Write errors:', err.writeErrors.map(e=>e.errmsg || e.message));
        throw err;    
    }
}

initDBUser()
.catch(err=>{
    console.log("Error:",err);
});