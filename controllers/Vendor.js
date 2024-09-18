const Product = require('../models/product');
// const path = require('path');

const fs = require('fs');
const path = require('path');

const postAddProducts = async (req, res, next) => {
    const { title, description, price } = req.body;
    const imageUrl = req.file.path.replace("\\" ,"/");
    if (!req.file) {
        return res.status(422).json({msg:"Error Uploading image"})
    }    
    try {
        const result = await req.user.createProduct({
            title,
            price,
            imageUrl,
            description,
        });
        res.json({ message: 'Product added successfully', product: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to add product' });
    }
};

const getEditProducts = async (req, res, next) => {
    const editMode = req.query.edit;
    if (editMode === "false") {
       return res.json({ message: 'Unauthorized to edit product'})
    }
    
    const prodId = req.params.productId;

    try {
        const products = await req.user.getProducts({ where: { id: prodId } });
        const product = products[0];

        if (!product) {
            return res.json({ message: 'No Such Product'})
        }
        res.json({ message: 'Product added successfully', product: product })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve product for editing' });
    }
};


const postEditProducts = async (req, res, next) => {
    const { productId, title, price, description } = req.body;

    try {
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!req.file) {
            return res.status(422).json({ msg: "Error uploading image" });
        }

        // Get the old image path
        const oldImagePath = path.join(__dirname, '..', product.imageUrl);

        // Replace backslashes with forward slashes for the new image path
        const newImageUrl = req.file.path.replace(/\\/g, '/');

        // Delete the old image file
        fs.unlink(oldImagePath, (err) => {
            if (err) {
                console.log("Failed to delete the old image: ", err);
            } else {
                console.log("Old image deleted successfully");
            }
        });

        // Update the product details
        product.title = title;
        product.price = price;
        product.imageUrl = newImageUrl;
        product.description = description;

        await product.save();
        res.json({ message: 'Product updated successfully', product: product });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to update product' });
    }
};


const postDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;

    try {
        const product = await Product.findByPk(prodId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

const getProducts = async (req, res, next) => {
    try {
        const products = await req.user.getProducts();
        res.json({ products });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve products' });
    }
};

module.exports = { postAddProducts,   getEditProducts, postEditProducts, postDeleteProduct, getProducts }