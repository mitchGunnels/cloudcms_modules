define(function(require, exports, module) {
    var $ = require("jquery");

    $(document).ajaxStop(function() {
        // 0 === $.active
        //Have to wait for ajax to stop and render page...delay 1ms for render.
        setTimeout(function() {
            var inputVal = $('div[name=previewURL]').text();
            console.log(inputVal);
        }, 1);

    });


});