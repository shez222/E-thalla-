const db = require('../models');
const Product = db.Product;
// const path = require('path');

const fs = require('fs');
const path = require('path');
const VendorDetail = db.VendorDetail
const User = db.User
const Vendor = db.VendorDetail
const Shop = db.Shop


const createVendorDetail = async (req, res) => {
    try {
        const {
            phoneNumber,
            description,
            selectedItems,
            priceRange,
            timeSelection,
            selectedDays,
            userId
        } = req.body;

        // Validate required fields
        if (!phoneNumber || !description || !selectedItems || !priceRange || !timeSelection || !userId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Process uploaded images
        let images = [];
        let certificateImages = [];

        if (req.files['images']) {
            images = req.files['images'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
        }

        if (req.files['certificateImages']) {
            certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
        }

        // Create VendorDetail
        const newVendorDetail = await VendorDetail.create({
            phoneNumber,
            description,
            selectedItems: JSON.parse(selectedItems), // Assuming JSON string is sent
            priceRange: JSON.parse(priceRange),
            timeSelection: JSON.parse(timeSelection),
            selectedDays: selectedDays ? JSON.parse(selectedDays) : [],
            uploadImages: {
                images,
                certificateImages
            },
            userId
        });

        res.status(201).json({ message: 'VendorDetail created successfully.', data: newVendorDetail });
    } catch (error) {
        console.error('Error creating VendorDetail:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


const getAllVendorDetails = async (req, res) => {
    try {
        const vendorDetails = await VendorDetail.findAll(
            {
            include: [{
                model: User,
                as: 'user',
                attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
            }]
        }
    );

        return res.status(200).json({ data: vendorDetails });
    } catch (error) {
        console.error('Error fetching VendorDetails:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

const getVendorDetailById = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const vendorDetail = await VendorDetail.findOne({
            where: { vendorId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['multiUserId', 'username', 'email'] // Adjust attributes as needed
            }]
        });

        if (!vendorDetail) {
            return res.status(404).json({ message: 'VendorDetail not found.' });
        }

        return res.status(200).json({ data: vendorDetail });
    } catch (error) {
        console.error('Error fetching VendorDetail:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

const updateVendorDetail = async (req, res) => {
    // try {
    //     const { vendorId } = req.params;
    //     const updateData = req.body;

    //     // Process uploaded images
    //     let images = [];
    //     let certificateImages = [];

    //     if (req.files['images']) {
    //         images = req.files['images'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
    //         updateData.uploadImages = updateData.uploadImages || {};
    //         updateData.uploadImages.images = images;
    //     }

    //     if (req.files['certificateImages']) {
    //         certificateImages = req.files['certificateImages'].map(file => `${req.protocol}://${req.get('host')}/images/${file.filename}`);
    //         updateData.uploadImages = updateData.uploadImages || {};
    //         updateData.uploadImages.certificateImages = certificateImages;
    //     }

    //     // Parse JSON fields if they are strings
    //     if (updateData.selectedItems) {
    //         updateData.selectedItems = JSON.parse(updateData.selectedItems);
    //     }

    //     if (updateData.priceRange) {
    //         updateData.priceRange = JSON.parse(updateData.priceRange);
    //     }

    //     if (updateData.timeSelection) {
    //         updateData.timeSelection = JSON.parse(updateData.timeSelection);
    //     }

    //     if (updateData.selectedDays) {
    //         updateData.selectedDays = JSON.parse(updateData.selectedDays);
    //     }

    //     // Update VendorDetail
    //     const [updatedRowsCount, updatedRows] = await VendorDetail.update(updateData, {
    //         where: { vendorId },
    //         returning: true
    //     });

    //     if (updatedRowsCount === 0) {
    //         return res.status(404).json({ message: 'VendorDetail not found or no changes made.' });
    //     }

    //     res.status(200).json({ message: 'VendorDetail updated successfully.', data: updatedRows[0] });
    // } catch (error) {
    //     console.error('Error updating VendorDetail:', error);
    //     res.status(500).json({ message: 'Internal server error.', error: error.message });
    // }
};

const deleteVendorDetail = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const deletedRowsCount = await VendorDetail.destroy({
            where: { vendorId }
        });

        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'VendorDetail not found.' });
        }

        return res.status(200).json({ message: 'VendorDetail deleted successfully.' });
    } catch (error) {
        console.error('Error deleting VendorDetail:', error);
        return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};






const postAddProducts = async (req, res, next) => {
    const { title, description, price, shopId } = req.body;
    console.log('hkjh');
    
    console.log(req.files); // Should show the uploaded images
    // Ensure images are received
    if (!req.files || !req.files.images) {
        return res.status(422).json({ msg: "Error uploading images" });
    }

    // Map the image paths to the correct format
    const imageUrls = req.files.images.map(file => file.path.replace(/\\/g, '/'));

    try {
        const result = await Product.create({
            title,
            price,
            imageUrl: imageUrls, // Assuming you want to save all image URLs
            description,
            shopId
        });
        
        // const result = await req.user.createProduct({
        //     title,
        //     price,
        //     imageUrl: imageUrls, // Assuming you want to save all image URLs
        //     description,
        // });
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
        const products = await Product.findOne({ where: { id: prodId } });
        // const products = await req.user.getProducts({ where: { id: prodId } });
        // const product = products;

        if (!products) {
            return res.json({ message: 'No Such Product'})
        }
        res.json({ message: 'Product added successfully', product: products })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve product for editing' });
    }
};


const postEditProducts = async (req, res, next) => {
    const { productId, title, price, description } = req.body;

    try {
        const product = await Product.findByPk(productId);
        console.log("check");
        

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Store old images if they exist
        const oldImageUrls = product.imageUrl || [];

        // Ensure images are received
        if (!req.files || !req.files.images) {
            return res.status(422).json({ msg: "Error uploading images" });
        }

        // Map the new image paths to the correct format
        const newImageUrls = req.files.images.map(file => file.path.replace(/\\/g, '/'));

        // Delete old images if necessary
        oldImageUrls.forEach(oldImagePath => {
            const fullOldImagePath = path.join(__dirname, '..', oldImagePath);
            fs.unlink(fullOldImagePath, (err) => {
                if (err) {
                    console.log("Failed to delete the old image: ", err);
                } else {
                    console.log("Old image deleted successfully");
                }
            });
        });

        // Update the product details
        product.title = title;
        product.price = price;
        product.imageUrl = newImageUrls; // Assuming you're storing all new image URLs
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
        const products = await Product.findAll();
        res.json({ products });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to retrieve products' });
    }
};


// Create a new Shop
const createShop = async (req, res) => {
    try {
        const { shopName, image, vendorId, location, description, ownerName, products } = req.body;
        const shop = await Shop.create({ shopName, image, vendorId, location, description, ownerName });

        // if (products && products.length > 0) {
        //     const productPromises = products.map(product => Product.create({ ...product, shopId: shop.id }));
        //     await Promise.all(productPromises);
        // }

        res.status(201).json(shop);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Read all Shops with their Products
const getShops = async (req, res) => {
    try {
        const shops = await Shop.findAll({
            include: [
                {
                  model: Product,
                  as: 'products',  // Use the alias defined in your association
                },
              ]
        });
        res.status(200).json(shops);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Read a single Shop by ID with Products
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id, {
            include: [
                {
                  model: Product,
                  as: 'products',  // Use the alias defined in your association
                },
              ]
        });
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        res.status(200).json(shop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a Shop
const updateShop = async (req, res) => {
    try {
        const { shopName, image, vendorId, location, description, ownerName, products } = req.body;
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        // Update the shop details
        await shop.update({ shopName, image, vendorId, location, description, ownerName });

        // Optionally, update the products associated with the shop
        // if (products && products.length > 0) {
        //     await Product.destroy({ where: { shopId: shop.id } });
        //     const productPromises = products.map(product => Product.create({ ...product, shopId: shop.id }));
        //     await Promise.all(productPromises);
        // }

        res.status(200).json(shop);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a Shop and its Products
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        // Deleting the shop will also delete associated products due to CASCADE
        await shop.destroy();
        res.status(200).json({ message: 'Shop deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { postAddProducts, getEditProducts, postEditProducts, postDeleteProduct, getProducts, deleteVendorDetail, createVendorDetail, getAllVendorDetails, getVendorDetailById, updateVendorDetail, createShop, getShops, getShopById, updateShop, deleteShop  }