'use strict';

var worker = require('../lib/co-work.js'),
	Q = require('q'),
	countWorkersToBeExecuted = 100,
	argsArray = [];

for (var i = 0; i < countWorkersToBeExecuted; i++) {
	argsArray.push([i]);
}

// Run no more than ten concurrently
worker.work(10, function(param1) {

	var deferred = Q.defer(),
		promise = deferred.promise;

	setTimeout(function() {

		console.log(param1 + ': This command is running asynchronously');
		deferred.resolve(param1);

	}, 1);

	promise.then(function(result) {
		console.log(result + ': has finished');
	});

	return promise;
}, argsArray);