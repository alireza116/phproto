const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
// const moment = require("moment");
var cookieParser = require("cookie-parser");
var bodyparser = require("body-parser");
const fs = require("fs");

console.log(__dirname);

let rawdata = fs.readFileSync(
  path.join(__dirname, "public/vietEmotGeoTopic_2.json"),
  {
    encoding: "utf-8",
  }
);

let topicTermsDict = fs.readFileSync(
  path.join(__dirname, "public/vietEmotGeoTopic2_topicDict.json"),
  {
    encoding: "utf-8",
  }
);

let geojson = JSON.parse(rawdata);
topicTermsDict = JSON.parse(topicTermsDict);

// geojson.forEach((f) => {
//   let date = moment(f["properties"]["date_time"]);
//   f["properties"]["date"] = moment(f["properties"]["date_time"]);
// });
// console.log(geojson[0]);
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
app.get("/api/data", (req, res) => {
  res.json(geojson);
});

app.get("/api/topics", (req, res) => res.json(topicTermsDict));

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
