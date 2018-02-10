define(function(require, exports, module) {
    var $ = require("jquery");
    $(document).ajaxStop(function() {
        //Check workspace-picker to determine the appropriate env for creating the preview link.
        var workspacePickerVal = $('select.workspace-picker option:selected').val();
        //Decide on the correct environment
        if (workspacePickerVal.contains("master")) {
            console.log("prod");
        } else if (workspacePickerVal.contains("SIT1")) {
            console.log("SIT1");
        } else {
            console.log("Nothing found");
        }

        //Must delay for page render after ajax finishes. 
        setTimeout(function() {
            var inputVal = $('div[name=previewURL]').text();
            console.log(inputVal);
        }, 2000);
    });
});