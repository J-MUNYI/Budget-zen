const express = require('express');
const auth = require('../middleware/auth');
const { generateInsights } = require('../controllers/insightsController');

const router = express.Router();

router.post('/generate', auth, generateInsights);

module.exports = router;
