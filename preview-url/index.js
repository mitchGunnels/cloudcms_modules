define(function(require, exports, module) {
	//var moduleId = module.uri.match(/^.+(_modules[^\/]+)\/.*/)[1];
	console.log('module', module);

	var UI = require("ui");
	console.log(UI.showModal);

	UI.showModal({
		"title":"test"
	});

    require("./script/preview.js");
});
