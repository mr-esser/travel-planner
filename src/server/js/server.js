/* Import base functionality */
const {fetchWeatherData} = require('./fetchWeatherData');

/* Basic express configuration */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
app.use(express.static('dist'));

// Accumulated travel data
// TODO: Use list-based structure here. Maybe even with IDs.
let projectData = {};

/* Routing */

/* Log all incoming requests for debugging purposes */
// TODO: Add proper, configurable logging library
app.all('*', function(req, res, next) {
  console.debug(`${req.method} ${req.path} req:${JSON.stringify(req.body)}`);
  next();
});

/* Never actually gets called, unless there is no
 * index.html in dist (static root). */
app.get('/', function(req, res) {
  res.send('Hello from travel planner!');
});

app.get('/all', function(req, res) {
  res.json(projectData);
});

// TODO: Should be a GET request with a query.
app.post('/weather', async function(req, res, next) {
  try {
    const {zipAndCountryCode} = req.body;
    const weatherData = await fetchWeatherData(zipAndCountryCode);
    console.debug(JSON.stringify(weatherData));
    // TODO: Do not parse and then serialize
    res.status(201).json(weatherData);
  } catch (error) {
    next(error);
  }
});

/* POST route to store an entry
 * Note(!): Deliberately not performing any validation here.
 * App serves as a general data store. Data validation is
 * the client's responsibility. */
app.post('/all', function(req, res) {
  projectData = req.body;
  res.status(201).json(projectData);
});

module.exports = app;
