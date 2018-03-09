define(function(require, exports, module) {
    var uri = module.uri;
    uri = uri.substring(0, uri.lastIndexOf('/'));
    console.log('v4');

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

    //CKEDITOR.plugins.basePath = 'https://raw.githubusercontent.com/mitchGunnels/cloudcms_modules/master/ckeditor-mods/script/';
    //CKEDITOR.plugins.addExternal('a11checker', 'a11ychecker/');


    // var ref = CKEDITOR.tools.addFunction(function() {
    //     alert('Hello!');
    // });
    // CKEDITOR.tools.callFunction(ref); // 'Hello!'


    CKEDITOR.config.removeButtons = 'Save,NewPage,Preview,Templates,ShowBlocks,Cut,Copy,Paste,PasteText,PasteFromWord,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Replace,Find,CopyFormatting,RemoveFormat,BidiLtr,BidiRtl,Language,CreateDiv,Flash,Image,Smiley,PageBreak,Iframe,About,TextColor,BGColor,FontSize,Font,Format';
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    CKEDITOR.config.pasteFromWordRemoveStyles = true;
    CKEDITOR.config.pasteFromWordRemoveFontStyles = true;
    CKEDITOR.config.entities_processNumerical = true;
    CKEDITOR.config.disallowedContent = 'script; style; *[on*, border, width, height, cellpadding, valign, cellspacing, font, style]; *{*}';

    CKEDITOR.plugins.add('ajaxsave', {
        init: function(editor) {
            var pluginName = 'ajaxsave';

            editor.addCommand(pluginName, {
                exec: function(editor) {
                    new Ajax.Request('ajaxsave.php', {
                        method: "POST",
                        parameters: { filename: 'index.html', editor: editor.getData() },
                        onFailure: function() { ThrowError("Error: The server has returned an unknown error"); },
                        on0: function() { ThrowError('Error: The server is not responding. Please try again.'); },
                        onSuccess: function(transport) {

                            var resp = transport.responseText;

                            //Successful processing by ckprocess.php should return simply 'OK'. 
                            if (resp == "OK") {
                                //This is a custom function I wrote to display messages. Nicer than alert() 
                                ShowPageMessage('Changes have been saved successfully!');
                            } else {
                                ShowPageMessage(resp, '10');
                            }
                        }
                    });
                },

                canUndo: true
            });

            editor.ui.addButton('ajaxsave', {
                label: 'Save',
                command: pluginName,
                className: 'cke_button_save',
                icon: 'https://avatars1.githubusercontent.com/u/5500999?v=2&s=16'
            });
        }
    });


    CKEDITOR.config.extraPlugins = 'ajaxsave';


    //  editorInstance.addCommand("mySimpleCommand", {
    //     exec: function(edt) {
    //         alert('yo');
    //     }
    // });

    // CKEDITOR.editor.ui.addButton('SuperButton', {
    //     label: "Click me",
    //     command: 'mySimpleCommand',
    //     toolbar: 'insert',
    //     icon: 'https://avatars1.githubusercontent.com/u/5500999?v=2&s=16'
    // });

});