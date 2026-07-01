const express = require('express');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const {
  testDarajaConnection,
  requestAccountBalance,
} = require('../controllers/mpesaController');

const router = express.Router();

router.get('/integrations/daraja/test', auth, requireAdmin, testDarajaConnection);
router.post('/integrations/daraja/balance', auth, requireAdmin, requestAccountBalance);

module.exports = router;