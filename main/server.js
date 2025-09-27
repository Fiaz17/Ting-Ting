const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client_id = 'SQvC5j7hd0deTKWED88jVjkEWv7kNs4X';
const client_secret = 'd99FZPXJcIhkprJO';

// Endpoint to search flights
app.post('/search-flights', async (req, res) => {
  const { origin, destination, departureDate, returnDate, adults } = req.body;

  try {
    // 1️⃣ Get access token
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2️⃣ Search flights
    const flightResponse = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&returnDate=${returnDate}&adults=${adults}&max=5`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const flightData = await flightResponse.json();

    res.json(flightData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching flights' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
