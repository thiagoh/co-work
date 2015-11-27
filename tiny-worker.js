var work = function work(slots, commands, argsArray) {

    if (typeof commands === 'undefined') {
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
    }

    slots = Math.min(slots, commands.length);

    var queue = [],
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
        n = commands.length,
        index;

    for (index = slots; index < n; index++) {
        queue.push({
            command: commands[index],
            argsArray: (argsArray || [])[index] || [],
            index: index
        });
    }
    for (index = 0; index < slots; index++) {
        run(commands[index], (argsArray || [])[index] || [], index);
    }
};

module.exports = {
    work: work
};