const { MongoClient } = require("mongodb");

const uri = "mongodb://admin:p189cmBDBfsXPqoj@cluster0-shard-00-00.aja2e.mongodb.net:27017,cluster0-shard-00-01.aja2e.mongodb.net:27017,cluster0-shard-00-02.aja2e.mongodb.net:27017/?authSource=admin&replicaSet=atlas-1dgf81-shard-0&tls=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    
    // List all databases
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases on cluster:");
    
    for (const dbInfo of dbs.databases) {
      console.log(`- ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      
      try {
          const collections = await db.listCollections().toArray();
          const colNames = collections.map(c => c.name);
          if (colNames.includes("bookings")) {
            console.log(` ---> FOUND 'bookings' collection inside database: ${dbInfo.name}`);
            const bookings = await db.collection("bookings").find().toArray();
            console.log(` ---> Contains ${bookings.length} documents.`);
          }
      } catch (err) {
         // might lack permissions for some internal dbs
      }
    }
  } catch (error) {
    console.error("Connection failed", error);
  } finally {
    await client.close();
  }
}
run();
