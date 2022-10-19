const orderModel = require("../model/orderModel")

const placeOrder = async function (req, res){
    try{
    let data = req.body

    }
    catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}
module.exports.placeOrder = placeOrder