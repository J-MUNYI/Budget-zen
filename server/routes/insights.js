const express = require('express');
const auth = require('../middleware/auth');
const { generateInsights, getSampleInsight } = require('../controllers/insightsController');

const router = express.Router();

router.post('/generate', auth, generateInsights);
router.get('/sample', getSampleInsight);

module.exports = router;
