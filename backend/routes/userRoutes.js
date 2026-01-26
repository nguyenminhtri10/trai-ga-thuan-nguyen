const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.get('/', getUsers);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
