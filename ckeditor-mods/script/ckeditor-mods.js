define(function(require, exports, module) {
    var modalHtml = '<div id="myModal" class="fade modal"role=dialog tabindex=-1><div class=modal-dialog role=document><div class=modal-content><div class=modal-header><button class=close type=button data-dismiss=modal aria-label=Close><span aria-hidden=true>×</span></button><h4 class=modal-title>Modal title</h4></div><div class=modal-body><p>One fine body…</div><div class=modal-footer><button class="btn btn-default"type=button data-dismiss=modal>Close</button> <button class="btn btn-primary"type=button>Save changes</button></div></div></div></div>';
    var $ = require("jquery");
    var uri = module.uri;
    uri = uri.substring(0, uri.lastIndexOf('/'));
    console.log('v5');

    CKEDITOR.config.customConfig = '';
    CKEDITOR.config.allowedContent = {
        $1: {
            // Use the ability to specify elements as an object.
            elements: CKEDITOR.dtd,
            attributes: true,
            styles: false,
            classes: true
        }
    };

    CKEDITOR.config.toolbarGroups = [
        { name: 'clipboard', groups: ['clipboard', 'undo'] },
        { name: 'tools', groups: ['tools'] },
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'forms', groups: ['forms'] },
        { name: 'paragraph', groups: ['align', 'list', 'indent', 'blocks', 'bidi', 'paragraph'] },
        { name: 'links', groups: ['links'] },
        { name: 'insert', groups: ['insert'] },
        { name: 'styles', groups: ['styles'] },
        { name: 'colors', groups: ['colors'] },
        { name: 'others', groups: ['others'] },
        { name: 'about', groups: ['about'] },
        { name: 'editing', groups: ['spellchecker', 'find', 'selection', 'editing'] },
        { name: 'document', groups: ['mode', 'document', 'doctools'] }
    ];


    CKEDITOR.config.removeButtons = 'Save,NewPage,Preview,Templates,ShowBlocks,Cut,Copy,Paste,PasteText,PasteFromWord,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Replace,Find,CopyFormatting,RemoveFormat,BidiLtr,BidiRtl,Language,CreateDiv,Flash,Image,Smiley,PageBreak,Iframe,About,TextColor,BGColor,FontSize,Font,Format';
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    CKEDITOR.config.pasteFromWordRemoveStyles = true;
    CKEDITOR.config.pasteFromWordRemoveFontStyles = true;
    CKEDITOR.config.entities_processNumerical = true;
    CKEDITOR.config.disallowedContent = 'script; style; *[on*, border, width, height, cellpadding, valign, cellspacing, font, style]; *{*}';

    CKEDITOR.plugins.add('globalContent', {
        init: function(editor) {

            var pluginName = 'globalContent';


            editor.addCommand(pluginName, {
                exec: function(editor) {
                    $('#myModal').modal(options)
                },

                canUndo: true
            });

            editor.ui.addButton('globalContent', {
                label: 'Insert global content',
                command: pluginName,
                className: 'cke_button__find_icon',
                toolbar: 'document,3'
            });
        }
    });

    CKEDITOR.config.extraPlugins = 'globalContent,dialog';

});