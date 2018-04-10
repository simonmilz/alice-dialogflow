'use strict';

const functions = require('firebase-functions');
const Queue = require('bull');

const config = functions.config();
const JamesQueue = new Queue(config.queue.name, config.queue.uri);

process.env.DEBUG = 'dialogflow:debug';

exports.jamesFulfillment = functions.https.onRequest((request, response) => {
	console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

	if ('james.tv' === request.body.result.action) {
		return JamesQueue.add(request.body).then(function() {
			response.send({
				speech: request.body.result.fulfillment.speech,
				text: request.body.result.fulfillment.speech
			});
		});
	}
});