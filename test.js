'use strict';

const bent = require('bent');

const getJSON = bent('json');

getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/latest?source=jhu').then((result) => {
    console.log(result.latest.confirmed);
}).catch((error) => {
    console.error(error);
});