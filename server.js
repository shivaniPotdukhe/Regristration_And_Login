const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const pages = require("./routes/pages");
const auth = require("./routes/auth");
// const apiRouter = require('./routes');
const apiResponse = require('./helper/apiResponse');

var app = express();

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Parse url-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

app.use(bodyParser.json());

// Route Prefixes
app.use("/", pages);
app.use("/auth", auth);

// throw 404 if URL not found
app.all('*', function (req, res) {
    return apiResponse.notFoundResponse(res, 'Not found');
  });

app.listen(5001, () => {
  console.log('Server started at port 5001...');
});