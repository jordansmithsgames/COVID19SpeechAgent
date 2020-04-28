// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const bent = require('bent');
const getJSON = bent('json');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
function realNum(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  // function welcome(agent) {
  //   agent.add(`Welcome to my agent!`);
  // }
 
  // function fallback(agent) {
  //   agent.add(`I didn't understand`);
  //   agent.add(`I'm sorry, can you try again?`);
  // }

  function worldwideLatestStats(agent) {
    const type = agent.parameters.type;
    return getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/latest?source=jhu').then((result) => {
      var all = false;
      agent.add("According to my latest data...");
      for (let i = 0; i < type.length; i++) {
      	if (type[i] == "all") all = true;
      }
      if (all || type.length >= 3) {
        agent.add(`There are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19, ${realNum(result.latest.deaths)} deaths, and ${realNum(result.latest.recovered)} people who have recovered from COVID-19.`);
      }
      else {
        let beginning = "There";
        for (let i = 0; i < type.length; i++) {
          if (i > 0) beginning = "Additionally, there";
          if (type[i] == "confirmed") agent.add(beginning + ` are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19.`);
          else if (type[i] == "deaths") agent.add(beginning + ` are currently ${realNum(result.latest.deaths)} deaths due to COVID-19.`);
          else if (type[i] == "recovered") agent.add(beginning + ` are currently ${realNum(result.latest.recovered)} people who have recvoed from COVID-19.`);       
        }
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  function locationLatestStats(agent) {
    // const types = agent.parameters.type;
    // const counties = agent.parameters.county;
    // const cities = agent.parameters.city;
    // const states = agent.parameters.states;
    // const countries = agent.parameters.country;
    return getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/latest?source=jhu').then((result) => {
      agent.add("Inside the function!");
      // if (types != null) for (let i = 0; i < types.length; i++) agent.add(`Types received:${types[i]}`);
      // if (counties != null) for (let i = 0; i < counties.length; i++) agent.add(`Counties received:${counties[i]}`);
      // if (cities != null) for (let i = 0; i < cities.length; i++) agent.add(`Cities received:${cities[i]}`);
      // if (states != null) for (let i = 0; i < states.length; i++) agent.add(`States received:${states[i]}`);
      // if (countries != null) for (let i = 0; i < countries.length; i++) agent.add(`Types received:${countries[i]}`);
    }).catch((error) => {
      console.log(error);
    });
  }
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  // intentMap.set('Default Welcome Intent', welcome);
  // intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Worldwide Latest Stats', worldwideLatestStats);
  intentMap.set('Location Latest Stats', locationLatestStats);
  agent.handleRequest(intentMap);
});
