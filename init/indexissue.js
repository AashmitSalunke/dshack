const mongoose=require('mongoose');
const express = require('express');
const Issue = require('../models/issue');
const initIssue=require('./initIssue');

const initDBIssue= async()=>{
    await mongoose.connect('mongodb://127.0.0.1:27017/DsHack');
    console.log("Connected to MongoDB");
    await Issue.insertMany(initIssue.data);
    console.log("created");
}

initDBIssue()
.catch(err=>{
    console.log("Error:",err);
});