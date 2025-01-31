require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

const cactusNameStore = {};

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

// * Code for Route 1 goes here
app.get('/', async (req, res) => {
    const getCustomCactus = 'https://api.hubapi.com/crm/v3/objects/cacti?properties=name,shape,blooming_habits';
    const headers = {
	Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
	'Content-Type': 'application/json'
    };
    try {
	const response = await axios.get(getCustomCactus, { headers });
	const data = response.data.results;
	await data.forEach(cactus => {
	    cactusNameStore[cactus.properties.name] = cactus.id;
	});
	res.render('homepage', { title: "Home", data, cactusNameStore });
    } catch (error) {
	console.error(error);
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

// * Code for Route 2 goes here
app.get('/update-cobj', async (req, res) => {
    const name = req.query.name;
    res.render('updates', { title: "Update Custom Object Form | Integrating With HubSpot I Practicum", name: name});
});
// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

// * Code for Route 3 goes here
app.post('/update-cobj', async (req, res) => {
    const cactusName = req.body.cactusName;
    if (cactusNameStore.hasOwnProperty(cactusName)) {
	// cactus name found, update existing record
	const updateCactus = `https://api.hubapi.com/crm/v3/objects/cacti/${cactusNameStore[cactusName]}`;
	const headers = {
	    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
	    'Content-Type': 'application/json'
	};
	const update = {
	    properties: {
		"shape": req.body.cactusShape,
		"blooming_habits": req.body.bloomingHabits
	    }
	};

	try {
	    await axios.patch(updateCactus, update, { headers });
	} catch(error) {
	    console.error(error);
	}
    } else {
	// cactus name not found, create new record
	const createCactus = 'https://api.hubapi.com/crm/v3/objects/cacti';
	const headers = {
	    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
	    'Content-Type': 'application/json'
	};
	const cactusSchema = {
	    properties: {
		'name': req.body.cactusName,
		'shape': req.body.cactusShape,
		'blooming_habits': req.body.bloomingHabits
	    }
	};

	try {
	    await axios.post(createCactus, cactusSchema, { headers });
	} catch(error) {
	    console.error(error);
	}
    }
    res.redirect('/');
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));
