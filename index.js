const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0fazp1r.mongodb.net/?retryWrites=true&w=majority`;

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

        const volunteerCollection = client.db('volunteerDB').collection('volunteer');
        const volunteerRegistration = client.db('volunteerDB').collection('registerList');
        const eventListCollection = client.db('volunteerDB').collection('eventList');
    
        //get events data form database
        app.get('/events', async (req, res) => {
            const cursor = volunteerCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        //get register list from database
        app.get('/register-list', async (req, res) => {
            const cursor = volunteerRegistration.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        //  get events by id
        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) }
            const options = {
                // Include only the `title` in the returned document
                projection: { title: 1, img: 1, description: 1, date:1 },
            };
            const result = await volunteerCollection.findOne(query, options)
            res.send(result);
        })
        //get events list by email
        app.get('/events-list', async (req, res) => {
            const email = req.query.email;
          //  console.log(email);
            let query={}
             query = { email: email }
            const cursor = eventListCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);

        })

        //post add events data which comes from client side
        app.post('/add-events', async (req, res) => {
            const addEvents = req.body;
            //console.log(addEvents);
            const result = await volunteerCollection.insertOne(addEvents);
            res.send(result);
        })
        // post add register list come from client side
        app.post('/register-list', async (req, res) => {
            const addRegisterList = req.body;
          //  console.log(addRegisterList);
            const result = await volunteerRegistration.insertOne(addRegisterList);
            res.send(result);
        })
        // post add event list come from client side
        app.post('/event-list', async (req, res) => {
            const addEventList = req.body;
          //  console.log(addEventList);
            const result = await eventListCollection.insertOne(addEventList);
            res.send(result);
        })
        //update  single event
        app.patch('/events/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedEvents = req.body;
           // console.log(updatedEvents);
            const updateDoc = {
                $set: {
                    title:updatedEvents.title,
                    description:updatedEvents.description,
                    img: updatedEvents.img,
                    date:updatedEvents.date
                },
            };
            const result = await volunteerCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        //delete for events list
        app.delete('/events-list/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await eventListCollection.deleteOne(query)
            res.send(result)
        })
        // delete for register list
        app.delete('/register-list/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await volunteerRegistration.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Volunteer server is running')
})
app.listen(port, () => {
    console.log(`Volunteer server is running on port: ${port}`)
})