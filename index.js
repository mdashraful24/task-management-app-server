// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "*", // You can restrict this later based on your frontend URL
//     },
// });

// async function run() {
//     try {
//         // Connect to MongoDB
//         await client.connect();
//         console.log('Connected to MongoDB');

//         const userCollection = client.db("taskManagementDB").collection("users");
//         const taskCollection = client.db("taskManagementDB").collection("tasks");

//         // **Users API**
//         app.get('/users', async (req, res) => {
//             try {
//                 const search = req.query.search;
//                 let query = {};
//                 if (search) {
//                     query = {
//                         $or: [
//                             { name: { $regex: search, $options: 'i' } },
//                             { email: { $regex: search, $options: 'i' } }
//                         ]
//                     };
//                 }
//                 const users = await userCollection.find(query).toArray();
//                 res.status(200).json(users);
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         app.get('/users/:email', async (req, res) => {
//             try {
//                 const user = await userCollection.findOne({ email: req.params.email });
//                 if (!user) return res.status(404).json({ message: "User not found" });
//                 res.status(200).json(user);
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         app.post('/users', async (req, res) => {
//             try {
//                 const user = req.body;
//                 const existingUser = await userCollection.findOne({ email: user.email });
//                 if (existingUser) {
//                     return res.status(409).json({ message: 'User already exists' });
//                 }
//                 const result = await userCollection.insertOne(user);
//                 res.status(201).json(result);
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         app.delete('/users/:id', async (req, res) => {
//             try {
//                 const result = await userCollection.deleteOne({ _id: new ObjectId(req.params.id) });
//                 res.status(200).json(result);
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         // **Tasks API**
//         app.get('/tasks', async (req, res) => {
//             try {
//                 const tasks = await taskCollection.find().toArray();
//                 res.status(200).json(tasks);
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         app.post('/tasks', async (req, res) => {
//             const task = req.body;
//             task.timestamp = new Date(); // Add creation timestamp
//             const result = await taskCollection.insertOne(task);
//             io.emit("task-updated");
//             res.send(result);
//         });

//         // **Update Task Status & Details**
//         app.put('/tasks/:id', async (req, res) => {
//             try {
//                 const { title, description, status } = req.body;
//                 const query = { _id: new ObjectId(req.params.id) };
//                 const updateDoc = { $set: { title, description, status } };
//                 const result = await taskCollection.updateOne(query, updateDoc);
//                 io.emit("task-updated");
//                 res.status(200).json(result);
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         // **Handle Drag & Drop Task Movement**
//         app.put('/tasks/move/:id', async (req, res) => {
//             try {
//                 const { status } = req.body;
//                 const query = { _id: new ObjectId(req.params.id) };
//                 const updateDoc = { $set: { status } };
//                 const result = await taskCollection.updateOne(query, updateDoc);
//                 io.emit("task-updated");
//                 res.status(200).json({ message: "Task moved successfully", result });
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         app.delete('/tasks/:id', async (req, res) => {
//             try {
//                 const result = await taskCollection.deleteOne({ _id: new ObjectId(req.params.id) });
//                 io.emit("task-updated");
//                 res.status(200).json(result);
//             } catch (err) {
//                 res.status(500).json({ error: err.message });
//             }
//         });

//         // **Real-Time Updates using MongoDB Change Streams**
//         const changeStream = taskCollection.watch();
//         changeStream.on("change", () => {
//             io.emit("task-updated");
//         });

//         // Handle WebSocket connections
//         io.on("connection", (socket) => {
//             console.log("⚡ User connected:", socket.id);
//             socket.on("disconnect", () => {
//                 console.log("❌ User disconnected:", socket.id);
//             });
//         });

//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });

//         // Start the server after the DB connection is established
//         server.listen(port, () => {
//             console.log(`Server running on port ${port}`);
//         });

//     } catch (err) {
//         console.error('Error connecting to MongoDB:', err);
//         process.exit(1);  // Exit the process if MongoDB connection fails
//     }
// }

// // Start the MongoDB connection
// run();

// app.get('/', (req, res) => {
//     res.send('Task Management App is running');
// });












require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db("taskManagementDB").collection("users");
        const taskCollection = client.db("taskManagementDB").collection("tasks");

        // users related api's
        app.get('/users', async (req, res) => {
            const search = req.query.search;
            let query = {};
            if (search) {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                };
            }
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // **Tasks Related APIs**
        app.get('/tasks', async (req, res) => {
            const tasks = await taskCollection.find().toArray();
            res.send(tasks);
        });

        app.post('/tasks', async (req, res) => {
            const task = req.body;

            // Add createdAt field and category (if not provided)
            const taskWithCreatedAt = {
                ...task,
                createdAt: new Date(),  // Set createdAt to current date and time
                category: task.category || 'To-Do'  // Default category is 'To-Do'
            };

            const result = await taskCollection.insertOne(taskWithCreatedAt);
            res.send(result);
        });

        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const { title, description } = req.body;
            const query = { _id: new ObjectId(id) };
            const updateDoc = { $set: { title, description } };
            const result = await taskCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task Management App is open')
})

app.listen(port, () => {
    console.log(`Task Management App is open on port ${port}`);
})