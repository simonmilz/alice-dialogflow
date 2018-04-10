'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const Queue = require('bull');

const config = functions.config();
const JamesQueue = new Queue(config.queue.name, config.queue.uri);

process.env.DEBUG = 'dialogflow:debug';

exports.jamesFulfillment = functions.https.onRequest((request, response) => {
	const agent = new WebhookClient({ request, response });
	console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

	function welcome(agent) {
		agent.add(`Welcome to my agent!`);
	}

	function fallback(agent) {
		agent.add(`I didn't understand`);
		agent.add(`I'm sorry, can you try again?`);
	}

	// Uncomment and edit to make your own intent handler
	// uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
	// below to get this function to be run when a Dialogflow intent is matched
	function sendToQueue(agent) {
		JamesQueue.add(request.body);
		agent.add(request.body.result.fulfillment.speech);
	}

	// Run the proper function handler based on the matched Dialogflow intent name
	let intentMap = new Map();

	['sony.power.on', 'sony.power.off'].forEach(function(intent) {
		intentMap.set(intent, sendToQueue);
	});

	intentMap.set('Default Welcome Intent', welcome);
	intentMap.set('Default Fallback Intent', fallback);

	agent.handleRequest(intentMap);
});