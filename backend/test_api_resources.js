const axios = require('axios');

async function testFetch() {
  try {
    const res = await axios.post('http://localhost:8081/api/auth/login', {
      email: 'admin@unisphere.com', // or any valid user
      password: 'password123'
    });
    const token = res.data.accessToken;
    
    const resourcesRes = await axios.get('http://localhost:8081/api/resources/type/LECTURE_HALL', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Status:", resourcesRes.status);
    console.log("Data total elements:", resourcesRes.data.length);
    console.log("First element:", resourcesRes.data[0]);
  } catch (err) {
    if(err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error data:", err.response.data);
    } else {
      console.log("Error:", err.message);
    }
  }
}
testFetch();
