const express = require('express');
const router = express.Router();
const {getInfo, GetAllSalones, chatbot} = require('./controllers/salon.js');

router.post('/salon', getInfo);
router.get('/GetAllSalones', GetAllSalones);
router.post('/chatbot', chatbot);

module.exports = router;