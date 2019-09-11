define(function (require, exports, module) {
    require("../libs/diff-match-patch.js");
    require('css!../css/style.css');
    const $ = require("jquery");
    const dmp = new diff_match_patch();
    const windowHref = window.location.href;
    const dropdownToggleButton = ".dropdown-toggle";
    const dropdownMenu = "ul[aria-labelledby='list-button-multi-documents-action-selector']";
    const newDropdownOption = '<li class="diff-tool"><a title="Compare Text Versions">' +
        '<i class="fa fa-object-group"></i>&nbsp;Compare Text Versions</a></li>';
    const listItem = "li.diff-tool";
    const listItemAnchor = "li.diff-tool a";
    const disabled = "disabled";
    const activeListItem = "active-list-item";
    const disabledCursor = "disabled-cursor";
    const enabledCursor = "enabled-cursor";
    const selectedItems = "input.list-check-box:checked";

    function enableDiffTool() {
        $(listItem).addClass(activeListItem);
        $(listItem).removeClass(disabled);
        $(listItemAnchor).addClass(enabledCursor);
        $(listItemAnchor).removeClass(disabled);
    }

    function disableDiffTool() {
        $(listItem).removeClass(activeListItem);
        $(listItem).addClass(disabled);
        $(listItemAnchor).addClass(disabledCursor);
        $(listItemAnchor).removeClass(enabledCursor);
    }

    function isVersionsList() {
        return window.location.href.indexOf("versions") > -1;
    }

    function isTwoItemsSelected() {
        return $(selectedItems).length === 2;
    }

    function showModal(title, content) {
        Ratchet.showModal({
            title: `<div id='diff-modal-title'>${title}</div>`,
            body: `<div id='diff-modal-content'>${content}</div>`,
            modalClass: 'node-content-diff-modal',
            big: true
        });
    }

    function renderDiff({ oldItem, newItem }) {
        const oldString = (oldItem || '').toString();
        const newString = (newItem || '').toString();

        const delta = dmp.diff_main(oldString, newString);

        // Make the diff human readable
        dmp.diff_cleanupSemantic(delta);

        // Return an HTML element
        return dmp.diff_prettyHtml(delta);
    }

    function getSelectedItems() {
        // Returns an array of the versions user selected
        let selectedItems = [];

        $('.document-versions .table').find('tr td input[type="checkbox"]:checked').closest('tr').filter(function () {
            const $this = $(this);
            const id = $this.attr('id'); // id = 134586:c8dfe996d5910f74ac9e/cf40e11e62dedcfd288d

            selectedItems.push(id);
        });
        return selectedItems;
    }

    function iterateThroughObject({ isRoot, newItem, oldItem }) {
        let modalContent = '';

        newItem = newItem || {};
        oldItem = oldItem || {};

        let usedKeys = {};

        for (let property in newItem) {
            if (newItem.hasOwnProperty(property)) {
                modalContent += isRoot ? `<div class="section-header">${property}</div>` : `<div class='field-content'><span class="field-label">${property}: </span>`;
                modalContent += buildPageContent({
                    newItem: newItem[property],
                    oldItem: oldItem[property],
                    isRoot: false
                });
                modalContent += isRoot ? '' : `</div>`;
                usedKeys[property] = true;
            }
        }
        for (let property in oldItem) {
            if (oldItem.hasOwnProperty(property)) {
                if (!usedKeys[property]) {
                    modalContent += isRoot ? `<div class="section-header">${property}</div>` : `<div class='field-content'><span class="field-label">${property}: </span>`;
                    modalContent += buildPageContent({
                        newItem: newItem[property],
                        oldItem: oldItem[property],
                        isRoot: false
                    });
                    modalContent += isRoot ? '' : `</div>`;
                }
            }
        }

        return modalContent;
    }

    function iterateThroughArray({ newItem, oldItem }) {
        let modalContent = '';
        newItem = newItem || [];
        oldItem = oldItem || [];

        // check to see which array is longer
        const newItemLength = newItem.length;
        const oldItemLength = oldItem.length;

        if (newItemLength >= oldItemLength) {
            // iterate through that array
            newItem.forEach((item, index) => {
                modalContent += buildPageContent({
                    oldItem: oldItem[index],
                    newItem: item,
                    isRoot: false
                });
            });
        } else {
            // iterate through that array
            oldItem.forEach((item, index) => {
                modalContent += buildPageContent({
                    newItem: newItem[index],
                    oldItem: item
                });
            });
        }
        return modalContent;
    }

    function buildPageContent({ isRoot, oldItem, newItem }) {
        if (isRoot) {
            return iterateThroughObject({ isRoot, newItem, oldItem });
        } else if ((newItem && Array.isArray(newItem)) || (oldItem && Array.isArray(oldItem))) {
            return iterateThroughArray({ newItem, oldItem });
        } else if ((newItem && typeof newItem === 'object') || (oldItem && typeof oldItem === 'object')) {
            return iterateThroughObject({ newItem, oldItem });
        } else {
            // If the item is neither an array nor an object at this point, assume it's a scalar value
            return renderDiff({ oldItem, newItem });
        }
    }

    function renderModal() {
        Ratchet.observable("document").get()
            // Return all document versions on this page, no limit, sort with newest first
            .listVersions({ full: true, limit: -1, sort: { "_system.modified_on.ms": -1 } })
            .then(function () {
                let mainModalContent = '';
                const selectedItems = getSelectedItems();
                const versionsList = this.asArray()

                // Given the array of all the versions on the page, find the ones we put a checkmark on
                const matchingResults = versionsList.filter(version => selectedItems.includes(version._doc));

                // Remove all the superfluous functions and stuff, just give us the JSON
                const newDocumentVersion = matchingResults[0].json();
                const oldDocumentVersion = matchingResults[1].json();

                // The modal needs a title, might as well use the one on newDocumentVersion...
                const modalTitle = newDocumentVersion.title;

                // Execute our recursive function above and add its output to the modal content
                mainModalContent += buildPageContent({
                    newItem: newDocumentVersion,
                    oldItem: oldDocumentVersion,
                    isRoot: true
                });

                // Finally, show the modal with the accumulated contents
                showModal(modalTitle, mainModalContent);
            });
    }

    function optionsListener() {
        if (isTwoItemsSelected()) {
            enableDiffTool();
        } else {
            disableDiffTool();
        }
    }

    $(document).on('click', 'li.diff-tool.active-list-item', renderModal);

    $(document).on('cloudcms-ready', function () {
        // Remove listener, prevent leaking
        $(dropdownToggleButton).off('click', optionsListener);

        if (isVersionsList()) {
            // Adding a timeout to fix a weird bug where my newDropdownOption was not getting
            // appended to the menu (Harry suggested this fix)
            if ($(dropdownMenu).find('.diff-tool').length === 0) {
                setTimeout(function () {
                    $(dropdownMenu).prepend(newDropdownOption)
                }, 0);
                $(dropdownToggleButton).on('click', optionsListener);
            }

        }
    });
});