[![view on npm](http://img.shields.io/npm/v/co-work.svg)](https://www.npmjs.org/package/co-work)
[![npm module downloads](http://img.shields.io/npm/dt/co-work.svg)](https://www.npmjs.org/package/co-work)

<a name="module_co-work"></a>
# co-work

The tinest `work` library for JavaScript ever.

## Getting Started
### On the server
Install the module with: `npm install co-work`

```javascript
var worker = require('co-work');
worker.work(slots, routines, argsArray); 
```

### In the browser
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/thiagoh/co-work/master/dist/co-work.min.js
[max]: https://raw.github.com/thiagoh/co-work/master/dist/co-work.js

In your web page:

```html
<script src="dist/co-work.min.js"></script>
<script>
worker.work(slots, routines, argsArray);
</script>
```

In your code, you can attach co-work's methods to any object.

```html
<script>
var exports = Bocoup.utils;
</script>
<script src="dist/co-work.min.js"></script>
<script>
Bocoup.utils.work(slots, routines, argsArray);
</script>
```

## Examples

The example bellow will execute the function `asyncJob` for `argsArray.length` times. Each time with a position from the `argsArray`. In this case, the `work` function guarantees that no more than three routines are executed concurrently. 

```js

var worker = require('co-work.js'),
    Q = require('q'),
    argsArray = [['foo'],['bar'],['baz'],['qux'],['quux'],
        ['garply'],['waldo'],['fred'],['plugh'],['xyzzy'],['thud']],
    asyncRoutine = function(param1) {
    
        var deferred = Q.defer(), promise = deferred.promise;
    
        setTimeout(function() {
            console.log(param1 + ': This command is running asynchronously');
            deferred.resolve(param1);
        }, 1);

        // required to return a promise
        return promise;
    };
// Run no more than three concurrently
worker.work(3, asyncRoutine, argsArray);
```

 This is specially useful for routines like, reading many files asynchronously, in order to avoid [EMFILE, too many open files 1](http://stackoverflow.com/questions/8965606/node-and-error-emfile-too-many-open-files) or [EMFILE, too many open files 2](http://stackoverflow.com/questions/19981065/nodejs-error-emfile-too-many-open-files-on-mac-for) os example. 

### Deferred! return a promise object  

Always remember to return a `promise` object from your async function. In order to kwnow when your routine is done, Co-Work will require you return a promise object like [Q's promise](https://github.com/kriskowal/q), [jQuery.Deferred()'s promise](https://api.jquery.com/category/deferred-object/), or another one that implements this pattern.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History

0.1.0 Initial release

## License
Copyright (c) 2015 Thiago Andrade  
Licensed under the MIT license.
