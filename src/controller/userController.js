const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const aws = require('aws-sdk')
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const { isValidString, isValidate, isEmail,isValidPassword,isValidPhone,isValidPincode } = require("../Validator/userValidator")



aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname,
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

    })
}

//**************************Create User*******************************/

const postUser = async (req, res) => {

    try {
        let data = req.body
        let files = req.files

        //.......destructuring......

        if (Object.keys(data).length==0) return res.status(400).send({status:false,message:"input should not be empty"})
        let { fname, lname, email, phone, password, address } = data
        let securePassword = await bcrypt.hash(password, 10)  //......salt used.....

        if (!fname) return res.status(400).send({ status: false, message: "fname is Mandatory field" })
        if(!isValidString(fname))  return res.status(400).send({message:"fname is not valid"})

        // if(!isValidate(fname))   return res.status(400).send({message:"fname is required"})
        if (!lname) return res.status(400).send({ message: "lname is required" })
        if(!isValidString(lname))  return res.status(400).send({message:"lname is not valid"})


        // //===========================  Email ================================================================
        if (!email) return res.status(400).send({ message: "email is required" })
        if (!isEmail(email)) return res.status(400).send({ message: "email is not valid" })
        let UniqueEmail = await userModel.find({ phone: phone })
        if (!UniqueEmail) return res.status(400).send({ message: "Email already Exists" })
        // //===========================  password ================================================================

        if (!password) return res.status(400).send({ message: "password is required" })
        if(!isValidPassword(password))  return res.status(400).send({message:"password should be between 8 to 15"})
        // //===========================  Phone ================================================================
        if (!phone) return res.status(400).send({ message: "phone is required" })
        if(!isValidPhone(phone))   res.status(400).send({ message: "phone is not valid" })
        let UniquePhone = await userModel.find({ phone: phone })
        if (!UniquePhone) return res.status(400).send({ message: "Phone already Exists" })

        if (!address) return res.status(400).send({ message: "address is required" })
        if (!isValidString(address.shipping)) return res.status(400).send({ message: "Shipping address is required" })
        if (!isValidString(address.shipping.street)) return res.status(400).send({ message: "Shipping street  is required" })
        if (!isValidString(address.shipping.city)) return res.status(400).send({ message: "Shipping city is required" })
        if (!isValidPincode(address.shipping.pincode)) return res.status(400).send({ message: "Shipping pincode is not valid" })
        if (!isValidString(address.billing.street)) return res.status(400).send({ message: "Billing Street is required" })
        if (!isValidString(address.billing.city)) return res.status(400).send({ message: "Billing city is required" })
        if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ message: "Billing pincode is valid" })

        if ((files && files.length) > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            var uploadedFileURL = await uploadFile(files[0])

        }
        else {
            return res.status(400).send({ msg: "No file found" })

        }
        let user = {
            fname: fname, lname: lname, email: email, profileImage: uploadedFileURL, phone: phone, address: address, password: securePassword
        }
        let createUser = await userModel.create(user)
        return res.status(201).send({ status: false, message: "file uploaded succesfully", data: createUser })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

//**************************Login User*******************************/

const loginUser = async function (req, res) {
    try {
        const body = req.body
        if (Object.keys(body).length == 0) return res.status(400).send({ status: false, msg: "Please fill data in body" })

        const { email, password } = body

        if (!email) return res.status(400).send({ status: false, msg: "Email is mandatory" })
        if (!isEmail(email)) return res.status(400).send({ status: false, msg: "Invalid email, ex.- ( abc123@gmail.com )" })


        let checkUser = await userModel.findOne({ email: email })

        if (!checkUser) {
            return res.status(401).send({ status: false, message: "User not found" })
        }

        let checkPassword = await bcrypt.compare(password, checkUser.password)
        if (!checkPassword) return res.status(400).send({ status: false, message: "Enter correct Password" })

        let createToken = jwt.sign({
            userId: checkUser._id.toString(),
        }, 'user-secret-key', { expiresIn: '5hr' })

        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: checkUser._id, token: createToken } })

    }
    catch (err) {
        return res.status(500).send(err.message)
    }
}
//****************************Get user********************************/

const getUserProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(400).send({ status: false, message: "userId is not valid" }) }

        const user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(404).send({ send: false, message: "No profile available with this userId" })
        }
        return res.status(200).send({ status: true, message: "User profile details", data: user })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
}

//**************************Update user******************************/

const updateUser=async (req,res)=>{
let data=req.body
let files=req.files
let userId=req.params.userId
let { fname, lname, email, phone, password, address } = data
if (Object.keys(data).length==0) return res.status(400).send({status:false,message:"input should not be empty"})

 if(!isValidate(fname)) return res.status(400).send({status:false,message:"fname should be valid"})
       
        if(isValidString(lname))  return res.status(400).send({message:"lname is not valid"})


        // //===========================  Email ================================================================
        if (isEmail(email)) return res.status(400).send({ message: "email is not valid" })
        let UniqueEmail = await userModel.find({ phone: phone })
        if (!UniqueEmail) return res.status(400).send({ message: "Email already Exists" })
        // //===========================  password ================================================================

        if(!isValidPassword(password))  return res.status(400).send({message:"password should be between 8 to 15"})
        // //===========================  Phone ================================================================
        if(isValidPhone(phone))   res.status(400).send({ message: "phone is not valid" })
        let UniquePhone = await userModel.find({ phone: phone })
        if (!UniquePhone) return res.status(400).send({ message: "Phone already Exists" })

        // if (isValidString(address.shipping)) return res.status(400).send({ message: "Shipping address is required" })

        // if (isValidString(address.shipping.street)) return res.status(400).send({ message: "Shipping street  is required" })
        // if (isValidString(address.shipping.city)) return res.status(400).send({ message: "Shipping city is required" })
        // if (isValidPincode(address.shipping.pincode)) return res.status(400).send({ message: "Shipping pincode is not valid" })
        // if (isValidString(address.billing.street)) return res.status(400).send({ message: "Billing Street is required" })
        // if (isValidString(address.billing.city)) return res.status(400).send({ message: "Billing city is required" })
        // if (isValidPincode(address.billing.pincode)) return res.status(400).send({ message: "Billing pincode is valid" })




if ((files && files.length) > 0) {
    //upload to s3 and get the uploaded link
    // res.send the link back to frontend/postman
    var uploadedFileURL = await uploadFile(files[0])

}
else {
    return res.status(400).send({ msg: "No file found" })

}
let securePass=await bcrypt.hash(password,10)
let user = {
    fname: fname, lname: lname, email:email, profileImage: uploadedFileURL, phone: phone, address: address, password: securePass
}

let update=await userModel.findByIdAndUpdate({_id:userId},user,{new:true})
res.status(200).send({status:true,message:"user updated successfully",data:update})



}


module.exports.updateUser=updateUser
module.exports.postUser = postUser
module.exports.loginUser = loginUser
module.exports.getUserProfile = getUserProfile

