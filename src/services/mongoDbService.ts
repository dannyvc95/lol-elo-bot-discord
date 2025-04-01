
import {MongoClient, ServerApiVersion} from 'mongodb';
// eslint-disable-next-line max-len
const uri = 'mongodb+srv://dannyvc95:5HjVpVJjUItWpwHj@lol-elo-bot-db.zjofhwg.mongodb.net/?retryWrites=true&w=majority&appName=lol-elo-bot-db';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const db = client.db('lol-elo-bot');

export async function run() {
    try {
    // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db('admin').command({ping: 1});
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } finally {
    // Ensures that the client will close when you finish/error
        await client.close();
    }
}

export const getTestDocument = async () => {
    const collection = db.collection('test');
    const docs = collection.find({type: 'test'});
    return await docs;
};
