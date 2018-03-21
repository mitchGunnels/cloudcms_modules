define(function(require) {

    var r = {};

    r.install = function(observableHolder, project, callback) {

    	console.log('v1');
        // TODO: any functions that you want to run on install

        callback();
    };

    return r;
});