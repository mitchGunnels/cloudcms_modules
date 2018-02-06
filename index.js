define(function(require) {

    var UI = require("ui");
    var moduleId = module.uri.match(/^.+(_modules[^\/]+)\/.*/)[1];

    // register the theme: "cloud-cms-theme"
    UI.registerTheme({
        "key": "cloud-cms-theme",
        "title": "Cricket Theme",
        "module": moduleId + "/theme.js"
    });

});