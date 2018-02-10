define(function(require, exports, module) {

    var $ = require("jquery");

    var inputVal = $('div[name=previewURL]').text();

    $(document).ajaxStop(function() {
        // 0 === $.active
        console.log(inputVal);
    });


});