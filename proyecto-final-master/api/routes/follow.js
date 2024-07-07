'use strict';

const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const FollowController = require('../controllers/follow');

const router = express.Router();

router.post('/follow/:followed', authMiddleware, FollowController.followUser);
router.delete('/unfollow/:followed', authMiddleware, FollowController.unfollowUser);
router.get('/following/:id/:page?', authMiddleware, FollowController.getFollowingUsers);
router.get('/followers/:id?/:page?', authMiddleware, FollowController.getFollowedUsers);
router.get('/get-my-follows/:followed?/', authMiddleware, FollowController.getMyFollows);

module.exports = router;
