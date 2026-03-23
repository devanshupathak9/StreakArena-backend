const router = require('express').Router();
const tasks = require('../controllers/taskController');
const requireAuth = require('../middleware/auth');

router.get('/today', requireAuth, tasks.getTodaysTasks);
router.post('/', requireAuth, tasks.createTask);
router.delete('/:id', requireAuth, tasks.deleteTask);
router.post('/:id/complete', requireAuth, tasks.completeTask);

module.exports = router;
