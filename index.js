define(function(require) {

    var UI = require("ui");
    var moduleId = module.uri.match(/^.+(_modules[^\/]+)\/.*/)[1];

    // register the theme: "cricket"
    UI.registerTheme({
        "key": "cricket",
        "title": "Cricket",
        "module": moduleId + "/theme.js"
    });

});