const express = require("express");




const app = express();

const port = process.env.PORT || 4000;












app.get("/api", function (req, res) {
    res.json({ message: "Welcome to group-03  backend ExpressJS project!" });
  })




















  app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, `);
   
  });
  
  module.exports = app;