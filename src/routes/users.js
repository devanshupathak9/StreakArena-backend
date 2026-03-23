const router = require('express').Router();
const users = require('../controllers/userController');
const requireAuth = require('../middleware/auth');

router.get('/me', requireAuth, users.getMe);
router.get('/dashboard', requireAuth, users.getDashboard);

module.exports = router;
