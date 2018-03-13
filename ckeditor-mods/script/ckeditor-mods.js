define(function(require, exports, module) {
    var modalContent;
    var modalHtml = '<div class="fade modal"role=dialog id=globalContent tabindex=-1><div class=modal-dialog role=document><div class=modal-content><div class=modal-header><button class=close type=button data-dismiss=modal aria-label=Close><span aria-hidden=true>×</span></button><h4 class=modal-title>Insert Modal</h4></div><div class=modal-body><p><form><div class=form-group><label for=searchTerm>Modal Search (by title)</label><input class="form-control input-lg"id=searchTerm placeholder="Modal title"type=input></div><div id=result></div></form></p></div><div class=modal-footer><button class="btn btn-default"type=button data-dismiss=modal>Close</button> <button class="btn btn-primary"type=button>Insert</button></div></div></div></div>';
    var modalCSS = '.autocomplete-suggestions { border: 1px solid #999; background: #FFF; overflow: auto; } .autocomplete-suggestion { padding: 2px 5px; white-space: nowrap; overflow: hidden; } .autocomplete-selected { background: #F0F0F0; } .autocomplete-suggestions strong { font-weight: normal; color: #3399FF; } .autocomplete-group { padding: 2px 5px; } .autocomplete-group strong { display: block; border-bottom: 1px solid #000; }';
    var $ = require("jquery");
    var uri = module.uri;
    uri = uri.substring(0, uri.lastIndexOf('/'));

    require('https://cdnjs.cloudflare.com/ajax/libs/jquery.devbridge-autocomplete/1.4.7/jquery.autocomplete.min.js');

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
                label: 'Insert Modal',
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
                $('<style>' + modalCSS + '</style>').appendTo('#globalContent');
            }
            initAutoComplete();
        });
    });

    function initAutoComplete() {
        //EVENTUALLY NEED TO SEARCH ONDEMAND, WILL NEED TO MODIFY THE MIDDLEWARE
        if (!sessionStorage.getItem('modalContent')) {
            $.get('https://wwwsit3.cricketwireless.com/cloudassets/cms/myAccount/modal/', function(result) {
                var newObject = [];
                $.each(result, function(data) {
                    var dataObj = { "value": this.title, "data": { "title": this.modalTitle, "modalBody": this.modalBody } };
                    newObject.push(dataObj);
                });
                sessionStorage.setItem('modalContent', JSON.stringify(newObject));
                modalContent = $.parseJSON(sessionStorage.getItem('modalContent'));
            });
        }

        modalContent = $.parseJSON(sessionStorage.getItem('modalContent'));

        //console.log(modalContent);

        $('#searchTerm').autocomplete({
            lookup: modalContent,
            onSelect: function(suggestion) {
                //console.log('You selected: ' + suggestion.value + ', ' + suggestion.data.modalBody);
                $('#result').html('<h4>' + suggestion.value + '</h4><br><p>'
                    suggestion.data.modalBody '</p>');
            }
        });

    }
});