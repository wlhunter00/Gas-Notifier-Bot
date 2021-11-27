require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PW}@cluster0.wqfvl.mongodb.net/GasBot?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('GasBot');
        const GasList = database.collection('TrackingList');
        const query = { gasLevel: 5 };
        const gasObj = await GasList.findOne(query);
        console.log(gasObj);

        const insertData = {
            gasLevel: 5,
            timeInserted: new Date(),
            userLists: [
                {
                    userID: 2002,
                    username: "testName",
                    repeat: false,
                },
            ],
        }

        const result = await GasList.insertOne(insertData);
        console.log(`A document was inserted with the info:`, result);

    } finally {
        await client.close();
    }
}
run().catch(console.dir);
