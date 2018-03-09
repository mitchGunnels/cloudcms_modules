define(function(require, exports, module) {
    var uri = module.uri;
    uri = uri.substring(0, uri.lastIndexOf('/'));
    console.log(uri);

    CKEDITOR.config.allowedContent = {
        $1: {
            // Use the ability to specify elements as an object.
            elements: CKEDITOR.dtd,
            attributes: true,
            styles: false,
            classes: true
        }
    };
    
    CKEDITOR.config.toolbar = [
        { name: 'clipboard', items: ['Undo', 'Redo'] },
        { name: 'styles', items: ['Styles', 'Format'] },
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote'] },
        { name: 'links', items: ['Link', 'Unlink'] },
        { name: 'insert', items: ['Image', 'EmbedSemantic', 'Table'] },
        { name: 'tools', items: ['Maximize'] },
        { name: 'editing', items: ['Scayt'] }
    ];

    CKEDITOR.config.extraPlugins = '';
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    CKEDITOR.config.pasteFromWordRemoveStyles = true;
    CKEDITOR.config.pasteFromWordRemoveFontStyles = true;
    CKEDITOR.config.entities_processNumerical = true;
    CKEDITOR.config.disallowedContent = 'script; style; *[on*, border, width, height, cellpadding, valign, cellspacing, font, style]; *{*}';

});