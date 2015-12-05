/*
 * co-work
 * https://github.com/thiagoh/co-work
 *
 * Copyright (c) 2015 Thiago Andrade
 * Licensed under the MIT license.
 */

(function(exports) {

	'use strict';

	var work = function work(slots, routines, argsArray, callback) {

		if (typeof routines === 'undefined' || routines === null) {
			throw new Error('Routines must be defined');

		} else if (typeof routines === 'function') {
			routines = [routines];
		}

		if (routines.length <= 0) {
			return;
		}

		slots = typeof slots === 'string' ? parseInt(slots, 10) : slots;

		if (isNaN(slots) === true) {
			throw new Error('Invalid slots');
		} else if (slots < 0) {
			throw new Error('Invalid slots. It must be positive');
		} else if (slots === 0) {
			throw new Error('Invalid slots. It must be at least 1');
		}

		argsArray = typeof argsArray === 'undefined' || Object.prototype.toString.call(argsArray) !== '[object Array]' ? [] : argsArray;

		var queue = [],
			index,
			iterations = Math.max(routines.length, argsArray.length),
			remaining = iterations,
			executeNext = function() {
				var obj = queue.shift();
				
				--remaining;

				if (typeof obj === 'undefined' && queue.length <= 0) {
					if (remaining === 0) {
						if (typeof callback === 'function') {
							callback();
						}
					}
					return;
				}

				run(obj.command, obj.arg);
			},
			run = function(command, arg) {

				var result = command.call(null, arg);

				if (typeof result === 'undefined') {
					executeNext();
				} else {
					var then = result['finally'] || result['fin'] || result['then'];
					if (typeof then === 'function') {
						then.call(result, function() {
							executeNext();
						});
					} else {
						executeNext();
					}
				}

			};

		slots = Math.min(slots, iterations);

		for (index = slots; index < iterations; index++) {
			queue.push({
				command: routines[index] || routines[0],
				arg: (argsArray || [])[index],
				index: index
			});
		}
		for (index = 0; index < slots; index++) {
			run(routines[index] || routines[0], (argsArray || [])[index]);
		}
	};

	exports.work = work;
	exports.batch = work;

}(typeof exports === 'object' && exports || this));