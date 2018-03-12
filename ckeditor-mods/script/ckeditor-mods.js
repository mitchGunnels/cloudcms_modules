define(function(require, exports, module) {
    var modalHtml = '<div class="fade modal"role=dialog id=globalContent tabindex=-1><div class=modal-dialog role=document><div class=modal-content><div class=modal-header><button class=close type=button data-dismiss=modal aria-label=Close><span aria-hidden=true>×</span></button><h4 class=modal-title>Insert Modal</h4></div><div class=modal-body><p><form><div class=form-group><label for=searchTerm>Modal Search (by title)</label><input class="form-control input-lg"id=searchTerm placeholder="Modal title"type=input></div><div id=result></div></form></p></div><div class=modal-footer><button class="btn btn-default"type=button data-dismiss=modal>Close</button> <button class="btn btn-primary"type=button>Insert</button></div></div></div></div>';
    var $ = require("jquery");
    require("jqueryui");
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
    CKEDITOR.config.disallowedContent = 'script; style; *[on*, *[style*, border, width, height, cellpadding, valign, cellspacing, font, style]; *{*}';

    CKEDITOR.plugins.add('globalContent', {
        init: function(editor) {

            var pluginName = 'globalContent';


            editor.addCommand(pluginName, {
                exec: function(editor) {
                    $('#globalContent').modal('toggle');
                },

                canUndo: true
            });

            editor.ui.addButton('globalContent', {
                label: 'Insert global content',
                command: pluginName,
                className: 'cke_button_icon cke_button__find_icon',
                toolbar: 'document,3'
            });
        }
    });

    CKEDITOR.config.extraPlugins = 'globalContent,dialog';

    CKEDITOR.on('instanceCreated', function(ev) {
        var editor = ev.editor;
        // Listen for the "pluginsLoaded" event, so we are sure that the
        // "dialog" plugin has been loaded and we are able to do our
        // customizations.
        editor.on('pluginsLoaded', function() {
            // If our custom dialog has not been registered, do that now.
            if ($('#globalContent').length == 0) {
                $('body').append(modalHtml);
            }
            initAutoComplete();
        });
    });



    function initAutoComplete() {
        $("#searchTerm").autocomplete({
            source: function(request, response) {
                $.get("https://wwwsit3.cricketwireless.com/cloudassets/cms/myAccount/serverErrors/", {
                    query: request.term
                }, function(data) {
                    // assuming data is a JavaScript array such as
                    // ["one@abc.de", "onf@abc.de","ong@abc.de"]
                    // and not a string
                    //response(data);
                    console.log(data);
                });
            },
            minLength: 3
        });
    }
});