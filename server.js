import express from "express";
import bcrypt from "bcrypt";
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, collection, setDoc, getDoc,  updateDoc, getDocs, query, where, deleteDoc} from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdP6RUEyuNC3mDY5Gs_xlByVKAF7vkX1M",
  authDomain: "ecom-website-v1-9ee5a.firebaseapp.com",
  projectId: "ecom-website-v1-9ee5a",
  storageBucket: "ecom-website-v1-9ee5a.appspot.com",
  messagingSenderId: "851722555605",
  appId: "1:851722555605:web:d0f807b9181c3ae7aa525c",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore();

// init server
const app = express();

// middle ware

app.use(express.static("public"));
app.use(express.json()); // to enable the form sharing

// // aws

// import aws from "aws-sdk"
// import " dotenv/config";

// // setup aws

// const region = "us-east-1" // this is the default region
// const bucketName = "ecom-website-3"  // this is the default bucket
// const accessKeyId = process.env.AWS_ACCESS_KEY;  // this is the access key
// const secretAccessKey = process.env.AWS_SECRET_KEY; // this is the secret access key


// aws.config.update({
//   region,
//   accessKeyId,
//   secretAccessKey,
// })


// // init s3

// const s3 = new aws.S3();

// // generate image url

// async function generateURL(){
//   let date = new Date();

//   const imageName = `${date.getTime()}.jpeg`;
//   const params = {
//     Bucket: bucketName,
//     Key: imageName,
//     Expires: 300,   // 300 ms
//     contentType: "image/jpeg"
//   };
//   const uploadURL = await s3.getSignedUrlPromise("putObject", params);
//   return uploadURL;
// }
// app.get('/s3url', (req, res) =>{
//   generateURL().then(url => res.json(url));;
// })


// routes
// home routes
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});
// signup route

app.get("/signup", (req, res) => {
  res.sendFile("signup.html", { root: "public" });
});

app.post("/signup", (req, res) => {
  const { name, email, password, number, tac } = req.body;

  // form validation
  if (name.length < 3) {
    res.json({ alert: "name must be more than 3" });
  } else if (!email.length) {
    res.json({ alert: "enter you email" });
  } else if (password.length < 8) {
    res.json({ alert: "password must be strong and 8 letters long" });
    // } else if(!Number(number) || number.length < 11){
    //     res.json({'alert': 'invalid number, please enter a valid number'})
  } else if (!tac) {
    res.json({ alert: "you must agree to our terms and condition" });
  } else {
    // store the data in db
    const users = collection(db, "users");
    getDoc(doc(users, email)).then((user) => {
      if (user.exists()) {
        return res.json({ alert: "email already exists" });
      } else {
        // encrypt the password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            req.body.password = hash;
            req.body.seller = false;

            // set doc

            setDoc(doc(users, email), req.body).then((data) => {
              res.json({
                name: req.body.name,
                email: req.body.email,
                seller: req.body.seller,
              });
            });
          });
        });
      }
    });
  }
});

// login rout

app.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "public" });
});
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (!email.length || !password.length) {
    res.json({ alert: "fill all the inputs" });
  }

  const users = collection(db, "users");

  getDoc(doc(users, email)).then((user) => {
    if (!user.exists()) {
      res.json({ alert: "email does not exist" });
    } else {
      bcrypt.compare(password, user.data().password, (err, result) => {
        if (result) {
          let data = user.data();
          return res.json({
            name: data.name,
            email: data.email,
            seller: data.seller,
          });
        } else {
          return res.json({ alert: "password is incorrect" });
        }
      });
    }
  });
});

// seller route
app.get("/seller", (req, res) => {
  res.sendFile("seller.html", { root: "public" });
});
app.post("/seller", (req, res) => {
  let { name, address, about, number, email } = req.body;
  if (
    !name.length ||
    !address.length | !about.length ||
    number.length < 10 ||
    !Number(number)
  ) {
    return res.json({
      "alert ": "invalid information, please enter a valid one",
    });
  } else {
    // updat user
    const sellers = collection(db, "sellers");
    setDoc(doc(sellers, email), req.body).then((data) => {
      const users = collection(db, "users");
      updateDoc(doc(users, email), {
        seller: true,
      }).then((data) => {
        res.json({ seller: true });
      });
    });
  }
});
// dashboard route
app.get("/dashboard", (req, res) => {
  res.sendFile("dashboard.html", { root: "public" });
});

// add product route

app.get("/add-product", (req, res) => {
  res.sendFile("add-product.html", { root: "public" });
});

app.get("/add-product/:id", (req, res) => {
  res.sendFile("add-product.html", { root: "public" });
});

app.post("/add-product", (req, res) => {
  let { name, shortDes, detail, price, image, tags, email, draft, id } = req.body;

 if(!draft){
  if ( !name.length) {
    return res.json({ alert: "should enter product name" });
  } else if ( !shortDes.length) {
    return res.json({ alert: "should enter short description" });
  } else if ( !price.length || !Number(price)) {
    return res.json({ alert: "should enter price" });
  } else if ( !detail.length) {
    return res.json({ alert: "should enter detail" });
  } else if ( !tags.length) {
    return res.json({ alert: "should enter tags" });
  }
 }

  // add product

  let docName =  id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 50000)}` : id;



  let product = collection(db, "product");
  setDoc(dec(product, docName), req.body)
    .then((data) => {
      res.json({ product: name });
    })
    .catch((err) => {
      res.json({ alert: "some error occurred" });
    });
});

// dashboard
app.post("/get-products", (req, res) => {
  let { email, id, tag } = req.body;
  let products = collection(db, "product");
  let docRef;

  if (id) {
    docRef = getDoc(doc(products, id));
  } else if (tag) {
    docRef = getDocs(query(products, where("tags", "array-contains", tag)));
  } else {
    docRef = getDocs(query(products, where("seller", "==", true)));
  }

  docRef = getDocs(query(products, where("email", "==", email)));

  docRef.then(products => {
    if(products.empty) {
      return res.json("no product");
    }
    let productArr = [];

    if(id){
      return res.json(products.data());
    } else{
      
    products.forEach(item =>  {
      let data = item.data();
      data.id = item.id;
      productArr.push(data);
        })
       }

    res.json(productArr);
  });
});


app.post('/delete-product', (req, res) => {
  let { id } = req.body;

  deleteDoc(doc(collection(db, 'products'), id))
  .then(data => {
    res.json('success');
  }).catch(err =>{
    res.json('error');
  })

})


app.get('/product/:id', (req, res) => {
  res.sendFile("product.html", { root: "public" });
}) 


// search routes for

app.get('/search/:key', (req, res) => {
  res.sendFile("search.html", { root: "public" });
})


// 404 route
app.get("/404", (req, res) => {
  res.sendFile("404.html", { root: "public" });
});
app.use((req, res) => {
  res.redirect("/404");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
