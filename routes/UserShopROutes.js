
const express = require('express');
const shopController = require('../controllers/UserShop');

const router = express.Router();

router.get('/products',shopController.getProducts);
router.get('/product/:productId',shopController.getProduct) //dynamic 
router.get('/cart',shopController.getCart);
router.post('/cart',shopController.postCart);
router.post('/cart-delete-item',shopController.postDeleteCartProduct)
router.post('/create-order',shopController.postOrder)
router.get('/orders',shopController.getOrders);



module.exports = router;