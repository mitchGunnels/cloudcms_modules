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

    function isPageDocument() {
        // check list-row-info class innerHTML for anything that contains cricket:page*
        // will return true for "cricket:page", "cricket:page-support", etc
        const arrayOfInfoElements = $('#document-summary .list-row-info a');
        const regex = /cricket:page(-.*)?/;
        return  $.grep(arrayOfInfoElements, function(element) {
            return regex.test(element.innerHTML);
        }).length;
    }

    function isVersionsList() {
        return windowHref.indexOf("versions") > -1;
    }

    function isThisPageVersions() {
        return isPageDocument() && isVersionsList();
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
        // make the diff human readable
        dmp.diff_cleanupSemantic(delta);

        // return an HTML element
        return dmp.diff_prettyHtml(delta);
    }

    function convertToHashMap(array) {
        const hashMap = {};
        array.forEach(element => {
            hashMap[element.id] = element;
        });
        return hashMap;
    }

    function getSelectedItems() {
        // returns an array of the versions user selected
        let selectedItems = [];
        $('.document-versions .table').find('tr td input[type="checkbox"]:checked').closest('tr').filter(function() {
            const $this = $(this);

            const id = $this.attr('id'); // id = 134586:c8dfe996d5910f74ac9e/cf40e11e62dedcfd288d

            selectedItems.push(id);
        });
        return selectedItems;
    }

    function renderModal() {
        Ratchet.observable("document").get()
        // return all document versions on this page, no limit, sort with newest first
        .listVersions({full:true, limit:-1, sort: {"_system.modified_on.ms": -1}})
        .then(function() {
            let modalContent = '';
            let fieldDiff = '';
            let isError = false;
            const selectedItems = getSelectedItems();

            // convert the returned map of versions to an array
            const versions = this.asArray()

            // given the array of all the versions on the page, find the ones we put a checkmark on
            const matchingResults = versions.filter(version => selectedItems.includes(version._doc));

            // remove all the superfluous functions and stuff, just give us the JSON
            const newDocumentVersion = matchingResults[0].json();
            const oldDocumentVersion = matchingResults[1].json();

            // TODO: delete these console logs
            console.log('new version 1 => ', newDocumentVersion);
            console.log('old version 2 => ', oldDocumentVersion);

            const oldNodeHash = convertToHashMap(oldDocumentVersion.content.node);

            const modalTitle = newDocumentVersion.title;

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
                    modalContent += `<div class='field-name'>${fieldName}</div><div class='field-content'>${fieldDiff}</div>`;
                } catch (err) {
                    showModal('Error creating a diff', `<div class='error'>Something went wrong with the diffing process. Are you sure relators are working set up correctly?
                                        Here's the error: <pre>${err}</pre></div>`);
                    isError = true;
                }
            });
            if (!isError) {
                showModal(modalTitle, modalContent);
            }
        });
    }

    $(document).on('click', 'li.diff-tool.active', renderModal);

    $(document).on('cloudcms-ready', function() {
        if (isThisPageVersions()) {
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