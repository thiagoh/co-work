'use strict';

var worker = require('../lib/co-work.js'),
	Q = require('q'),
	fillWithIntegers = function(n) {
		var accum = [];
		for (var i = 0; i < n; i++) {
			accum.push(i);
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
	argsArray = fillWithIntegers(countWorkersToBeExecuted);

worker.work(maximumWorkersAtTheSameTime, generateAsyncCommand(), argsArray,
	function() {
		console.log('Callback at the end');
	});