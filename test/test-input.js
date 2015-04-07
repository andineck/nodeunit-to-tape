var async = require('../series');

if (!Function.prototype.bind) {
    Function.prototype.bind = function (thisArg) {
        var args = Array.prototype.slice.call(arguments, 1);
        var self = this;
        return function () {
            self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
        }
    };
}

function eachIterator(args, x, callback) {
    setTimeout(function(){
        args.push(x);
        callback();
    }, x*25);
}

function mapIterator(call_order, x, callback) {
    setTimeout(function(){
        call_order.push(x);
        callback(null, x*2);
    }, x*25);
}

function filterIterator(x, callback) {
    setTimeout(function(){
        callback(x % 2);
    }, x*25);
}

function detectIterator(call_order, x, callback) {
    setTimeout(function(){
        call_order.push(x);
        callback(x == 2);
    }, x*25);
}

function eachNoCallbackIterator(test, x, callback) {
    test.equal(x, 1);
    callback();
    test.done();
}

function getFunctionsObject(call_order) {
    return {
        one: function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 125);
        },
        two: function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 200);
        },
        three: function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 50);
        }
    };
}

exports['series function alias'] = function(test){
  var call_order = [];
  async([
      function(callback){
        setTimeout(function(){
          call_order.push(1);
          callback(null, 1);
        }, 25);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(2);
          callback(null, 2);
        }, 50);
      },
      function(callback){
        setTimeout(function(){
          call_order.push(3);
          callback(null, 3,3);
        }, 15);
      }
    ],
    function(err, results){
      test.equals(err, null);
      test.same(results, [1,2,[3,3]]);
      test.same(call_order, [1,2,3]);
      test.done();
    });
};

exports['series'] = function(test){
    var call_order = [];
    async.series([
        function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    ],
    function(err, results){
        test.equals(err, null);
        test.same(results, [1,2,[3,3]]);
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['series empty array'] = function(test){
    async.series([], function(err, results){
        test.equals(err, null);
        test.same(results, []);
        test.done();
    });
};

exports['series error'] = function(test){
    test.expect(1);
    async.series([
        function(callback){
            callback('error', 1);
        },
        function(callback){
            test.ok(false, 'should not be called');
            callback('error2', 2);
        }
    ],
    function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 100);
};

exports['series no callback'] = function(test){
    async.series([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
};

exports['series object'] = function(test){
    var call_order = [];
    async.series(getFunctionsObject(call_order), function(err, results){
        test.equals(err, null);
        test.same(results, {
            one: 1,
            two: 2,
            three: [3,3]
        });
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['series call in another context'] = function(test) {
    if (typeof process === 'undefined') {
        // node only test
        test.done();
        return;
    }
    var vm = require('vm');
    var sandbox = {
        async: async,
        test: test
    };

    var fn = "(" + (function () {
        async.series([function (callback) {
            callback();
        }], function (err) {
            if (err) {
                return test.done(err);
            }
            test.done();
        });
    }).toString() + "())";

    vm.runInNewContext(fn, sandbox);
};

exports['eachSeries'] = function(test){
    var args = [];
    async.eachSeries([1,3,2], eachIterator.bind(this, args), function(err){
        test.same(args, [1,3,2]);
        test.done();
    });
};

exports['eachSeries empty array'] = function(test){
    test.expect(1);
    async.eachSeries([], function(x, callback){
        test.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['eachSeries error'] = function(test){
    test.expect(2);
    var call_order = [];
    async.eachSeries([1,2,3], function(x, callback){
        call_order.push(x);
        callback('error');
    }, function(err){
        test.same(call_order, [1]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['eachSeries no callback'] = function(test){
    async.eachSeries([1], eachNoCallbackIterator.bind(this, test));
};

exports['forEachSeries alias'] = function (test) {
    test.strictEqual(async.eachSeries, async.forEachSeries);
    test.done();
};

exports['mapSeries'] = function(test){
    var call_order = [];
    async.mapSeries([1,3,2], mapIterator.bind(this, call_order), function(err, results){
        test.same(call_order, [1,3,2]);
        test.same(results, [2,6,4]);
        test.done();
    });
};

exports['mapSeries error'] = function(test){
    test.expect(1);
    async.mapSeries([1,2,3], function(x, callback){
        callback('error');
    }, function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};
