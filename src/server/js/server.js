const {fetchWeatherData} = require('./fetchWeatherData');
const {fetchGeoData} = require('./fetchGeoData');
const {fetchImageData} = require('./fetchImageData');
const express = require('express');

/* Basic express configuration */
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
app.use(express.static('dist'));

/* Accumulated trips */
let nextId = 0;
const allTrips = new Map();

/* Store trips. Uses strings for trip ids to avoid having to
 * parse ints from string and dealing with errors
 * when looking up trips again. */
const storeTrip = function(tripData) {
  const trip = {id: nextId.toString(), ...tripData};
  allTrips.set(trip.id, trip);
  nextId++;
  return trip;
};

const clearTrips = function() {
  nextId = 0;
  allTrips.clear();
};

/* Routing */
/* Log all incoming requests for debugging purposes */
// TODO: Add proper, configurable logging library
app.all('*', function(req, res, next) {
  console.debug(`${req.method} ${req.path} req:${JSON.stringify(req.body)}`);
  next();
});

/* Never actually gets called,
 * unless there is no 'index.html' in dist (static root). */
app.get('/', function(req, res) {
  res.status(200).send('Hello from travel planner!');
});

/* Prevent errors when client requests favicon */
app.get('/favicon.ico', function(req, res) {
  res.sendStatus(204);
});

app.get('/geodata', async function(req, res, next) {
  try {
    const geoData = await fetchGeoData(req.query?.city, req.query?.country);
    console.debug(JSON.stringify(geoData));
    res.status(200).set('Content-Type', 'application/json').send(geoData);
  } catch (error) {
    next(error);
  }
});

app.get('/weather', async function(req, res, next) {
  try {
    const weatherData = await fetchWeatherData(req.query?.lat, req.query?.long);
    console.debug(JSON.stringify(weatherData));
    res.status(200).set('Content-Type', 'application/json').send(weatherData);
  } catch (error) {
    next(error);
  }
});

app.get('/imagedata', async function(req, res, next) {
  try {
    const imageData = await fetchImageData(req.query?.loc);
    console.debug(JSON.stringify(imageData));
    res.status(200).set('Content-Type', 'application/json').send(imageData);
  } catch (error) {
    next(error);
  }
});

/* Note(!): Route param (:id) is marked as optional (?) here
 * so that requests like '/trips' and 'trips/0' are both processed
 * by this endpoint. */
app.get('/trips/:id?', function(req, res) {
  const tripId = req.params.id;
  if (!tripId) {
    res.status(200).json(Array.from(allTrips.values()));
  } else {
    const trip = allTrips.get(tripId);
    if (!trip) {
      res.sendStatus(404);
    } else {
      res.status(200).json(trip);
    }
  }
});

/* Note(!): Deliberately not performing any sophisticated validation here.
 * App serves as a general data store. Data validation is
 * the client's responsibility. */
app.post('/trips', function(req, res) {
  const tripData = req.body;
  if (Object.keys(tripData).length == 0) {
    // TODO: Consider throwing a ValidationError here
    res.status(400).send('No trip data provided!');
  } else {
    const trip = storeTrip(tripData);
    const tripUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${trip.id}`;
    res.status(201).setHeader('Location', tripUrl).json(trip);
  }
});

module.exports = {
  app, clearTrips,
};
