const express = require('express');
const router = express.Router();
const userController= require('../controller/userController')



router.post('/register',userController.postUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile', userController.getUserProfile)


module.exports = router