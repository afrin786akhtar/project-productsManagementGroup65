const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const auth = require('../auth/auth')



router.post('/register', userController.postUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', auth.Authentication, userController.getUserProfile)
router.put('/user/:userId/profile',auth.Authentication,auth.Authorization,userController.updateUser)

//************************Product*************//
router.post('/products', productController.product)
router.get('/products',productController.getFilteredProducts)
router.get('/products/:productId',productController.getProductsById)
router.put('/products/:productId',productController.updateProductsById)
router.delete('/products/:productId',productController.deleteProductById)



module.exports = router



