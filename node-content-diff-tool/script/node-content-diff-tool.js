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
    const disabledCursor = "disabled-cursor";
    const enabledCursor = "enabled-cursor";
    const selectedItems = "input.list-check-box:checked";

    function enableDiffTool() {
        $(listItem).removeClass(disabled);
        $(listItem).addClass(activeListItem);
        $(listItemAnchor).addClass(enabledCursor);
    }

    function disableDiffTool() {
        $(listItem).removeClass(activeListItem);
        $(listItem).addClass(disabled);
        $(listItemAnchor).addClass(disabledCursor);
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

    function showModal(title, content) {
        Ratchet.showModalMessage(
            `<div id='diff-modal-title'>${title}</div>`,
            `<div id='diff-modal-content'>${content}</div>`
        );
    }

    function renderDiff(oldDocumentVersion, newDocumentVersion) {
        const delta = dmp.diff_main(oldDocumentVersion, newDocumentVersion);
        dmp.diff_cleanupSemantic(delta); // makes the diff human readable
        return dmp.diff_prettyHtml(delta); // returns pretty html content
    }

    $(document).on('click', 'li.diff-tool.active', function() {
        let selectedListItems = [];

        $('.document-versions .table').find('tr td input[type="checkbox"]:checked').closest('tr').filter(function() {
            const $this = $(this);
            // id = 134586:c8dfe996d5910f74ac9e/cf40e11e62dedcfd288d
            const id = $this.attr('id');

            selectedListItems.push(id);
        });

        Ratchet.observable("document").get()
            // return all info, no limit, sort with newest first
            .listVersions({full:true, limit:-1, sort: {"_system.modified_on.ms": -1}})
            .then(function() {
                // set up needed variables
                let modalContent = '';
                let fieldDiff = '';
                let isError = false;

                // convert the returned map of versions to an array
                const versions = this.asArray()

                // given the array of all the versions on the page, find the ones we put a checkmark on
                const matchingResults = versions.filter(version => selectedListItems.includes(version._doc));

                // remove all the superfluous functions and stuff, just give us the JSON
                const newDocumentVersion = matchingResults[0].json();
                const oldDocumentVersion = matchingResults[1].json();

                // TODO: delete these console logs
                console.log('new version 1 => ', newDocumentVersion);
                console.log('old version 2 => ', oldDocumentVersion);

                // convert the oldDocumentVersion array to a hash map
                const oldNodeHash = {};
                oldDocumentVersion.content.node.forEach(element => {
                    oldNodeHash[element.id] = element;
                });

                const newPageTitle = newDocumentVersion.title;
                newDocumentVersion.content.node.forEach(element => {
                    if (isError) {
                        return;
                    }
                    let newFieldValue;
                    let fieldName;

                    if (element.typeQName === 'cricket:header') {
                        fieldName = 'header';
                        newFieldValue = element.header;
                    } else if (element.typeQName === 'cricket:paragraph') {
                        fieldName = 'paragraph';
                        newFieldValue = element.paragraph;
                    }

                    try { // rendering the diff with the dmp tool will fail if the newFieldValue or oldNodeHash[][] is not truthy
                        fieldDiff = renderDiff(newFieldValue, oldNodeHash[element.id][fieldName]);
                    } catch (err) {
                        showModal('Error creating a diff', `<div class='error'>Something went wrong with the diffing process. Are you sure relators are working set up correctly?
                                            Here's the error: <pre>${err}</pre></div>`);
                        isError = true;
                    }

                    modalContent += `<div class='field-name'>${fieldName}</div><div class='field-content'>${fieldDiff}</div>`;
                });
                if (!isError) {
                    showModal(newPageTitle, modalContent);
                }
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