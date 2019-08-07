define(function(require, exports, module) {
    var $ = require("jquery");
    var windowHref = window.location.href;
    var dropdownToggleButton = ".dropdown-toggle";
    var dropdownMenu = ".dropdown-menu";
    var newDropdownOption = '<li class="diff-tool"><a title="Compare Text Versions">'+
                            '<i class="fa fa-object-group"></i>&nbsp;Compare Text Versions</a></li>';
    var listItem = "li.diff-tool";
    var listItemAnchor = "li.diff-tool a";
    var activeListItem = "active";
    var disabled = "disabled";
    var selectedItems = "input.list-check-box:checked";

    function enableDiffTool() {
        $(listItem).removeClass(disabled);
        $(listItem).addClass(activeListItem);
        $(listItemAnchor).css({cursor:"pointer"});
    }

    function disableDiffTool() {
        $(listItem).addClass(disabled);
        $(listItem).removeClass(activeListItem);
        $(listItemAnchor).css({cursor:"not-allow"});
    }

    function isThisPageVersionsTool() {
        // TODO: Figure out how to detect if we're on a page vs. any other kind of document
        // detect if we're on the correct page
        // var isPage = windowHref.indexOf('cricket:page') > -1;
        return windowHref.indexOf("versions") > -1;
    }

    function isTwoItemsSelected() {
        return $(selectedItems).length === 2;
    }

    $(document).on('click', 'li.diff-tool.active', function() {
        $('#DataTables_Table_0').find('tr td input[type="checkbox"]:checked').closest('tr').filter(function() {
            var $this = $(this);
            var id = $this.attr('id');

            // regex will match on everything before the forward slash
            // e.g. "134586:c8dfe996d5910f74ac9e/cf40e11e62dedcfd288d" will match to "134586:c8dfe996d5910f74ac9e"
            var regex = /([^:\s]+):([^:\/s]+)/gi;

            var matches = regex.exec(id);

            try{
                var version = matches[0];

                // have to find a way to match the href to get it
                var foundHref = $this.find('a[href$=”/versions/' + version + '”]').attr('href');

            } catch(err){
                console.log(err);
            }
            return false;
        });
    });

    $(document).on('cloudcms-ready', function() {
        if (isThisPageVersionsTool) {
            // insert a new option to the top of the select dropdown
            $(dropdownMenu).prepend(newDropdownOption);

            // detect click on existing dropdown menu and disable or enable our tool based on number of items selected
            $(dropdownToggleButton).on('click', function() {
                if (isTwoItemsSelected()) {
                    enableDiffTool();
                } else {
                    disableDiffTool();
                }
            });

            // use difftool to compare the two variables

            // open new tab with the contents of the two docs
        }

    });
});