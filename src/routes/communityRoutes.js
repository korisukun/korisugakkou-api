const express = require('express');
const router = express.Router();
const { getPosts, createPost, editPost, deletePost, toggleLike, getComments, addComment } = require('../controllers/communityController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/posts', protect, getPosts);
router.post('/posts', protect, createPost);

// [BARU] Rute untuk Edit dan Delete Postingan
router.put('/posts/:id', protect, editPost);
router.delete('/posts/:id', protect, deletePost);

router.post('/like', protect, toggleLike);
router.get('/comments/:post_id', protect, getComments);
router.post('/comment', protect, addComment);

module.exports = router;