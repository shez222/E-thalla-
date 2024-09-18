const { where } = require('sequelize');
const Cart = require('../models/cart');
const Product = require('../models/product');

const getProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll();
        res.json({ products: products });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve products' });
    }
};

const getProduct = async (req, res, next) => {
    const prodId = req.params.productId;
    console.log("check");
    
    try {
        const product = await Product.findByPk(prodId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ product });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve product details' });
    }
};


const getCart = async (req, res, next) => {
    try {
        // await req.user.createCart()
        console.log("uyhuaifdyiyh",req.user.dataValues.multiUserId);
        // console.log(req.user);
        
        const cartCheck = await Cart.findOne({where: {UserMultiUserId: req.user.dataValues.multiUserId}})
        if (!cartCheck) {
          await req.user.createCart() 
        }
        
        const cart = await req.user.getCart();
        const products = await cart.getProducts();
        if (!products) {
            return res.json("Cart is Empty")
        }
        res.json({ products:products });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve cart products' });
    }
};

const postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    let fetchCart;
    let newQuantity = 1;

    try {
        const cartCheck = await Cart.findOne({where: {UserMultiUserId: req.user.dataValues.multiUserId}})
        if (!cartCheck) {
          await req.user.createCart() 
        }
        console.log("hgckh");
        
        const cart = await req.user.getCart();
        fetchCart = cart;
        const products = await cart.getProducts({ where: { id: prodId } });
        

        let product;
        if (products.length > 0) {
            product = products[0];
        }

        if (product) {
            console.log('Product',product);
            
            const oldQuantity = product.CartItems.quantity;
            newQuantity = oldQuantity + 1;
        } else {
            product = await Product.findByPk(prodId);
        }

        await fetchCart.addProduct(product, { through: { quantity: newQuantity } });
        res.json({ message: 'Product added to cart' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to add product to cart' });
    }
};

const postDeleteCartProduct = async (req, res, next) => {
    const prodId = req.body.productId;

    try {
        const cart = await req.user.getCart();
        const products = await cart.getProducts({ where: { id: prodId } });

        if (!products.length) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        const product = products[0];

        if (product.CartItems.quantity > 1) {
            // Decrement the quantity by 1
            product.CartItems.quantity -= 1;
            await product.CartItems.save();
            res.json({ message: 'Product quantity decreased by 1' });
        } else {
            // Quantity is 1, so remove the product from the cart
            await product.CartItems.destroy();
            res.json({ message: 'Product removed from cart' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to update cart' });
    }
};

const postOrder = async (req, res, next) => {
    try {
        const cart = await req.user.getCart();
        const products = await cart.getProducts();
        console.log(products.length);
        
        if (products.length < 1) {
           return res.json({message:"Cart is Empty Add something to cart"})
        }
        const order = await req.user.createOrder();
        await order.addProducts(
            products.map(product => {
                product.orderItem = { quantity: product.CartItems.quantity };
                return product;
            })
        );

        await cart.setProducts(null);
        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to place order' });
    }
};

const getOrders = async (req, res, next) => {
    try {
        const orders = await req.user.getOrders({ include: ['Products'] });
        res.json({ orders });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
};

module.exports = { getProducts, getProduct, getCart, postCart, postDeleteCartProduct, postOrder, getOrders }
