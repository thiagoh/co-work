'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var worker = require('../lib/co-work.js'),
    Q = require('q'),
    sleep = function(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e10; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    },
    times = function(n, command) {
        var accum = [];
        for (var i = 0; i < n; i++) {
            accum.push(command(i));
        }
        return accum;
    },
    fillWithIntegers = function(n) {
        var accum = [];
        for (var i = 0; i < n; i++) {
            accum.push(i);
        }
        return accum;
    },
    test_work_x_commands_async = function(test, max_workers_same_time, count_workers_to_be_executed, testOpts) {

        var count_workers_to_be_executed_test = count_workers_to_be_executed,
            count_workers_same_time = 0,
            getCommand = function() {

                return function() {

                    var deferred = Q.defer(),
                        promise = deferred.promise;

                    ++count_workers_same_time;

                    setTimeout(function() {

                        test.ok(count_workers_same_time <= max_workers_same_time,
                            "More workers than permitted. " + count_workers_same_time +
                            " workers are running when should be only " + max_workers_same_time);

                        sleep(5);
                        --count_workers_same_time;
                        --count_workers_to_be_executed_test;
                        deferred.resolve();
                    }, 10);

                    return promise;
                };
            },
            commands = times(count_workers_to_be_executed, getCommand);

        test.ok(commands.length === count_workers_to_be_executed,
            "It should exist " + count_workers_to_be_executed + " commands");

        var fn = worker.work;

        if (typeof testOpts === 'object') {
            if (typeof testOpts.fnName === 'string') {
                fn = worker[testOpts.fnName];
            }
        }

        fn(max_workers_same_time, commands, function() {

            // test callback

            if (count_workers_to_be_executed_test === 0) {
                test.done();
            }
        });

        test.expect(count_workers_to_be_executed + 1);

        if (count_workers_to_be_executed_test === 0) {
            test.done();
        }
    },
    generateAsyncCommand = function(test, wrapper) {

        return function(value) {

            if (typeof wrapper.output !== 'undefined') {
                wrapper.output.push(value);
            }

            ++wrapper.count_workers_same_time;

            var deferred = Q.defer(),
                promise = deferred.promise;

            setTimeout(function() {

                test.ok(wrapper.count_workers_same_time <= wrapper.max_workers_same_time,
                    "More workers than permitted. " + wrapper.count_workers_same_time +
                    " workers are running when should be only " + wrapper.max_workers_same_time);

                --wrapper.count_workers_same_time;
                --wrapper.count_workers_to_be_executed;

                deferred.resolve();

            }, 10);

            return promise;
        };
    };

exports['work'] = {
    setUp: function(done) {
        // setup here
        done();
    },
    'test_null_command': function(test) {

        test.throws(function() {
            worker.work(-1, null);
        }, "Cannot accept negative slots");

        test.throws(function() {
            worker.work(0, null);
        }, "Cannot accept 0 slots");

        test.throws(function() {
            worker.work(1, null);
        }, "Cannot accept null commands");

        test.done();
    },
    'test_undefined_command': function(test) {

        test.throws(function() {
            worker.work(-1, undefined);
        }, "Cannot accept negative slots");

        test.throws(function() {
            worker.work(0, undefined);
        }, "Cannot accept 0 slots");

        test.throws(function() {
            worker.work(1, undefined);
        }, "Cannot accept undefined commands");

        test.done();
    },
    'test_edge_slots': function(test) {

        var getCommand = function() {
            return function() {};
        };

        test.throws(function() {
            worker.work(-1, getCommand());
        }, "Cannot accept negative slots");

        test.throws(function() {
            worker.work(0, getCommand());
        }, "Cannot accept 0 slots");

        test.done();
    },
    'test_work_command_argsArrayFilled_async': function(test) {

        var count_workers_to_be_executed = 1000,
            argsArray = fillWithIntegers(count_workers_to_be_executed),
            config = {
                max_workers_same_time: 100,
                count_workers_same_time: 0,
                count_workers_to_be_executed: count_workers_to_be_executed,
                output: [],
                input: argsArray
            },
            command = generateAsyncCommand(test, config);

        test.ok(argsArray.length === config.count_workers_to_be_executed,
            "It should exist " + config.count_workers_to_be_executed + " commands");

        worker.work(config.max_workers_same_time, command, argsArray, function() {

            // test callback

            if (config.count_workers_to_be_executed === 0) {

                if (typeof config.input !== 'undefined') {

                    config.output.sort();
                    config.input.sort();

                    test.equal(config.output.length, config.input.length, "Input parameter's length should be equal to output parameter's length");

                    for (var i = 0; i < config.output.length; i++) {
                        test.equal(config.output[i], config.input[i], "Input parameters should be equal to output");
                    }
                }

                test.done();
            }
        });
        test.expect(config.count_workers_to_be_executed * 2 + 2);
    },
    'test_work_1000_commands_sync': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 1000,
            count_workers_to_be_executed_test = count_workers_to_be_executed,
            count_workers_same_time = 0,
            getCommand = function() {

                return function() {

                    ++count_workers_same_time;

                    test.ok(count_workers_same_time <= max_workers_same_time,
                        "More workers than permitted. " + count_workers_same_time +
                        " workers are running when should be only " + max_workers_same_time);

                    --count_workers_same_time;

                    if (--count_workers_to_be_executed_test === 0) {
                        test.done();
                    }
                };
            },
            commands = times(count_workers_to_be_executed, getCommand);

        test.ok(commands.length === count_workers_to_be_executed, "It should exist " + count_workers_to_be_executed + " commands");
        worker.work(max_workers_same_time, commands);
        test.expect(count_workers_to_be_executed + 1);
    },
    'test_work_0_commands_async': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 0;

        test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
    },
    'test_work_99_commands_async': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 99;

        test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
    },
    'test_work_100_commands_async': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 100;

        test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
    },
    'test_work_1000_commands_async': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 1000;

        test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed);
    },
    'test_batch_0_commands_async': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 0;

        test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed, {
            fnName: 'batch'
        });
    },
    'test_batch_99_commands_async': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 99;

        test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed, {
            fnName: 'batch'
        });
    },
    'test_batch_100_commands_async': function(test) {

        var max_workers_same_time = 100,
            count_workers_to_be_executed = 100;

        test_work_x_commands_async(test, max_workers_same_time, count_workers_to_be_executed, {
            fnName: 'batch'
        });
    }
};