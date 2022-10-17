const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {
  isValidString,
  isValidate,
  isEmail,
  isValidPassword,
  isValidPhone,
  isValidPincode,
} = require("../Validator/userValidator");
const { uploadFile } = require('../utils/awsUpload');


//**************************Create User*******************************/

const postUser = async (req, res) => {
  try {
    let data = req.body;
    let files = req.files;

    //.......destructuring......

    if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, message: "input should not be empty" });

    let { fname, lname, email, phone, password, address } = data;

    let securePassword = await bcrypt.hash(password, 10); //......salt used.....

    if (!fname) return res.status(400).send({ status: false, message: "fname is Mandatory!!" });

    if (!lname) return res.status(400).send({ status: false, message: "lname is Mandatory!!" });

    //===========================  Email ================================================================
    if (!email) return res.status(400).send({ status: false, message: "email is required" });
    if (!isEmail(email))
      return res.status(400).send({ status: false, message: "email is not valid" });
    let UniqueEmail = await userModel.findOne({ email: email });
    if (UniqueEmail)
      return res.status(400).send({ status: false, message: "Email already Exists" });

    //===========================  password ================================================================

    if (!password)
      return res.status(400).send({ status: false, message: "password is required" });
    if (!isValidPassword(password))
      return res.status(400).send({ status: false, message: "The password must contain an uppercase, a lowercase, a numeric value, a special character and the limit is from 8 to 15 characters." });

    //===========================  Phone ================================================================
    if (!phone) return res.status(400).send({ status: false, message: "phone number is required" });
    if (!isValidPhone(phone))
     return res.status(400).send({ status: false, message: "phone is not valid" });
    let UniquePhone = await userModel.find({ phone: phone });
    if (UniquePhone)
      return res.status(400).send({ status: false, message: "Phone already Exists" });


    if (address) {
      // address = JSON.parse(address)

      if (!data.address)
        return res.status(400).send({ status: false, message: "address is required" });
      if (!(address.shipping))
        return res.status(400).send({ status: false, message: "Shipping address is required" });
      if (!(address.shipping.street))
        return res.status(400).send({ status: false, message: "Shipping street  is required" });
      if (!(address.shipping.city))
        return res.status(400).send({ status: false, message: "Shipping city is required" });
      if (!isValidPincode(address.shipping.pincode))
        return res.status(400).send({ status: false, message: "Shipping pincode is not valid" });
      if (!(address.billing.street))
        return res.status(400).send({ status: false, message: "Billing Street is required" });
      if (!(address.billing.city))
        return res.status(400).send({ status: false, message: "Billing city is required" });
      if (!isValidPincode(address.billing.pincode))
        return res.status(400).send({ status: false, message: "Billing pincode is valid" });

    }
    if ((files && files.length) > 0) {
      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      var uploadedFileURL = await uploadFile(files[0]);
    } else {
      return res.status(404).send({ status: fasle, message: "No file found" });
    }
    let user = {
      fname: fname,
      lname: lname,
      email: email,
      profileImage: uploadedFileURL,
      phone: phone,
      address: address,
      password: securePassword,
    };

    let createUser = await userModel.create(user);
    return res.status(201).send({ status: true, message: "file uploaded succesfully", data: createUser });

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//**************************Login User*******************************/

