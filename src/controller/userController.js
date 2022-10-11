const userModel= require('../model/userModel')
const bcrypt=require('bcrypt')
const aws=require('aws-sdk')
const isValid = require ("../Validator/userValidator")
const jwt = require("jsonwebtoken")


aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  
        Key: "abc/" + file.originalname, 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

   })
}

//**************************Create User*******************************/

const postUser=async(req,res)=>{
     let data = req.body
    if(req.files[0]){
        let files= req.files

        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            var uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{

            res.status(400).send({ msg: "No file found" })

        }
        const createUser=await userModel.create(data)
        return res.status(201).send({msg:'User Created Successfully',data:createUser})
      

    }  

}

//**************************Login User*******************************/

const loginUser=async function(req,res){
    try {
        const body = req.body
        if (Object.keys(body).length == 0) return res.status(400).send({ status: false, msg: "Please fill data in body" })

        const { email, password } = req.body

        if (!email) return res.status(400).send({ status: false, msg: "Email is mandatory" })
        if (!isValid.isEmail(email)) return res.status(400).send({ status: false, msg: "Invalid email, ex.- ( abc123@gmail.com )"})


    let checkUser = await userModel.findOne({ email:email })

    if (!checkUser) {
      return res.status(401).send({ status: false, message: "User not found" })
    }
    if (password != checkUser.password) {
      return res.status(401).send({ status: false, message: "Password is incorrect" })
    }
    
    let createToken = jwt.sign({
      userId: checkUser._id.toString(),
    }, 'user-secret-key',{expiresIn:'1hr'})

    return res.status(200).send({ status: true, message: "User login successfull", data:{userId:checkUser._id,token: createToken} })
   
        }
        catch (err){
            return res.status(500).send(err.message)
        }
    }



module.exports.postUser= postUser
module.exports.loginUser= loginUser
