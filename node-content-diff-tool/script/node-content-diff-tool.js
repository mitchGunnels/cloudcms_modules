define(function (require, exports, module) {
    require("./diff-match-patch.js");
    require('css!./style.css');
    const $ = require("jquery");
    const dmp = new diff_match_patch();
    const windowHref = window.location.href;
    const dropdownToggleButton = ".dropdown-toggle";
    const dropdownMenu = ".dropdown-menu";
    const newDropdownOption = '<li class="diff-tool"><a title="Compare Text Versions">' +
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
        // Check list-row-info class innerHTML for anything that contains cricket:page*
        // Will return true for "cricket:page", "cricket:page-support", etc
        const arrayOfInfoElements = $('#document-summary .list-row-info a');
        const regex = /cricket:page(-.*)?/;

        return $.grep(arrayOfInfoElements, function (element) {
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
        Ratchet.showModal({
            title: `<div id='diff-modal-title'>${title}</div>`,
            body: `<div id='diff-modal-content'>${content}</div>`
        });
    }

    function renderDiff(oldDocumentVersion, newDocumentVersion) {
        if (!oldDocumentVersion && newDocumentVersion) {
            return `<div clalss="added-text">${newDocumentVersion}</div>`;
        }
        if (!newDocumentVersion && oldDocumentVersion) {
            return `<div class="removed-text">${oldDocumentVersion}</div>;`
        }
        if (!newDocumentVersion && !oldDocumentVersion) {
            return `<div>EMPTY</div>`
        }

        const delta = dmp.diff_main(oldDocumentVersion, newDocumentVersion);

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

    function renderSkuField(options) {
        let modalContent = '';

        modalContent += `<div class='field-name'>${options.type}</div>`;
        modalContent += `<div class='field-content'>${renderDiff(options.oldSku[options.field], options.newSku[options.field])}</div>`;
        return modalContent;
    }

    function renderSku(options) {
        let modalContent = '';
        const additionalSkuFields = ['active', 'id', 'modelName', 'refurbished', 'skuId', 'title'];

        // Specifically call out the color array
        if (options.newSku.color && options.newSku.color[0]) {
            const colorFields = ['active', 'displayName', 'hexValue', 'id', 'title'];
            const newColor = options.newSku.color[0];
            const oldColor = options.oldSku.color[0];

            colorFields.forEach(field => {
                modalContent += `<div class='field-name'>SKU:color:${field}</div>`;
                modalContent += `<div class='field-content'>${renderDiff(oldColor[field], newColor[field])}</div>`;
            });
        }

        // Call out the other fields that are not "color"
        additionalSkuFields.forEach(field => {
            modalContent += renderSkuField({
                type: `SKU${options.index}:${field}`,
                oldSku: options.oldSku,
                newSku: options.newSku,
                field: field
            });
        });
        return modalContent;
    }

    function buildPageContent(options) {
        // Here be dragons
        if (options.newDocumentVersion.typeQName === 'cricket:header') {
            let modalContent = '';

            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:title</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.title, options.newDocumentVersion.title)}</div>`;
            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:header</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.header, options.newDocumentVersion.header)}</div>`;
            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:active</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.active, options.newDocumentVersion.active)}</div>`;
            return modalContent;
        } else if (options.newDocumentVersion.typeQName === 'cricket:paragraph') {
            let modalContent = '';

            modalContent += `<div class='field-name'>${options.nodeKey}:${options.nodeIndex}:paragraph</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.paragraph, options.newDocumentVersion.paragraph)}</div>`;
            return modalContent;
        } else if (options.newDocumentVersion.typeQName === 'cricket:link') {
            let modalContent = '';

            modalContent += `<div class='field-name'>${options.nodeKey}:node:${options.nodeIndex}:link title</div>`;
            modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.title, options.newDocumentVersion.title)}</div>`;
            if (options.oldDocumentVersion.linkNodeReference) {
                modalContent += `<div class='field-name'>${options.nodeKey}:node:${options.nodeIndex}:linkNodeReference title</div>`;
                modalContent += `<div class='field-content'>${renderDiff(options.oldDocumentVersion.linkNodeReference.title, options.newDocumentVersion.linkNodeReference.title)}</div>`;
            }
            return modalContent;
        } else if (options.newDocumentVersion.typeQName === 'cricket:view-multi') {
            let modalContent = '';

            if (options.newDocumentVersion.view) {
                options.newDocumentVersion.view.node.forEach((item, index) => {
                    modalContent += buildPageContent({
                        newDocumentVersion: item,
                        oldDocumentVersion: ((options.oldDocumentVersion.view || {}).node || [])[index] || '',
                        modalContent: modalContent,
                        isRoot: false,
                        nodeKey: options.nodeKey+":view-multi",
                        nodeIndex: index
                    });
                });
            }
            return modalContent;
        } else if (options.isRoot) {
            let modalContent = '';

            Object.keys(options.newDocumentVersion).forEach((key, index) => {
                if (options.newDocumentVersion[key].node) {
                    if (Array.isArray(options.newDocumentVersion[key].node)) {
                        options.newDocumentVersion[key].node.forEach((node, nodeIndex) => {
                            modalContent += buildPageContent({
                                newDocumentVersion: node,
                                oldDocumentVersion: options.oldDocumentVersion[key].node[nodeIndex],
                                nodeKey: key,
                                parentIndex: index,
                                nodeIndex: nodeIndex,
                                isRoot: false
                            });
                        });
                    } else {
                        modalContent += buildPageContent({
                            newDocumentVersion: options.newDocumentVersion[key].node,
                            oldDocumentVersion: options.oldDocumentVersion[key].node,
                            nodeKey: key,
                            nodeIndex: '',
                            isRoot: false
                        });
                    }
                }
            });
            return modalContent;
        }
    }

    function renderModal() {
        Ratchet.observable("document").get()
            // Return all document versions on this page, no limit, sort with newest first
            .listVersions({ full: true, limit: -1, sort: { "_system.modified_on.ms": -1 } })
            .then(function () {
                let mainModalContent = '';
                let isError = false;
                const selectedItems = getSelectedItems();
                const versionsList = this.asArray()

                // Given the array of all the versions on the page, find the ones we put a checkmark on
                const matchingResults = versionsList.filter(version => selectedItems.includes(version._doc));

                // Remove all the superfluous functions and stuff, just give us the JSON
                const newDocumentVersion = matchingResults[0].json();
                const oldDocumentVersion = matchingResults[1].json();

                // The modal needs a title, might as well use the one on newDocumentVersion...
                const modalTitle = newDocumentVersion.title;

                // Print diff of page title, all pages have a title
                mainModalContent +=  mainModalContent += `<div class='field-name'>Page Title</div>`;
                mainModalContent += `<div class='field-content'>${renderDiff(newDocumentVersion.title, oldDocumentVersion.title)}</div>`;

                 // Print metadata diffs, all pages have metadata
                 newDocumentVersion.metadata.forEach((item, index) => {
                    newValue = item.value;
                    newType = item.type;
                    mainModalContent += `<div class='field-name'>Metadata: ${newType}</div>`;
                    mainModalContent += `<div class='field-content'>${renderDiff(oldDocumentVersion.metadata[index].value, newValue)}</div>`;
                });

                // Print Url List diffs, all pages have a url list
                let oldUrl = (oldDocumentVersion.urlList[0] || {}).url;
                let newUrl = (newDocumentVersion.urlList[0] || {}).url;

                mainModalContent += `<div class='field-name'>url list</div>`;
                mainModalContent += `<div class='field-content'>${renderDiff(oldUrl, newUrl)}</div>`;

                // Add a black divider
                mainModalContent += `<hr class="content-diff-modal-divider" />`;

                // Execute our recursive function above
                // All these page types contain nested nodes we need to recurse through
                if ((matchingResults[1].getTypeQName() === 'cricket:page') ||
                    (matchingResults[1].getTypeQName() === 'cricket:page-support-article') ||
                    (matchingResults[1].getTypeQName() === 'cricket:page-support-category') ||
                    (matchingResults[1].getTypeQName() === 'cricket:page-support-home')) {
                        mainModalContent += buildPageContent({
                            newDocumentVersion: newDocumentVersion,
                            oldDocumentVersion: oldDocumentVersion,
                            isRoot: true
                        });
                } else if (matchingResults[1].getTypeQName() === 'cricket:page-shop') {
                    // Print out page-level properties
                    mainModalContent += `<div class='field-name'>document active</div>`;
                    mainModalContent += `<div class='field-content'>${renderDiff(oldDocumentVersion.active, newDocumentVersion.active)}</div>`;
                    mainModalContent += `<div class='field-name'>document title</div>`;
                    mainModalContent += `<div class='field-content'>${renderDiff(oldDocumentVersion.title, newDocumentVersion.title)}</div>`;

                    // Print out Sku diffs, only possible on page-shop
                    newDocumentVersion.skus.forEach((item, index) => {
                        mainModalContent += renderSku({
                            newSku: item,
                            oldSku: oldDocumentVersion.skus[index],
                            index
                        });
                    });
                }

                if (!isError) {
                    showModal(modalTitle, mainModalContent);
                }
            });
    }

    $(document).on('click', 'li.diff-tool.active', renderModal);

    $(document).on('cloudcms-ready', function () {
        if (isThisPageVersions()) {
            // Insert a new option to the top of the select dropdown
            $(dropdownMenu).prepend(newDropdownOption);

            // Detect click on existing dropdown menu
            // Disable or enable our tool based on number of items selected
            $(dropdownToggleButton).on('click', function () {
                if (isTwoItemsSelected()) {
                    enableDiffTool();
                } else {
                    disableDiffTool();
                }
            });
        }
    });
});