const loginUser = async function (req, res) {
  try {
    const body = req.body;
    if (Object.keys(body).length == 0)
      return res.status(400).send({ status: false, msg: "Please fill data in body" });

    const { email, password } = body;

    if (!email) return res.status(400).send({ status: false, msg: "Email is mandatory" });
    if (!isEmail(email))
      return res.status(400).send({ status: false, message: "Invalid email, ex.- ( abc123@gmail.com )" });

    if(!password) return res.status(400).send({status : false , message : "Please provide the password!!"})

    let checkUser = await userModel.findOne({ email: email });

    if (!checkUser) {
      return res.status(401).send({ status: false, message: "User not found" });
    }

    let checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword)
      return res.status(400).send({ status: false, message: "Enter correct Password" });

    let createToken = jwt.sign(
      {
        userId: checkUser._id.toString(),
      },
      "user-secret-key", { expiresIn: "5 hr" }
    );

    return res.status(201).send({ status: true, message: "User login successfull", data: { userId: checkUser._id, token: createToken } });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

//****************************Get user********************************/

const getUserProfile = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ status: false, message: "userId is not valid" });
    }

    const user = await userModel.findById({ _id: userId });
    if (!user) {
      return res.status(404).send({ send: false, message: "No profile available with this userId" });
    }
    return res.status(200).send({ status: true, message: "User profile details", data: user });

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//**************************Update user******************************/

const updateUser = async (req, res) => {
  let data = req.body;
  let files = req.files;
  let userId = req.params.userId;
  let { fname, lname, email, phone, password, address } = data;
  // let securePass=await bcrypt.hash(password,10)
  if (Object.keys(data).length == 0)
    return res.status(400).send({ status: false, message: "input should not be empty" });

  if (isValidString(fname)) {
    return res.status(400).send({ status: false, message: "fname should be valid" });
  }

  if (isValidString(lname)) {
    return res.status(400).send({status: false, message: "lname is not valid" });
  }

  // //===========================  Email ================================================================

  let UniqueEmail = await userModel.findOne({ email: email });
  if (UniqueEmail)
    return res.status(400).send({ status: false,message: "Email already Exists" });
  // //===========================  password ================================================================

  if (isValidPassword(password)) {
    return res.status(400).send({status: false, message: "The password must contain an uppercase, a lowercase, a numeric value, a special character and the limit is from 8 to 15 characters." });
  }
  // //===========================  Phone ================================================================
  if (isValidPhone(phone))
    res.status(400).send({status: false, message: "phone is not valid" });
  let UniquePhone = await userModel.findOne({ phone: phone });
  if (UniquePhone)
    return res.status(400).send({status: false, message: "Phone already Exists" });

  if (address) {
    // address = JSON.parse(address)

    let { shipping, billing } = address;

    if (address.shipping) {
      let { street, city, pincode } = shipping

      if (street) {
        if (!isValidate(address.shipping.street))
          return res.status(400).send({ status: false,message: "Shipping street is invalid" });
      }
      if (city) {
        if (!isValidate(address.shipping.city))
          return res.status(400).send({ status: false,message: "Shipping city is not valid" });
      }
      if (pincode) {
        if (!isValidPincode(address.shipping.pincode))
          return res.status(400).send({status: false, message: "Shipping pincode is Invalid" });
      }
    }

    if (billing) {
      let { street, city, pincode } = billing
      if (street) {
        if (!isValidate(address.billing.street))
          return res.status(400).send({status: false, message: "Billing street is invalid" });
      }
      if (city) {
        if (!isValidate(address.billing.city))
          return res.status(400).send({status: false, message: "Billing city is not valid" });
      }
      if (pincode) {
        if (!isValidPincode(address.billing.pincode))
          return res.status(400).send({status: false, message: "Billing pincode is not valid" });
      }
    }
  }

  if(files){
    if (files != undefined && files.length > 0) {
        //upload to s3 and get the uploaded link
        // res.send the link back to frontend/postman
      var uploadedFileURL = await uploadFile(files[0]);
    } else {
      return res.status(400).send({status: false, message: "No file found" });
    }
  }

  let user = {
    fname: data.fname,
    lname: data.lname,
    email: data.email,
    profileImage: uploadedFileURL,
    phone: data.phone,
    address: data.address,
    password: data.password,
  };

  let update = await userModel.findByIdAndUpdate({ _id: userId }, user, { new: true });

  res.status(200).send({ status: true, message: "Update user profile is successful", data: update });
};

module.exports.updateUser = updateUser;
module.exports.postUser = postUser;
module.exports.loginUser = loginUser;
module.exports.getUserProfile = getUserProfile;
