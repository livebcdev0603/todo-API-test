const express  = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
/**
 * this is for next development stage - role permission
 */
// const { checkAdminRole } = require('../middleware/roleMiddleware');


const router = express.Router();

router.use(authMiddleware);
// router.use(checkAdminRole);

//Routes
router.post('/migrations/run', adminController.runMigrations);
router.get('/migrations/rollback', adminController.rollbackMigration);
router.get('/migrations/status', adminController.getMigrationStatus);

module.exports = router;