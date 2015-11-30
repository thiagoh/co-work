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

var tinyWorker = require('../lib/tiny-worker.js'),
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
  test_work_x_commands_async = function(test, max_workers_same_time, count_workers_to_be_executed) {

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
            deferred.resolve(--count_workers_same_time);
            if (--count_workers_to_be_executed_test === 0) {
              test.done();
            }
          }, 10);

          return promise;
        };
      },
      commands = times(count_workers_to_be_executed, getCommand);

    test.ok(commands.length === count_workers_to_be_executed,
      "It should exist " + count_workers_to_be_executed + " commands");

    tinyWorker.work(max_workers_same_time, commands);

    test.expect(count_workers_to_be_executed + 1);

    if (count_workers_to_be_executed_test === 0) {
      test.done();
    }
  },
  getAsyncCommand = function(test, wrapper) {

    return function() {

      ++wrapper.count_workers_same_time;

      var deferred = Q.defer(),
        promise = deferred.promise;

      setTimeout(function() {

        test.ok(wrapper.count_workers_same_time <= wrapper.max_workers_same_time,
          "More workers than permitted. " + wrapper.count_workers_same_time +
          " workers are running when should be only " + wrapper.max_workers_same_time);

        deferred.resolve(--wrapper.count_workers_same_time);

        if (--wrapper.count_workers_to_be_executed === 0) {
          test.done();
        }
      }, 10);

      return promise;
    };
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


exports['work'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'test_null_command': function(test) {

    test.throws(function() {
      tinyWorker.work(-1, null);
    }, "Cannot accept negative slots");

    test.throws(function() {
      tinyWorker.work(0, null);
    }, "Cannot accept 0 slots");

    test.throws(function() {
      tinyWorker.work(1, null);
    }, "Cannot accept null commands");

    test.done();
  },
  'test_undefined_command': function(test) {

    test.throws(function() {
      tinyWorker.work(-1, undefined);
    }, "Cannot accept negative slots");

    test.throws(function() {
      tinyWorker.work(0, undefined);
    }, "Cannot accept 0 slots");

    test.throws(function() {
      tinyWorker.work(1, undefined);
    }, "Cannot accept undefined commands");

    test.done();
  },
  'test_edge_slots': function(test) {

    var getCommand = function() {
      return function() {};
    };

    test.throws(function() {
      tinyWorker.work(-1, getCommand());
    }, "Cannot accept negative slots");

    test.throws(function() {
      tinyWorker.work(0, getCommand());
    }, "Cannot accept 0 slots");

    test.done();
  },
  'test_work_command_argsArrayFilled_async': function(test) {

    var config = {
        max_workers_same_time: 100,
        count_workers_same_time: 0,
        count_workers_to_be_executed: 1000
      },
      command = getAsyncCommand(test, config),
      argsArray = repeat(config.count_workers_to_be_executed, []);

    test.ok(argsArray.length === config.count_workers_to_be_executed,
      "It should exist " + config.count_workers_to_be_executed + " commands");

    tinyWorker.work(config.max_workers_same_time, command, argsArray);
    test.expect(config.count_workers_to_be_executed + 1);
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
    tinyWorker.work(max_workers_same_time, commands);
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
  }
};