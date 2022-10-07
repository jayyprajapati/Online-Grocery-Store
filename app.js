//jshint esversion:6

//–––––––––––––––––––––––––––– required packages ––––––––––––––––––––––––––––
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const multer = require("multer");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash");

const app = express();

//–––––––––––––––––––––––––––– Initialization ––––––––––––––––––––––––––––
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//–––––––––––––––––––––––––––– cookies & session ––––––––––––––––––––––––––––

app.use(
  session({
    secret: "Our little secret.",
    cookie: { maxAge: 600000 },
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//–––––––––––––––––––––––––––– DataBase Connection ––––––––––––––––––––––––––––

mongoose.connect("mongodb://localhost:27017/onlineGroceryDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.set("useCreateIndex", true);

//–––––––––––––––––––––––––––– DataBase Schema ––––––––––––––––––––––––––––

const fruitSchema = new mongoose.Schema({
  productType: String,
  productName: String,
  productCompany: String,
  price: String,
  productImage: String,
  availability: String,
  qtytype: String,
});

const vegetableSchema = new mongoose.Schema({
  productType: String,
  productName: String,
  productCompany: String,
  price: String,
  productImage: String,
  availability: String,
  qtytype: String,
});

const dairySchema = new mongoose.Schema({
  productType: String,
  productName: String,
  productCompany: String,
  price: String,
  productImage: String,
  availability: String,
  qtytype: String,
});

const snackSchema = new mongoose.Schema({
  productType: String,
  productName: String,
  productCompany: String,
  price: String,
  productImage: String,
  availability: String,
  qtytype: String,
});

const drinkSchema = new mongoose.Schema({
  productType: String,
  productName: String,
  productCompany: String,
  price: String,
  productImage: String,
  availability: String,
  qtytype: String,
});

const itemSchema = new mongoose.Schema({
  productType: String,
  productName: String,
  productCompany: String,
  price: String,
  productImage: String,
  availability: String,
  qtytype: String,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
});

userSchema.plugin(passportLocalMongoose);

fruitSchema.index({ productName: "text", productCompany: "text" });
vegetableSchema.index({ productName: "text", productCompany: "text" });
dairySchema.index({ productName: "text", productCompany: "text" });
itemSchema.index({ productName: "text", productCompany: "text" });
drinkSchema.index({ productName: "text", productCompany: "text" });
snackSchema.index({ productName: "text", productCompany: "text" });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connected");
});

//–––––––––––––––––––––––––––– DataBase model ––––––––––––––––––––––––––––

const Fruit = mongoose.model("Fruit", fruitSchema);
const Vegetable = mongoose.model("Vegetable", vegetableSchema);
const Drink = mongoose.model("Drink", drinkSchema);
const Snack = mongoose.model("Snack", snackSchema);
const Item = mongoose.model("Item", itemSchema);
const Dairy = mongoose.model("Dairy", dairySchema);
const User = new mongoose.model("User", userSchema);

//–––––––––––––––––––––––––––– Login Authorization ––––––––––––––––––––––––––––

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//–––––––––––––––––––––––––––– Multer Image upload ––––––––––––––––––––––––––––

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/imgs/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

//–––––––––––––––––––––––––––– User Login request ––––––––––––––––––––––––––––

app.get("/", function (re, res) {
  res.render("usercredential");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
  })
);

//–––––––––––––––––––––––––––– User Register request ––––––––––––––––––––––––––––

app.post("/register", function (req, res, next) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, function () {
          req.flash("ls", "Login Successful");
          res.redirect("/home");
        });
      }
    }
  );
});

//–––––––––––––––––––––––––––– Admin Requests ––––––––––––––––––––––––––––

