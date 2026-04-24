const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("unisphere");
    const collections = await db.listCollections().toArray();
    console.log("Collections in Local 'unisphere' DB:", collections.map(c => c.name).join(", "));
    
    if (collections.map(c => c.name).includes("bookings")) {
      const bookings = await db.collection("bookings").find().toArray();
      console.log(`Found ${bookings.length} bookings locally`);
      if(bookings.length > 0) {
         console.log("First booking locally:", bookings[0]);
      }
    } else {
       console.log("No bookings collection locally either.");
    }
    
  } catch (error) {
    console.error("Connection to localhost failed:", error.message);
  } finally {
    await client.close();
  }
}
run();
