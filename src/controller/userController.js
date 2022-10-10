const userModel = require("../model/userModel")

const loginUser=async function(req,res){
    try {
        let body=req.body
        
        let keys= [email, password ]
        if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
            return res
              .status(400)
              .send({ status: false, message: "wrong Parameters" });
          }
        
        if (Object.keys(body).length == 0) {
           return res.status(400) .send({ status: false, message: "Body should not be empty" });
          }
          
        }
        catch (err){
            return res.status(500).send(err.message)
        }
    }