// routes/vendor.js

const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/Vendor'); // Ensure the path is correct

// ------------------- Product Routes -------------------

// Create a new product with multiple image URLs
router.post(
    '/add-product',
    vendorController.postAddProducts
);

// Edit a product with multiple image URLs
router.post(
    '/edit-product',
    vendorController.postEditProducts
);

// Get all products
router.get('/products', vendorController.getProducts);

// Get a specific product by ID for editing
router.get('/edit-product/:productId', vendorController.getEditProducts);

// Delete a product
router.post('/delete-product', vendorController.postDeleteProduct);

// ------------------- VendorDetail Routes -------------------

// Create a new VendorDetail with image URLs and location
router.post(
    '/create',
    vendorController.createVendorDetail
);

// Get all VendorDetails
router.get('/all-vendor', vendorController.getAllVendorDetails);

// Get a single VendorDetail by vendorId
router.get('/detail/:vendorId', vendorController.getVendorDetailById);

// Update a VendorDetail by vendorId with image URLs and location
router.put(
    '/detail-update/:vendorId',
    vendorController.updateVendorDetail
);

// Delete a VendorDetail by vendorId
router.delete('/:vendorId', vendorController.deleteVendorDetail);

// ------------------- Shop Routes -------------------

// Create a new shop with location
router.post(
    '/create-shop',
    vendorController.createShop
);

// Get all shops
router.get('/shops', vendorController.getShops);

// Get a specific shop by ID
router.get('/shop/:shopId', vendorController.getShopById);

// Update a shop by ID with location
router.put(
    '/shop/:shopId',
    vendorController.updateShop
);

// Delete a shop by ID
router.delete('/shop/:shopId', vendorController.deleteShop);

router.get("/check/:userId", vendorController.checkVendorByUserId); 

module.exports = router;














// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/Vendor'); // Assuming the controller is named 'Vendor'

// // Multer configuration specific to VendorRoute
// const multer = require('multer');
// const { v4: uuidv4 } = require('uuid');
// const path = require('path');

// // Multer storage configuration
// const fileStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'images'); // Ensure this directory exists
//     },
//     filename: function (req, file, cb) {
//         const uniqueFilename = `${uuidv4()}.${file.originalname.split('.').pop()}`;
//         cb(null, uniqueFilename);
//     }
// });

// // Multer file filter
// const fileFilter = (req, file, cb) => {
//     if (
//         file.mimetype === 'image/png' ||
//         file.mimetype === 'image/jpg' ||
//         file.mimetype === 'image/jpeg'
//     ) {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// // Initialize Multer with the above configurations
// const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

// // ------------------- Product Routes -------------------

// // Create a new product with multiple images
// router.post(
//     '/add-product',
//     upload.fields([{ name: 'images', maxCount: 10 }]),
//     adminController.postAddProducts
// );

// // Edit a product with multiple images
// router.post(
//     '/edit-product',
//     upload.fields([{ name: 'images', maxCount: 10 }]),
//     adminController.postEditProducts
// );

// // Get all products
// router.get('/products', adminController.getProducts);

// // Get a specific product by ID for editing
// router.get('/edit-product/:productId', adminController.getEditProducts);

// // Delete a product
// router.post('/delete-product', upload.none(), adminController.postDeleteProduct);

// // ------------------- VendorDetail Routes -------------------

// // Create a new VendorDetail with multiple images
// router.post(
//     '/create',
//     upload.fields([
//         { name: 'images', maxCount: 10 },
//         { name: 'certificateImages', maxCount: 5 }
//     ]),
//     adminController.createVendorDetail
// );

// // Get all VendorDetails
// router.get('/all-vendor', adminController.getAllVendorDetails);

// // Get a single VendorDetail by vendorId
// router.get('/detail/:vendorId', adminController.getVendorDetailById);

// // Update a VendorDetail by vendorId with multiple images
// router.put(
//     '/detail-update/:vendorId',
//     upload.fields([
//         { name: 'images', maxCount: 10 },
//         { name: 'certificateImages', maxCount: 5 }
//     ]),
//     adminController.updateVendorDetail
// );

// // Delete a VendorDetail by vendorId
// router.delete('/:vendorId', upload.none(), adminController.deleteVendorDetail);

// // ------------------- Shop Routes -------------------

// // Create a new shop
// router.post(
//     '/create-shop',
//     upload.single('profilePicture'), // Assuming only one image for shop
//     adminController.createShop
// );

// // Get all shops
// router.get('/shops', adminController.getShops);

// // Get a specific shop by ID
// router.get('/shop/:shopId', adminController.getShopById);

// // Update a shop by ID
// router.put(
//     '/shop/:shopId',
//     upload.single('image'), // Assuming only one image for shop
//     adminController.updateShop
// );

// // Delete a shop by ID
// router.delete('/shop/:shopId', upload.none(), adminController.deleteShop);

// module.exports = router;
