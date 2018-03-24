define(function(require, exports, module) {
    var $ = require("jquery");

    $(document).on('cloudcms-ready', function(event) {
        
        //HANDLE THE COLOR AT THE TOP OF THE PAGE TO REMIND WHICH BRANCH
        $('select.workspace-picker').on('click', function() {
            var workspacePickerVal = $('select.workspace-picker option:selected').text();
            if (workspacePickerVal.includes("Master")) {
                $('div[region="workspace-bar"]').css('borderTopColor', '#a94442');
            } else {
                $('div[region="workspace-bar"]').css('borderTopColor', '#60a630');
            }
        });

        //WHEN "CREATING A DOCUMENT" SELECT THE PROPER NODE BASED ON THE CURRENT FOLDER
        $(document).on('click', '.list-button-new_document', function(event) {
            var nodeName = $('ol.breadcrumb.docpath li:last a').text().replace(/\s/g, '').replace(/_/g, ' ');
            var selectExists = setInterval(function() {
                if ($('.card-content-holder select').length) {
                    $('.card-content-holder select option:contains(' + nodeName + ')').attr('selected', 'selected');
                    clearInterval(selectExists);
                }
            }, 100);
        });
        //Create custom config for authors
        var uiConfig = $('button[data-header-item-key=ui-config-dropdown]').text().replace(/\s/g, '');
        if (uiConfig == 'Author') {
            //HIDE FROM VIEW
            $('.list-button-view_details, .list-button-new_text_document').parent().hide();
            $('.list-button-view_rules, .dropdown-menu li.divider').hide();
            //CHANGE NAME

            //CUSTOM ACTIONS
        }

        //---------------------------------------------------------------------------------------------------------------
        //IF DELAY IS NEEDED:
        setTimeout(function() {
            $('.previewButton').remove();
            //THIS IS TO CHANGE THE DEFAULT CLICK TO TAKE USERS TO THE PROPERTIES PAGE. QUICKER EDITING
            if ($('.documents-list').length > 0 || $('.content-instances').length > 0) {
                $('.list-row-info.title a').each(function(index, el) {
                    var url = $(this).attr('href');
                    var slug = url.substr(url.lastIndexOf('/') + 1);
                    var self = this;
                    if (slug != 'browse' && slug != 'properties') {
                        $(self).attr('href', url + '/properties');
                    }
                });
            }
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
            var endPoint = $('div[name=previewURL]').text();
            var inputEndPoint = $('input[name=previewURL]').val();

            if (endPoint != undefined && endPoint.length > 0) {
                $('div[name=previewURL]').append(' <span class="previewButton">- <a href="' + domain + endPoint + '" target="_blank">Preview Content</a></span>');
                $('#gadget175 div.row div.col-md-4').prepend('<div class="pull-right previewButton"><a href="' + domain + endPoint + '" class="btn btn-success" target="_blank"><span class="fa fa-eye" aria-hidden="true"></span> Preview Content</a></div>');
            } else if (inputEndPoint != undefined && inputEndPoint.length > 0) {
                $('div[name=previewURL]').append(' <span class="previewButton">- <a href="' + domain + inputEndPoint + '" target="_blank">Preview Content</a></span>');
                $('#gadget175 div.row div.col-md-4').prepend('<div class="pull-right previewButton"><a href="' + domain + inputEndPoint + '" class="btn btn-success" target="_blank"><span class="fa fa-eye" aria-hidden="true"></span> Preview Content</a></div>');
            }

        }, 2000);

    });
});