const { compare } = require("bcrypt");
const cartModel = require("../model/cartModel");
const productModel = require("../model/productModel");
const ProductModel = require("../model/productModel");
const { validate } = require("../model/userModel");
const { isValidate, isValidObjectId, isValidSize, isValidPrice } = require("../Validator/userValidator");

//*******************Adding products to cart*************/


const addToCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const data = req.body
        //         const query = req.query
        //         const userId = req.params.userId

        // checking if data is provided
        if (!Object.keys(data).length > 0) {
            return res.status(400).send({ status: false, message: "Please provide data" })
        }
        // console.log(data)

        //destructuring
        const { productId, cartId } = data
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Enter valid product id" })

        //checking if product is present in product model and its is deleted is false
        const productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(400).send({ status: false, message: "Product doesn't exist" })

        //checking for cartId and usrID
        if (cartId) {
            if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "enter valid cartId" })

            const cartData = await cartModel.findOne({ _id: cartId, userId: userId })
            if (!cartData) return res.status(400).send({ status: false, message: "Cart does not exist with this id" })

            let cartArray = cartData.items
            console.log(cartArray)
            let productPresent = { productId: productId, quantity: 1 }

            let compareId = cartArray.findIndex((obj) => obj.productId == productId)

            if (compareId == -1) cartArray.push(productPresent)
            else cartArray[compareId].quantity += 1

            cartData.totalItems = cartArray.length
            cartData.totalPrice += productData.price
            // cartData.totalPrice = 0
            // for (let i = 0; i < cartArray.length; i++) {
            //     let product = await productModel.findOne({ _id: cartArray[i].productId })
            //     cartData.totalPrice += cartArray[i].quantity * product.price
            // }

            await cartData.save()

            return res.status(200).send({ status: true, message: "product added to cart successfully", data: cartData })
        } else {
            let items = []
            
            let product = await productModel.findOne({ _id: productId })
            console.log(product)
            if(!product) return res.status(404).send({status : false , message : "No product found"})
            let newitem = items.push({productId: productId, quantity: 1})
            let cartBody = {
                userId: userId,
                items: newitem,
                // items : items,
                totalPrice: product.price,
                totalItems: 1
            }
            let createdCart = await cartModel.create(cartBody)
            console.log(createdCart)
            return res.status(201).send({ status: false, message: "Cart created successfully", data: createdCart })
        }
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

//***************remove product from cart***********/

const removeProduct = async function (req, res) {

}

//*****************get cart details****************/

const getCartDetails = async function (req, res) {

}

//*****************delete the cart***************/

const deleteCart = async function (req, res) {

}

module.exports = { addToCart, removeProduct, getCartDetails, deleteCart }