define(function(require, exports, module) {
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




    var dialogObj = CKEDITOR.dialog.add('testOnly', function(editor) {
        return {
            title: 'Test Dialog',
            resizable: CKEDITOR.DIALOG_RESIZE_BOTH,
            minWidth: 500,
            minHeight: 400,
            contents: [{
                id: 'tab1',
                label: 'First Tab',
                title: 'First Tab Title',
                accessKey: 'Q',
                elements: [{
                    type: 'text',
                    label: 'Test Text 1',
                    id: 'testText1',
                    'default': 'hello world!'
                }]
            }]
        };
    });


    CKEDITOR.plugins.add('globalContent', {
        init: function(editor) {
            var pluginName = 'globalContent';

            editor.addCommand(pluginName, {
                exec: function(editor) {
                    dialogObj.show();
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


    CKEDITOR.config.extraPlugins = 'globalContent';



});