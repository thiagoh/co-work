'use strict';

var worker = require('../lib/co-work.js'),
	Q = require('q'),
	argsArray = [
		['foo'],
		['bar'],
		['baz'],
		['qux'],
		['quux'],
		['garply'],
		['waldo'],
		['fred'],
		['plugh'],
		['xyzzy'],
		['thud']
	];

// Run no more than three concurrently
worker.work(3, function(param1) {

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