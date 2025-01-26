const express = require('express');
const shopController = require('../controllers/UserShop');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage(); // Using memory storage since we're not handling files
router.use(multer({ storage: storage }).none())
// Get all products
router.get('/products', shopController.getProducts);

// Get a specific product by ID
router.get('/product/:productId', shopController.getProduct);

// Get cart
// router.get('/cart/', shopController.getCart);
router.get('/cart/:id', shopController.getCart);

router.delete('/cart/:id', shopController.deleteCart);

// Add to cart
router.post('/cart', shopController.postCart);

// Delete item from cart
router.post('/cart-delete-item', shopController.postDeleteCartProduct);

// Create an order
router.post('/create-order', shopController.postOrder);

// Get all orders
// router.get('/orders', shopController.getOrders);
router.get('/orders/:userId', shopController.getOrders);

module.exports = router;
