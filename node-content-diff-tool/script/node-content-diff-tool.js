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
            return `<div class="removed-text">${oldDocumentVersion}</div>`;
        }
        if (!newDocumentVersion && !oldDocumentVersion) {
            return `<div class="error">EMPTY</div>`
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

    function renderMetadataDiffs({ newDocumentVersion, oldDocumentVersion }) {
        let modalContent = '';

        // Print metadata diffs, all pages have metadata
        // Determine which document version has more metadata items, this is the one we're going to loop through
        const newMetadataLength = newDocumentVersion.metadata.length;
        const oldMetadataLength = oldDocumentVersion.metadata.length;

        modalContent += `<div class="section-header">metadata</div>`;
        if (newMetadataLength >= oldMetadataLength) {
            newDocumentVersion.metadata.forEach((item, index) => {
                newValue = item.value;
                newType = item.type;
                oldValue = oldDocumentVersion.metadata[index] ? oldDocumentVersion.metadata[index].value : '';
                oldType = oldDocumentVersion.metadata[index] ? oldDocumentVersion.metadata[index].type : '';
                modalContent += `<div class="field-content"><span class="field-label">${newType}</span>: ${renderDiff(oldValue, newValue)}</div>`;
            });
        } else if (newMetadataLength <= oldMetadataLength) {
            oldDocumentVersion.metadata.foreach((item, index) => {
                oldValue = item.value;
                oldType = item.type;
                newValue = newDocumentVersion.metadata[index] ? newDocumentVersion.metadata[index].value : '';
                newType = newDocumentVersion.metadata[index] ? newDocumentVersion.metadata[index].type : '';
                modalContent += `<div class="field-content"><span class="field-label">${newType}</span>: ${renderDiff(oldValue, newValue)}</div>`;
            });
        }
        return modalContent;
    }

    function renderUrlListDiffs({ newDocumentVersion, oldDocumentVersion }) {
        let modalContent = '';

        // Print Url List diffs, all pages have a url list
        let oldUrl = (oldDocumentVersion.urlList[0] || {}).url;
        let newUrl = (newDocumentVersion.urlList[0] || {}).url;

        modalContent += `<div class="section-header">url list</div>`;
        modalContent += `<div class="field-content"><span class="field-label">url</span>: ${renderDiff(oldUrl, newUrl)}</div>`;

        return modalContent;
    }

    function renderSkuField({ oldSku, newSku, field }) {
        let modalContent = '';

        modalContent += `<div class="field-content"><span class="field-label">${field}</span>: ${renderDiff(oldSku[field], newSku[field])}</div>`;
        return modalContent;
    }

    function renderSku({ oldSku, newSku }) {
        let modalContent = '';
        const typeQName = newSku ? newSku.typeQName : oldSku.typeQName;
        const additionalSkuFields = ['active', 'id', 'modelName', 'refurbished', 'skuId', 'title'];
        const colorFields = ['active', 'displayName', 'hexValue', 'id', 'title'];

        if (typeQName === 'cricket:product') {

        }

        // Specifically call out the color array
        // Check that the color property exists on either the old or new document version
        // If not, then just render the diffs on the other properties
        if ((newSku.color && newSku.color[0]) || (oldSku.color && oldSku.color[0])) {
            const newColor = newSku.color ? newSku.color[0] : '';
            const oldColor = oldSku.color ? oldSku.color[0] : '';

            modalContent += `<div class="section-header">skus</div>`;
            colorFields.forEach(field => {
                modalContent += `<div class="field-content"><span class="field-label">color ${field}</span>: ${renderDiff(oldColor[field], newColor[field])}</div>`;
            });
        }

        // Call out the other fields that are not "color"
        additionalSkuFields.forEach(field => {
            if (oldSku[field] || newSku[field]) {
                modalContent += renderSkuField({
                    oldSku,
                    newSku,
                    field
                });
            }
        });
        return modalContent;
    }

    function renderPageShopContent({ newDocumentVersion, oldDocumentVersion }) {
        let modalContent = '';

        // Print out page-level properties
        modalContent += `<div class="section-header">page shop content</div>`;
        modalContent += `<div class="field-content"><span class="field-label">active</span>: ${renderDiff(oldDocumentVersion.active, newDocumentVersion.active)}</div>`;
        modalContent += `<div class="field-content"><span class="field-label">title</span>: ${renderDiff(oldDocumentVersion.title, newDocumentVersion.title)}</div>`;

        // Print out Sku diffs, only possible on page-shop
        // Determine which document version has more skus, this is the one we're going to loop through
        const newSkusLength = newDocumentVersion.skus.length;
        const oldSkusLength = oldDocumentVersion.skus.length;
        if (newSkusLength >= oldSkusLength) {
            newDocumentVersion.skus.forEach((item, index) => {
                modalContent += renderSku({
                    newSku: item,
                    oldSku: oldDocumentVersion.skus[index],
                    index
                });
            })
        } else if (oldSkusLength > newSkusLength) {
            oldDocumentVersion.skus.forEach((item, index) => {
                modalContent += renderSku({
                    oldSku: item,
                    newSku: newDocumentVersion.skus[index],
                    index
                });
            });
        }

        return modalContent;
    }

    function renderPageTitleDiffs({ newDocumentVersion, oldDocumentVersion }) {
        let modalContent = '';

        // Print diff of page title, all pages have a title
        modalContent += `<div class="section-header">page title</div>`;
        modalContent += `<div class="field-content">${renderDiff(newDocumentVersion.title, oldDocumentVersion.title)}</div>`;

        return modalContent;
    }

    function buildPageContent({ isRoot, nodeKey, oldDocumentVersion, newDocumentVersion }) {
        // Here be dragons
        // TODO: refactor this function

        const typeQName = newDocumentVersion ? newDocumentVersion.typeQName : oldDocumentVersion.typeQName;

        if (typeQName === 'cricket:header') {
            let modalContent = '';
            const oldTitle = oldDocumentVersion ? oldDocumentVersion.title : '';
            const newTitle = newDocumentVersion ? newDocumentVersion.title : '';
            const oldHeader = oldDocumentVersion ? oldDocumentVersion.header : '';
            const newHeader = newDocumentVersion ? newDocumentVersion.header : '';
            const oldactive = oldDocumentVersion ? oldDocumentVersion.active : '';
            const newactive = newDocumentVersion ? newDocumentVersion.active : '';

            modalContent += `<div class='field-content'><span class="field-label">title</span>: ${renderDiff(oldTitle, newTitle)}</div>`;
            modalContent += `<div class='field-content'><span class="field-label">header</span>: ${renderDiff(oldHeader, newHeader)}</div>`;
            modalContent += `<div class='field-content'><span class="field-label">active</span>: ${renderDiff(oldactive, newactive)}</div>`;
            return modalContent;
        } else if ((typeQName === 'cricket:paragraph') ||
            (newDocumentVersion.typeQName === 'cricket:disclaimer') ||
            (newDocumentVersion.typeQName === 'cricket:table')) {
            let modalContent = '';
            const oldParagraph = oldDocumentVersion ? oldDocumentVersion.paragraph : '';
            const newParagraph = newDocumentVersion ? newDocumentVersion.paragraph : '';

            modalContent += `<div class='field-content'><span class="field-label">paragraph</span>: ${renderDiff(oldParagraph, newParagraph)}</div>`;
            return modalContent;
        } else if (typeQName === 'cricket:link') {
            let modalContent = '';
            const oldAriaLabel = oldDocumentVersion ? oldDocumentVersion.linkAriaLabel : '';
            const newAriaLabel = newDocumentVersion ? newDocumentVersion.linkAriaLabel : '';

            modalContent += `<div class='field-content'><span class="field-label">link</span>: ${renderDiff(oldAriaLabel, newAriaLabel)}</div>`;
            return modalContent;
        } else if (typeQName === 'cricket:image') {
            let modalContent = '';
            const oldImageTitle = oldDocumentVersion ? oldDocumentVersion.title : '';
            const newImagetitle = newDocumentVersion ? newDocumentVersion.title : '';

            modalContent += `<div class='field-content'><span class="field-label">title</span>: ${renderDiff(oldImageTitle, newImagetitle)}</div>`;
            return modalContent;
        } else if (typeQName === 'cricket:product') {
            let modalContent = '';
            const oldSOL = oldDocumentVersion ? oldDocumentVersion.sol : '';
            const newSOL = newDocumentVersion ? newDocumentVersion.sol : '';

            modalContent += `<div class='field-content'><span class="field-label">sol</span>: ${renderDiff(oldSOL, newSOL)}</div>`;
            return modalContent;
        } else if (typeQName === 'cricket:view-multi') {
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
            Object.keys(newDocumentVersion).forEach((key, index) => {
                if (newDocumentVersion[key].node) {
                    if (Array.isArray(newDocumentVersion[key].node)) {
                        modalContent += `<div class="section-header">${key}</div>`;
                        // Which array is longer? Use this to iterate over.
                        newLength = newDocumentVersion.length;
                        oldLength = oldDocumentVersion.length;
                        if (newLength >= oldLength) {
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
                        }

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
                        modalContent += `<div class="section-header">${key}</div>`;
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

                // Render page title diffs
                mainModalContent += renderPageTitleDiffs({ newDocumentVersion, oldDocumentVersion });

                // Render metadata diffs
                mainModalContent += renderMetadataDiffs({ newDocumentVersion, oldDocumentVersion });

                // Render url list diffs
                mainModalContent += renderUrlListDiffs({ newDocumentVersion, oldDocumentVersion });

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
                mainModalContent += renderPageShopContent({ newDocumentVersion, oldDocumentVersion });
                }

                // Finally, show the modal with the accumulated contents
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