const cartModel = require("../model/cartModel")
const ProductModel = require("../model/productModel")

//*******************Adding products to cart*************/

const addToCart = async function (req, res) {
    try {

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