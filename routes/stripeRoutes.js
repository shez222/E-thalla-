const express = require('express');
const stripe = require('stripe')("sk_test_51NizxzSCV4TK3HtnWjiVLbzkmHGZCIwLos19AC8IXIKoM0xtOXuNWyhXzMg04NeljR26ou8ytRKGYwIxJNXJXbGD00sbTi8ks2");
const router = express.Router();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



router.post('/', async (req, res) => {
    console.log(req.body);
    try {
        const { amount, email, username, items } = req.body;

        if (!amount || isNaN(amount) || amount <= 0 || !email || !username) {
            return res.status(400).send({ error: 'Invalid data' });
        }

        // Create a Customer first
        const customer = await stripe.customers.create({
            email: email,
            name: username,
            metadata: {
                username: username
            }
        });

        // Create a PaymentIntent with customer details
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'pkr',
            customer: customer.id,
            payment_method_types: ['card'],
            description: 'Purchase from your app',
            metadata: {
                username,
                email,
                order_items: JSON.stringify(items.map(item => item.name))
            },
            shipping: {
                name: username,
                address: {
                    line1: 'Default Address', // Replace with actual user-provided address
                    city: 'Karachi', // Example city in Pakistan
                    state: 'Sindh', // Example state in Pakistan
                    postal_code: '75500', // Example postal code in Pakistan
                    country: 'PK' // Country code for Pakistan
                }
            }
        });

        // Return both client secret and customer
        res.json({
            sessionId: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            customerId: customer.id
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
});



module.exports = router;
