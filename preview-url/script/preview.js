define(function(require, exports, module) {

    var $ = require("jquery");

    var inputVal = $('input[name=previewURL]')[0];

    $(document).ajaxStop(function() {
        // 0 === $.active
        console.log(inputVal);
    });


});