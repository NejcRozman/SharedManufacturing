const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

const adminRoutes = require('./routes/admin');
const playerRoutes = require('./routes/player');

app.use(morgan('dev'));

app.use(express.json());
app.use(cors());

// Routes which should handle requests
app.use('/admin', adminRoutes);
app.use('/player', playerRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

mongoose.connect('mongodb+srv://ldsedev:' + process.env.MONGO_ATLAS_PW + '@cluster0.hka4i.mongodb.net/sharedManufacturing?retryWrites=true&w=majority', {
    useNewUrlParser: true,
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
