define(function(require, exports, module) {
    var $ = require("jquery");
    $(document).ajaxStop(function() {
        // 0 === $.active
        //Must delay for page render after ajax finishes. 
        setTimeout(function() {
            var inputVal = $('div[name=previewURL]').text();
            console.log(inputVal);
        }, 2000);
    });
});