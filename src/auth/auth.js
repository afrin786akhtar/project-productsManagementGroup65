const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const userModel = require("../model/userModel")

//*******************Authentication*************************** */

const Authentication = async function (req , res , next){
    try {
        
        let token = req.Authorization["authorization"]
        if(!token) return res.status(401).send({status : false , message : "Token is required"})
        
        jwt.verify(token , secretKey , function(error , decodedToken){
            if(error){
                let message = error.message == "jwt expired" ? "token expired , please Login Again!!!" : "invalid Token"
                return res.status(400).send({status: fasle , message : message})
            } 
            req.decodedToken = decodedToken;
            next()
        })
    } catch (error) {
        return res.status(500).send({status: false , message : error.message})
    }
}



module.exports = {Authentication}