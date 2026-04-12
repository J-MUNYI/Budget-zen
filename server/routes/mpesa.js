const express = require('express');
const auth = require('../middleware/auth');
const {
  testDarajaConnection,
  requestAccountBalance,
  balanceResult,
  balanceTimeout,
} = require('../controllers/mpesaController');

const router = express.Router();

router.post('/callback/balance-result', balanceResult);
router.post('/callback/balance-timeout', balanceTimeout);

router.get('/daraja/test', auth, testDarajaConnection);
router.post('/account-balance', auth, requestAccountBalance);

module.exports = router;
