var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var jwt = require('jsonwebtoken'); 
var cookieParser = require("cookie-parser");
var path = require("path");
var socketIo = require("socket.io");
var authRoutes = require("./routes/auth");

var http = require("http");

var { SERVER_SECRET, PORT } = require("./core");
var { userModel, order, productModel } = require("./derepo");


// To Send files
const fs = require('fs')
const multer = require("multer");
const admin = require("firebase-admin");

const storage = multer.diskStorage({ 
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

var serviceAccount = require("./firebase/firebase.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "yyyyyyyyyyyyyyyyyyyyyyyyyyyy"
});

const bucket = admin.storage().bucket("yyyyyyyyyyyyyyyyyyyyyyyyyyyy");





var app = express();
var server = http.createServer(app);
var io = socketIo(server, {
    cors: ["http://localhost:3000", '']
});

app.use(morgan("dev"));
app.use(bodyParser.json());

app.use(cors({
    origin: ["http://localhost:3000", ''],
    credentials: true,
}));

app.use(cookieParser());






app.use("/", express.static(path.resolve(path.join(__dirname, "../Web/build"))));

app.use("/auth", authRoutes);

// io.on('connection', (user) => {
//     console.log('user connected', user);
// })

app.use(function (req, res, next) {
    if (!req.cookies.jToken) {
        // res.redirect("https://shopappnavtc.herokuapp.com/")
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {
            const issueDate = decodedData.iat * 1000; // 1000 miliseconds because in js ms is in 16 digits
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate; // 86400,000

            if (diff > 3000000) { // expire after 5 min (in milis)
                res.status(401).send("token expired")
                res.clearCookie();
            }

            else { // issue new token
                var token = jwt.sign({
                    id: decodedData.id,
                    userName: decodedData.userName,
                    userEmail: decodedData.userEmail,
                    userPhone: decodedData.userPhone,
                    userAddress: decodedData.userAddress,
                    roll: decodedData.roll,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData;
                req.headers.jToken = decodedData;
                next();
            }

        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {
    userModel.findById(req.body.jToken.id, "userName userEmail userAddress userPhone roll",

        function (err, doc) {
            if (!err) {
                res.send({
                    profile: doc
                })
            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
});

app.get('/getproducts', (req, res, next) => {

    productModel.find({}, (err, products) => {
        if (!err) {
            console.log('products are=>',products);
            res.send({
                products: products,
            })
        }
        else {
            res.send({
                message: 'an error occured'
            })
        }
    })
})


app.post("/placeOrder", (req, res, next) => {
    console.log("req.body is = > ", req.body);


    userModel.findOne({ userEmail: req.body.jToken.userEmail }, (err, userFound) => {
        if (!err) {
            order.create({
                cart: req.body.cart,
                total: req.body.total,
                userEmail: req.body.jToken.userEmail,
                userName: req.body.jToken.userName,
                phoneNo: req.body.phoneNo,
                address: req.body.address,
                status: 'pending',
                remarks: req.body.remarks ? req.body.remarks : null,
            }).then((orderPlaced) => {
                res.status(200).send({
                    message: "Your request has been sent succesfully" + orderPlaced,
                });
                io.emit("requests", orderPlaced);
            })
                .catch((err) => {
                    res.status(500).send({
                        message: "an error occured"
                    })
                })
        }
    })

});



app.get("/getOrders", (req, res, next) => {
    order.find({}, (err, data) => {
        if (!err) {
            res.status(200).send({
                placedRequests: data,
            });
        }
        else {
            console.log("error : ", err);
            res.status(500).send("error");
        }
    })
});

app.get("/myorders", (req, res, next) => {
    order.find({ userEmail: req.body.jToken.userEmail }, (err, data) => {
        if (!err) {
            console.log('getting orders=>', data)
            res.status(200).send({
                placedRequests: data,
            });
        }
        else {
            console.log("error : ", err);
            console.log('error', err)

            res.status(500).send({
                message: 'error occored'
            });
        }
    })
});



app.patch('/confirmOrder', (req, res, next) => {
    var { id } = req.body;
    userModel.find({ userEmail: req.body.jToken.userEmail }, (err, user) => {
        if (!err) {
            order.findById({ _id: id }, (err, data) => {
                if (data) {

                    data.updateOne({ status: 'confirmed' }, {}, (err, updated) => {
                        if (updated) {
                            res.status(200).send({
                                message: "order updated"
                            })
                        }
                        else {
                            res.status(501).send({
                                message: "server error",
                            })
                        }
                    })
                }
                else {
                    res.status(403).send({
                        message: "Could not find the order"
                    })
                }
            })
        }
        else {
            res.status(501).send({
                message: "user could not be found",
            })
        }
    })
})




app.post("/logout", (req, res, next) => {
    res.cookie('jToken', "", {
        maxAge: 86_400_000,
        httpOnly: true
    });
    res.clearCookie();
    res.send("logout succesfully");
})


app.post('/uploadProduct', upload.any(), (req, res, next) => {


    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                // console.log("api resp: ", apiResponse);

                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0]) // this is public downloadable url 

                        productModel.create({
                            productName: req.body.productName,
                            productPrice: req.body.productPrice,
                            productImage: urlData[0],
                            productDescription: req.body.productDescription,
                            isActive: true,
                        }).then((productCreated) => {
                            res.send({
                                message: "product has been created",
                                productCreated: productCreated,
                            })
                        }).catch((err) => {
                            res.send({
                                message: "an error occured",
                            })
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                            //file removed
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send({
                    message: "an error occured",
                });
            }
        });


})


server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})