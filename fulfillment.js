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

  function worldwideLatestStats(agent) {
    const type = agent.parameters.type;
    return getJSON('https://coronavirus-tracker-api.ruizlab.org/v2/latest?source=jhu').then((result) => {
      let all = false;
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
          else if (type[i] == "recovered") agent.add(beginning + ` are currently ${realNum(result.latest.recovered)} people who have recovered from COVID-19.`);       
        }
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  function locationLatestStats(agent) {
    const type = agent.parameters.type;
    let county = agent.parameters.county[0];
    const state = agent.parameters.state[0];
    let country = agent.parameters.country[0];

    let all = false;
    for (let i = 0; i < type.length; i++) {
      if (type[i] == "all") {
        all = true;
      }
    }

    if (county != null) {
      county = county.replace(/county/gi, "");
      county = county.replace(/ /g, "");  
      if (state != null) {
        return getJSON(`https://coronavirus-tracker-api.ruizlab.org/v2/locations?source=csbs&province=${state}&county=${county}`).then((result) => {
          if (all || type.length >= 3) {
            agent.add(`In ${result.locations[0].county} County, ${result.locations[0].province}, there are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19, ${realNum(result.latest.deaths)} deaths, and ${realNum(result.latest.recovered)} people who have recovered from COVID-19.`);
          }
          else {
            let beginning = `In ${result.locations[0].county} County, ${result.locations[0].province}, there`;
            let ending = ".";
            for (let i = 0; i < type.length; i++) {
              if (i > 0) {
                beginning = "Additionally, there";
                ending = " there as well.";
              }
              if (type[i] == "confirmed") agent.add(beginning + ` are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19` + ending);
              else if (type[i] == "deaths") agent.add(beginning + ` are currently ${realNum(result.latest.deaths)} deaths due to COVID-19` + ending);
              else if (type[i] == "recovered") agent.add(beginning + ` are currently ${realNum(result.latest.recovered)} people who have recovered from COVID-19` + ending);             
            }
          }
        }).catch((error) => {
          console.log(error);
        });
      }
      else {
        agent.add("Please specify a state to go with the county described.");
      }
    }
    else if (country != null) {
      country = country["alpha-2"];
      if (state != null) {
        return getJSON(`https://coronavirus-tracker-api.ruizlab.org/v2/locations?source=csbs&country_code=${country}&province=${state}`).then((result) => {
          
          if (all|| type.length >= 3) {
            agent.add(`In ${result.locations[0].province}, ${result.locations[0].country}, there are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19, ${realNum(result.latest.deaths)} deaths, and ${realNum(result.latest.recovered)} people who have recovered from COVID-19.`);
          }
          else {
            let beginning = `In ${result.locations[0].province}, ${result.locations[0].country}, there`;
            let ending = ".";
            for (let i = 0; i < type.length; i++) {
              if (i > 0) {
                beginning = "Additionally, there";
                ending = " there as well.";
              }
              if (type[i] == "confirmed") agent.add(beginning + ` are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19` + ending);
              else if (type[i] == "deaths") agent.add(beginning + ` are currently ${realNum(result.latest.deaths)} deaths due to COVID-19` + ending);
              else if (type[i] == "recovered") agent.add(beginning + ` are currently ${realNum(result.latest.recovered)} people who have recovered from COVID-19` + ending);             
            }
          }
        }).catch((error) => {
          console.log(error);
        });
      }
      else {
        console.log("WOOOO"); // e.g. // https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=jhu&country_code=FR
        return getJSON(`https://coronavirus-tracker-api.ruizlab.org/v2/locations?source=jhu&country_code=${country}`).then((result) => {
          if (all|| type.length >= 3) {
            agent.add(`In ${result.locations[0].country}, there are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19, ${realNum(result.latest.deaths)} deaths, and ${realNum(result.latest.recovered)} people who have recovered from COVID-19.`);
          }
          else {
            let beginning = `In ${result.locations[0].country}, there`;
            let ending = ".";
            for (let i = 0; i < type.length; i++) {
              if (i > 0) {
                beginning = "Additionally, there";
                ending = " there as well.";
              }
              if (type[i] == "confirmed") agent.add(beginning + ` are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19` + ending);
              else if (type[i] == "deaths") agent.add(beginning + ` are currently ${realNum(result.latest.deaths)} deaths due to COVID-19` + ending);
              else if (type[i] == "recovered") agent.add(beginning + ` are currently ${realNum(result.latest.recovered)} people who have recovered from COVID-19` + ending);             
            }
          }
        }).catch((error) => {
          console.log(error);
        });
      }
    }
    else if (state != null) {
      return getJSON(`https://coronavirus-tracker-api.ruizlab.org/v2/locations?source=csbs&province=${state}`).then((result) => {
        if (all|| type.length >= 3) {
          agent.add(`In ${result.locations[0].province}, there are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19, ${realNum(result.latest.deaths)} deaths, and ${realNum(result.latest.recovered)} people who have recovered from COVID-19.`);
        }
        else {
          let beginning = `In ${result.locations[0].province}, there`;
          let ending = ".";
          for (let i = 0; i < type.length; i++) {
            if (i > 0) {
              beginning = "Additionally, there";
              ending = " there as well.";
            }
            if (type[i] == "confirmed") agent.add(beginning + ` are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19` + ending);
            else if (type[i] == "deaths") agent.add(beginning + ` are currently ${realNum(result.latest.deaths)} deaths due to COVID-19` + ending);
            else if (type[i] == "recovered") agent.add(beginning + ` are currently ${realNum(result.latest.recovered)} people who have recovered from COVID-19` + ending);             
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    }
    else if (all) {
      return getJSON('https://coronavirus-tracker-api.ruizlab.org/v2/latest?source=jhu').then((result) => {
        agent.add(`There are currently ${realNum(result.latest.confirmed)} confirmed cases of COVID-19, ${realNum(result.latest.deaths)} deaths, and ${realNum(result.latest.recovered)} people who have recovered from COVID-19.`);
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Worldwide Latest Stats', worldwideLatestStats);
  intentMap.set('Location Latest Stats', locationLatestStats);
  agent.handleRequest(intentMap);
});
