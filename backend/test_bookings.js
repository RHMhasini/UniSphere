const { MongoClient } = require("mongodb");

const uri = "mongodb://admin:p189cmBDBfsXPqoj@cluster0-shard-00-00.aja2e.mongodb.net:27017,cluster0-shard-00-01.aja2e.mongodb.net:27017,cluster0-shard-00-02.aja2e.mongodb.net:27017/SmartCampusDB?authSource=admin&replicaSet=atlas-1dgf81-shard-0&tls=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("SmartCampusDB");
    const bookings = await db.collection("bookings").find().toArray();
    console.log(`Found ${bookings.length} bookings in Atlas DB`);
    if(bookings.length > 0) {
       console.log("First booking:", bookings[0]);
    }
    
    // Also list all collections to see what's there
    const collections = await db.listCollections().toArray();
    console.log("Collections in Atlas DB:", collections.map(c => c.name).join(", "));
  } catch (error) {
    console.error("Connection failed", error);
  } finally {
    await client.close();
  }
}
run();
