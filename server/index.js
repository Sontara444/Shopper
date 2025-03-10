const port = process.env.PORT || 4001;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");

// modules
const allowedOrigins = ['http://localhost:3000','http://localhost:5173' ]

app.use(cors({ origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with mongoDB

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.c7t7e.mongodb.net/ecommerce`
  )
  .then(() => console.log("MongoDb connected!"))
  .catch((error) => console.log("Error", error));

// API Creationtha

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Image Storage Engine

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: storage });

//  Creating Upload Endpoint for images

//middleware for images multer
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Schema for creating products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

// app.post("/addproduct", upload.single('image'), async (req, res) => {

//   const image = req.file? req.file.path : null;

//   let products = await Product.find({});
//   let id;
//   if (products.length > 0) {
//     let last_product_array = products.slice(-1);
//     let last_product = last_product_array[0];
//     id = last_product.id + 1;
//   } else {
//     id = 1;
//   }

//   const product = new Product({
//     id: id,
//     name: req.body.name,
//     image: req.body.image,
//     category: req.body.category,
//     new_price: req.body.new_price,
//     old_price: req.body.old_price,
//   });

//   console.log(product);
//   await product.save();
//   console.log("Saved");

//   res.json({
//     success: true,
//     name: req.body.name,
//   });
// });

//Creating API for deleting Product

app.post("/addproduct", upload.single("image"), async (req, res) => {
  const { file, body } = req;
  const image = file ? file.path : null;

  let products = await Product.find({});
  const lastProduct = products.length > 0 ? products[products.length - 1] : null;
  const id = lastProduct ? lastProduct.id + 1 : 1;

  const { name, category, new_price, old_price } = body;

  const product = new Product({
    id,
    name,
    image,
    category,
    new_price,
    old_price,
  });

  console.log(product);
  await product.save();
  console.log("Saved");

  res.json({
    success: true,
    name,
  });
});


app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating API for Getting All Products

app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

// Schema creating for User model

const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
// Creating Endpoint for registering the user

app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      errors: "existing user found with same email address ",
    });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

// Creating Endpoint for user login the user

app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });

  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
});


// Creating Endpoint for newcollection data

app.get("/newcollections", async (req, res) =>{
   let products = await Product.find({})
   let newcollection = products.slice(1).slice(-8)
   console.log("Newcollection fetched")
   res.send(newcollection);
})



// Creating Endpoint for popular in women section

app.get("/popularinwomen", async (req, res)=>{
  let products = await Product.find({category: "women"})
    let popular_in_women = products.slice(0,4)
    console.log("Popular in women fetched")
    res.send(popular_in_women)

})

// Creating middleware to fetch user
const fetchUser = async(req, res, next)=>{
  const token = req.header("auth-token");
  
  if(!token){
    return res.status(401).send({errors: "Please authenticate using valid token"})
  }
  else{
    try {
      const data = jwt.verify(token, "secret_ecom")
      req.user = data.user;
      next()
    } catch (error) {
      res.status(401).send({errors: "Please authenticate using valid token"})
    }
  }

}


// Creating Endpoint for cart Data

app.post("/addtocart",fetchUser, async (req, res)=>{
  let userData = await Users.findOne({_id:req.user.id})
  userData.cartData[req.body.itemId] += 1
  await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData})
  res.send("Added")

})

// Creating Endpoint for remove product from cartData

app.post("/removefromcart", fetchUser, async (req, res)=>{
  console.log("removed", req.body.itemId)
  let userData = await Users.findOne({_id:req.user.id});
  if(userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
   await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData})
  res.send("Removed")
})

// Creating Endpoint to get cartData

app.post("/getcart", fetchUser, async(req, res)=>{
  
  let userData = await Users.findOne({_id:req.user.id})
  res.json(userData.cartData)
    
})      




app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error : " + error);
  }
});
