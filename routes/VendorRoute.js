const express = require('express');
const adminController = require('../controllers/Vendor');


const router = express.Router();


router.get('/products',adminController.getProducts);
router.post('/add-product', adminController.postAddProducts);
router.get('/edit-product/:productId', adminController.getEditProducts);
router.post('/edit-product', adminController.postEditProducts);
router.post('/delete-product',adminController.postDeleteProduct)


module.exports = router
