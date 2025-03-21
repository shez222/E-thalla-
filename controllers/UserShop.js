// controllers/productController.js
const db = require('../models');
const Product = db.Product;
const Cart = db.Cart;
const User = db.User;
const ProductImage = db.ProductImage;

const bcrypt = require('bcrypt');

const getProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            include: [{
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'url']
            }]
        });
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
        const product = await Product.findByPk(prodId, {
            include: [{
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'url']
            }]
        });
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
        console.log("COMING HERE");
        const userId = req.params.id;
        
        const user = await User.findOne({ where: { multiUserId: userId } });
        const cartCheck = await Cart.findOne({ where: { userId: userId } });
        if (!cartCheck) {
            await user.createCart();
        }
        
        const cart = await user.getCart();
        const products = await cart.getProducts({
            include: [{
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'url']
            }],
            through: {
                attributes: ['quantity'],
            },
        });
        console.log(products);
        
        if (!products || products.length === 0) {
            return res.json({ message: "Cart is Empty" });
        }
        res.json({ products: products });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve cart products' });
    }
};

const postCart = async (req, res, next) => {
    const prodId = req.body.productId;
    const userId = req.body.userId;
    const quantityToAdd = req.body.quantity || 1;

    try {
        // Check if user exists
        const user = await User.findOne({ where: { multiUserId: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has a cart, if not create one
        let cart = await Cart.findOne({ where: { userId: userId } });
        if (!cart) {
            cart = await user.createCart(); 
        }

        // Check if the product is already in the cart
        const cartProducts = await cart.getProducts({ where: { id: prodId } });
        let product;
        if (cartProducts.length > 0) {
            product = cartProducts[0];

            // Update the quantity in the CartItem (junction table)
            await cart.addProduct(product, { through: { quantity: quantityToAdd } });
        } else {
            // Fetch product by ID
            product = await Product.findByPk(prodId, {
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'url']
                }]
            });

            // If no product found for the given prodId
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Add new product to the cart
            await cart.addProduct(product, { through: { quantity: quantityToAdd } });
        }

        // Send success response
        res.json({ message: 'Product added to cart' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to add product to cart' });
    }
};

const postDeleteCartProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    const userId = req.body.userId

    try {
        const user = await User.findOne({ where : { multiUserId: userId }});
        const cart = await user.getCart();
        const products = await cart.getProducts({ where: { id: prodId } });

        if (!products.length) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        const product = products[0];

        if (product.CartItem.quantity > 1) {
            // Decrement the quantity by 1
            product.CartItem.quantity -= 1;
            await product.CartItem.save();
            res.json({ message: 'Product quantity decreased by 1' });
        } else {
            // Quantity is 1, so remove the product from the cart
            await product.CartItem.destroy();
            res.json({ message: 'Product removed from cart' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to update cart' });
    }
};

const postOrder = async (req, res, next) => {
    const userId = req.body.userId
    try {
        console.log(userId);
        
        const user = await User.findOne({ where : { multiUserId: userId }});
        const cart = await user.getCart();
        const products = await cart.getProducts({
            include: [{
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'url']
            }],
        });
        console.log(products.length);
        
        if (products.length < 1) {
           return res.json({ message: "Cart is Empty Add something to cart" });
        }
        const order = await user.createOrder();
        
        await order.addProducts(
            products.map(product => {
                product.OrderItem = { quantity: product.CartItem.quantity };
                return product;
            })
        );
        console.log(order);


        await cart.setProducts([]);
        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to place order' });
    }
};

const getOrders = async (req, res, next) => {
    try {
        const userId = req.params.userId
        const user = await User.findOne({ where : { multiUserId: userId }});
        const orders = await user.getOrders({ 
            include: [{
                model: Product,
                as: 'Products',
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'url']
                }]
            }] 
        });
        res.json({ orders });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
};

const deleteCart = async (req, res, next) => {
    // Retrieve userId from URL parameters
    const userId = req.params.id; // Ensure your route is set up to pass 'id' as a URL parameter
    console.log(`Deleting cart for userId: ${userId}`);

    try {
        // Find the user by multiUserId
        const user = await User.findOne({ where: { multiUserId: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the user's cart
        const cart = await user.getCart();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Retrieve current products in the cart
        const currentProducts = await cart.getProducts();

        // Check if the cart is already empty
        if (currentProducts.length === 0) {
            return res.status(200).json({ message: 'Cart is already empty' });
        }

        // Remove all products from the cart
        await cart.setProducts([]); // This disassociates all products from the cart

        res.status(200).json({ message: 'All products have been removed from the cart' });
    } catch (err) {
        console.error(`Error deleting cart for userId ${userId}:`, err);
        res.status(500).json({ message: 'Failed to delete all cart products' });
    }
};

module.exports = { 
    getProducts, 
    getProduct, 
    getCart, 
    postCart, 
    postDeleteCartProduct, 
    postOrder, 
    getOrders, 
    deleteCart 
};























// const db = require('../models');
// const Product = db.Product
// const Cart = db.Cart
// const User = db.User


// const bcrypt = require('bcrypt');



// const getProducts = async (req, res, next) => {
//     try {
//         const products = await Product.findAll();
//         res.json({ products: products });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve products' });
//     }
// };

// const getProduct = async (req, res, next) => {
//     const prodId = req.params.productId;
//     console.log("check");
    
//     try {
//         const product = await Product.findByPk(prodId);
//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.json({ product });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve product details' });
//     }
// };


// const getCart = async (req, res, next) => {
//     try {


//         // await req.user.createCart()
//         // const userId = req.body.userId
//         console.log("COMING HERE")
//         const userId = req.params.id 
//         // console.log("uyhuaifdyiyh",req.user.dataValues.multiUserId);
//         // console.log(req.user);
        
//         // const cartCheck = await Cart.findOne({where: {userId: req.user.dataValues.multiUserId}})
//         const user = await User.findOne({ where: {multiUserId: userId} })
//         const cartCheck = await Cart.findOne({where: {userId: userId}})
//         if (!cartCheck) {
//           await user.createCart() 
//         }
        
//         const cart = await user.getCart();
//         const products = await cart.getProducts({
//             through: {
//                 attributes: [], // Add other fields if present
//             },
//         });
//         console.log(products);
        
//         if (!products) {
//             return res.json("Cart is Empty")
//         }
//         res.json({ products:products });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve cart products' });
//     }
// };

// const postCart = async (req, res, next) => {
//     const prodId = req.body.productId;
//     const userId = req.body.userId;
//     const quantityToAdd = req.body.quantity || 1;

//     try {
//         // Check if user exists
//         const user = await User.findOne({ where: { multiUserId: userId } });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Check if the user has a cart, if not create one
//         let cart = await Cart.findOne({ where: { userId: userId } });
//         if (!cart) {
//             cart = await user.createCart(); 
//         }

//         // Check if the product is already in the cart
//         const cartProducts = await cart.getProducts({ where: { id: prodId } });
//         let product;
//         if (cartProducts.length > 0) {
//             product = cartProducts[0];

//             // Update the quantity in the CartItem (junction table)
//             // const oldQuantity = product.CartItem.quantity;
//             // const newQuantity = oldQuantity + quantityToAdd;
//             await cart.addProduct(product, { through: { quantity: quantityToAdd } });
//         } else {
//             // Fetch product by ID
//             product = await Product.findByPk(prodId);

//             // If no product found for the given prodId
//             if (!product) {
//                 return res.status(404).json({ message: 'Product not found' });
//             }

//             // Add new product to the cart
//             await cart.addProduct(product, { through: { quantity: quantityToAdd } });
//         }

//         // Send success response
//         res.json({ message: 'Product added to cart' });

//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to add product to cart' });
//     }
// };


// // const postCart = async (req, res, next) => {
// //     const prodId = req.body.productId;
// //     const userId = req.body.userId;
// //     let fetchCart;
// //     let newQuantity = 1;

// //     try {
// //         // Check if user exists
// //         const user = await User.findOne({ where: { multiUserId: userId }});
// //         if (!user) {
// //             return res.status(404).json({ message: 'User not found' });
// //         }

// //         // Check if the user has a cart, if not create one
// //         let cartCheck = await Cart.findOne({ where: { userId: userId }});
// //         if (!cartCheck) {
// //             await user.createCart(); 
// //         }

// //         // Get the cart
// //         const cart = await user.getCart();
// //         fetchCart = cart;

// //         // Check if the product exists in the cart
// //         const products = await cart.getProducts({ where: { id: prodId } });
// //         let product;
// //         if (products.length > 0) {
// //             product = products[0];
// //         }

// //         // If product is already in the cart, increase the quantity
// //         if (product) {
// //             const oldQuantity = product.CartItem.quantity;
// //             newQuantity = oldQuantity + 1;
// //         } else {
// //             // Fetch product by ID to add to the cart
// //             product = await Product.findByPk(prodId);

// //             // If no product exists for the given prodId
// //             if (!product) {
// //                 return res.status(404).json({ message: 'Product not found' });
// //             }
// //         }

// //         // Add the product to the cart or update quantity
// //         await fetchCart.addProduct(product, { through: { quantity: newQuantity } });

// //         // Send success response
// //         res.json({ message: 'Product added to cart' });

// //     } catch (err) {
// //         console.log(err);
// //         res.status(500).json({ message: 'Failed to add product to cart' });
// //     }
// // };

// const postDeleteCartProduct = async (req, res, next) => {
//     const prodId = req.body.productId;
//     const userId = req.body.userId

//     try {
//         const user = await User.findOne({ where : { multiUserId: userId}})
//         const cart = await user.getCart();
//         const products = await cart.getProducts({ where: { id: prodId } });

//         if (!products.length) {
//             return res.status(404).json({ message: 'Product not found in cart' });
//         }

//         const product = products[0];

//         if (product.CartItem.quantity > 1) {
//             // Decrement the quantity by 1
//             product.CartItem.quantity -= 1;
//             await product.CartItem.save();
//             res.json({ message: 'Product quantity decreased by 1' });
//         } else {
//             // Quantity is 1, so remove the product from the cart
//             await product.CartItem.destroy();
//             res.json({ message: 'Product removed from cart' });
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to update cart' });
//     }
// };

// const postOrder = async (req, res, next) => {
//     const userId = req.body.userId
//     try {
//         console.log(userId);
        
//         const user = await User.findOne({ where : { multiUserId: userId}})
//         const cart = await user.getCart();
//         const products = await cart.getProducts();
//         console.log(products.length);
        
//         if (products.length < 1) {
//            return res.json({message:"Cart is Empty Add something to cart"})
//         }
//         const order = await user.createOrder();
        
//         await order.addProducts(
//             products.map(product => {
//                 product.OrderItem = { quantity: product.CartItem.quantity };
//                 return product;
//             })
//         );
//         console.log(order);


//         await cart.setProducts(null);
//         res.json({ message: 'Order placed successfully' });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to place order' });
//     }
// };

// const getOrders = async (req, res, next) => {
//     try {
//         const userId = req.params.userId
//         const user = await User.findOne({ where : { multiUserId: userId}})
//         const orders = await user.getOrders({ include: ['Products'] });
//         res.json({ orders });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Failed to retrieve orders' });
//     }
// };

// const deleteCart = async (req, res, next) => {
//     // Retrieve userId from URL parameters
//     const userId = req.params.id; // Ensure your route is set up to pass 'id' as a URL parameter
//     console.log(`Deleting cart for userId: ${userId}`);

//     try {
//         // Find the user by multiUserId
//         const user = await User.findOne({ where: { multiUserId: userId } });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Get the user's cart
//         const cart = await user.getCart();
//         if (!cart) {
//             return res.status(404).json({ message: 'Cart not found' });
//         }

//         // Retrieve current products in the cart
//         const currentProducts = await cart.getProducts();

//         // Check if the cart is already empty
//         if (currentProducts.length === 0) {
//             return res.status(200).json({ message: 'Cart is already empty' });
//         }

//         // Remove all products from the cart
//         await cart.setProducts([]); // This disassociates all products from the cart

//         // Optionally, you can also delete the cart entirely if desired
//         // await cart.destroy();

//         res.status(200).json({ message: 'All products have been removed from the cart' });
//     } catch (err) {
//         console.error(`Error deleting cart for userId ${userId}:`, err);
//         res.status(500).json({ message: 'Failed to delete all cart products' });
//     }
// };




// module.exports = { getProducts, getProduct, getCart, postCart, postDeleteCartProduct, postOrder, getOrders, deleteCart}
