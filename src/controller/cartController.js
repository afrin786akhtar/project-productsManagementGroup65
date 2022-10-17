const cartModel = require("../model/cartModel")
const ProductModel = require("../model/productModel")
const userModel = require("../model/userModel")

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
try{
let userId = req.params.userId
if (!isValidObjectId(userId)) {
    return res.status(400).send({ status: false, message: 'Please provide valid userId' })
  }

//   let checkUser = await userModel.findOne({_id:userId})
//   if(!checkUser){
//     return res.status(404).send({status:false, message:" This User does not exist"})
//   }

  let checkCart = await cartModel.findOne({userId:userId}).populate(items.productId)
  if(!checkCart){
    return res.status(400).send({status:false, message : "The Cart does not exist with this user"})
  }

  return res.status(200).send({status:true, message:"Success", data:checkCart})

}
catch(err){
    return res.status(500).send({status: false, message: err.message})
}
}

//*****************delete the cart***************/

const deleteCart = async function (req, res) {

}

module.exports = { addToCart, removeProduct, getCartDetails, deleteCart }