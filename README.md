# About
**Travel Planner** is a small web applicaton that allows you to plan a trip to a city of your choice.

Simply bring up the frontend in your browser, enter the **city's name** (no diacritics), **country code** (2 letters), a **departure and return date** (current or future date with format *yyyy-mm-dd*) and press **SAVE**.

The app will now try to gather some additional information from a number of 3rd party web services, 
and then display a short summary of your trip, a landmark image of your destination and a weather forecast for the time you plan to spend there. 

# Current Limitations
* Depending on the data submitted, it is not always possible to provide all of the above information. In such cases, the app will respond in a best-effort fashion and display as much information as it was able to find.
* Form validation is rather rudimentary at this point, especially with regard to date combinations. So, in order to get meaningful results, make sure that your earliest departure date is today and that you generally do not plan to return before you depart.
* If your trip lies more that 16 days in the future, the app will provide you with a fictional forecast for the day of your departure.

# Running the App Locally
1. Clone this repository and switch to the main branch.
1. Install a recent version of Node (>= v15.5.0) and NPM (>= 7.3.0).
1. Install the necessary dependencies by running `npm install`. This may take a while.
1. Sign up for a free account at [GeoNames](https://www.geonames.org), [Weatherbit](https://www.weatherbit.io) and [pixabay](https://pixabay.com).
1. In the project root folder, create a file `.env` and replace the placeholders with your API credentials.
    ```
    GEO_URL=http://api.geonames.org/search
    GEO_USERNAME=<your_geodata_username>

    IMAGE_URL=https://pixabay.com/api
    IMAGE_API_KEY=<your_pixabay_api_key>

    WEATHER_URL=http://api.weatherbit.io/v2.0/forecast/daily
    WEATHER_API_KEY=<your_weatherbit_api_key>
    ```
1. Build the server by running `npm run build`.
1. Start up the server with `npm run express-server`.
1. Verify that the server is up and running by checking Node's console log. 
   It should at least mention the port the app is listening on (**8080** by default).
1. In your browser, navigate to `localhost:8080` to access the web frontend. Prefer a recent version of Google's Chrome.

:zap: If running any of the build scripts fails due to problems with package `node-sass` try running `npm rebuild node-sass`. May take a while to complete.

# Troubleshooting the App
If anything goes fatally wrong behind the scenes, the frontend will alert you by showing an -admittedly very general- error message. In most cases, the error will be due to the app backend being down, or to some really bizarre values being present in the form fields.

If none of the above conditions are to blame, take a look at the server console log for more detailed hints as to what went wrong.

Provided that valid dates are entered (e.g.: departing today, returning in two days), the following example destinations should always work fine:
* Madrid, ES.
* Berlin, DE.
* New York, US.
* Sydney, AU.

# Development
- The frontend can be served in dev mode by running `npm run dev-server`.
  The dev server is configured to listen on **port 9000** per default and will properly interact with the production backend, if it is running and listening on **port 8080**. It will attempt to open the frontend page in Chrome automatically.
- Linting (JS only): `npm run lint`.
- Unit testing: `npm run test`.
- Integration testing: `npm run itest`.
  **Run sparingly! This will consume API credits!**