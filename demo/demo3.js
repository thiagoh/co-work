'use strict';

var worker = require('../lib/co-work.js'),
	Q = require('q'),
	times = function(n, command) {
		var accum = [];
		for (var i = 0; i < n; i++) {
			accum.push(command(i));
		}
		return accum;
	},
	repeat = function(n, array) {
		var accum = [];
		for (var i = 0; i < n; i++) {
			accum.push([].slice.call(array, 0));
		}
		return accum;
	},
	generateAsyncCommand = function() {

		return function(param1) {

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
		};
	},
	maximumWorkersAtTheSameTime = 10,
	countWorkersToBeExecuted = 100,
	argsArray = [];

for (var i = 0; i < countWorkersToBeExecuted; i++) {
	argsArray.push([i]);
}

worker.work(maximumWorkersAtTheSameTime, generateAsyncCommand(), argsArray);