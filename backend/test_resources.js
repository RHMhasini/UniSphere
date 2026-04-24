const { MongoClient } = require("mongodb");

const uri = "mongodb://admin:p189cmBDBfsXPqoj@cluster0-shard-00-00.aja2e.mongodb.net:27017,cluster0-shard-00-01.aja2e.mongodb.net:27017,cluster0-shard-00-02.aja2e.mongodb.net:27017/SmartCampusDB?authSource=admin&replicaSet=atlas-1dgf81-shard-0&tls=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("SmartCampusDB");
    const resources = await db.collection("resources").find().toArray();
    console.log(`Found ${resources.length} resources`);
    if(resources.length > 0) {
       console.log("First resource:", resources[0]);
    }
  } catch (error) {
    console.error("Connection failed", error);
  } finally {
    await client.close();
  }
}
run();
