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
            body: `<div id='diff-modal-content'>${content}</div>`,
            modalClass: 'node-content-diff-modal'
        });
    }

    function renderDiff(oldDocumentVersion, newDocumentVersion) {
        if (!oldDocumentVersion && newDocumentVersion) {
            return `<div class="added-text">${newDocumentVersion}</div>`;
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

    function renderSkuField({ type, oldSku, newSku, field }) {
        let modalContent = '';

        modalContent += `<div class='field-name'>${type}</div>`;
        modalContent += `<div class='field-content'>${renderDiff(oldSku[field], newSku[field])}</div>`;
        return modalContent;
    }

    function renderSku({ oldSku, newSku, index }) {
        let modalContent = '';
        const additionalSkuFields = ['active', 'id', 'modelName', 'refurbished', 'skuId', 'title'];
        const colorFields = ['active', 'displayName', 'hexValue', 'id', 'title'];

        // Specifically call out the color array
        // Check that the color property exists on either the old or new document version
        // If not, then just render the diffs on the other properties
        if ((newSku.color && newSku.color[0]) || (oldSku.color && oldSku.color[0])) {
            const newColor = newSku.color ? newSku.color[0] : '';
            const oldColor = oldSku.color ? oldSku.color[0] : '';

            colorFields.forEach(field => {
                modalContent += `<div class='field-name'>SKU${index}:color:${field}</div>`;
                modalContent += `<div class='field-content'>${renderDiff(oldColor[field], newColor[field])}</div>`;
            });
        }

        // Call out the other fields that are not "color"
        additionalSkuFields.forEach(field => {
            modalContent += renderSkuField({
                type: `SKU${index}:${field}`,
                oldSku,
                newSku,
                field
            });
        });
        return modalContent;
    }

    function buildPageContent({ isRoot, nodeKey, oldDocumentVersion, newDocumentVersion }) {
        // Here be dragons
        // TODO: refactor this function

        if (newDocumentVersion.typeQName === 'cricket:header') {
            let modalContent = '';

            modalContent += `<div class='field-content'><span>title</span>: ${renderDiff(oldDocumentVersion.title, newDocumentVersion.title)}</div>`;
            modalContent += `<div class='field-content'>header: ${renderDiff(oldDocumentVersion.header, newDocumentVersion.header)}</div>`;
            modalContent += `<div class='field-content'>active: ${renderDiff(oldDocumentVersion.active, newDocumentVersion.active)}</div>`;
            return modalContent;
        } else if ((newDocumentVersion.typeQName === 'cricket:paragraph') ||
            (newDocumentVersion.typeQName === 'cricket:disclaimer') ||
            (newDocumentVersion.typeQName === 'cricket:table')) {
            let modalContent = '';
            const oldParagraph = oldDocumentVersion ? oldDocumentVersion.paragraph : '';
            const newParagraph = newDocumentVersion ? newDocumentVersion.paragraph : '';
            modalContent += `<div class='field-content'><span>paragraph</span>:${renderDiff(oldParagraph, newParagraph)}</div>`;
            return modalContent;
        } else if (newDocumentVersion.typeQName === 'cricket:link') {
            let modalContent = '';
            const oldAriaLabel = oldDocumentVersion ? oldDocumentVersion.linkAriaLabel : '';
            const newAriaLabel = newDocumentVersion ? newDocumentVersion.linkAriaLabel : '';
            modalContent += `<div class='field-content'><span>link</span>: ${renderDiff(oldAriaLabel, newAriaLabel)}</div>`;
            return modalContent;
        } else if (newDocumentVersion.typeQName === 'cricket:view-multi') {
            let modalContent = '';

            if (newDocumentVersion.view) {
                newDocumentVersion.view.node.forEach((item, index) => {
                    modalContent += buildPageContent({
                        newDocumentVersion: item,
                        oldDocumentVersion: ((oldDocumentVersion.view || {}).node || [])[index] || '',
                        modalContent,
                        isRoot: false,
                        nodeKey: nodeKey + ":view-multi",
                        nodeIndex: index
                    });
                });
            }
            return modalContent;
        } else if (isRoot) {
            let modalContent = '';
            // Determine which document version has the longer array length
            // We will then use that docuemnt version to loop through
            // TODO change this to check if it's an array
            const newDocumentLength = newDocumentVersion.length || 1; // first pass through, the length will be undefined, so give it a default
            const oldDocumentLength = oldDocumentVersion.length || 1;

            if (newDocumentLength >= oldDocumentLength) {
                Object.keys(newDocumentVersion).forEach((key, index) => {
                    if (newDocumentVersion[key].node) {
                        if (Array.isArray(newDocumentVersion[key].node)) {
                            modalContent += `<div class="section-header">${key}</div>`;
                            newDocumentVersion[key].node.forEach((node, nodeIndex) => {
                                modalContent += buildPageContent({
                                    newDocumentVersion: node,
                                    oldDocumentVersion: oldDocumentVersion[key].node[nodeIndex],
                                    nodeKey: key,
                                    parentIndex: index,
                                    nodeIndex,
                                    isRoot: false
                                });
                            });
                        } else {
                            modalContent += buildPageContent({
                                newDocumentVersion: newDocumentVersion[key].node,
                                oldDocumentVersion: oldDocumentVersion[key].node,
                                nodeKey: key,
                                nodeIndex: '',
                                isRoot: false
                            });
                        }
                    }
                });
            } else if (oldDocumentLength >= newDocumentLength) {
                Object.keys(oldDocumentVersion).forEach((key, index) => {
                    if (oldDocumentVersion[key].node) {
                        if (Array.isArray(oldDocumentVersion[key].node)) {
                            modalContent += `<h1>${key}</h1>`;
                            oldDocumentVersion[key].node.forEach((node, nodeIndex) => {
                                modalContent += buildPageContent({
                                    oldDocumentVersion: node,
                                    newDocumentVersion: newDocumentVersion[key].node[nodeIndex],
                                    nodeKey: key,
                                    parentIndex: index,
                                    nodeIndex,
                                    isRoot: false
                                });
                            });
                        } else {
                            modalContent += buildPageContent({
                                newDocumentVersion: newDocumentVersion[key].node,
                                oldDocumentVersion: oldDocumentVersion[key].node,
                                nodeKey: key,
                                nodeIndex: '',
                                isRoot: false
                            });
                        }
                    }
                });
            }

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

                // TODO: remove these consoles
                console.log('new doc ver =>', newDocumentVersion);
                console.log('old doc ver =>', oldDocumentVersion);

                // Print diff of page title, all pages have a title
                mainModalContent += `<div class="section-header">page title</div>`;
                mainModalContent += `<div class="field-content">${renderDiff(newDocumentVersion.title, oldDocumentVersion.title)}</div>`;

                // Print metadata diffs, all pages have metadata
                // Determine which document version has more metadata items, this is the one we're going to loop through
                const newMetadataLength = newDocumentVersion.metadata.length;
                const oldMetadataLength = oldDocumentVersion.metadata.length;
                mainModalContent += `<div class="section-header">metadata</div>`;
                if (newMetadataLength >= oldMetadataLength) {
                    newDocumentVersion.metadata.forEach((item, index) => {
                        newValue = item.value;
                        newType = item.type;
                        oldValue = oldDocumentVersion.metadata[index] ? oldDocumentVersion.metadata[index].value : '';
                        oldType = oldDocumentVersion.metadata[index] ? oldDocumentVersion.metadata[index].type : '';
                        mainModalContent += `<div class="field-content">${renderDiff(oldValue, newValue)}</div>`;
                    });
                } else if (newMetadataLength <= oldMetadataLength) {
                    oldDocumentVersion.metadata.foreach((item, index) => {
                        oldValue = item.value;
                        oldType = item.type;
                        newValue = newDocumentVersion.metadata[index] ? newDocumentVersion.metadata[index].value : '';
                        newType = newDocumentVersion.metadata[index] ? newDocumentVersion.metadata[index].type : '';
                        mainModalContent += `<div class="field-content">${renderDiff(oldValue, newValue)}</div>`;
                    });
                }

                // Print Url List diffs, all pages have a url list
                let oldUrl = (oldDocumentVersion.urlList[0] || {}).url;
                let newUrl = (newDocumentVersion.urlList[0] || {}).url;

                mainModalContent += `<div class="section-header">url list</div>`;
                mainModalContent += `<div class="field-content">${renderDiff(oldUrl, newUrl)}</div>`;

                // Add a black divider
                mainModalContent += `<hr class="content-diff-modal-divider" />`;

                // Execute our recursive function above
                // All these page types contain nested nodes we need to recurse through
                if ((matchingResults[1].getTypeQName() === 'cricket:page') ||
                    (matchingResults[1].getTypeQName() === 'cricket:page-support-article') ||
                    (matchingResults[1].getTypeQName() === 'cricket:page-support-category') ||
                    (matchingResults[1].getTypeQName() === 'cricket:page-support-home')) {
                    mainModalContent += buildPageContent({
                        newDocumentVersion,
                        oldDocumentVersion,
                        isRoot: true
                    });
                } else if (matchingResults[1].getTypeQName() === 'cricket:page-shop') {
                    // Print out page-level properties
                    mainModalContent += `<div class="field-name">document active</div>`;
                    mainModalContent += `<div class="field-content">${renderDiff(oldDocumentVersion.active, newDocumentVersion.active)}</div>`;
                    mainModalContent += `<div class="field-name">document title</div>`;
                    mainModalContent += `<div class="field-content">${renderDiff(oldDocumentVersion.title, newDocumentVersion.title)}</div>`;

                    // Print out Sku diffs, only possible on page-shop
                    // Determine which document version has more skus, this is the one we're going to loop through
                    newSkusLength = newDocumentVersion.skus.length;
                    oldSkusLength = oldDocumentVersion.skus.length;
                    if (newSkusLength >= oldSkusLength) {
                        newDocumentVersion.skus.forEach((item, index) => {
                            mainModalContent += renderSku({
                                newSku: item,
                                oldSku: oldDocumentVersion.skus[index],
                                index
                            });
                        });
                    } else if (oldSkusLength >= newSkusLength) {
                        oldDocumentVersion.skus.forEach((item, index) => {
                            mainModalContent += renderSku({
                                oldSku: item,
                                newSku: newDocumentVersion.skus[index],
                                index
                            });
                        });
                    }
                }

                if (!isError) {
                    // The modal needs a title, might as well use the one on newDocumentVersion...
                    const modalTitle = newDocumentVersion.title;
                    showModal(modalTitle, mainModalContent);
                }
            });
    }

    $(document).on('click', 'li.diff-tool.active-list-item', renderModal);

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