define(function(require, exports, module) {

    var UI = require("ui");
    
    var moduleId = UI.extractModuleID(module.uri);
    
    // register the theme: "cricket"
    UI.registerTheme({
        "key": "cricket",
        "title": "Cricket",
        "module": "_modules/" + moduleId + "/cricket-theme.js"
    });

});