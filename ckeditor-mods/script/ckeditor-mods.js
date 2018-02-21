define(function(require, exports, module) {
    //var $ = require("jquery");
    CKEDITOR.config.allowedContent = {
        $1: {
            // Use the ability to specify elements as an object.
            elements: CKEDITOR.dtd,
            attributes: true,
            styles: true,
            classes: true
        }
    };
    CKEDITOR.config.disallowedContent = 'script; style';
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    //CKEDITOR.config.pasteFromWordCleanupFile = 'plugins/pastefromword/filter/custom.js';
    CKEDITOR.config.pasteFromWordPromptCleanup = true;
});