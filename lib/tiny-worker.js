/*
 * tiny-worker
 * https://github.com/thiagoh/tiny-worker
 *
 * Copyright (c) 2015 Thiago Andrade
 * Licensed under the MIT license.
 */

(function(exports) {

	'use strict';

	var work = function work(slots, commands, argsArray) {

		if (typeof commands === 'undefined' || commands === null) {
			throw new Error('Commands must be defined');

		} else if (typeof commands === 'function') {
			commands = [commands];
		}

		if (commands.length <= 0) {
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
			iterations = Math.max(commands.length, argsArray.length),
			executeNext = function() {
				var obj = queue.shift();

				if (typeof obj === 'undefined' && queue.length <= 0) {
					return;
				}

				run(obj.command, obj.argsArray, obj.index);
			},
			run = function(command, argsArray, index) {

				var result = command.apply(null, argsArray);

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
				command: commands[index] || commands[0],
				argsArray: (argsArray || [])[index] || [],
				index: index
			});
		}
		for (index = 0; index < slots; index++) {
			run(commands[index] || commands[0], (argsArray || [])[index] || [], index);
		}
	};

	exports.work = work;

}(typeof exports === 'object' && exports || this));