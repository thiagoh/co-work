/*
 * co-work
 * https://github.com/thiagoh/co-work
 *
 * Copyright (c) 2015 Thiago Andrade
 * Licensed under the MIT license.
 */

(function(exports) {

	'use strict';

	var work = function work(slots, routines, args) {

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

		args = typeof args === 'undefined' || Object.prototype.toString.call(args) !== '[object Array]' ? [] : args;

		var queue = [],
			iterations = Math.max(routines.length, args.length),
			executeNext = function() {
				var obj = queue.shift();

				if (typeof obj === 'undefined' && queue.length <= 0) {
					return;
				}

				run(obj.command, obj.arg, obj.index);
			},
			run = function(command, arg, index) {

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

			},
			index;

		slots = Math.min(slots, iterations);

		for (index = slots; index < iterations; index++) {
			queue.push({
				command: routines[index] || routines[0],
				arg: (args || [])[index],
				index: index
			});
		}
		for (index = 0; index < slots; index++) {
			run(routines[index] || routines[0], (args || [])[index], index);
		}
	};

	exports.work = work;
	exports.batch = work;

}(typeof exports === 'object' && exports || this));