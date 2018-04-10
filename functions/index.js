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

	if ('james.tv' === request.body.result.action) {
		return JamesQueue.add(request.body).then(function() {
			agent.add(request.body.result.fulfillment.speech);
		});
	} else {
		agent.add('Ich verstehe deine Frage leider nicht.');
		agent.add('Entschuldige bitte, ich habe deine Frage nicht verstanden.');
		agent.add('Ich bin nicht so sicher, ob ich dich richtig verstanden habe.');
	}
});