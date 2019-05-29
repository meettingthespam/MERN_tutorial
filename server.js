// importing express
const express = require('express');

// initializing the app
const app = express();


app.get('/', (req, res) => res.send('API runnig'));

// making the port based on the actual server's
// real PORT or defaulting to port 5000
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
