require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

const livechatRouter = require('./controllers/livechat');

app.use('/', express.static(path.resolve('views', 'home')));
app.use('/api/livechat', livechatRouter);


module.exports = app;