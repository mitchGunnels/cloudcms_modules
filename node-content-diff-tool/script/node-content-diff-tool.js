define(function(require, exports, module) {
    const $ = require("jquery");
    require("./diff-match-patch.js");
    require('css!./style.css');
    const dmp = new diff_match_patch();

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
        $(listItem).removeClass(activeListItem);
        $(listItem).addClass(disabled);
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
            title: result.title,
            pararaph: result.content.node[1].paragraph
        }
        return formattedResult;
    }

    function showModal(content) {
        Ratchet.showModalMessage(
            `Showing Diffs`,
            `<div id='diff-modal'>${content ? content : 'No differences between selected versions.'}</div>`
        );
    }

    $(document).on('click', 'li.diff-tool.active', function() {
        let selectedListItems = [];

        $('#DataTables_Table_0').find('tr td input[type="checkbox"]:checked').closest('tr').filter(function() {
            const $this = $(this);
            const id = $this.attr('id');
            // id = 134586:c8dfe996d5910f74ac9e/cf40e11e62dedcfd288d

            selectedListItems.push(id);
        });

        Ratchet.observable("document").get()
            .listVersions({full:true, limit:-1, sort: {"_system.modified_on.ms": -1}}) // return all, no limit, sort with newest on top
            .then(function() {
                const versions = this.asArray() // <-- this is the content as an array
                const matchingResults = versions.filter(version => selectedListItems.includes(version._doc));

                const matchingResultsOneJson = matchingResults[0].json();
                const matchingResultsTwoJson = matchingResults[1].json();

                console.log('Version 1 => ', matchingResultsOneJson);
                console.log('Version 2 => ', matchingResultsTwoJson);

                const formattedResultOne = formatResult(matchingResultsOneJson);
                const formattedResultTwo = formatResult(matchingResultsTwoJson);





                const delta = dmp.diff_main(left, right);
                dmp.diff_cleanupSemantic(delta); // makes the diff human readable
                showModal(dmp.diff_prettyHtml(delta));
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