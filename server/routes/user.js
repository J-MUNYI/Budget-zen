const express = require('express');
const auth = require('../middleware/auth');
const { getMe, patchMe } = require('../controllers/userController');

const router = express.Router();

router.get('/me', auth, getMe);
router.patch('/me', auth, patchMe);

module.exports = router;
