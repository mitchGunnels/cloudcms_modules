define(function(require, exports, module) {
    var modalContent;
    var modalHtml = '<div id="globalContent" class="fade modal" role="dialog" tabindex="-1"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"> <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title" >Insert Modal</h4></div><div class="modal-body"><p><form><div class="form-group"> <label for="searchTerm">Modal Search (by title)</label> <input class="form-control input-lg" id="searchTerm" placeholder="Modal title" type="input" /></div><div id="result"></div></form></p></div><div class="modal-footer"> <button class="btn btn-default" type="button" data-dismiss="modal">Close</button> <button class="btn btn-primary" type="button" id="insert">Insert</button></div></div></div></div>';
    var legalHtml = '<div id="legalContent" class="fade modal" role="dialog" tabindex="-1"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"> <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button><h4 class="modal-title" >Insert Legal Content</h4></div><div class="modal-body"><p><form><div class="form-group"> <label for="legalSearch">Legal Search (by topic)</label> <input class="form-control input-lg" id="legalSearch" placeholder="Legal topic" type="input" /></div><div id="legalResult"></div></form></p></div><div class="modal-footer"> <button class="btn btn-default" type="button" data-dismiss="modal">Close</button> <button class="btn btn-primary" type="button" id="legalInsert">Insert</button></div></div></div></div>';
    var modalCSS = '.cke_maximized {z-index: 9996 !important;}; .cke_button__globalcontent_icon, .cke_button__legalcontent_icon { display: none; } .cke_button__globalcontent_label, .cke_button__legalcontent_label { display: inline !important; padding: 0px; margin: 0px; } .modal.fade, .modal-scrollable { z-index: 9998 !important; } span#modalID { font-size: 11px; font-style: italic; } .autocomplete-suggestions { border: 1px solid #999; background: #FFF; overflow: auto; z-index: 9999 !important; } .autocomplete-suggestion { padding: 2px 5px; white-space: nowrap; overflow: hidden; } .autocomplete-selected { background: #F0F0F0; } .autocomplete-suggestions strong { font-weight: normal; color: #3399FF; } .autocomplete-group { padding: 2px 5px; } .autocomplete-group strong { display: block; border-bottom: 1px solid #000; }';
    var $ = require("jquery");
    var uri = module.uri;
    uri = uri.substring(0, uri.lastIndexOf('/'));

    require('https://cache.cricketwireless.com/ckeditor-plugins/jquery.autocomplete.min.js');
    var fleschKincaid = require('https://cache.cricketwireless.com/ckeditor-plugins/flesch-kincaid.js'); 
    var exports = [];

    var str = "The quick brown fox jumped over the lazy dogs";
    console.log( fleschKincaid.grade( str ) ); // 3.653333333333336

    CKEDITOR.config.skin = 'moono-lisa';
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
        { name: 'styles', groups: ['cricket_styles'] },
        { name: 'colors', groups: ['colors'] },
        { name: 'others', groups: ['others'] },
        { name: 'about', groups: ['about'] },
        { name: 'editing', groups: ['spellchecker', 'find', 'selection', 'editing'] },
        '/',
        { name: 'document', groups: ['mode', 'document', 'doctools'] },
        { name: 'globalContent' },
        { name: 'legalContent' }
    ];

    CKEDITOR.stylesSet.add('cricket_styles', [
        // Block-level styles
        { name: 'Paragraph Font-10px', element: 'p', attributes: { 'class': 'font-10' } },
        { name: 'Paragraph Font-11px', element: 'p', attributes: { 'class': 'font-11' } },
        { name: 'Paragraph Font-12px', element: 'p', attributes: { 'class': 'font-12' } },
        { name: 'Paragraph Font-14px', element: 'p', attributes: { 'class': 'font-14' } },
        { name: 'Paragraph Font-16px', element: 'p', attributes: { 'class': 'font-16' } },
        { name: 'Paragraph Font-18px', element: 'p', attributes: { 'class': 'font-18' } },
        { name: 'Paragraph Font-20px', element: 'p', attributes: { 'class': 'font-20' } },
        { name: 'Paragraph Font-22px', element: 'p', attributes: { 'class': 'font-22' } },
        { name: 'Paragraph Font-24px', element: 'p', attributes: { 'class': 'font-24' } },
        { name: 'Paragraph Font-26px', element: 'p', attributes: { 'class': 'font-26' } },
        { name: 'Paragraph Font-36px', element: 'p', attributes: { 'class': 'font-36' } },
        { name: 'Paragraph Font-40px', element: 'p', attributes: { 'class': 'font-40' } },
        // Inline styles
        { name: 'Cricket Green', element: 'span', attributes: { 'class': 'cricket-green-text' } },
        { name: 'Dark Green', element: 'span', attributes: { 'class': 'dark-green-text' } },
        { name: 'Light Green', element: 'span', attributes: { 'class': 'light-green-text' } },
        { name: 'Dark Blue', element: 'span', attributes: { 'class': 'dark-blue-text' } },
        { name: 'Light Blue', element: 'span', attributes: { 'class': 'light-blue-text' } },
        { name: 'Dark Gray', element: 'span', attributes: { 'class': 'dark-gray-text' } },
        { name: 'Light Gray', element: 'span', attributes: { 'class': 'light-gray-text' } },
        { name: 'Black', element: 'span', attributes: { 'class': 'black-text' } },
        { name: 'White', element: 'span', attributes: { 'class': 'white-text' } },
        { name: 'Gold', element: 'span', attributes: { 'class': 'gold-text' } }
    ]);

    CKEDITOR.config.stylesSet = 'cricket_styles';

    CKEDITOR.config.removeButtons = 'Save,NewPage,Preview,Templates,ShowBlocks,Cut,Copy,Paste,PasteText,PasteFromWord,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Replace,Find,CopyFormatting,RemoveFormat,BidiLtr,BidiRtl,Language,CreateDiv,Flash,Image,Smiley,PageBreak,Iframe,About,TextColor,BGColor,FontSize,Font,Format';
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    CKEDITOR.config.pasteFromWordRemoveStyles = true;
    CKEDITOR.config.pasteFromWordRemoveFontStyles = true;
    CKEDITOR.config.entities_processNumerical = true;
    CKEDITOR.config.disallowedContent = 'script; style; *[on*, *[style*, border, width, height, cellpadding, valign, cellspacing, font, style]; *{*}';

    CKEDITOR.plugins.add('globalContent', {
        init: function(editor) {

            var modalContent = 'modalContent';
            var legalContent = 'legalContent';

            editor.addCommand(modalContent, {
                exec: function(editor) {
                    $('#insert').unbind("click");
                    $('#globalContent').modal('show');
                    $('#insert').on('click', function(event) {
                        event.preventDefault();
                        var modalTitle = $('#result h4#modalTitle').text();
                        var modalID = $('#result span#modalID').text();
                        editor.insertHtml('<a href="modalAction/' + modalID + '" title="" pop-modal modalid="' + modalID + '" class="custom-class" data-toggle="modal" data-target="' + modalID + '">' + modalTitle + '</a>');
                        $('#globalContent').modal('hide');
                        $('#globalContent #result').empty();
                        $('#searchTerm').val('');
                    });
                },
                canUndo: true
            });


            editor.addCommand(legalContent, {
                exec: function(editor) {
                    $('#legalInsert').unbind("click");
                    $('#legalContent').modal('show');
                    $('#legalInsert').on('click', function(event) {
                        event.preventDefault();
                        var legalID = $('#legalResult span#legalID').text();
                        var descriptionType = $('#legalResult #descriptionType').val();
                        if (descriptionType.length > 0 && descriptionType) {
                            editor.insertText('~#[content]-[legal]-[content]-[' + legalID + ']-[' + descriptionType + ']#~');
                        } else {
                            $('#legalResult #descriptionTypeLabel').addClass('text-danger');
                            return false;
                        }
                        $('#legalContent').modal('hide');
                        $('#legalContent #legalResult').empty();
                        $('#legalSearch').val('');
                    });
                },
                canUndo: true
            });

            editor.ui.addButton('globalContent', {
                label: 'Modal',
                command: modalContent,
                toolbar: 'globalContent,1'
            });

            editor.ui.addButton('legalContent', {
                label: 'Legal',
                command: legalContent,
                toolbar: 'legalContent,1'
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
                $('body').append(legalHtml);

                $('<style>' + modalCSS + '</style>').appendTo('#globalContent');
                $('select.workspace-picker').on('change', initAutoComplete);
                initAutoComplete();
            }


        });
    });

    function initAutoComplete() {
        //Check workspace-picker to determine the appropriate env for creating the preview link.
        var workspacePickerVal = $('select.workspace-picker option:selected').text();
        var domain;
        //Decide on the correct environment
        if (workspacePickerVal.includes("Master")) {
            //console.log("prod");
            domain = "https://www.cricketwireless.com";
        } else if (workspacePickerVal.includes("SIT1")) {
            //console.log("SIT1");
            domain = "https://wwwsit1.cricketwireless.com";
        } else if (workspacePickerVal.includes("SIT2")) {
            //console.log("SIT2");
            domain = "https://wwwsit2.cricketwireless.com";
        } else if (workspacePickerVal.includes("SIT3")) {
            //console.log("SIT3");
            domain = "https://wwwsit3.cricketwireless.com";
        } else if (workspacePickerVal.includes("SIT6")) {
            //console.log("SIT6");
            domain = "https://wwwsit6.cricketwireless.com";
        } else if (workspacePickerVal.includes("SIT8")) {
            //console.log("SIT8");
            domain = "https://wwwsit8.cricketwireless.com";
        } else if (workspacePickerVal.includes("SIT9")) {
            //console.log("SIT9");
            domain = "https://wwwsit9.cricketwireless.com";
        } else {
            console.log("Nothing found");
        }

        //console.log('GET CALLED!');
        //EVENTUALLY NEED TO SEARCH ONDEMAND, WILL NEED TO MODIFY THE MIDDLEWARE
        $.get(domain + '/cloudassets/cms/modal/content', function(result) {
            var newObject = [];
            $.each(result, function(data) {
                //console.log(data);
                var dataObj = { "value": this.title, "data": { "ID": data, "title": this.modalTitle, "modalBody": this.modalBody } };
                newObject.push(dataObj);
            });

            modalContent = newObject;
            searchInit();
        });

        //LOAD LEGAL CONTENT
        $.get(domain + '/cloudassets/cms/legal/content', function(result) {
            var newObject = [];
            $.each(result, function(data) {
                var dataObj = { "value": this.topic, "data": { "ID": data, "title": this.title, "shortDisclaimer": this.shortDisclaimer, "longDisclaimer": this.longDisclaimer } };
                newObject.push(dataObj);
            });

            legalContent = newObject;
            legalInit();
        });
    }

    function searchInit() {
        $('#searchTerm').autocomplete({
            lookup: modalContent,
            onSelect: function(suggestion) {
                $('#result').empty().html('<h4 id="modalTitle">' + suggestion.value + '</h4><p id="modalBody">' + suggestion.data.modalBody + '</p><p><span id="modalID">' + suggestion.data.ID + '</span></p>');
            }
        });
    }

    function legalInit() {
        $('#legalSearch').autocomplete({
            lookup: legalContent,
            onSelect: function(suggestion) {
                if (suggestion.data.longDisclaimer && suggestion.data.shortDisclaimer) {
                    $('#legalResult').empty().html('<p id="descriptionTypeLabel">Please select description type</p><select class="form-control" id="descriptionType"><option value="">Insert Short or Long Description</option><option value="shortDisclaimer">Short</option><option value="longDisclaimer">Long</option></select><br><h4 id="legalTitle">' + suggestion.data.title + '</h4><p id="shortDisclaimer"><b>Short Disclaimer:</b><br>' + suggestion.data.shortDisclaimer + '</p><p id="longDisclaimer"><b>Long Disclaimer:</b><br>' + suggestion.data.longDisclaimer + '</p><p><span id="legalID">' + suggestion.data.ID + '</span></p>');
                } else if (suggestion.data.longDisclaimer) {
                    $('#legalResult').empty().html('<p id="descriptionTypeLabel">Please select description type</p><select class="form-control" id="descriptionType"><option value="longDisclaimer">Long</option></select><br><h4 id="legalTitle">' + suggestion.data.title + '</h4><p id="longDisclaimer"><b>Long Disclaimer:</b><br>' + suggestion.data.longDisclaimer + '</p><p><span id="legalID">' + suggestion.data.ID + '</span></p>');
                } else {
                    $('#legalResult').empty().html('<p id="descriptionTypeLabel">Please select description type</p><select class="form-control" id="descriptionType"><option value="shortDisclaimer">Short</option></select><br><h4 id="legalTitle">' + suggestion.data.title + '</h4><p id="shortDisclaimer"><b>Short Disclaimer:</b><br>' + suggestion.data.shortDisclaimer + '</p><p><span id="legalID">' + suggestion.data.ID + '</span></p>');
                }
            }
        });
    }
});