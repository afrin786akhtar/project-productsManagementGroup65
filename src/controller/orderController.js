const orderModel = require("../model/orderModel")

const placeOrder = async function (req, res){
    try{
    let data = req.body

    }
    catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}


const updateOrder = async function (req, res){
    try{
    let data = req.body

    }
    catch(err){
        return res.status(500).send({status: false, message: err.message})
    }
}
module.exports.placeOrder = placeOrder
module.exports.updateOrder = updateOrder