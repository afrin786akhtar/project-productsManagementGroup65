const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const auth = require('../auth/auth')



router.post('/register', userController.postUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', auth.Authentication, userController.getUserProfile)
router.put('/user/:userId/profile',auth.Authentication,auth.Authorization,userController.updateUser)

module.exports = router