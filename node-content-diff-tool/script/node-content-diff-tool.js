define(function(require, exports, module) {
    var $ = require("jquery");
    $(document).on('cloudcms-ready', function(event) {
        console.log('You are here');
    });
});