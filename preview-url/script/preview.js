define(function(require, exports, module) {
    var $ = require("jquery");
    var modalHtml = '<div id="previewModal" class="fade modal" role="dialog" tabindex="-1"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"> <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button> <button class="minimize" type="button" aria-label="minimize"><span aria-hidden="true">-</span></button><div class="modal-body"> <iframe src="" width="100%" height="100%"></iframe></div></div></div></div>';
    var modalCSS = '#previewModal .modal-dialog { width: 100%; height: 100%; margin: 0; padding: 0; }#previewModal .modal-content { height: auto; min-height: 100%; border-radius: 0; }';

    // $('select.workspace-picker').on('change', function() {

    // });
    if ($('#globalContent').length == 0) {
        $('body').append(modalHtml);
        $('<style>' + modalCSS + '</style>').appendTo('#previewModal');
    }

    $(document).ajaxStop(function() {
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

        //Must delay for page render after ajax finishes. 
        setTimeout(function() {
            var endPoint = $('div[name=previewURL]').text();
            //console.log(endPoint);
            if (endPoint.length > 0) {
                $('div[name=previewURL]').append(' - <a href="' + domain + endPoint + '" target="_blank">Preview Content</a>');
                $('#gadget175 div.row div.col-md-4').prepend('<div class="pull-right"><a href="javascript:void(0)" class="btn btn-success" id="previewModalClick"><span class="fa fa-eye" aria-hidden="true"></span> Preview Content</a></div>', function() {
                    $('#previewModalClick').on('click', function(){
                        $('#previewModal iframe').attr('src', '' + domain + endPoint + '');
                    });
                });
            }
        }, 1500);
    });
});