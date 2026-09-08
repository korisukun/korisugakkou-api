const express = require('express');
const router = express.Router();
const { getPosts, createPost, editPost, deletePost, toggleLike, getComments, addComment, editComment, deleteComment, getNotifications, markNotificationsRead } = require('../controllers/communityController');
const { protect } = require('../middlewares/authMiddleware');

// Postingan
router.get('/posts', protect, getPosts);
router.post('/posts', protect, createPost);
router.put('/posts/:id', protect, editPost);
router.delete('/posts/:id', protect, deletePost);

// Interaksi (Like & Komentar)
router.post('/like', protect, toggleLike);
router.get('/comments/:post_id', protect, getComments);
router.post('/comment', protect, addComment);
router.put('/comment/:id', protect, editComment);
router.delete('/comment/:id', protect, deleteComment);

// Notifikasi
router.get('/notifications', protect, getNotifications);
router.post('/notifications/read', protect, markNotificationsRead);

module.exports = router;