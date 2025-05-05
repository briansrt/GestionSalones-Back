const express = require('express');
const router = express.Router();
const {getInfo, chatbot} = require('./controllers/salon.js');

router.post('/salon', getInfo);
router.post('/chatbot', chatbot);

module.exports = router;