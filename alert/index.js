define(function(require, exports, module) {
	var moduleId = module.uri.match(/^.+(_modules[^\/]+)\/.*/)[1];
	console.log('module', module);
    require("./test/alert.js");
});
