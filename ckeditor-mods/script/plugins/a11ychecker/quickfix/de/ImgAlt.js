/**
 * @license Copyright (c) 2014-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/license
 */

(function() {
    'use strict';

    CKEDITOR.plugins.a11ychecker.quickFixes.get({
        langCode: 'de',
        name: 'QuickFix',
        callback(QuickFix) {
            const emptyWhitespaceRegExp = /^[\s\n\r]+$/g;

            /**
             * Fixes the image with missing alt attribute.
             *
             * @constructor
             */
            function ImgAlt(issue) {
                QuickFix.call(this, issue);
            }

            /**
             * Maximal count of characters in the alt. It might be changed to `0` to prevent
             * length validation.
             *
             * @member CKEDITOR.plugins.a11ychecker.quickFix.AttributeRename
             * @static
             */
            ImgAlt.altLengthLimit = 100;

            ImgAlt.prototype = new QuickFix();
            ImgAlt.prototype.constructor = ImgAlt;

            ImgAlt.prototype.display = function(form) {
                form.setInputs({
                    alt: {
                        type: 'text',
                        label: this.lang.altLabel,
                        value: this.issue.element.getAttribute('alt') || ''
                    }
                });
            };

            ImgAlt.prototype.fix = function(formAttributes, callback) {
                this.issue.element.setAttribute('alt', formAttributes.alt);

                if (callback) {
                    callback(this);
                }
            };

            ImgAlt.prototype.validate = function(formAttributes) {
                const ret = [];
                const proposedAlt = `${formAttributes.alt}`;
                const imgElem = this.issue && this.issue.element;
                const { lang } = this;

                // Test if the alt has only whitespaces.
                if (proposedAlt.match(emptyWhitespaceRegExp)) {
                    ret.push(lang.errorWhitespace);
                }

                // Testing against exceeding max length.
                if (ImgAlt.altLengthLimit && proposedAlt.length > ImgAlt.altLengthLimit) {
                    const errorTemplate = new CKEDITOR.template(lang.errorTooLong);

                    ret.push(
                        errorTemplate.output({
                            limit: ImgAlt.altLengthLimit,
                            length: proposedAlt.length
                        })
                    );
                }

                if (imgElem) {
                    const fileName = String(imgElem.getAttribute('src'))
                        .split('/')
                        .pop();
                    if (fileName == proposedAlt) {
                        ret.push(lang.errorSameAsFileName);
                    }
                }

                return ret;
            };

            ImgAlt.prototype.lang = {
                altLabel: 'Alternativtext',
                errorTooLong: 'Der Alternativtext ist zu lang. Er sollte {limit} Zeichen lang sein, ist aber aktuell {length} Zeichen lang',
                errorWhitespace: 'Der Alternativtext kann nicht nur Leerzeichen enthalten',
                errorSameAsFileName: 'Der Alternativtext sollte nicht dem Dateinamen entsprechen'
            };
            CKEDITOR.plugins.a11ychecker.quickFixes.add('de/ImgAlt', ImgAlt);
        }
    });
})();
