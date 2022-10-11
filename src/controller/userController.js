const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const aws = require('aws-sdk')
const isValid = require("../Validator/userValidator")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")


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
        let { fname, lname, email, phone, password, address } = data
        let securePassword = await bcrypt.hash(password , 10)  //......salt used.....

        if ((files && files.length) > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            var uploadedFileURL = await uploadFile(files[0])
           
        }

        else {
           return res.status(400).send({ msg: "No file found" })

        }
        let user = {
            fname: fname, lname: lname, email: email,profileImage:uploadedFileURL,  phone: phone, address: address, password: securePassword 
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

        const { email, password } = req.body

        if (!email) return res.status(400).send({ status: false, msg: "Email is mandatory" })
        if (!isValid.isEmail(email)) return res.status(400).send({ status: false, msg: "Invalid email, ex.- ( abc123@gmail.com )" })


        let checkUser = await userModel.findOne({ email: email })

        if (!checkUser) {
            return res.status(401).send({ status: false, message: "User not found" })
        }
        if (password != checkUser.password) {
            return res.status(401).send({ status: false, message: "Password is incorrect" })
        }

        let createToken = jwt.sign({
            userId: checkUser._id.toString(),
        }, 'user-secret-key', { expiresIn: '1hr' })

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




module.exports.postUser = postUser
module.exports.loginUser = loginUser
module.exports.getUserProfile = getUserProfile
