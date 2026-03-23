const router = require('express').Router();
const groups = require('../controllers/groupController');
const requireAuth = require('../middleware/auth');

router.post('/', requireAuth, groups.createGroup);
router.get('/search', requireAuth, groups.searchGroups);
router.get('/:id', requireAuth, groups.getGroup);
router.post('/:id/join', requireAuth, groups.joinGroup);
router.post('/:id/invite', requireAuth, groups.generateInvite);

module.exports = router;
