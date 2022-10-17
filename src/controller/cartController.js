const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")
const{isValidate,isValidObjectId}=require("../Validator/userValidator")

//*******************Adding products to cart*************/

const addToCart = async function (req, res) {
    try {

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

//***************remove product from cart***********/

const removeProduct = async function (req, res) {
      try {
        userId=req.params.userId
     
        let findCart=await cartModel.findOne({_id:userId,isDeleted:false})
        if(!findCart) return res.status(400).send({status:false,message:"no Cart found by this userId"})

        if(findCart.items==0) return res.status(400).send({status:false,message:"Cart is Empty"})

        let data=req.body

        if(!isValidate(data)) return res.status(400).send({status:false,message:"Input is Empty"})

        if(data.totalPrice || data.totalItems || typeof data.totalPrice == 'string' || typeof data.totalItems == 'string') return res.status(400).send({ status: false, message: "Cannot change or update total price or total items value" });

        if(!isValidObjectId(data.productId)) return res.status(400).send({status:false,message:"productId is not Valid"})
        let checkProduct=await productModel.findById({_id:data.productId})
        if(!checkProduct) return res.status(400).send({status:false,message:`No product found with this '${data.productId}'productID`})

        if(!isValidObjectId(data.cartId)) return res.status(400).send({status:false,message:"cartId is not Valid"})
        let checkProductId=await cartModel.findOne({_id:findCart._id,'items.productId':{$in:[data.productId]}})
       if(!checkProductId) return res.status(400).send({status:false,message:`No product found in Cart with this '${data.productId}'productID`})

       if(data.removeProduct==undefined) return res.status(400).send({status:false,message:"removeProduct is Required"})
       if(!(/0|1/.test(data.removeProduct))) return res.status(400).send({ status: false, message: "removeProduct should be 0 or 1 in numbers" });

      let Cart=findCart
     Cart.items.map(x=>{
        let getIndex= Cart.items.indexOf(x)
        if(x.productId.toString()==data.productId){
            if(data.removeProduct==0){
                Cart.items.splice(getIndex,1)
                Cart.totalPrice -= x.quantity * checkProduct.price 

            }else if(data.removeProduct==1){
                Cart.totalPrice -=checkProduct.price
            }
        }
        if(x.quantity==0){
            Cart.items.splice(getIndex,1)
        }

     })

      //updating totalPrice and totalItems
    if(Cart.items.length == 0) {
        Cart.items = [];
        Cart.totalItems = 0;
        Cart.totalPrice = 0;            
      }else {
        Cart.totalPrice = Cart.totalPrice           //.toFixed(2);
        Cart.totalItems = Cart.items.length;
      }

      let getUpdatedCart = await Cart.findByIdAndUpdate(
        {_id: findCart._id},
        Cart,
        {new: true}
      ).populate('items.productId')
  
      res.status(200).send({ status: true, message: "Success", data: getUpdatedCart });
        
      } catch (error) {

     return res.status(500).send({ error: error.message })

      }

}

//*****************get cart details****************/

const getCartDetails = async function (req, res) {

}

//*****************delete the cart***************/

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;
    
        const userDoc = await userModel.findById(userId);
    
        const cart = await cartModel.findOne({ userId: userId });
    
        if (
          !cart ||
          (cart.items.length == 0 && cart.totalItems == 0 && cart.totalPrice == 0)
        ) {
          return res.status(404).send({
            status: false,
            message: "Cart does not exist or may be already deleted",
          });
        }
    
        const updated_Cart = await cartModel.findOneAndUpdate(
          { userId: userId },
          { $set: { items: [], totalPrice: 0, totalItems: 0 } },
          { new: true }
        );
    
        return res.status(204).send({
          status: true,
          message: "Cart deleted successfully for user",
          data: updated_Cart,
        });
      } catch (err) {
        res.status(500).send({
          status: false,
          message: "Internal-Server Error",
          error: err.message,
        });
      }
    };



module.exports = { addToCart, removeProduct, getCartDetails, deleteCart }