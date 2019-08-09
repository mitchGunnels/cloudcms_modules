define(function(require, exports, module) {
    const $ = require("jquery");

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

            selectedListItems.push(id);
        });

        Ratchet.observable("document").get()
            .listVersions({full:true, limit:-1})
            .then(function() {
                const versions = this.asArray() // <-- this is the content as an array
                const matchingResults = versions.filter(version => selectedListItems.includes(version._doc));
                const matchingResultsOneJson = matchingResults[0].json();
                const matchingResultsTwoJson = matchingResults[1].json();

                console.log('Version 1 => ', matchingResultsOneJson);
                console.log('Version 2 => ', matchingResultsTwoJson);

                const formattedResultOne = formatResult(matchingResultsOneJson);
                const formattedResultTwo = formatResult(matchingResultsTwoJson);

                // const left = {
                //     title: 'foobar one two three',
                //     paragraph: 'this is the paragrah.  we are going to make some changes here.'
                // };
                // const right = {
                //     title: 'foobar one tw3o three',
                //     paragraph: 'this is the paragrah.  We are going to make some changes now.'
                // };
                const customDiffPatch = jsondiffpatch.create({
                    textDiff: {
                      minLength: 1, // show diffs one character at a time
                    }
                });

                const left = "Lorem ipsum dolor sit amet";
                const right = "Loremx ipsum dolor sit amet";

                jsondiffpatch.formatters.html.showUnchanged();
                const delta = customDiffPatch.diff(left, right);

                showModal(jsondiffpatch.formatters.html.format(delta));
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