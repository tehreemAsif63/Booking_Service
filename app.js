const express = require("express");
const mongoose = require("mongoose");
const mqtt = require("mqtt");
//Create the express object
const app = express();

app.get("/api", function (req, res) {
    res.json({ message: "Reservation service API is now running" });
  })


// Set URI to connect to
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ToothFerryReservations";
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
    .connect(mongoURI)
    .then(function () {
        console.log(`Connected to MongoDB with URI: ${mongoURI}`);
    })
    .catch(function (err) {
        if (err) {
            console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
            console.error(err.stack);
            process.exit(1);
        }
        console.log(`Connected to MongoDB with URI: ${mongoURI}`);
    });
 
app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Backend: http://localhost:${port}/api/v1`);
    console.log(`Frontend (production): http://localhost:${port}/`);
    });