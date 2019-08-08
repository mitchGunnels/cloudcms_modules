define(function(require, exports, module) {
    const $ = require("jquery");
    const UI = require("ui");

    const windowHref = window.location.href;
    const dropdownToggleButton = ".dropdown-toggle";
    const dropdownMenu = ".dropdown-menu";
    const newDropdownOption = '<li class="diff-tool"><a title="Compare Text Versions">'+
                            '<i class="fa fa-object-group"></i>&nbsp;Compare Text Versions</a></li>';
    const listItem = "li.diff-tool";
    const listItemAnchor = "li.diff-tool a";
    const activeListItem = "active";
    const disabled = "disabled";
    const selectedItems = "input.list-check-box:checked";

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
        // determines if we're on the correct page
        // var isPage = windowHref.indexOf('cricket:page') > -1;
        return windowHref.indexOf("versions") > -1;
    }

    function isTwoItemsSelected() {
        return $(selectedItems).length === 2;
    }

    function formatResult(result) {
        const formattedResult = {
            title: result.title
        }
        return formattedResult;
    }

    $(document).on('click', 'li.diff-tool.active', function() {
        UI.showModal({
            'title': `Executed Snapshot Creation from: whatever`,
            'body': `<div style="text-align:center"> Please check the branches in a minute </div>`
        });

        let selectedListItems = [];

        $('#DataTables_Table_0').find('tr td input[type="checkbox"]:checked').closest('tr').filter(function() {
            const $this = $(this);
            const id = $this.attr('id');

            selectedListItems.push(id);
        });

        Ratchet.observable("document").get()
            .listVersions({full:true, limit:-1})
            .then(function() {
                const versions = this.asArray() // <-- this is the content as an array
                const matchingResults = versions.filter(version => selectedListItems.includes(version._doc));
                const resultOne = matchingResults[0].json();
                const resultTwo = matchingResults[1].json();

                const formattedResultOne = formatResult(resultOne);
                const formattedResultTwo = formatResult(resultTwo);


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
        }
    });
});