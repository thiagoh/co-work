var tinyWorker = require('./tiny-worker.js'),
	Q = require('q'),
	sleep = function sleep(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e10; i++) {
			if ((new Date().getTime() - start) > milliseconds) {
				break;
			}
		}
	},
	times = function(n, command) {
		var accum = Array(Math.max(0, n));
		for (var i = 0; i < n; i++) accum[i] = command(i);
		return accum;
	};

module.exports.test_work_1000_commands_sync = function(test) {

	var max_workers_same_time = 100,
		count_workers_to_be_executed = 1000,
		count_workers_to_be_executed_test = count_workers_to_be_executed,
		count_workers_same_time = 0,
		getCommand = function(i) {

			return function() {

				++count_workers_same_time;

				test.ok(count_workers_same_time <= max_workers_same_time, "More workers than permitted. " + count_workers_same_time + " workers are running when should be only " + max_workers_same_time);
				sleep(5);
				--count_workers_same_time;
				if (--count_workers_to_be_executed_test === 0) {
					test.done();
				}
			};
		},
		commands = times(count_workers_to_be_executed, getCommand);

	test.ok(commands.length === count_workers_to_be_executed, "It should exist " + count_workers_to_be_executed + " commands");
	tinyWorker.work(max_workers_same_time, commands);
	test.expect(count_workers_to_be_executed + 1);
};

var test_work_x_commands_async = function(test, max_workers_same_time, count_workers_to_be_executed) {

	var count_workers_to_be_executed_test = count_workers_to_be_executed,
		count_workers_same_time = 0,
		getCommand = function(i) {

			return function() {

				var deferred = Q.defer(),
					promise = deferred.promise;

				++count_workers_same_time;

				setTimeout(function() {
					test.ok(count_workers_same_time <= max_workers_same_time, "More workers than permitted. " + count_workers_same_time + " workers are running when should be only " + max_workers_same_time);
					sleep(5);
					deferred.resolve(--count_workers_same_time);
					if (--count_workers_to_be_executed_test === 0) {
						test.done();
					}
				}, 10);

				return promise;
			};
		},
		commands = times(count_workers_to_be_executed, getCommand);

	test.ok(commands.length === count_workers_to_be_executed, "It should exist " + count_workers_to_be_executed + " commands");
	tinyWorker.work(max_workers_same_time, commands);
	test.expect(count_workers_to_be_executed + 1);
	if (count_workers_to_be_executed_test === 0) {
		test.done();
	}
};

module.exports.test_work_0_commands_async = function(test) {

	var max_workers_same_time = 100,
		count_workers_to_be_executed = 0;

	test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
};

module.exports.test_work_99_commands_async = function(test) {

	var max_workers_same_time = 100,
		count_workers_to_be_executed = 99;

	test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
};

module.exports.test_work_100_commands_async = function(test) {

	var max_workers_same_time = 100,
		count_workers_to_be_executed = 100;

	test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
};

module.exports.test_work_1000_commands_async = function(test) {

	var max_workers_same_time = 100,
		count_workers_to_be_executed = 1000;

	test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
};


// module.exports.testSomething = function(test) {
// test.expect(1);
// test.ok(true, "this assertion should pass");
// test.done();
// };
// 
// module.exports.testSomethingElse = function(test) {
// test.ok(false, "this assertion should fail");
// test.done();
// };