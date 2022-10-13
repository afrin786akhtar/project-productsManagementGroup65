const productModel = require("../model/productModel")
const aws = require('aws-sdk')
const userModel = require("../model/userModel")
const {isValidate,isValidObjectId} = require("../Validator/userValidator");
const { validate } = require("../model/userModel");



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

const product = async function (req, res){
    try{
        let data = req.body
        let files = req.files

        if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "input should not be empty" });
    let { title, description, price, currencyId, currencyFormat, isFreeShipping,style, 
         installments , availableSizes} = data;

         
   if(!title) return res.status(400).send({status:false, message:"Title is mandatory field"}) 

   if(!description) return res.status(400).send({status:false, message:"Description is mandatory field"})

     if(!price) return res.status(400).send({status:false, message:"Price is mandatory field"}) 

     if(!currencyId) return res.status(400).send({status:false, message:"currencyId is mandatory field"}) 

     if(!currencyFormat) return res.status(400).send({status:false, message:"currencyFormat is mandatory field"}) 
     
     const Sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    

    //  if (!Object.keys(data.availableSizes).every(elem => Sizes.includes(elem))){
    //     return res.status(400).send({ status: false, message: "wrong Parameters"})
    //   }
    if (!Sizes.includes(availableSizes)) return res.status(400).send({status:false, message:"Please select[S|| XS|| M ||X ||L|| XXL|| XL] "})


     if ((files && files.length) > 0) {
        //upload to s3 and get the uploaded link
        // res.send the link back to frontend/postman
        var productImage = await uploadFile(files[0]);
      } else {
        return res.status(400).send({ msg: "No file found" });
      }
      let product  = {
        title: title,
        description: description,
        price: price,
        currencyId: currencyId,
        currencyFormat: currencyFormat,
        isFreeShipping: isFreeShipping,
        productImage: productImage,
        style:style, 
        availableSizes: data.availableSizes,
          installments : installments    
      };

      let createProduct = await productModel.create(product);
      console.log(createProduct)
      return res
        .status(201)
        .send({
          status: false,
          message: "file uploaded succesfully",
          data: createProduct,
        });


    }
    catch (err){
        return res.status(500).send(err.message)
    }
}


let getProductsById=async(req,res)=>{
  try{
    let productId = req.params.productId;

    //checking is product id is valid or not
    if (!isValidObjectId(productId)){
      return res.status(400).send({ status: false, message: 'Please provide valid productId' })
    }
  
    //getting the product by it's ID
    const product = await productModel.findOne({ _id: productId, isDeleted:false})
    if(!product) return res.status(404).send({ status: false, message:"No product found"})

    return res.status(200).send({ status: true, message: 'Success', data: product})
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}


let updateProductsById=async(req,res)=>{
  try {
  let productsId=req.params.productsId
  
  if(!isValidate.isValidObjectId(productsId)) return res.status(400).send({status:false,message:"please enter a product Id"})
  
  const products= await productModel.findByIdAndUpdate({_id:productsId,isDeleted:false})
  if(!products)  return res.status(400).send({status:false,message:"No products Found"})
  
  return res.status(200).send({ status: true, message: 'Success', data: products})
  
  } catch (error) {
    return res.status(500).send({status:false,message:error.message})
  }
  
  }

  // ----------------------------------deleteapi--------------------------------------------

const deleteProductById = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid productId" });
    }

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (product == null) {
      return res.status(404).send({
        status: false,
        message: "Product document does not exist or already deleted",
      });
    }

    let deleteProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      { $set: { isDeleted: true, deletedAt: new Date().toISOString() } },
      { new: true, upsert: true }
    );
    return res.status(200).send({
      status: true,
      message: "Product document deleted successfully",
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};


module.exports.product= product
module.exports.getProductsById=getProductsById
module.exports.updateProductsById=updateProductsById
module.exports.deleteProductById=deleteProductById