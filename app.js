const express = require('express');
const path = require('path');
const sequelize = require('./utils/db');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Import routes
const MultiUseruserRoutes = require('./routes/multiUserROutes');
const adminRoutes = require('./routes/VendorRoute');
const shopRoutes = require('./routes/UserShopROutes');
const db = require('./models')
const User = db.User

// // Import models
// const Product = require('./models/product');
// const Location = require('./models/Location');
// const User = require('./models/User');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

// // Define associations
// Location.belongsTo(User, { onDelete: 'CASCADE' });
// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// Order.belongsTo(User);

// User.hasOne(Cart);
// User.hasMany(Product);
// User.hasMany(Order);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Product.belongsToMany(Order, { through: OrderItem });
// Order.belongsToMany(Product, { through: OrderItem });

const app = express();

// Multer configuration
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${uuidv4()}.${file.originalname.split('.').pop()}`;
        cb(null, uniqueFilename);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware to attach user to request
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            // console.log(req.user);
            
            next();
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Internal server error' });
        });
});

// Routes
app.use('/E-Thalla', MultiUseruserRoutes);
app.use('/Vendors', adminRoutes);
app.use('/Shop', shopRoutes);

// Sync database and start server
// sequelize.sync({force: true})  // Use {force: true} only in development if you want to drop and recreate tables
//     .then(() => {
//         console.log("Connected to the database");
//         app.listen(3000, () => {
//             console.log('Listening on port 3000');
//         });
//     })
//     .catch(error => {
//         console.log(error);
//     });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
