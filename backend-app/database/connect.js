const mongoose = require("mongoose")

/*async function ConnectDB(){
    try{
        await mongoose.connect(process.env.mongoURL)
        console.log('mongodb connected successfully')
    }catch(err){
        console.log(err)
        process.exit(1)
    }
}*/

const uri = `mongodb+srv://anxumalo000:${process.env.PASSWORD}@cluster0.mb1i07x.mongodb.net/travel?retryWrites=true&w=majority&appName=Cluster0`;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function ConnectDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}

module.exports = ConnectDB