define((require, exports, module) => {
    const $ = require('jquery');
    const dashletSelector = '.htmldashlet .body .cricket-page-search';

    const typeClass = 'page-search';
    const typeSelect = `<div class=${typeClass}">
                            <label>Page URL
                                <input id="search-val" type="text" placeholder="Enter page url">
                            </label>
                        </div>`;

    const messageClass = 'search-message';
    const messageSelector = `${dashletSelector} .${messageClass}`;
    const message = `<div class=${messageClass}></div>`;
    const errorMessageClass = 'errorMessage';
    const errorMessageSelector = `${messageSelector}.${errorMessageClass}`;

    const resultClass = 'search-result';
    const resultSelector = `${dashletSelector} .${resultClass}`;
    const result = `<div class=${resultClass}></div>`;
    const resultMessageClass = 'resultMessage';

    const searchClass = 'search-submit';
    const searchSelector = `${dashletSelector} .${searchClass}`;
    const searchButtonSelector = `${searchSelector} input`;
    const searchButton = `<div class="${searchClass}"><input type="button" value="Search" /></div>`;

    const buttonsClass = 'action-buttons';
    const buttonsSelector = `${dashletSelector} .${buttonsClass}`;
    const buttons = `<div class="${buttonsClass}">${searchButton}</div>`;

    const contentClass = 'content';
    const contentSelector = `${dashletSelector} .${contentClass}`;
    const content = `<div class="${contentClass}"></div>`;

    const activationStyles = `${contentSelector} { background: #fff; border: 1px solid #ccc; padding: 10px; }
                              ${buttonsSelector} { background: #fff; border-top: none; text-align: right; }
                              ${searchButtonSelector} { display: inline-block; margin: 10px 0 10px 10px; }
                              ${dashletSelector} label { width: 100%; display: flex; flex-direction: column; }
                              ${errorMessageSelector} { color: #a94442; }
                              ${resultSelector} { overflow-wrap: break-word}`;

    function populateDashlet() {
        $(dashletSelector).append(`<style>${activationStyles}</style>`);
        $(dashletSelector).append(content);

        const contentElem = $(contentSelector);
        contentElem.append(typeSelect);
        contentElem.append(message);
        contentElem.append(buttons);
        contentElem.append(result);
    }

    function disableButtons() {
        $(`${searchButtonSelector}`).attr('disabled', 'disabled');
    }

    function enableButtons() {
        $(`${searchButtonSelector}`).removeAttr('disabled');
    }

    function setMessage(msg, msgClass) {
        $(messageSelector)
            .addClass(msgClass)
            .text(msg);
    }

    function clearMessage() {
        $(messageSelector)
            .removeClass(errorMessageClass)
            .empty();
    }

    function clearResults() {
        $(resultSelector)
            .removeClass(resultMessageClass)
            .empty();
    }

    function setResult(searchResult) {
        $(resultSelector).append(searchResult);
    }

    function genericErrorLoggerHalter(err) {
        console.error(err);
        return false;
    }

    function queryForDocuments(value) {
        const branch = Ratchet.observable('branch').get();
        const chain = Chain(branch).trap(genericErrorLoggerHalter);
        const queryObject = {
            urlList: {
                $elemMatch: {
                    url: value
                }
            }
        };
        return chain.queryNodes(queryObject);
    }

    function searchByUrl() {
        const searchValue = $('#search-val').val();
        const currentUrl = window.location.href;
        const branch = Ratchet.observable('branch').get();
        if (searchValue) {
            clearMessage();
            clearResults();
            disableButtons();
            queryForDocuments(searchValue).then(function() {
                if (this.asArray().length === 0) {
                    setMessage('No results found for the URL.', errorMessageClass);
                    enableButtons();
                } else {
                    let masterBranchId = '';
                    if (branch.isMaster) {
                        masterBranchId = `/wid/${branch.getId()}`;
                    }
                    this.asArray().forEach((node) => {
                        const curResult = `${currentUrl}${masterBranchId}/documents/${node._doc}`;
                        setResult(`<div><a href="${curResult}" target="_blank">${node.getTitle()}</a></div>`);
                    });
                    enableButtons();
                }
            });
        } else {
            clearResults();
            setMessage('Please enter the URL that you want to search.', errorMessageClass);
            enableButtons();
        }
    }

    $(document).on('cloudcms-ready', () => {
        let branch;
        if (Ratchet) {
            branch = Ratchet.observable('branch').get();
        }
        // only inject form if user is on branch
        if (branch) {
            populateDashlet();
        }

        $('#search-val').on('keydown', function(event) {
            if (event && event.key && event.key === 'Enter') {
                searchByUrl();
            }
        });
    });

    $(document).on('click', `${searchButtonSelector}`, searchByUrl);
});
