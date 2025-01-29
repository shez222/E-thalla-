const express = require('express');
const socketIo = require('socket.io');
const Chat = require('./models/chat');
const Message = require('./models/message');


// Import routes
const MultiUseruserRoutes = require('./routes/multiUserRoutes');
// import { initializeOpenAI } from './controllers/openAI.js';
const { initializeOpenAI, sendPromptToGpt } = require('./controllers/openAiController.js');

// const openAi = require('./controllers/openAiController ');
const vendorRoutes = require('./routes/VendorRoute');
const shopRoutes = require('./routes/ShopRoutes');
const serviceProviderRoutes = require('./routes/ServiceProviderRoute'); // Add this line
const db = require('./models');
const User = db.User;
const stripeRoutes = require('./routes/stripeRoutes');

// Initialize Express app
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();



// // Middleware to parse JSON and URL-encoded data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// const storage = multer.memoryStorage(); // Using memory storage since we're not handling files
// app.use(multer({ storage: storage }).any())

// Middleware to attach user to request
// app.use(async (req, res, next) => {
//     try {
//         const user = await User.findByPk(1);
//         req.user = user;
//         next();
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

//=================

app.use(cors());
app.use(bodyParser.json());

// Endpoint to handle PDF analysis
app.post('/generate-map', async (req, res) => {
    try {
        //   const { prompt, pdfPresent } = req.body;
        const { prompt } = req.body;
        //   const pdfPath = req.file.path || "";
        //   const newFilePath = `${pdfPath}.pdf`
        //   fs.renameSync(pdfPath, newFilePath);

        console.log(`prompt: ${prompt}`)
        let response = await sendPromptToGpt("thread_4EgkjhkjgiYyS3lemTm", prompt);
        response = JSON.parse(response);
        console.log("response: " + response)


        // Delete the uploaded file after processing
        //   fs.unlinkSync(pdfPath);
        //   fs.unlinkSync(newFilePath);

        // res.json({ response });
        res.status(200).send(response)
        // res.status(200).send(JSON.stringify(response))
    } catch (error) {
        console.log('Error processing: ', error.message);
        res.status(500).json({ error: 'An error occurred while processing.' });
    }
});

//=================
app.get('/', (req,res,next)=>{
    res.json({response: "sgahdhgda"})
    next()
});





// Routes without file uploads
app.use('/E-Thalla', MultiUseruserRoutes);
app.use('/Shop', shopRoutes);
app.use('/service-provider-details', serviceProviderRoutes); // Add this line

// Routes with file uploads will be handled in their respective route files
app.use('/Vendors', vendorRoutes);

// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use('/create-checkout-session', stripeRoutes);

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

// Start the Server
const PORT = process.env.PORT || 8080;
const io = socketIo(3001, {
    cors: {
      origin: '*', // Allow all origins for now, you can specify your client domain here
      methods: ['GET', 'POST']
    }
  });

app.set('io', io); // Make Socket.io instance available in routes

(async () => {

    initializeOpenAI()
    console.log(`Serveeee}`);
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// app.listen(PORT, '192.168.100.65', () => {
//     console.log(`Server running at http://192.168.100.65:${PORT}`);
//     console.log('Available endpoint:');
//     console.log(`- POST http://192.168.100.65:${PORT}/create-checkout-session`);
//   });

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.",socket.id);
    
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        console.log("a user added.",socket.id);
        console.log("users: ",users);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            senderId,
            text,
        });
    }); 
    // ==========================
    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
        try {
            // Find or create a chat between sender and receiver
            let chat = await Chat.findOne({
                where: { participants: { [Op.contains]: [senderId, receiverId] } },
            });
    
            if (!chat) {
                chat = await Chat.create({ participants: [senderId, receiverId] });
            }
    
            // Save the message in the database
            const message = await Message.create({
                chatId: chat.id,
                senderId,
                receiverId,
                type: 'text',
                content: text,
            });
            
            console.log("Message saved to DB:", message);

            // Emit message to the receiver
            const user = getUser(receiverId);
            if (user) {
                io.to(user.socketId).emit("getMessage", {
                    senderId,
                    text,
                });
            }
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });
    
    // ==========================
    socket.on("sendMessage2", ({ senderId, receiverId, text }) => { // this is for testing purposes
        // const user = getUser(receiverId);
        console.log(`sender ${senderId} , reciever ${receiverId} , text ${text}`);

        io.to(receiverId).emit("getMessage", {
            senderId,
            text,
        });
    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});



// app.listen(PORT, '192.168.100.116', () => {
//     console.log(`Server running at http://192.168.100.116:${PORT}`);
//     console.log('Available endpoint:');
//     console.log(`- POST http://192.168.100.116:${PORT}/create-checkout-session`);
//   });
