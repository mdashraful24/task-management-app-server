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
        // await client.connect();

        const userCollection = client.db("taskManagementDB").collection("users");
        const taskCollection = client.db("taskManagementDB").collection("tasks");
        const activityLogCollection = client.db("taskManagementDB").collection("activityLogs");

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
        app.get('/tasks/:email', async (req, res) => {
            const query = { email: req.params.email }
            const tasks = await taskCollection.find(query).toArray();
            res.send(tasks);
        });

        app.post('/tasks', async (req, res) => {
            const { title, description, category, email } = req.body;

            // Ensure the task includes the user's email
            const taskWithCreatedAt = {
                title,
                description,
                category: category, // Default category is 'To-Do'
                email, // Add email to the task data
                createdAt: new Date(),
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

        app.patch('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const updatedDoc = {
                ...req.body,
                updatedAt: new Date() // Add the current timestamp
            };
            const filter = { _id: new ObjectId(id) };
            const result = await taskCollection.updateOne(filter, { $set: updatedDoc });
            res.send(result);
        });

        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        });

        // GET Route for fetching logs by email
        app.get('/activity-logs/:email', async (req, res) => {
            const query = { email: req.params.email };
            try {
                const logs = await activityLogCollection.find(query).toArray();
                res.send(logs);
            } catch (error) {
                console.error("Error fetching logs:", error);
                res.status(500).send({ message: "Error fetching logs from database" });
            }
        });

        // POST Route for saving logs
        app.post('/activity-logs', async (req, res) => {
            console.log(req.body);
            const { message, timestamp, email } = req.body;

            if (!message || !timestamp || !email) {
                return res.status(400).send({ message: "Missing required fields" });
            }

            const logData = {
                message,
                timestamp: new Date(timestamp),
                email,
                createdAt: new Date(),
            };

            try {
                const result = await activityLogCollection.insertOne(logData);
                res.send(result); // Respond with the inserted log result
            } catch (error) {
                console.error("Error inserting log:", error);
                res.status(500).send({ message: "Error inserting log into database" });
            }
        });




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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




// Reserve
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = process.env.PORT || 5000;

// // middleware
// app.use(cors());
// app.use(express.json());


// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         // await client.connect();

//         const userCollection = client.db("taskManagementDB").collection("users");
//         const taskCollection = client.db("taskManagementDB").collection("tasks");

//         // users related api's
//         app.get('/users', async (req, res) => {
//             const search = req.query.search;
//             let query = {};
//             if (search) {
//                 query = {
//                     $or: [
//                         { name: { $regex: search, $options: 'i' } },
//                         { email: { $regex: search, $options: 'i' } }
//                     ]
//                 };
//             }
//             const result = await userCollection.find(query).toArray();
//             res.send(result);
//         });

//         app.get('/users/:email', async (req, res) => {
//             const email = req.params.email;
//             const query = { email: email };
//             const result = await userCollection.findOne(query);
//             res.send(result);
//         })

//         app.post('/users', async (req, res) => {
//             const user = req.body;
//             const query = { email: user.email }
//             const existingUser = await userCollection.findOne(query);
//             if (existingUser) {
//                 return res.send({ message: 'user already exists', insertedId: null })
//             }
//             const result = await userCollection.insertOne(user);
//             res.send(result);
//         })

//         app.delete('/users/:id', async (req, res) => {
//             const id = req.params.id;
//             const query = { _id: new ObjectId(id) }
//             const result = await userCollection.deleteOne(query);
//             res.send(result);
//         })

//         // **Tasks Related APIs**
//         app.get('/tasks/:email', async (req, res) => {
//             const query = { email: req.params.email }
//             const tasks = await taskCollection.find(query).toArray();
//             res.send(tasks);
//         });

//         app.post('/tasks', async (req, res) => {
//             const { title, description, category, email } = req.body;

//             // Default category to 'To-Do' if no category is provided
//             const taskCategory = category || 'To-Do';

//             // Ensure the task includes the user's email
//             const taskWithCreatedAt = {
//                 title,
//                 description,
//                 category: taskCategory,  // Use default category if not provided
//                 email,  // Add email to the task data
//                 createdAt: new Date(),
//             };

//             const result = await taskCollection.insertOne(taskWithCreatedAt);
//             res.send(result);
//         });

//         app.put('/tasks/:id', async (req, res) => {
//             const id = req.params.id;
//             const { title, description } = req.body;
//             const query = { _id: new ObjectId(id) };
//             const updateDoc = { $set: { title, description } };
//             const result = await taskCollection.updateOne(query, updateDoc);
//             res.send(result);
//         });

//         app.patch('/tasks/:id', async (req, res) => {
//             const id = req.params.id;
//             const updatedDoc = {
//                 ...req.body,
//                 updatedAt: new Date() // Add the current timestamp
//             };
//             const filter = { _id: new ObjectId(id) };
//             const result = await taskCollection.updateOne(filter, { $set: updatedDoc });
//             res.send(result);
//         });


//         app.delete('/tasks/:id', async (req, res) => {
//             const id = req.params.id;
//             const query = { _id: new ObjectId(id) };
//             const result = await taskCollection.deleteOne(query);
//             res.send(result);
//         });


//         // Send a ping to confirm a successful connection
//         // await client.db("admin").command({ ping: 1 });
//         // console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }
// run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send('Task Management App is open')
// })

// app.listen(port, () => {
//     console.log(`Task Management App is open on port ${port}`);
// })