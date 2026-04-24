const { MongoClient } = require("mongodb");

const uri = "mongodb://admin:p189cmBDBfsXPqoj@cluster0-shard-00-00.aja2e.mongodb.net:27017,cluster0-shard-00-01.aja2e.mongodb.net:27017,cluster0-shard-00-02.aja2e.mongodb.net:27017/SmartCampusDB?authSource=admin&replicaSet=atlas-1dgf81-shard-0&tls=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('SmartCampusDB');
    const users = database.collection('users');
    const allUsers = await users.find({}).toArray();
    console.log("Found " + allUsers.length + " users in the database:");
    allUsers.forEach(user => {
      console.log("-------------------");
      console.log("Keys: ", Object.keys(user));
      console.log("Email field (exact key 'email'):", user.email);
      console.log("Role:", user.role);
    });
  } catch (error) {
    console.error("Connection failed", error);
  } finally {
    await client.close();
  }
}
run();