app.post("/adminlogin", function (req, res) {
  (username = req.body.username), (password = req.body.password);
  if (username === "jay.prajapati5717@gmail.com") {
    if (password === "123456") {
      res.redirect("/adminhome");
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

app.get("/adminhome", function (req, res) {
  Promise.all([
    Fruit.find({}),
    Vegetable.find({}),
    Dairy.find({}),
    Drink.find({}),
    Snack.find({}),
    Item.find({}),
  ]).then(function (result) {
    const [fruits, vegetables, dairies, drinks, snacks, items] = result;
    res.render("admin/adminhome", {
      fruits: fruits,
      vegetables: vegetables,
      dairies: dairies,
      drinks: drinks,
      snacks: snacks,
      items: items,
    });
  });
});

//–––––––––––––––––––––––––––– User GET requests ––––––––––––––––––––––––––––

app.get("/home", function (req, res, next) {
  if (req.isAuthenticated()) {
    Promise.all([
      Fruit.find({}),
      Vegetable.find({}),
      Dairy.find({}),
      Drink.find({}),
      Snack.find({}),
      Item.find({}),
    ]).then(function (result) {
      const [fruits, vegetables, dairies, drinks, snacks, items] = result;
      res.render("home", {
        fruits: fruits,
        vegetables: vegetables,
        dairies: dairies,
        drinks: drinks,
        snacks: snacks,
        items: items,
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get("/fruit", function (req, res) {
  Fruit.find({}, function (err, fruits) {
    res.render("display/fruit", {
      fruits: fruits,
    });
  });
});

app.get("/vegetable", function (req, res) {
  Vegetable.find({}, function (err, vegetables) {
    res.render("display/vegetable", {
      vegetables: vegetables,
    });
  });
});

app.get("/drink", function (req, res) {
  Drink.find({}, function (err, drinks) {
    res.render("display/drink", {
      drinks: drinks,
    });
  });
});

app.get("/dairy", function (req, res) {
  Dairy.find({}, function (err, dairies) {
    res.render("display/dairy", {
      dairies: dairies,
    });
  });
});

app.get("/item", function (req, res) {
  Item.find({}, function (err, items) {
    res.render("display/item", {
      items: items,
    });
  });
});

app.get("/snack", function (req, res) {
  Snack.find({}, function (err, snacks) {
    res.render("display/snack", {
      snacks: snacks,
    });
  });
});

//–––––––––––––––––––––––––––– Search Request ––––––––––––––––––––––––––––

app.get("/search", function (req, res) {
  res.render("search");
});

app.post("/search", function (req, res, next) {
  searchItem = _.capitalize(req.body.search);

  const partialSearch = new RegExp(searchItem);

  Promise.all([
    Fruit.find({ productName: { $regex: partialSearch } }),
    Vegetable.find({ productName: { $regex: partialSearch } }),
    Dairy.find({ productName: { $regex: partialSearch } }),
    Drink.find({ productName: { $regex: partialSearch } }),
    Item.find({ productName: { $regex: partialSearch } }),
    Snack.find({ productName: { $regex: partialSearch } }),
  ]).then(function (result) {
    const [fruits, vegetables, dairies, drinks, snacks, items] = result;
    res.render("search", {
      fruits: fruits,
      vegetables: vegetables,
      dairies: dairies,
      drinks: drinks,
      snacks: snacks,
      items: items,
    });
  });
});

//–––––––––––––––––––––––––––– LOGOUT request ––––––––––––––––––––––––––––

app.get("/profile", function (req, res) {
  res.render("profile", {
    username: req.user.username,
  });
});

app.get("/logout", function (req, res) {
  req.session.cart = null;
  req.logout();
  res.redirect("/");
});

//–––––––––––––––––––––––––––– CheckOut and payment request ––––––––––––––––––––––––––––

app.get("/checkout", function (req, res) {
  req.session.cart = null;
  res.redirect("/home");
});

app.get("/payment", function (req, res) {
  if (!req.session.cart) {
    res.render("payment", { products: null });
  } else {
    var cart = scart(req.session.cart);

    res.render("payment", {
      products: this.generateArray(),
      totalPrice: this.totalPrice,
      item: this.items,
    });
  }
});

//–––––––––––––––––––––––––––– Cart request ––––––––––––––––––––––––––––

app.get("/cart/:id", function (req, res) {
  const productId = req.params.id;
  var cart = new scart(req.session.cart ? req.session.cart : {});

  Fruit.findById(productId, function (err, product) {
    if (err) {
      res.redirect("/home");
    } else {
      if (product) {
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect("/home");
      } else {
        Item.findById(productId, function (err, product) {
          if (err) {
            res.redirect("/home");
          } else {
            if (product) {
              cart.add(product, product.id);
              req.session.cart = cart;
              res.redirect("/home");
            } else {
              Vegetable.findById(productId, function (err, product) {
                if (err) {
                  res.redirect("/home");
                } else {
                  if (product) {
                    cart.add(product, product.id);
                    req.session.cart = cart;
                    res.redirect("/home");
                  } else {
                    Dairy.findById(productId, function (err, product) {
                      if (err) {
                        res.redirect("/home");
                      } else {
                        if (product) {
                          cart.add(product, product.id);
                          req.session.cart = cart;
                          res.redirect("/home");
                        } else {
                          Drink.findById(productId, function (err, product) {
                            if (err) {
                              res.redirect("/home");
                            } else {
                              if (product) {
                                cart.add(product, product.id);
                                req.session.cart = cart;
                                res.redirect("/home");
                              } else {
                                Snack.findById(
                                  productId,
                                  function (err, product) {
                                    if (err) {
                                      res.redirect("/home");
                                    } else {
                                      if (product) {
                                        cart.add(product, product.id);
                                        req.session.cart = cart;
                                        res.redirect("/home");
                                      }
                                    }
                                  }
                                );
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  });
});

var scart = function (olditems) {
  this.items = olditems.items || {};
  this.totalPrice = olditems.totalPrice || 0;
  this.totalQty = olditems.totalQty || 0;

  this.add = function (item, id) {
    var storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    storedItem.qty++;
    storedItem.price = Number(storedItem.item.price) * storedItem.qty;
    this.totalQty++;
    this.totalPrice += Number(storedItem.item.price);
  };

  this.generateArray = function () {
    var arr = [];
    for (var id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};

app.get("/shoppingcart", function (req, res) {
  if (!req.session.cart) {
    res.render("shoppingcart", { products: null });
  } else {
    var cart = scart(req.session.cart);

    res.render("shoppingcart", {
      products: this.generateArray(),
      totalPrice: this.totalPrice,
      item: this.items,
    });
  }
});

//–––––––––––––––––––––––––––– Admin CRUD GET requests ––––––––––––––––––––––––––––

app.get("/add", function (req, res) {
  res.render("admin/add");
});

app.get("/delete", function (req, res) {
  res.render("admin/delete");
});

app.get("/update", function (req, res) {
  res.render("admin/update");
});

app.get("/adminfruit", function (req, res) {
  Fruit.find({}, function (err, fruits) {
    res.render("admin/adminfruit", {
      fruits: fruits,
    });
  });
});

app.get("/adminvegetable", function (req, res) {
  Vegetable.find({}, function (err, vegetables) {
    res.render("admin/adminvegetable", {
      vegetables: vegetables,
    });
  });
});

app.get("/admindairy", function (req, res) {
  Dairy.find({}, function (err, dairies) {
    res.render("admin/admindairy", {
      dairies: dairies,
    });
  });
});

//–––––––––––––––––––––––––––– Admin CRUD POST request ––––––––––––––––––––––––––––

app.post("/add", upload.single("productImage"), function (req, res) {
  if (req.body.type === "Fruit") {
    fruit = new Fruit({
      productType: req.body.type,
      productName: req.body.pname,
      productCompany: req.body.pcom,
      price: req.body.pprice,
      productImage: req.file.filename,
      availability: req.body.availability,
      qtytype: req.body.msr,
    });

    fruit.save(function (err) {
      if (!err) {
        res.redirect("/adminhome");
      }
    });
  } else if (req.body.type === "Vegetable") {
    vegetable = new Vegetable({
      productType: req.body.type,
      productName: req.body.pname,
      productCompany: req.body.pcom,
      price: req.body.pprice,
      productImage: req.file.filename,
      availability: req.body.availability,
      qtytype: req.body.msr,
    });

    vegetable.save(function (err) {
      if (!err) {
        res.redirect("/adminhome");
      }
    });
  } else if (req.body.type === "Drink") {
    drink = new Drink({
      productType: req.body.type,
      productName: req.body.pname,
      productCompany: req.body.pcom,
      price: req.body.pprice,
      productImage: req.file.filename,
      availability: req.body.availability,
      qtytype: req.body.msr,
    });

    drink.save(function (err) {
      if (!err) {
        res.redirect("/adminhome");
      }
    });
  } else if (req.body.type === "Dairy") {
    dairy = new Dairy({
      productType: req.body.type,
      productName: req.body.pname,
      productCompany: req.body.pcom,
      price: req.body.pprice,
      productImage: req.file.filename,
      availability: req.body.availability,
      qtytype: req.body.msr,
    });

    dairy.save(function (err) {
      if (!err) {
        res.redirect("/adminhome");
      }
    });
  } else if (req.body.type === "Item") {
    item = new Item({
      productType: req.body.type,
      productName: req.body.pname,
      productCompany: req.body.pcom,
      price: req.body.pprice,
      productImage: req.file.filename,
      availability: req.body.availability,
      qtytype: req.body.msr,
    });

    item.save(function (err) {
      if (!err) {
        res.redirect("/adminhome");
      }
    });
  } else if (req.body.type === "Snack") {
    snack = new Snack({
      productType: req.body.type,
      productName: req.body.pname,
      productCompany: req.body.pcom,
      price: req.body.pprice,
      productImage: req.file.filename,
      availability: req.body.availability,
      qtytype: req.body.msr,
    });

    snack.save(function (err) {
      if (!err) {
        res.redirect("/adminhome");
      }
    });
  }
});

app.post("/delete", function (req, res) {
  deleteitem = _.capitalize(req.body.pname);
  if (req.body.type === "Fruit") {
    Fruit.deleteOne(
      {
        productName: deleteitem,
      },
      function (err) {
        if (!err) {
          res.redirect("/adminhome");
        }
      }
    );
  }

  if (req.body.type === "Vegetable") {
    Vegetable.deleteOne(
      {
        productName: deleteitem,
      },
      function (err) {
        if (!err) {
          res.redirect("/adminhome");
        }
      }
    );
  }

  if (req.body.type === "Drink") {
    Drink.deleteOne(
      {
        productName: deleteitem,
      },
      function (err) {
        if (!err) {
          res.redirect("/adminhome");
        }
      }
    );
  }

  app.post("/delete", function (req, res) {
    if (req.body.type === "Dairy") {
      Dairy.deleteOne(
        {
          productName: deleteitem,
        },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }

    if (req.body.type === "Item") {
      Item.deleteOne(
        {
          productName: deleteitem,
        },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }

    if (req.body.type === "Snack") {
      Snack.deleteOne(
        {
          productName: deleteitem,
        },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }
  });
});

app.post("/update", function (req, res) {
  currentname = _.capitalize(req.body.currentname);
  if (req.body.type === "Fruit") {
    if (req.body.name === "price") {
      Fruit.updateOne(
        { productName: currentname },
        { $set: { price: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    } else if (req.body.name === "availability") {
      Fruit.updateOne(
        { productName: currentname },
        { $set: { availability: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }
  }

  if (req.body.type === "Vegetable") {
    if (req.body.name === "price") {
      Vegetable.updateOne(
        { productName: currentname },
        { $set: { price: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    } else if (req.body.name === "availability") {
      Vegetable.updateOne(
        { productName: currentname },
        { $set: { availability: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }
  }

  if (req.body.type === "Drink") {
    if (req.body.name === "price") {
      Drink.updateOne(
        { productName: currentname },
        { $set: { price: req.body.newtext } },
        function () {
          res.redirect("/adminhome");
        }
      );
    } else if (req.body.name === "availability") {
      Drink.updateOne(
        { productName: currentname },
        { $set: { availability: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }
  }

  if (req.body.type === "Dairy") {
    if (req.body.name === "price") {
      Dairy.updateOne(
        { productName: currentname },
        { $set: { price: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    } else if (req.body.name === "availability") {
      Dairy.updateOne(
        { productName: currentname },
        { $set: { availability: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }
  }

  if (req.body.type === "Snack") {
    if (req.body.name === "price") {
      Snack.updateOne(
        { productName: currentname },
        { $set: { price: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    } else if (req.body.name === "availability") {
      Snack.updateOne(
        { productName: currentname },
        { $set: { availability: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }
  }

  if (req.body.type === "Item") {
    if (req.body.name === "price") {
      Item.updateOne(
        { productName: currentname },
        { $set: { price: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    } else if (req.body.name === "availability") {
      Item.updateOne(
        { productName: currentname },
        { $set: { availability: req.body.newtext } },
        function (err) {
          if (!err) {
            res.redirect("/adminhome");
          }
        }
      );
    }
  }
});

//–––––––––––––––––––––––––––– Server Response ––––––––––––––––––––––––––––

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
