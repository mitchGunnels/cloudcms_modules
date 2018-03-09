define(function(require, exports, module) {


    var uri = module.uri;
    uri = uri.substring(0, uri.lastIndexOf('/'));
    console.log(uri);
    /**
     * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
     * For licensing, see LICENSE.md or http://ckeditor.com/license
     */

    /**
     * @fileOverview The "a11ychecker" plugin.
     *
     */
    var pluginName = 'a11ychecker';

    CKEDITOR.plugins.add(pluginName, {
        requires: 'balloonpanel',
        lang: 'en,nl,de', // %REMOVE_LINE_CORE%
        // List of preferred languages for quickfixes.
        quickFixesLang: 'en,nl,de',
        icons: pluginName, // %REMOVE_LINE_CORE%
        hidpi: true, // %REMOVE_LINE_CORE%

        onLoad: function() {
            var path = uri+'/';

            // Load skin CSS.
            CKEDITOR.document.appendStyleSheet(path + 'skins/' + this.getStylesSkinName() + '/a11ychecker.css');

            // Namespace register.
            require([
                path+'Engine',
                path+'Issue',
                path+'IssueList',
                path+'IssueDetails',
                path+'quickfix/LocalizedRepository'
            ], function(
                Engine,
                Issue,
                IssueList,
                IssueDetails,
                LocalizedRepository
            ) {
                CKEDITOR.tools.extend(CKEDITOR.plugins.a11ychecker, {
                    Engine: Engine,
                    Issue: Issue,
                    IssueList: IssueList,
                    IssueDetails: IssueDetails
                });

                CKEDITOR.plugins.a11ychecker.quickFixes = new LocalizedRepository(path + 'quickfix/');
            });
        },

        beforeInit: function(editor) {
            var that = this;

            if (!editor.config.a11ychecker_noIgnoreData) {
                // Register an ACF rule so it won't remove data-a11y-ignore attributes, only if there
                // is no config setting denying it.
                editor.filter.allow('*[data-a11y-ignore]', 'a11ychecker');
            }

            // Create a temp controller placeholder.
            this.createTemporaryNamespace(editor);

            editor.once('instanceReady', function() {
                // Loads Engine, Controller and ViewerController classes.
                require(['Controller'], function(Controller) {
                    var a11ychecker = new Controller(editor),
                        tempNamespace = editor._.a11ychecker;

                    // Assign controller object to the editor protected namespace.
                    editor._.a11ychecker = a11ychecker;

                    tempNamespace.getEngineType(function(EngineType) {
                        a11ychecker.setEngine(new EngineType(that));
                        /**
                         * @todo: this line should be moved to the EngineQuail constructor.
                         * I've put it here just to avoid conflicts with t/130 branch. After that we should move this.
                         */
                        a11ychecker.engine.config = a11ychecker.engine.createConfig(editor);

                        // Fire loaded event on old placeholder, so subscribers know that real Controller
                        // is available.
                        tempNamespace.fire('loaded', null, editor);
                    });
                });
            });

            that.commandRegister.call(that, editor);
            that.guiRegister(editor);
        },

        // Register buttons, dialogs etc.
        guiRegister: function(editor) {
            var cssPath = this.path + 'skins/' + this.getStylesSkinName() + '/contents.css',
                // We need to be aware that editor.addContentsCss might not be
                // available as it was introduced in CKE 4.4.0.
                addContentsCss = editor.addContentsCss || editorAddContentsCss;

            if (editor.ui.addButton) {
                editor.ui.addButton('A11ychecker', {
                    label: editor.lang.a11ychecker.toolbar,
                    command: pluginName,
                    toolbar: 'document,10'
                });
            }

            // Insert contents CSS.
            addContentsCss.call(editor, cssPath);
        },

        /*
         * Registers commands like:
         * a11ychecker
         * a11ychecker.next
         * a11ychecker.prev
         *
         * etc
         */
        commandRegister: function(editor) {
            editor.addCommand(pluginName, {
                exec: cmdExec,
                async: true,
                canUndo: false,
                editorFocus: false // (#123)
            });

            editor.addCommand(pluginName + '.listen', {
                exec: cmdListen,
                canUndo: false,
                editorFocus: false
            });

            editor.addCommand(pluginName + '.next', {
                exec: cmdNext,
                async: true,
                canUndo: false,
                editorFocus: false
            });

            editor.addCommand(pluginName + '.prev', {
                exec: cmdPrev,
                async: true,
                canUndo: false,
                editorFocus: false
            });

            editor.addCommand(pluginName + '.close', {
                exec: cmdClose
            });
        },

        /**
         * Creates a temporary editor._.a11ychecker object, implementing event listening.
         *
         * The only purpose of this object is to fire `loaded` event, telling that real
         * Controller was instantiated in editor._.a11ychecker method.
         */
        createTemporaryNamespace: function(editor) {
            editor._.a11ychecker = {
                getEngineType: function(callback) {
                    /**
                     * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
                     * For licensing, see LICENSE.md or http://ckeditor.com/license
                     */
                    //jscs:disable
                    /* jshint ignore:start */

                    /**
                     * @fileOverview This file contains a code that will be inlined to plugin.js in partucilar place when
                     * building AC distro.
                     *
                     * The reason for such approach is that AMDClean was automatically hoisting all the AMD types to the
                     * beginning of the file, and executing them. Therefore Quail would... require jQuery! No matter if
                     * it's overriden by any custom plugin or not.
                     *
                     * So with this file Quail is simply inlined inside the plugin.js file (still I'd say that we might
                     * actually load it async at runtime, it would keep the file smaller).
                     */

                    var acNamespace = CKEDITOR.plugins.a11ychecker,
                        Engine = acNamespace.Engine,
                        IssueList = acNamespace.IssueList,
                        Issue = acNamespace.Issue,
                        IssueDetails = acNamespace.IssueDetails,
                        Quail,
                        EngineQuailConfig,
                        $ = window.jQuery || window.$;

                    // EngineQuailConfig class can still be loaded with RequireJS as it does not have any deps.
                    require(['EngineQuailConfig'], function(_EngineQuailConfig) {
                        EngineQuailConfig = _EngineQuailConfig;
                    });

                    (function() {
                        if (!$ || !$.fn) {
                            throw new Error('Missing jQuery. Accessibility Checker\'s default engine, Quail.js requires jQuery ' +
                                'to work correctly.');
                        }

                        // We'll load custom Quail only if it's not already registered.
                        if ($.fn.quail) {
                            return;
                        }
                        // %LEAVE_UNMINIFIED% %REMOVE_LINE%
                        /*! QUAIL quailjs.org | quailjs.org/license */
                        ! function(a) {
                            "use strict";
                            Function.prototype.bind = Function.prototype.bind || function(a) { if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable"); var b = Array.prototype.slice,
                                    c = b.call(arguments, 1),
                                    d = this,
                                    e = function() {},
                                    f = function() { return d.apply(this instanceof e ? this : a || window, c.concat(b.call(arguments))) }; return e.prototype = this.prototype, f.prototype = new e, f };
                            var b = { options: {}, components: {}, lib: {}, testabilityTranslation: { 0: "suggestion", .5: "moderate", 1: "severe" }, html: null, strings: {}, accessibilityResults: {}, accessibilityTests: null, guidelines: { wcag: { setup: function(a, b, c) { c = c || {}; for (var d in this.successCriteria)
                                                if (this.successCriteria.hasOwnProperty(d)) { var e = this.successCriteria[d];
                                                    e.registerTests(a), b && b.listenTo && "function" == typeof b.listenTo && c.successCriteriaEvaluated && b.listenTo(e, "successCriteriaEvaluated", c.successCriteriaEvaluated) } }, successCriteria: {} } }, tests: {}, textSelector: ":not(:empty)", suspectPHeaderTags: ["strong", "b", "em", "i", "u", "font"], suspectPCSSStyles: ["color", "font-weight", "font-size", "font-family"], focusElements: "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]", emoticonRegex: /((?::|;|B|P|=)(?:-)?(?:\)|\(|o|O|D|P))/g, selfClosingTags: ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"], optionalClosingTags: ["p", "li", "th", "tr", "td"], run: function(c) {
                                    function d(a, b, c) { if (c.guideline && c.guideline.length) { a.tests = a.lib.TestCollection([], { scope: a.html || null }); for (var d = 0, e = c.guideline.length; e > d; ++d) { var f = c.guideline[d];
                                                b[f] && (b[f].scope = a.html || null, a.tests.set(f, b[f])) } } else a.tests = a.lib.TestCollection(b, { scope: a.html || null }) }

                                    function e() { if ("undefined" != typeof c.customTests)
                                            for (var a in c.customTests) c.customTests.hasOwnProperty(a) && (c.customTests[a].scope = b.html || null, b.tests.set(a, c.customTests[a])); var d = function() {}; for (var e in b.guidelines) b.guidelines[e] && "function" == typeof b.guidelines[e].setup && b.guidelines[e].setup(b.tests, this, { successCriteriaEvaluated: c.successCriteriaEvaluated || d });
                                        b.tests.run({ preFilter: c.preFilter || function() {}, caseResolve: c.caseResolve || function() {}, testComplete: c.testComplete || function() {}, testCollectionComplete: c.testCollectionComplete || function() {}, complete: c.complete || function() {} }) } if (c.reset && (b.accessibilityResults = {}), b.tests = b.lib.TestCollection([], { scope: b.html || null }), "undefined" != typeof quailBuilderTests) b.tests = b.lib.TestCollection(quailBuilderTests, { scope: b.html || null }), e.call(b);
                                    else if ("wcag2" === c.guideline) b.lib.wcag2.run(c);
                                    else if (c.accessibilityTests) d(b, c.accessibilityTests, c), e.call(b);
                                    else { var f = c.jsonPath; "string" == typeof c.guideline && (f += "/guidelines/" + c.guideline), a.ajax({ url: f + "/tests.json", dataType: "json", success: function(a) { "object" == typeof a && (d(b, a, c), e.call(b)) }, error: function() { throw new Error("Tests could not be loaded") } }) } }, listenTo: function(a, b, c) { c = c.bind(this), a.registerListener.call(a, b, c) }, getConfiguration: function(a) { var b = this.tests.find(a),
                                        c = b && b.get("guidelines"),
                                        d = c && this.options.guidelineName && c[this.options.guidelineName],
                                        e = d && d.configuration; return e ? e : !1 }, isUnreadable: function(a) { return "string" != typeof a ? !0 : a.trim().length ? !1 : !0 }, isDataTable: function(b) { if (b.find("tr").length < 3) return !1; if (b.find("th[scope]").length) return !0; var c = b.find("tr:has(td)").length,
                                        d = b.find("td[rowspan], td[colspan]"),
                                        e = !0; if (d.length) { var f = {};
                                        d.each(function() { "undefined" == typeof f[a(this).index()] && (f[a(this).index()] = 0), f[a(this).index()]++ }), a.each(f, function(a, b) { c > b && (e = !1) }) } var g = b.find("table"); if (g.length) { var h = {};
                                        g.each(function() { var b = a(this).parent("td").index();
                                            b !== !1 && "undefined" == typeof h[b] && (h[b] = 0), h[b]++ }), a.each(h, function(a, b) { c > b && (e = !1) }) } return e }, getTextContents: function(a) { if (a.is("p, pre, blockquote, ol, ul, li, dl, dt, dd, figure, figcaption")) return a.text(); for (var b = "", c = a[0].childNodes, d = 0, e = c.length; e > d; d += 1) 3 === c[d].nodeType && (b += c[d].nodeValue); return b }, validURL: function(a) { return -1 === a.search(" ") }, cleanString: function(a) { return a.toLowerCase().replace(/^\s\s*/, "") }, containsReadableText: function(c, d) { if (c = c.clone(), c.find("option").remove(), !b.isUnreadable(c.text())) return !0; if (!b.isUnreadable(c.attr("alt"))) return !0; if (d) { var e = !1; if (c.find("*").each(function() { b.containsReadableText(a(this), !0) && (e = !0) }), e) return !0 } return !1 } };
                            if (window && (window.quail = b), a.fn.quail = function(a) { return this.length ? (b.options = a, b.html = this, b.run(a), this) : this }, a.expr[":"].quailCss = function(b, c, d) { var e = d[3].split(/\s*=\s*/); return a(b).css(e[0]).search(e[1]) > -1 }, b.components.acronym = function(b, c, d) { c.get("$scope").each(function() { var b = a(this),
                                            e = {},
                                            f = {};
                                        b.find("acronym[title], abbr[title]").each(function() { f[a(this).text().toUpperCase().trim()] = a(this).attr("title") }), b.find("p, div, h1, h2, h3, h4, h5").each(function() { var b = this,
                                                g = a(b),
                                                h = g.text().split(" "),
                                                i = [];
                                            h.length > 1 && g.text().toUpperCase() !== g.text() ? (a.each(h, function(a, b) { b.length < 2 || (b = b.replace(/[^a-zA-Zs]/, ""), b.toUpperCase() === b && "undefined" == typeof f[b.toUpperCase().trim()] && ("undefined" == typeof e[b.toUpperCase()] && i.push(b), e[b.toUpperCase()] = b)) }), c.add(i.length ? d({ element: b, expected: g.closest(".quail-test").data("expected"), info: { acronyms: i }, status: "failed" }) : d({ element: b, expected: g.closest(".quail-test").data("expected"), status: "passed" }))) : c.add(d({ element: b, expected: g.closest(".quail-test").data("expected"), status: "passed" })) }) }) }, b.components.color = function() {
                                    function c(a, c, d, e, f, g) { a.add(c({ element: d, expected: function(a, c) { return b.components.resolveExpectation(a, c) }(d, f), message: g, status: e })) }

                                    function d(b) { return "" !== a.trim(b) }

                                    function e(c) { var d = c.parentNode,
                                            e = a(d); return 1 !== d.nodeType ? !1 : -1 !== ["script", "style", "title", "object", "applet", "embed", "template", "noscript"].indexOf(d.nodeName.toLowerCase()) ? !1 : b.isUnreadable(e.text()) ? !1 : !0 }

                                    function f(a) {
                                        function b(a) { return Object.keys(a).length } var c = {},
                                            d = a.groupCasesBySelector(),
                                            e = ""; for (var f in d)
                                            if (d.hasOwnProperty(f)) { var g = d[f];
                                                g.each(function(a, b) { b.get("status") === c && (c[f] = e) }) }
                                        return b(c) === b(d) } var g = { cache: {}, getLuminosity: function(a, b) { var c = "getLuminosity_" + a + "_" + b; if (a = g.parseColor(a), b = g.parseColor(b), void 0 !== g.cache[c]) return g.cache[c]; var d, e, f = a.r / 255,
                                                h = a.g / 255,
                                                i = a.b / 255,
                                                j = .03928 >= f ? f / 12.92 : Math.pow((f + .055) / 1.055, 2.4),
                                                k = .03928 >= h ? h / 12.92 : Math.pow((h + .055) / 1.055, 2.4),
                                                l = .03928 >= i ? i / 12.92 : Math.pow((i + .055) / 1.055, 2.4),
                                                m = b.r / 255,
                                                n = b.g / 255,
                                                o = b.b / 255,
                                                p = .03928 >= m ? m / 12.92 : Math.pow((m + .055) / 1.055, 2.4),
                                                q = .03928 >= n ? n / 12.92 : Math.pow((n + .055) / 1.055, 2.4),
                                                r = .03928 >= o ? o / 12.92 : Math.pow((o + .055) / 1.055, 2.4); return d = .2126 * j + .7152 * k + .0722 * l, e = .2126 * p + .7152 * q + .0722 * r, g.cache[c] = Math.round((Math.max(d, e) + .05) / (Math.min(d, e) + .05) * 10) / 10, g.cache[c] }, fetchImageColorAtPixel: function(a, b, c) { b = "undefined" != typeof b ? b : 1, c = "undefined" != typeof c ? c : 1; var d = document.createElement("canvas"),
                                                e = d.getContext("2d");
                                            e.drawImage(a, 0, 0); var f = e.getImageData(b, c, 1, 1).data; return "rgb(" + f[0] + "," + f[1] + "," + f[2] + ")" }, testElmContrast: function(a, b, c) { var d = g.getColor(b, "background"); return g.testElmBackground(a, b, d, c) }, testElmBackground: function(a, b, c, d) { var e, f = g.getColor(b, "foreground"); return "wcag" === a ? e = g.passesWCAGColor(b, f, c, d) : "wai" === a && (e = g.passesWAIColor(f, c)), e }, passesWCAGColor: function(a, c, d, e) { var f = b.components.convertToPx(a.css("fontSize")); if ("undefined" == typeof e)
                                                if (f >= 18) e = 3;
                                                else { var h = a.css("fontWeight");
                                                    e = f >= 14 && ("bold" === h || parseInt(h, 10) >= 700) ? 3 : 4.5 }
                                            return g.getLuminosity(c, d) > e }, passesWAIColor: function(a, b) { var c = g.getWAIErtContrast(a, b),
                                                d = g.getWAIErtBrightness(a, b); return c > 500 && d > 125 }, getWAIErtContrast: function(a, b) { var c = g.getWAIDiffs(a, b); return c.red + c.green + c.blue }, getWAIErtBrightness: function(a, b) { var c = g.getWAIDiffs(a, b); return (299 * c.red + 587 * c.green + 114 * c.blue) / 1e3 }, getWAIDiffs: function(a, b) { return { red: Math.abs(a.r - b.r), green: Math.abs(a.g - b.g), blue: Math.abs(a.b - b.b) } }, getColor: function(b, c) { var d = g;
                                            b.attr("data-cacheId") || b.attr("data-cacheId", "id_" + Math.random()); var e = "getColor_" + c + "_" + b.attr("data-cacheId"); if (void 0 !== g.cache[e]) return g.cache[e]; if ("foreground" === c) return g.cache[e] = b.css("color") ? b.css("color") : "rgb(0,0,0)", g.cache[e]; var f = b.css("background-color"); return g.hasBackgroundColor(f) ? (g.cache[e] = f, g.cache[e]) : (b.parents().each(function() { var b = a(this).css("background-color"); return g.hasBackgroundColor(b) ? d.cache[e] = b : void 0 }), g.cache[e] = "rgb(255,255,255)", g.cache[e]) }, getForeground: function(a) { return g.getColor(a, "foreground") }, parseColor: function(a) { return "object" == typeof a ? a : "#" === a.substr(0, 1) ? { r: parseInt(a.substr(1, 2), 16), g: parseInt(a.substr(3, 2), 16), b: parseInt(a.substr(5, 2), 16), a: !1 } : "rgb" === a.substr(0, 3) ? (a = a.replace("rgb(", "").replace("rgba(", "").replace(")", "").split(","), { r: a[0], g: a[1], b: a[2], a: "undefined" == typeof a[3] ? !1 : a[3] }) : void 0 }, getBackgroundImage: function(b) { b.attr("data-cacheId") || b.attr("data-cacheId", "id_" + Math.random()); var c = "getBackgroundImage_" + b.attr("data-cacheId"); if (void 0 !== g.cache[c]) return g.cache[c]; for (b = b[0]; b && 1 === b.nodeType && "BODY" !== b.nodeName && "HTML" !== b.nodeName;) { var d = a(b).css("background-image"); if (d && "none" !== d && -1 !== d.search(/^(.*?)url(.*?)$/i)) return g.cache[c] = d.replace("url(", "").replace(/['"]/g, "").replace(")", ""), g.cache[c];
                                                b = b.parentNode } return g.cache[c] = !1, !1 }, getBackgroundGradient: function(b) { b.attr("data-cacheId") || b.attr("data-cacheId", "id_" + Math.random()); var c = "getBackgroundGradient_" + b.attr("data-cacheId"); if (void 0 !== g.cache[c]) return g.cache[c]; var d = function(b) { return "" !== a.trim(b) }; for (b = b[0]; b && 1 === b.nodeType && "BODY" !== b.nodeName && "HTML" !== b.nodeName;) { if (g.hasBackgroundColor(a(b).css("background-color"))) return g.cache[c] = !1, !1; var e = a(b).css("backgroundImage"); if (e && "none" !== e && -1 !== e.search(/^(.*?)gradient(.*?)$/i)) { var f = e.match(/gradient(\(.*\))/g); if (f.length > 0) return f = f[0].replace(/(linear|radial|from|\bto\b|gradient|top|left|bottom|right|\d*%)/g, ""), g.cache[c] = a.grep(f.match(/(rgb\([^\)]+\)|#[a-z\d]*|[a-z]*)/g), d), g.cache[c] } b = b.parentNode } return g.cache[c] = !1, !1 }, getAverageRGB: function(a) { var b = a.src; if (void 0 !== g.cache[b]) return g.cache[b]; var c, d, e, f, h = 5,
                                                i = { r: 0, g: 0, b: 0 },
                                                j = document.createElement("canvas"),
                                                k = j.getContext && j.getContext("2d"),
                                                l = -4,
                                                m = { r: 0, g: 0, b: 0, a: 0 },
                                                n = 0; if (!k) return g.cache[b] = i, i;
                                            e = j.height = a.height, d = j.width = a.width, k.drawImage(a, 0, 0); try { c = k.getImageData(0, 0, d, e) } catch (o) { return g.cache[b] = i, i } for (f = c.data.length;
                                                (l += 4 * h) < f;) ++n, m.r += c.data[l], m.g += c.data[l + 1], m.b += c.data[l + 2]; return m.r = ~~(m.r / n), m.g = ~~(m.g / n), m.b = ~~(m.b / n), g.cache[b] = m, m }, colorToHex: function(a) { var b = /rgba?\((\d+), (\d+), (\d+)/.exec(a); return b ? "#" + (1 << 24 | b[1] << 16 | b[2] << 8 | b[3]).toString(16).substr(1) : a }, hasBackgroundColor: function(a) { return "rgba(0, 0, 0, 0)" !== a && "transparent" !== a }, traverseVisualTreeForBackground: function(b, c) { b.attr("data-cacheId") || b.attr("data-cacheId", "id_" + Math.random()); var e = "traverseVisualTreeForBackground_" + b.attr("data-cacheId") + "_" + c; if (void 0 !== g.cache[e]) return g.cache[e]; var f, h = [];
                                            b[0].scrollIntoView(); var i = b.offset().left - a(window).scrollLeft(),
                                                j = b.offset().top - a(window).scrollTop();
                                            h.push({ element: b, visibility: b.css("visibility") }), b.css("visibility", "hidden"); for (var k = document.elementFromPoint(i, j); void 0 === f && k && "BODY" !== k.tagName && "HTML" !== k.tagName;) { k = a(k); var l, m = k.css("backgroundColor"); switch (c) {
                                                    case "background-color":
                                                        g.hasBackgroundColor(m) && (f = m); break;
                                                    case "background-gradient":
                                                        if (g.hasBackgroundColor(m)) { f = !1; continue } if (l = k.css("backgroundImage"), l && "none" !== l && -1 !== l.search(/^(.*?)gradient(.*?)$/i)) { var n = l.match(/gradient(\(.*\))/g);
                                                            n.length > 0 && (n = n[0].replace(/(linear|radial|from|\bto\b|gradient|top|left|bottom|right|\d*%)/g, ""), f = a.grep(n.match(/(rgb\([^\)]+\)|#[a-z\d]*|[a-z]*)/g), d)) } break;
                                                    case "background-image":
                                                        if (g.hasBackgroundColor(m)) { f = !1; continue } l = k.css("backgroundImage"), l && "none" !== l && -1 !== l.search(/^(.*?)url(.*?)$/i) && (f = l.replace("url(", "").replace(/['"]/g, "").replace(")", "")) } h.push({ element: k, visibility: k.css("visibility") }), k.css("visibility", "hidden"), k = document.elementFromPoint(i, j) } for (var o = 0; o < h.length; o++) h[o].element.css("visibility", h[o].visibility); return g.cache[e] = f, f }, getBehindElementBackgroundColor: function(a) { return g.traverseVisualTreeForBackground(a, "background-color") }, getBehindElementBackgroundGradient: function(a) { return g.traverseVisualTreeForBackground(a, "background-gradient") }, getBehindElementBackgroundImage: function(a) { return g.traverseVisualTreeForBackground(a, "background-image") } }; return { colors: g, textShouldBeTested: e, postInvoke: f, buildCase: c } }(), b.components.content = { findContent: function(b) { var c = b; return b.is("[role=main]") ? b : b.find("[role=main]").length ? b.find("[role=main]").first() : 0 === b.find("p").length ? b : (b.find("p").each(function() { var b = a(this).parent(),
                                                d = b.get(0),
                                                e = b.data("content-score") || 0;
                                            b.data("content-score") || (e = b.find("p").length, d.className.match(/(comment|meta|footer|footnote)/) ? e -= 50 : d.className.match(/((^|\\s)(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)(\\s|$))/) && (e += 25), d.id.match(/(comment|meta|footer|footnote)/) ? e -= 50 : d.id.match(/^(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)$/) && (e += 25), b.data("content-score", e)), e += a(this).text().split(",").length, ("undefined" == typeof c.data("content-score") || e > c.data("content-score")) && (c = b) }), c) } }, b.components.convertToPx = function(c) { if (c.search("px") > -1) return parseInt(c, 10); var d = a('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: ' + c + '; line-height: 1; border:0;">&nbsp;</div>').appendTo(b.html),
                                        e = d.height(); return d.remove(), e }, b.components.event = function(b, c, d, e) { var f = c.get("$scope"),
                                        g = e.selector && f.find(e.selector) || f.find("*"),
                                        h = e.searchEvent || "",
                                        i = e.correspondingEvent || "";
                                    g.each(function() { var e, f = h.replace("on", ""),
                                            g = b.components.hasEventListener(a(this), f);
                                        a._data && (e = a._data(this, "events")); var j = e && e[f] && !!e[f].length,
                                            k = !!i.length,
                                            l = b.components.hasEventListener(a(this), i.replace("on", "")),
                                            m = a(this).closest(".quail-test").data("expected"),
                                            n = c.add(d({ element: this, expected: m }));
                                        n.set(!g && !j || k && l ? { status: "passed" } : { status: "failed" }) }) }, b.components.hasEventListener = function(b, c) { return "undefined" != typeof a(b).attr("on" + c) ? !0 : a._data(a(b)[0], "events") && "undefined" != typeof a._data(a(b)[0], "events")[c] ? !0 : a(b).is("a[href], input, button, video, textarea") && "undefined" != typeof a(b)[0][c] && ("click" === c || "focus" === c) && a(b)[0][c].toString().search(/^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i) > -1 ? !1 : "undefined" != typeof a(b)[0][c] }, b.components.headingLevel = function(b, c, d, e) { var f = !1;
                                    c.get("$scope").find(":header").each(function() { var g = parseInt(a(this).get(0).tagName.substr(-1, 1), 10),
                                            h = this;
                                        c.add(f === e.headingLevel && g > f + 1 ? d({ element: h, expected: function(a) { return b.components.resolveExpectation(a) }(h), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(h), status: "passed" })), f = g }) }, b.components.htmlSource = { getHtml: function(c) { var d = this; if ("undefined" != typeof b.options.htmlSource && b.options.htmlSource) return void c(b.options.htmlSource, d.parseHtml(b.options.htmlSource)); var e = a.ajax({ url: window.location.href, async: !1 });
                                        e && "undefined" != typeof e.responseText && c(e.responseText, d.parseHtml(e.responseText)) }, traverse: function(b, c, d, e) { var f = this; "undefined" == typeof e && c(b, d, !1), "undefined" != typeof b.children && (b.childCount = 1, a.each(b.children, function(a, d) { c(d, b.childCount, b), f.traverse(d, c, b.childCount, !0), "tag" === d.type && b.childCount++ })), a.isArray(b) && a.each(b, function(a, b) { f.traverse(b, c) }) }, addSelector: function(a, b, c) { if ("tag" === a.type && "undefined" != typeof a.name && "undefined" == typeof a.selector) { a.selector = c && "undefined" != typeof c.selector ? c.selector.slice() : []; var d = a.name; return "undefined" != typeof a.attributes && ("undefined" != typeof a.attributes.id ? d += "#" + a.attributes.id[0] : "undefined" != typeof a.attributes["class"] && (d += "." + a.attributes["class"][0].replace(/\s/, "."))), !b || "undefined" != typeof a.attributes && "undefined" != typeof a.attributes.id || (d += ":nth-child(" + b + ")"), a.selector.push(d), a.selector } }, parseHtml: function(a) { if ("undefined" == typeof Tautologistics) return !1;
                                        a = a.replace(/<!doctype ([^>]*)>/g, ""); var b = new Tautologistics.NodeHtmlParser.HtmlBuilder(function() {}, {}),
                                            c = new Tautologistics.NodeHtmlParser.Parser(b);
                                        c.parseComplete(a); var d = b.dom,
                                            e = this; return this.traverse(d, e.addSelector), d } }, "undefined" != typeof Tautologistics) { var c = { Text: "text", Tag: "tag", Attr: "attr", CData: "cdata", Comment: "comment" };
                                Tautologistics.NodeHtmlParser.HtmlBuilder.prototype.write = function(a) { if (this._done && this.handleCallback(new Error("Writing to the builder after done() called is not allowed without a reset()")), this._options.includeLocation && a.type !== c.Attr && (a.location = this._getLocation(), this._updateLocation(a)), a.type !== c.Text || !this._options.ignoreWhitespace || !HtmlBuilder.reWhitespace.test(a.data)) { var b, d; if (this._tagStack.last())
                                            if (b = this._tagStack.last(), a.type === c.Tag)
                                                if ("/" === a.name.charAt(0)) { var e = this._options.caseSensitiveTags ? a.name.substring(1) : a.name.substring(1).toLowerCase(); if (b.name === e && (b.closingTag = !0), !this.isEmptyTag(a)) { for (var f = this._tagStack.length - 1; f > -1 && this._tagStack[f--].name !== e;); if (f > -1 || this._tagStack[0].name === e)
                                                            for (; f < this._tagStack.length - 1;) this._tagStack.pop() } } else a.type === c.Attr ? (b.attributes || (b.attributes = {}), "undefined" == typeof b.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()] && (b.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()] = []), b.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()].push(a.data)) : (d = this._copyElement(a), b.children || (b.children = []), b.children.push(d), this.isEmptyTag(d) || this._tagStack.push(d), a.type === c.Tag && (this._lastTag = d));
                                        else b = this._tagStack.last(), a.type === c.Attr ? (b.attributes || (b.attributes = {}), "undefined" == typeof b.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()] && (b.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()] = []), b.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()].push(a.data)) : (b.children || (b.children = []), b.children.push(this._copyElement(a)));
                                        else a.type === c.Tag ? "/" !== a.name.charAt(0) && (d = this._copyElement(a), d.closingTag = !0, this.dom.push(d), this.isEmptyTag(d) || this._tagStack.push(d), this._lastTag = d) : a.type === c.Attr && this._lastTag ? (this._lastTag.attributes || (this._lastTag.attributes = {}), "undefined" == typeof this._lastTag.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()] && (this._lastTag.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()] = []), this._lastTag.attributes[this._options.caseSensitiveAttr ? a.name : a.name.toLowerCase()].push(a.data)) : this.dom.push(this._copyElement(a)) } } }
                            var d = function() { var a, b, c, d, e, f, g, h = "<",
                                    i = ">",
                                    j = "/",
                                    k = "/",
                                    l = "!",
                                    m = new RegExp("[dD]"),
                                    n = new RegExp("[a-z0-9-]"),
                                    o = new RegExp("^<!--.*-->"),
                                    p = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"],
                                    q = ["pre", "code", "textarea", "script", "style"],
                                    r = ["p", "li", "tr", "th", "td"],
                                    s = function(a, b) { return { name: c, line: a + 1, "char": b } },
                                    t = function(a) { var b = new Error("Ending tag not found for: " + a.name + " at line: " + a.line + " char: " + a["char"] + " starting tags: " + d[0].name); throw b.lineData = a, b },
                                    u = function(a) { var b = new Error("Comment ending not found for: `comment` at line: " + a.line + " char: " + a["char"]); throw b.lineData = a, b },
                                    v = function(a) { var b = new Error("Ending `/` not found for: `" + a.name + "` at line: " + a.line + " char: " + a["char"]); throw b.lineData = a.name, b },
                                    w = function(c) { b = a, a = c },
                                    x = function(a) { e -= a },
                                    y = function(a, b, e) { if (n.test(a)) c += a;
                                        else if (a === j) w(C);
                                        else if (a === l) c = "", w(I);
                                        else if (p.indexOf(c) > -1) g.strict_self_closing_tags ? w(z) : (c = "", w(B));
                                        else { var f = s(b, e);
                                            d.push(f), q.indexOf(c) > -1 ? (c = "", x(1), w(F)) : (c = "", x(1), w(A)) } },
                                    z = function(a, b, d) { a === k ? (c = "", w(E)) : a === i && v(s(b, d)) },
                                    A = function(a) { a === i && w(E) },
                                    B = function(a) { a === h && w(y) },
                                    C = function(a) {
                                        function b() { var a = d.pop();
                                            a.name === c ? w(B) : r.indexOf(a.name) > -1 ? b() : t(a) } n.test(a) ? c += a : (b(), c = "") },
                                    D = function(a) { a === j ? w(C) : (x(1), w(y)) },
                                    E = function(a) { a === h && w(D) },
                                    F = function(a) { a === h && w(G) },
                                    G = function(a) { a === j && w(H) },
                                    H = function(a) { if (n.test(a)) c += a;
                                        else { var b = d.pop();
                                            b.name === c ? w(B) : t(b), c = "" } },
                                    I = function(a) { m.test(a) ? (c = "", w(B)) : (x(3), w(J)) },
                                    J = function(a, b, c) { f || (f = { content: "", line: b + 1, "char": c + 1, name: "comment" }), f.content += a, o.test(f.content) && (f = null, w(B)) },
                                    K = function(b, h) { var i = null; try { var j, k = b.split("\n");
                                            w(B), c = "", d = [], f = null, g = h || {}; for (var l = 0, m = k.length; m > l; l++)
                                                for (e = 0, j = k[l].length; j > e && a; e++) a(k[l][e], l, e); if (f) u(f);
                                            else if (d.length > 0) { var n = d[d.length - 1]; - 1 === r.indexOf(n.name) && t(n) } i = null } catch (o) { i = o.message } finally { return i } }; return K };
                            b.components.htmlTagValidator = d(), b.components.label = function(b, c, d, e) { var f = c.get("$scope");
                                    f.each(function() { var f = a(this);
                                        f.find(e.selector).each(function() { c.add(a(this).parent("label").length && f.find("label[for=" + a(this).attr("id") + "]").length && b.containsReadableText(a(this).parent("label")) || b.containsReadableText(f.find("label[for=" + a(this).attr("id") + "]")) ? d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "passed" }) : d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "failed" })) }) }) }, b.components.labelProximity = function(b, c, d, e) { var f = c.get("$scope");
                                    f.find(e.selector).each(function() { var b = f.find("label[for=" + a(this).attr("id") + "]").first();
                                        c.add(d(b.length ? a(this).parent().is(b.parent()) ? { element: this, expected: a(this).closest(".quail-test").data("expected"), status: "passed" } : { element: this, expected: a(this).closest(".quail-test").data("expected"), status: "failed" } : { element: this, expected: a(this).closest(".quail-test").data("expected"), status: "failed" })) }) }, b.components.language = { maximumDistance: 300, textDirection: { rtl: /[\u0600-\u06FF]|[\u0750-\u077F]|[\u0590-\u05FF]|[\uFE70-\uFEFF]/gm, ltr: /[\u0041-\u007A]|[\u00C0-\u02AF]|[\u0388-\u058F]/gm }, textDirectionChanges: { rtl: /[\u200E]|&rlm;/gm, ltr: /[\u200F]|&lrm;/gm }, scripts: { basicLatin: { regularExpression: /[\u0041-\u007F]/g, languages: ["ceb", "en", "eu", "ha", "haw", "id", "la", "nr", "nso", "so", "ss", "st", "sw", "tlh", "tn", "ts", "xh", "zu", "af", "az", "ca", "cs", "cy", "da", "de", "es", "et", "fi", "fr", "hr", "hu", "is", "it", "lt", "lv", "nl", "no", "pl", "pt", "ro", "sk", "sl", "sq", "sv", "tl", "tr", "ve", "vi"] }, arabic: { regularExpression: /[\u0600-\u06FF]/g, languages: ["ar", "fa", "ps", "ur"] }, cryllic: { regularExpression: /[\u0400-\u04FF]|[\u0500-\u052F]/g, languages: ["bg", "kk", "ky", "mk", "mn", "ru", "sr", "uk", "uz"] } }, scriptSingletons: { bn: /[\u0980-\u09FF]/g, bo: /[\u0F00-\u0FFF]/g, el: /[\u0370-\u03FF]/g, gu: /[\u0A80-\u0AFF]/g, he: /[\u0590-\u05FF]/g, hy: /[\u0530-\u058F]/g, ja: /[\u3040-\u309F]|[\u30A0-\u30FF]/g, ka: /[\u10A0-\u10FF]/g, km: /[\u1780-\u17FF]|[\u19E0-\u19FF]/g, kn: /[\u0C80-\u0CFF]/g, ko: /[\u1100-\u11FF]|[\u3130-\u318F]|[\uAC00-\uD7AF]/g, lo: /[\u0E80-\u0EFF]/g, ml: /[\u0D00-\u0D7F]/g, mn: /[\u1800-\u18AF]/g, or: /[\u0B00-\u0B7F]/g, pa: /[\u0A00-\u0A7F]/g, si: /[\u0D80-\u0DFF]/g, ta: /[\u0B80-\u0BFF]/g, te: /[\u0C00-\u0C7F]/g, th: /[\u0E00-\u0E7F]/g, zh: /[\u3100-\u312F]|[\u2F00-\u2FDF]/g }, getDocumentLanguage: function(a, c) { var d = navigator.language || navigator.userLanguage; return "undefined" != typeof b.options.language && (d = b.options.language), a.parents("[lang]").length && (d = a.parents("[lang]:first").attr("lang")), "undefined" != typeof a.attr("lang") && (d = a.attr("lang")), d = d.toLowerCase().trim(), c ? d.split("-")[0] : d } }, b.components.placeholder = function(b, c, d, e) { var f = function(b, e) { c.add(d({ element: b, expected: a(b).closest(".quail-test").data("expected"), status: e })) };
                                    c.get("$scope").find(e.selector).each(function() { var c = ""; if ("none" === a(this).css("display") && !a(this).is("title")) return void f(this, "inapplicable"); if ("undefined" != typeof e.attribute) { if (("undefined" == typeof a(this).attr(e.attribute) || "tabindex" === e.attribute && a(this).attr(e.attribute) <= 0) && !e.content) return void f(this, "failed");
                                            a(this).attr(e.attribute) && "undefined" !== a(this).attr(e.attribute) && (c += a(this).attr(e.attribute)) } if (("undefined" == typeof e.attribute || !e.attribute || e.content) && (c += a(this).text(), a(this).find("img[alt]").each(function() { c += a(this).attr("alt") })), "string" == typeof c && c.length > 0) { c = b.cleanString(c); var d = /^([0-9]*)(k|kb|mb|k bytes|k byte)$/g,
                                                g = d.exec(c.toLowerCase());
                                            g && g[0].length ? f(this, "failed") : e.empty && b.isUnreadable(c) ? f(this, "failed") : b.strings.placeholders.indexOf(c) > -1 ? f(this, "failed") : f(this, "passed") } else e.empty && "number" != typeof c && f(this, "failed") }) }, b.components.resolveExpectation = function(b, c) { var d, e = a(b).closest(".quail-test"),
                                        f = e.data("expected");
                                    c || (d = e.data("expected")); var g = "string" == typeof f && f.split("|"); if (c && 0 === g.length && f.indexOf(":") > -1 && (g = [f]), g.length > 0 && 1 === b.nodeType)
                                        for (var h, i, j = 0, k = g.length; k > j; ++j)
                                            if (h = g[j].split(":"), c) { if (h[0] === c) { if (!h[1] || "ignore" === h[1]) return;
                                                    d = h[1] } } else if (i = a(h[0], e), 1 === i.length && b === i.get(0)) { if (!h[1] || "ignore" === h[1]) return;
                                        d = h[1] } return d }, b.components.selector = function(b, c, d, e) { this.get("$scope").each(function() { var d = a(this),
                                            f = a(this).find(e.selector);
                                        f.length ? f.each(function() { var d, f = a(this);
                                            d = e.test && !f.is(e.test) ? "passed" : "failed", c.add(b.lib.Case({ element: this, expected: f.closest(".quail-test").data("expected"), status: d })) }) : c.add(b.lib.Case({ element: void 0, expected: d.data("expected") || d.find("[data-expected]").data("expected"), status: e.test ? "inapplicable" : "passed" })) }) }, b.statistics = { setDecimal: function(a, b) { var c = Math.pow(10, b || 0); return b ? Math.round(c * a) / c : a }, average: function(a, c) { for (var d = a.length, e = 0; d--;) e += a[d]; return b.statistics.setDecimal(e / a.length, c) }, variance: function(a, c) { for (var d = b.statistics.average(a, c), e = a.length, f = 0; e--;) f += Math.pow(a[e] - d, 2); return f /= a.length, b.statistics.setDecimal(f, c) }, standardDeviation: function(a, c) { var d = Math.sqrt(b.statistics.variance(a, c)); return b.statistics.setDecimal(d, c) } }, b.components.textStatistics = { cleanText: function(a) { return a.replace(/[,:;()\-]/, " ").replace(/[\.!?]/, ".").replace(/[ ]*(\n|\r\n|\r)[ ]*/, " ").replace(/([\.])[\. ]+/, "$1").replace(/[ ]*([\.])/, "$1").replace(/[ ]+/, " ").toLowerCase() }, sentenceCount: function(a) { return a.split(".").length + 1 }, wordCount: function(a) { return a.split(" ").length + 1 }, averageWordsPerSentence: function(a) { return this.wordCount(a) / this.sentenceCount(a) }, averageSyllablesPerWord: function(b) { var c = this,
                                            d = 0,
                                            e = c.wordCount(b); return e ? (a.each(b.split(" "), function(a, b) { d += c.syllableCount(b) }), d / e) : 0 }, syllableCount: function(a) { var b = a.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").match(/[aeiouy]{1,2}/g); return b && 0 !== b.length ? b.length : 1 } }, b.components.video = { isVideo: function(b) { var c = !1; return a.each(this.providers, function() { b.is(this.selector) && this.isVideo(b) && (c = !0) }), c }, findVideos: function(b, c) { a.each(this.providers, function(d, e) { b.find(this.selector).each(function() { var b = a(this);
                                                e.isVideo(b) && e.hasCaptions(b, c) }) }) }, providers: { youTube: { selector: "a, iframe", apiUrl: "http://gdata.youtube.com/feeds/api/videos/?q=%video&caption&v=2&alt=json", isVideo: function(a) { return this.getVideoId(a) !== !1 ? !0 : !1 }, getVideoId: function(a) { var b = a.is("iframe") ? "src" : "href",
                                                    c = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&\?]*).*/,
                                                    d = a.attr(b).match(c); return d && 11 === d[7].length ? d[7] : !1 }, hasCaptions: function(b, c) { var d = this.getVideoId(b);
                                                a.ajax({ url: this.apiUrl.replace("%video", d), async: !1, dataType: "json", success: function(a) { c(b, a.feed.openSearch$totalResults.$t > 0) } }) } }, flash: { selector: "object", isVideo: function(b) { var c = !1; return 0 === b.find("param").length ? !1 : (b.find("param[name=flashvars]").each(function() { a(this).attr("value").search(/\.(flv|mp4)/i) > -1 && (c = !0) }), c) }, hasCaptions: function(b, c) { var d = !1;
                                                b.find("param[name=flashvars]").each(function() {
                                                    (a(this).attr("value").search("captions") > -1 && a(this).attr("value").search(".srt") > -1 || a(this).attr("value").search("captions.pluginmode") > -1) && (d = !0) }), c(b, d) } }, videoElement: { selector: "video", isVideo: function(a) { return a.is("video") }, hasCaptions: function(c, d) { var e = c.find("track[kind=subtitles], track[kind=captions]"); if (!e.length) return void d(c, !1); var f = b.components.language.getDocumentLanguage(c, !0);
                                                c.parents("[lang]").length && (f = c.parents("[lang]").first().attr("lang").split("-")[0]); var g = !1; return e.each(function() { if (!a(this).attr("srclang") || a(this).attr("srclang").toLowerCase() === f) { g = !0; try { var b = a.ajax({ url: a(this).attr("src"), type: "HEAD", async: !1, error: function() {} });
                                                            404 === b.status && (g = !1) } catch (c) {} } }), g ? void d(c, !0) : void d(c, !1) } } } }, b.strings.colors = { aliceblue: "f0f8ff", antiquewhite: "faebd7", aqua: "00ffff", aquamarine: "7fffd4", azure: "f0ffff", beige: "f5f5dc", bisque: "ffe4c4", black: "000000", blanchedalmond: "ffebcd", blue: "0000ff", blueviolet: "8a2be2", brown: "a52a2a", burlywood: "deb887", cadetblue: "5f9ea0", chartreuse: "7fff00", chocolate: "d2691e", coral: "ff7f50", cornflowerblue: "6495ed", cornsilk: "fff8dc", crimson: "dc143c", cyan: "00ffff", darkblue: "00008b", darkcyan: "008b8b", darkgoldenrod: "b8860b", darkgray: "a9a9a9", darkgreen: "006400", darkkhaki: "bdb76b", darkmagenta: "8b008b", darkolivegreen: "556b2f", darkorange: "ff8c00", darkorchid: "9932cc", darkred: "8b0000", darksalmon: "e9967a", darkseagreen: "8fbc8f", darkslateblue: "483d8b", darkslategray: "2f4f4f", darkturquoise: "00ced1", darkviolet: "9400d3", deeppink: "ff1493", deepskyblue: "00bfff", dimgray: "696969", dodgerblue: "1e90ff", firebrick: "b22222", floralwhite: "fffaf0", forestgreen: "228b22", fuchsia: "ff00ff", gainsboro: "dcdcdc", ghostwhite: "f8f8ff", gold: "ffd700", goldenrod: "daa520", gray: "808080", green: "008000", greenyellow: "adff2f", honeydew: "f0fff0", hotpink: "ff69b4", indianred: "cd5c5c", indigo: "4b0082", ivory: "fffff0", khaki: "f0e68c", lavender: "e6e6fa", lavenderblush: "fff0f5", lawngreen: "7cfc00", lemonchiffon: "fffacd", lightblue: "add8e6", lightcoral: "f08080", lightcyan: "e0ffff", lightgoldenrodyellow: "fafad2", lightgrey: "d3d3d3", lightgreen: "90ee90", lightpink: "ffb6c1", lightsalmon: "ffa07a", lightseagreen: "20b2aa", lightskyblue: "87cefa", lightslategray: "778899", lightsteelblue: "b0c4de", lightyellow: "ffffe0", lime: "00ff00", limegreen: "32cd32", linen: "faf0e6", magenta: "ff00ff", maroon: "800000", mediumaquamarine: "66cdaa", mediumblue: "0000cd", mediumorchid: "ba55d3", mediumpurple: "9370d8", mediumseagreen: "3cb371", mediumslateblue: "7b68ee", mediumspringgreen: "00fa9a", mediumturquoise: "48d1cc", mediumvioletred: "c71585", midnightblue: "191970", mintcream: "f5fffa", mistyrose: "ffe4e1", moccasin: "ffe4b5", navajowhite: "ffdead", navy: "000080", oldlace: "fdf5e6", olive: "808000", olivedrab: "6b8e23", orange: "ffa500", orangered: "ff4500", orchid: "da70d6", palegoldenrod: "eee8aa", palegreen: "98fb98", paleturquoise: "afeeee", palevioletred: "d87093", papayawhip: "ffefd5", peachpuff: "ffdab9", peru: "cd853f", pink: "ffc0cb", plum: "dda0dd", powderblue: "b0e0e6", purple: "800080", red: "ff0000", rosybrown: "bc8f8f", royalblue: "4169e1", saddlebrown: "8b4513", salmon: "fa8072", sandybrown: "f4a460", seagreen: "2e8b57", seashell: "fff5ee", sienna: "a0522d", silver: "c0c0c0", skyblue: "87ceeb", slateblue: "6a5acd", slategray: "708090", snow: "fffafa", springgreen: "00ff7f", steelblue: "4682b4", tan: "d2b48c", teal: "008080", thistle: "d8bfd8", tomato: "ff6347", turquoise: "40e0d0", violet: "ee82ee", wheat: "f5deb3", white: "ffffff", whitesmoke: "f5f5f5", yellow: "ffff00", yellowgreen: "9acd32" }, b.strings.languageCodes = ["bh", "bi", "nb", "bs", "br", "bg", "my", "es", "ca", "km", "ch", "ce", "ny", "ny", "zh", "za", "cu", "cu", "cv", "kw", "co", "cr", "hr", "cs", "da", "dv", "dv", "nl", "dz", "en", "eo", "et", "ee", "fo", "fj", "fi", "nl", "fr", "ff", "gd", "gl", "lg", "ka", "de", "ki", "el", "kl", "gn", "gu", "ht", "ht", "ha", "he", "hz", "hi", "ho", "hu", "is", "io", "ig", "id", "ia", "ie", "iu", "ik", "ga", "it", "ja", "jv", "kl", "kn", "kr", "ks", "kk", "ki", "rw", "ky", "kv", "kg", "ko", "kj", "ku", "kj", "ky", "lo", "la", "lv", "lb", "li", "li", "li", "ln", "lt", "lu", "lb", "mk", "mg", "ms", "ml", "dv", "mt", "gv", "mi", "mr", "mh", "ro", "ro", "mn", "na", "nv", "nv", "nd", "nr", "ng", "ne", "nd", "se", "no", "nb", "nn", "ii", "ny", "nn", "ie", "oc", "oj", "cu", "cu", "cu", "or", "om", "os", "os", "pi", "pa", "ps", "fa", "pl", "pt", "pa", "ps", "qu", "ro", "rm", "rn", "ru", "sm", "sg", "sa", "sc", "gd", "sr", "sn", "ii", "sd", "si", "si", "sk", "sl", "so", "st", "nr", "es", "su", "sw", "ss", "sv", "tl", "ty", "tg", "ta", "tt", "te", "th", "bo", "ti", "to", "ts", "tn", "tr", "tk", "tw", "ug", "uk", "ur", "ug", "uz", "ca", "ve", "vi", "vo", "wa", "cy", "fy", "wo", "xh", "yi", "yo", "za", "zu"], b.strings.newWindow = [/new (browser )?(window|frame)/, /popup (window|frame)/], b.strings.placeholders = ["title", "untitled", "untitled document", "this is the title", "the title", "content", " ", "new page", "new", "nbsp", "&nbsp;", "spacer", "image", "img", "photo", "frame", "frame title", "iframe", "iframe title", "legend"], b.strings.redundant = { inputImage: ["submit", "button"], link: ["link to", "link", "go to", "click here", "link", "click", "more"], required: ["*"] }, b.strings.siteMap = ["site map", "map", "sitemap"], b.strings.skipContent = [/(jump|skip) (.*) (content|main|post)/i], b.strings.suspiciousLinks = ["click here", "click", "more", "here", "read more", "download", "add", "delete", "clone", "order", "view", "read", "clic aqu&iacute;", "clic", "haga clic", "m&aacute;s", "aqu&iacute;", "image"], b.strings.symbols = ["|", "*", /\*/g, "<br>*", "&bull;", "&#8226", "♦", "›", "»", "‣", "▶", ".", "◦", "✓", "◽", "•", "—", "◾"], b.KINGStrongList = function(b, c, d) {
                                    c.get("$scope").find("strong").each(function() {
                                        var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set({ status: a(this).parent().is("li") ? "passed" : "failed" })
                                    })
                                }, b.KINGUseCurrencyAsSymbol = function(b, c, d) {
                                    function e(e, f) { var g = ["dollar", "euro", "pound", "franc", "krona", "rupee", "ruble", "dinar"],
                                            h = new RegExp("\\d{1,}\\s*(" + g.join("|") + ")\\w*\\b|(" + g.join("|") + ")\\w*\\b\\s*\\d{1,}", "ig"),
                                            i = b.getTextContents(a(f)),
                                            j = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(j), j.set({ status: h.test(i) ? "failed" : "passed" }) } c.get("$scope").find("p").each(e) }, b.KINGUseLongDateFormat = function(b, c, d) {
                                    function e(b, e) { var f, g = /\d{1,2}([./-])\d{1,2}\1\d{2,4}/g,
                                            h = e.childNodes,
                                            i = !1,
                                            j = [],
                                            k = 0; for (f = h.length; f > k; k++) h[k].nodeType === Node.TEXT_NODE && j.push(h[k]); for (k = 0; k < j.length && !i; k++) { var l = j[k].nodeValue;
                                            g.test(l) && (i = !0) } var m = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(m), m.set({ status: i ? "failed" : "passed" }) } var f = "a, article, aside, b, blockquote, caption, cite, dd, del, div, em, figcaption, footer, h1, h2, h3, h4, h5, h6, header, i, label, legend, li, mark, nav, option, p, q, s, section, small, span, strong, sub, summary, sup, td, th, title, u";
                                    c.get("$scope").find(f).each(e) }, b.KINGUsePercentageWithSymbol = function(b, c, d) {
                                    function e(e, f) { var g = ["percent", "pct\\."],
                                            h = new RegExp("\\d{1,}\\s*(" + g.join("|") + ")|(" + g.join("|") + ")\\s*\\d{1,}", "ig"),
                                            i = b.getTextContents(a(f)),
                                            j = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(j), j.set({ status: h.test(i) ? "failed" : "passed" }) } c.get("$scope").find("p").each(e) }, b.aAdjacentWithSameResourceShouldBeCombined = function(b, c, d) {
                                    function e(b, c) { var d = a(c),
                                            e = d.find("a + a").length > 0,
                                            h = d.find("a");
                                        h.each(e ? f : g) }

                                    function f(b, e) { var f = a(e),
                                            g = e.getAttribute("href"),
                                            h = f.find("+ a"); if (h.length) { var i = h[0].getAttribute("href"),
                                                j = "passed",
                                                k = d({ element: e, expected: f.closest(".quail-test").data("expected") });
                                            g === i && (j = "failed"), c.add(k), k.set({ status: j }) } }

                                    function g(b, e) { var f = d({ element: e });
                                        c.add(f), f.set({ status: "inapplicable", expected: a(e).closest(".quail-test").data("expected") }) } c.get("$scope").each(e) }, b.aImgAltNotRepetitive = function(b, c, d) { c.get("$scope").find("a img[alt]").each(function() { var e = c.add(d({ element: this })),
                                            f = a(this).closest(".quail-test").data("expected");
                                        e.set(b.cleanString(a(this).attr("alt")) === b.cleanString(a(this).parent("a").text()) ? { expected: f, status: "failed" } : { expected: f, status: "passed" }) }) }, b.aInPHasADistinctStyle = function(b, c, d) {
                                    function e(a) { return a.outerWidth() - a.innerWidth() > 0 || a.outerHeight() - a.innerHeight() > 0 }

                                    function f(b, c) { var d = !1,
                                            f = ["font-weight", "font-style"],
                                            g = b.css("text-decoration"); return "none" !== g && g !== c.css("text-decoration") && (d = !0), "rgba(0, 0, 0, 0)" !== b.css("background-color") && f.push("background"), a.each(f, function(a, e) { d || b.css(e) === c.css(e) || (d = !0) }), d || e(b) }

                                    function g(a) { var b = "block" === a.css("display"),
                                            c = a.css("position"),
                                            d = "relative" !== c && "static" !== c; return b || d } var h = /^([\s|-]|>|<|\\|\/|&(gt|lt);)*$/i;
                                    c.get("$scope").each(function() { var b = a(this),
                                            e = b.find("p a[href]:visible");
                                        e.each(function() { var b = a(this),
                                                e = b.closest("p"),
                                                i = b.parent(),
                                                j = d({ element: this, expected: b.closest(".quail-test").data("expected") });
                                            c.add(j); var k = b.text().trim(),
                                                l = e.clone().find("a[href]").remove().end().text(); "" === k || l.match(h) ? j.set("status", "inapplicable") : b.css("color") === e.css("color") ? j.set("status", "passed") : f(b, e) ? j.set("status", "passed") : g(b) ? j.set("status", "passed") : b.find("img").length > 0 ? j.set("status", "passed") : i.text().trim() === k && f(i, e) ? j.set("status", "passed") : j.set("status", "failed") }) }) }, b.aLinkTextDoesNotBeginWithRedundantWord = function(b, c, d) { c.get("$scope").find("a").each(function() { var e = a(this),
                                            f = "";
                                        a(this).find("img[alt]").length && (f += a(this).find("img[alt]:first").attr("alt")), f += a(this).text(), f = f.toLowerCase(); var g;
                                        a.each(b.strings.redundant.link, function(a, b) { f.search(b) > -1 && (g = c.add(d({ element: this, expected: e.closest(".quail-test").data("expected"), status: "failed" }))) }), g || c.add(d({ element: this, expected: e.closest(".quail-test").data("expected"), status: "passed" })) }) }, b.aLinkWithNonText = function(b, c, d) { c.get("$scope").find("a").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") }); if (c.add(e), !a(this).is("a:has(img, object, embed)[href]")) return void e.set({ status: "inapplicable" }); if (!b.isUnreadable(a(this).text())) return void e.set({ status: "passed" }); var f = 0;
                                        a(this).find("img, object, embed").each(function() {
                                            (a(this).is("img") && b.isUnreadable(a(this).attr("alt")) || !a(this).is("img") && b.isUnreadable(a(this).attr("title"))) && f++ }), e.set(a(this).find("img, object, embed").length === f ? { status: "failed" } : { status: "passed" }) }) }, b.aLinksAreSeparatedByPrintableCharacters = function(b, c, d) { c.get("$scope").find("a").each(function() { var e = c.add(d({ element: this })),
                                            f = a(this).closest(".quail-test").data("expected");
                                        a(this).next("a").length && e.set(b.isUnreadable(a(this).get(0).nextSibling.wholeText) ? { expected: f, status: "failed" } : { expected: f, status: "passed" }) }) }, b.aLinksDontOpenNewWindow = function(b, c, d) { c.get("$scope").find("a").not("[target=_new], [target=_blank]").each(function() { c.add(d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "passed" })) }), c.get("$scope").find("a[target=_new], a[target=_blank]").each(function() { var e = a(this),
                                            f = !1,
                                            g = 0,
                                            h = e.text() + " " + e.attr("title"),
                                            i = "";
                                        do i = b.strings.newWindow[g], h.search(i) > -1 && (f = !0), ++g; while (!f && g < b.strings.newWindow.length);
                                        c.add(d(f ? { element: this, expected: e.closest(".quail-test").data("expected"), status: "passed" } : { element: this, expected: e.closest(".quail-test").data("expected"), status: "failed" })) }) }, b.aLinksNotSeparatedBySymbols = function(b, c, d) { c.get("$scope").find("a").each(function() { var e = a(this); if (e.next("a").length) { var f = e.get(0).nextSibling.wholeText; "string" == typeof f ? -1 !== b.strings.symbols.indexOf(f.toLowerCase().trim()) && c.add(d({ element: this, expected: e.closest(".quail-test").data("expected"), status: "failed" })) : c.add(d({ element: this, expected: e.closest(".quail-test").data("expected"), status: "passed" })) } else c.add(d({ status: "inapplicable" })) }) }, b.aMustContainText = function(b, c, d) { c.get("$scope").find("a").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") }); return c.add(e), a(this).attr("href") && "none" !== a(this).css("display") ? void e.set(b.containsReadableText(a(this), !0) ? { status: "passed" } : { status: "failed" }) : void e.set({ status: "inapplicable" }) }) }, b.aSuspiciousLinkText = function(b, c, d) { c.get("$scope").find("a").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") }); if (c.add(e), !a(this).attr("href")) return void e.set({ status: "inapplicable" }); var f = a(this).text();
                                        a(this).find("img[alt]").each(function() { f += a(this).attr("alt") }), e.set(b.strings.suspiciousLinks.indexOf(b.cleanString(f)) > -1 ? { status: "failed" } : { status: "passed" }) }) }, b.animatedGifMayBePresent = function(b, c, d) {
                                    function e(a, b, c) { if ("gif" !== b) return void c(!1); var d = new XMLHttpRequest;
                                        d.open("GET", a, !0), d.responseType = "arraybuffer", d.addEventListener("load", function() { var a = new Uint8Array(d.response),
                                                b = 0; if (71 !== a[0] || 73 !== a[1] || 70 !== a[2] || 56 !== a[3]) return void c(!1); for (var e = 0; e < a.length - 9; e++)
                                                if (0 !== a[e] || 33 !== a[e + 1] || 249 !== a[e + 2] || 4 !== a[e + 3] || 0 !== a[e + 8] || 44 !== a[e + 9] && 33 !== a[e + 9] || b++, b > 1) return void c(!0);
                                            c(!1) }), d.send() } c.get("$scope").find("img").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b); var f = a(this).attr("src"),
                                            g = a(this).attr("src").split(".").pop().toLowerCase(); return "gif" !== g ? void b.set({ status: "inapplicable" }) : void e(f, g, function(a) { return a ? void b.set({ status: "cantTell" }) : void b.set({ status: "inapplicable" }) }) }) }, b.appletContainsTextEquivalent = function(b, c, d) { c.get("$scope").find('applet[alt=""], applet:not(applet[alt])').each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e), e.set(b.isUnreadable(a(this).text()) ? { status: "failed" } : { status: "passed" }) }) }, b.ariaOrphanedContent = function(b, c, d) { var e = c.get("$scope");
                                    e.each(function() { var b = a(this),
                                            e = !!b.attr("role"),
                                            f = !!b.find("[role]").length; if (!e && !f) return void c.add(d({ expected: b.data("expected"), status: "inapplicable" })); var g = b.find("*:not(*[role] *, *[role], script, meta, link)");
                                        g.length ? g.each(function() { c.add(d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "failed" })) }) : c.add(d({ expected: b.data("expected"), status: "passed" })) }) }, b.audioMayBePresent = function(b, c, d) { var e = ["mp3", "m4p", "ogg", "oga", "opus", "wav", "wma", "wv"];
                                    c.get("$scope").each(function() { var b = a(this),
                                            f = !1;
                                        b.find("object, audio").each(function() { f = !0, c.add(d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "cantTell" })) }), b.find("a[href]").each(function() { var b = a(this),
                                                g = b.attr("href").split(".").pop(); - 1 !== a.inArray(g, e) && (f = !0, c.add(d({ element: this, expected: b.closest(".quail-test").data("expected"), status: "cantTell" }))) }), f || c.add(d({ element: this, status: "inapplicable", expected: a(this).closest(".quail-test").data("expected") })) }) }, b.blockquoteUseForQuotations = function(b, c, d) { c.get("$scope").find("p").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") }); return c.add(b), a(this).parents("blockquote").length > 0 ? void b.set({ status: "inapplicable" }) : void b.set(a(this).text().substr(0, 1).search(/'|"|«|“|「/) > -1 && a(this).text().substr(-1, 1).search(/'|"|»|„|」/) > -1 ? { status: "failed" } : { status: "passed" }) }) }, b.closingTagsAreUsed = function(b, c, d) { b.components.htmlSource.getHtml(function(e, f) { b.components.htmlSource.traverse(f, function(e) { if ("tag" === e.type && a.isArray(e.selector)) { var f;
                                                f = /#/.test(e.selector.slice(-1)[0]) ? e.selector.slice(-1)[0] : e.selector.join(" > "); var g = a(f, c.get("$scope")).get(0);
                                                g || (g = e.raw || f), c.add("undefined" != typeof e.closingTag || e.closingTag || -1 !== b.selfClosingTags.indexOf(e.name.toLowerCase()) ? d({ element: g, expected: "object" == typeof g && 1 === g.nodeType && a(g).closest(".quail-test").data("expected") || null, status: "passed" }) : d({ element: g, expected: "object" == typeof g && 1 === g.nodeType && a(g).closest(".quail-test").data("expected") || null, status: "failed" })) } }) }) }, b.colorBackgroundGradientContrast = function(b, c, d, e) {
                                    function f(a, b, c, d, e) { var f, j, k, l = g.getBackgroundGradient(d); if (l) { for (var m = 0; m < l.length; m++) "rgb" === l[m].substr(0, 3) && (l[m] = g.colorToHex(l[m])); for (j = new Rainbow, j.setSpectrumByArray(l), k = l.length * c.gradientSampleMultiplier, f = !1, m = 0; !f && k > m; m++) { var n = g.testElmBackground(c.algorithm, d, "#" + j.colourAt(m));
                                                n || (h(a, b, e, "failed", i, "The background gradient makes the text unreadable"), f = !0) } f || h(a, b, e, "passed", i, "The background gradient does not affect readability") } } var g = b.components.color.colors,
                                        h = b.components.color.buildCase,
                                        i = "colorBackgroundGradientContrast";
                                    c.get("$scope").each(function() { for (var g = document.evaluate("descendant::text()[normalize-space()]", this, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null), i = [], j = g.iterateNext(); j;) b.components.color.textShouldBeTested(j) && i.push(j.parentNode), j = g.iterateNext();
                                        0 === i.length && h(c, d, null, "inapplicable", "", "There is no text to evaluate"), i.forEach(function(b) { f(c, d, e, a(b), b) }) }) }, b.colorBackgroundImageContrast = function(b, c, d, e) {
                                    function f(a, b, c, d, e) { var f = g.getBackgroundImage(d); if (f) { var j = document.createElement("img");
                                            j.crossOrigin = "Anonymous", j.onload = function() { var f = g.getAverageRGB(j),
                                                    k = g.testElmBackground(c.algorithm, d, f);
                                                k ? h(a, b, e, "passed", i, "The element's background image does not affect readability") : h(a, b, e, "failed", i, "The element's background image makes the text unreadable") }, j.onerror = j.onabort = function() { h(a, b, e, "cantTell", i, "The element's background image could not be loaded (" + f + ")") }, j.src = f } } var g = b.components.color.colors,
                                        h = b.components.color.buildCase,
                                        i = "colorBackgroundImageContrast";
                                    c.get("$scope").each(function() { for (var g = document.evaluate("descendant::text()[normalize-space()]", this, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null), i = [], j = g.iterateNext(); j;) b.components.color.textShouldBeTested(j) && i.push(j.parentNode), j = g.iterateNext();
                                        0 === i.length && h(c, d, null, "inapplicable", "", "There is no text to evaluate"), i.forEach(function(b) { f(c, d, e, a(b), b) }) }) }, b.colorElementBehindBackgroundGradientContrast = function(b, c, d, e) {
                                    function f(a, b, c, d, e) { var f, j; if (d.is("option") || (f = g.getBehindElementBackgroundGradient(d)), f) { for (var k = 0; k < f.length; k++) "rgb" === f[k].substr(0, 3) && (f[k] = g.colorToHex(f[k])); var l = new Rainbow;
                                            l.setSpectrumByArray(f); var m = f.length * c.gradientSampleMultiplier; for (j = !1, k = 0; !j && m > k; k++) j = !g.testElmBackground(c.algorithm, d, "#" + l.colourAt(k));
                                            j ? h(a, b, e, "failed", i, "The background gradient of the element behind this element makes the text unreadable") : h(a, b, e, "passed", i, "The background gradient of the element behind this element does not affect readability") } } var g = b.components.color.colors,
                                        h = b.components.color.buildCase,
                                        i = "colorElementBehindBackgroundGradientContrast";
                                    c.get("$scope").each(function() { for (var g = document.evaluate("descendant::text()[normalize-space()]", this, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null), i = [], j = g.iterateNext(); j;) b.components.color.textShouldBeTested(j) && i.push(j.parentNode), j = g.iterateNext();
                                        0 === i.length && h(c, d, null, "inapplicable", "", "There is no text to evaluate"), i.forEach(function(b) { f(c, d, e, a(b), b) }) }) }, b.colorElementBehindBackgroundImageContrast = function(b, c, d, e) {
                                    function f(a, b, c, d, e) { var f; if (d.is("option") || (f = g.getBehindElementBackgroundImage(d)), f) { var j = document.createElement("img");
                                            j.crossOrigin = "Anonymous", j.onload = function() { var f = g.getAverageRGB(j),
                                                    k = g.testElmBackground(c.algorithm, d, f);
                                                k ? h(a, b, e, "passed", i, "The background image of the element behind this element does not affect readability") : h(a, b, e, "failed", i, "The background image of the element behind this element makes the text unreadable") }, j.onerror = j.onabort = function() { h(a, b, e, "cantTell", i, "The background image of the element behind this element could not be loaded (" + f + ")") }, j.src = f } } var g = b.components.color.colors,
                                        h = b.components.color.buildCase,
                                        i = "colorElementBehindBackgroundImageContrast";
                                    c.get("$scope").each(function() { for (var g = document.evaluate("descendant::text()[normalize-space()]", this, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null), i = [], j = g.iterateNext(); j;) b.components.color.textShouldBeTested(j) && i.push(j.parentNode), j = g.iterateNext();
                                        0 === i.length && h(c, d, null, "inapplicable", "", "There is no text to evaluate"), i.forEach(function(b) { f(c, d, e, a(b), b) }) }) }, b.colorElementBehindContrast = function(b, c, d, e) {
                                    function f(a, b, c, d, e) { var f; if (d.is("option") || (f = g.getBehindElementBackgroundColor(d)), f) { var j = g.testElmBackground(c.algorithm, d, f);
                                            j ? h(a, b, e, "passed", i, "The element behind this element does not affect readability") : h(a, b, e, "failed", i, "The element behind this element makes the text unreadable") } } var g = b.components.color.colors,
                                        h = b.components.color.buildCase,
                                        i = "colorElementBehindContrast";
                                    c.get("$scope").each(function() { for (var g = document.evaluate("descendant::text()[normalize-space()]", this, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null), i = [], j = g.iterateNext(); j;) b.components.color.textShouldBeTested(j) && i.push(j.parentNode), j = g.iterateNext();
                                        0 === i.length && h(c, d, null, "inapplicable", "", "There is no text to evaluate"), i.forEach(function(b) { f(c, d, e, a(b), b) }) }) }, b.colorFontContrast = function(b, c, d, e) {
                                    function f(a, b, c, d, e) { g.testElmContrast(c.algorithm, d) ? h(a, b, e, "passed", i, "The font contrast of the text is sufficient for readability") : h(a, b, e, "failed", i, "The font contrast of the text impairs readability") } var g = b.components.color.colors,
                                        h = b.components.color.buildCase,
                                        i = "colorFontContrast";
                                    c.get("$scope").each(function() { for (var g = document.evaluate("descendant::text()[normalize-space()]", this, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null), i = [], j = g.iterateNext(); j;) b.components.color.textShouldBeTested(j) && i.push(j.parentNode), j = g.iterateNext();
                                        0 === i.length && h(c, d, null, "inapplicable", "", "There is no text to evaluate"), i.forEach(function(b) { f(c, d, e, a(b), b) }) }) }, b.contentPositioningShouldNotChangeMeaning = function(b, c, d) { var e = ["top", "left", "right", "bottom"],
                                        f = {},
                                        g = !1;
                                    c.get("$scope").find("*:has(*:quailCss(position=absolute))").each(function() { f = { top: {}, left: {}, right: {}, bottom: {} }, g = !1; var b = a(this);
                                        b.find("h1, h2, h3, h4, h5, h6, p, blockquote, ol, li, ul, dd, dt").filter(":quailCss(position=absolute)").each(function() { for (var b = 0; b < e.length; b++) "undefined" != typeof a(this).css(e[b]) && "auto" !== a(this).css(e[b]) && ("undefined" == typeof f[e[b]][a(this).css(e[b])] && (f[e[b]][a(this).css(e[b])] = 0), f[e[b]][a(this).css(e[b])]++) }), a.each(e, function() { a.each(f[this], function() { this > 2 && !g && (g = !0, c.add(d({ element: b.get(0), expected: b.closest(".quail-test").data("expected"), status: "failed" }))) }) }) }) }, b.definitionListsAreUsed = function(b, c, d) { c.get("$scope").find("dl").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set({ status: "inapplicable" }) }), c.get("$scope").find("p, li").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b); var e = a(this);
                                        a(this).find("span, strong, em, b, i").each(function() { if (a(this).text().length < 50 && 0 === e.text().search(a(this).text())) { if (a(this).is("span") && a(this).css("font-weight") === e.css("font-weight") && a(this).css("font-style") === e.css("font-style")) return void b.set({ status: "passed" });
                                                b.set({ status: "failed" }) } }) }) }, b.doNotUseGraphicalSymbolToConveyInformation = function(b, c, d) { c.get("$scope").find(b.textSelector + ":not(abbr, acronym)").each(function() { var e = "✓",
                                            f = "?xo[]()+-!*xX",
                                            g = a(this).text(),
                                            h = g.replace(/[\W\s]+/g, "");
                                        0 === h.length ? -1 === e.indexOf(g) && c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) : c.add(1 === g.length && f.indexOf(g) >= 0 ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" })) }), c.get("$scope").find(b.textSelector).filter("abbr, acronym").each(function() { c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "inapplicable" })) }) }, b.doctypeProvided = function(b, c, d) { var e = c.get("$scope").get(0);
                                    c.add(d(0 !== a(e.doctype).length || document.doctype ? { element: e, expected: "pass", status: "passed" } : { element: e, expected: "fail", status: "failed" })) }, b.documentAbbrIsUsed = function(a, b, c) { a.components.acronym(a, b, c, "abbr") }, b.documentAcronymsHaveElement = function(a, b, c) { a.components.acronym(a, b, c, "acronym") }, b.documentIDsMustBeUnique = function(b, c, d) { c.get("$scope").each(function() { 0 === a(this).children().length && c.add(d({ element: this, status: "inapplicable", expected: a(this).closest(".quail-test").data("expected") })) }), c.get("$scope").find(":not([id])").each(function() { c.add(d({ element: this, status: "inapplicable", expected: a(this).closest(".quail-test").data("expected") })) }), c.get("$scope").each(function() { var e = {};
                                        a(this).find("[id]").each(function() { var f = d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this) });
                                            c.add(f), "undefined" == typeof e[a(this).attr("id")] && 0 === Object.keys(e).length ? (f.set({ status: "inapplicable" }), e[a(this).attr("id")] = a(this).attr("id")) : "undefined" == typeof e[a(this).attr("id")] ? (f.set({ status: "passed" }), e[a(this).attr("id")] = a(this).attr("id")) : f.set({ status: "failed" }) }) }) }, b.documentIsWrittenClearly = function(b, c, d) { c.get("$scope").find(b.textSelector).each(function() { var e = b.components.textStatistics.cleanText(a(this).text()),
                                            f = d({ element: this, expected: a(this).closest(".quail-test").data("expected") }); return c.add(f), b.isUnreadable(e) ? void f.set({ status: "inapplicable" }) : void f.set(Math.round(206.835 - 1.015 * b.components.textStatistics.averageWordsPerSentence(e) - 84.6 * b.components.textStatistics.averageSyllablesPerWord(e)) < 60 ? { status: "failed" } : { status: "passed" }) }) }, b.documentLangIsISO639Standard = function(b, c, d) { var e = c.get("$scope").is("html") ? c.get("$scope") : c.get("$scope").find("html").first(),
                                        f = d({ element: e[0], expected: e.closest(".quail-test").length ? e.closest(".quail-test").data("expected") : e.data("expected") }),
                                        g = e.attr("lang"),
                                        h = !1;
                                    c.add(f), e.is("html") && "undefined" != typeof g ? (a.each(b.strings.languageCodes, function(a, b) { h || 0 !== g.indexOf(b) || (h = !0) }), f.set(h ? null === g.match(/^[a-z]{2}(-[A-Z]{2})?$/) ? { status: "failed" } : { status: "passed" } : { status: "failed" })) : f.set({ status: "inapplicable" }) }, b.documentStrictDocType = function(a, b, c) { b.add("undefined" != typeof document.doctype && document.doctype && -1 !== document.doctype.systemId.search("strict") ? c({ element: document, expected: b.get("$scope").data("expected"), status: "passed" }) : c({ element: document, expected: b.get("$scope").data("expected"), status: "failed" })) }, b.documentTitleIsShort = function(a, b, c) { var d = b.get("$scope").find("head title:first"),
                                        e = c({ element: d, expected: d.closest(".quail-test").data("expected") }); return b.add(e), d.length ? void e.set({ status: d.text().length > 150 ? "failed" : "passed" }) : void e.set({ element: b.get("$scope"), status: "inapplicable" }) }, b.documentValidatesToDocType = function() { "undefined" == typeof document.doctype }, b.documentVisualListsAreMarkedUp = function(b, c, d) { var e = ["♦", "›", "»", "‣", "▶", "◦", "✓", "◽", "•", "—", "◾", "-\\D", "\\\\", "\\*(?!\\*)", "\\.\\s", "x\\s", "&bull;", "&#8226;", "&gt;", "[0-9]+\\.", "\\(?[0-9]+\\)", "[\\u25A0-\\u25FF]", "[IVX]{1,5}\\.\\s"],
                                        f = RegExp("(^|<br[^>]*>)[\\s]*(" + e.join("|") + ")", "gi");
                                    c.get("$scope").find(b.textSelector).each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b); var e = a(this).html().match(f);
                                        b.set({ status: e && e.length > 2 ? "failed" : "passed" }) }) }, b.elementAttributesAreValid = function(b, c, d) { b.components.htmlSource.getHtml(function(e, f) { f && b.components.htmlSource.traverse(f, function(b) { if ("undefined" != typeof b.raw && a.isArray(b.selector)) { var e, f = !1;
                                                e = /#/.test(b.selector.slice(-1)[0]) ? b.selector.slice(-1)[0] : b.selector.join(" > "); var g = a(e, c.get("$scope")).get(0);
                                                g || (g = b.raw || e); var h = b.raw.match(/\'|\"/g);
                                                h && h.length % 2 !== 0 && (c.add(d({ element: g, expected: "object" == typeof g && 1 === g.nodeType && a(g).closest(".quail-test").data("expected") || null, status: "failed" })), f = !0), b.raw.search(/([a-z]*)=(\'|\")([a-z\.]*)(\'|\")[a-z]/i) > -1 && (c.add(d({ element: g, expected: "object" == typeof g && 1 === g.nodeType && a(g).closest(".quail-test").data("expected") || null, status: "failed" })), f = !0); var i = b.raw.split("=");
                                                i.shift(), a.each(i, function() {-1 === this.search(/\'|\"/) && this.search(/\s/i) > -1 && (c.add(d({ element: g, expected: "object" == typeof g && 1 === g.nodeType && a(g).closest(".quail-test").data("expected") || null, status: "failed" })), f = !0) }), f || c.add(d({ element: g, expected: "object" == typeof g && 1 === g.nodeType && a(g).closest(".quail-test").data("expected") || null, status: "passed" })) } }) }) }, b.elementsDoNotHaveDuplicateAttributes = function(b, c, d) { b.components.htmlSource.getHtml(function(e, f) { f && b.components.htmlSource.traverse(f, function(b) { if ("tag" === b.type && a.isArray(b.selector)) { var e;
                                                e = /#/.test(b.selector.slice(-1)[0]) ? b.selector.slice(-1)[0] : b.selector.join(" > "); var f = a(e, c.get("$scope")).get(0); if (f || (f = b.raw || e), "undefined" != typeof b.attributes) { var g = [];
                                                    a.each(b.attributes, function(a, b) { b.length > 1 && g.push(b) }), c.add(g.length ? d({ element: f, expected: "object" == typeof f && 1 === f.nodeType && a(f).closest(".quail-test").data("expected") || null, info: g, status: "failed" }) : d({ element: f, expected: "object" == typeof f && 1 === f.nodeType && a(f).closest(".quail-test").data("expected") || null, info: g, status: "passed" })) } } }) }) }, b.embedHasAssociatedNoEmbed = function(b, c, d) { c.get("$scope").find("embed").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set({ status: a(this).find("noembed").length || a(this).next().is("noembed") ? "passed" : "failed" }) }) }, b.emoticonsExcessiveUse = function(b, c, d) { c.get("$scope").find(b.textSelector).each(function() { var e = 0,
                                            f = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(f), a.each(a(this).text().split(" "), function(a, c) { c.search(b.emoticonRegex) > -1 && e++ }), f.set(0 === e ? { status: "inapplicable" } : { status: e > 4 ? "failed" : "passed" }) }) }, b.emoticonsMissingAbbr = function(b, c, d) { c.get("$scope").find(b.textSelector + ":not(abbr, acronym)").each(function() { var e = a(this),
                                            f = e.clone(),
                                            g = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(g), f.find("abbr, acronym").each(function() { a(this).remove() }); var h = "passed";
                                        a.each(f.text().split(" "), function(a, c) { c.search(b.emoticonRegex) > -1 && (h = "failed") }), g.set({ status: h }) }) }, b.focusIndicatorVisible = function(b, c, d) { c.get("$scope").find(b.focusElements).each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e); var f = { borderWidth: a(this).css("border-width"), borderColor: a(this).css("border-color"), backgroundColor: a(this).css("background-color"), boxShadow: a(this).css("box-shadow") }; if (a(this).focus(), f.backgroundColor.trim() !== a(this).css("background-color").trim()) return a(this).blur(), void e.set({ status: "passed" }); var g = b.components.convertToPx(a(this).css("border-width")); if (g > 2 && g !== b.components.convertToPx(f.borderWidth)) return a(this).blur(), void e.set({ status: "passed" }); var h = a(this).css("box-shadow") && "none" !== a(this).css("box-shadow") ? a(this).css("box-shadow").match(/(-?\d+px)|(rgb\(.+\))/g) : !1; return h && a(this).css("box-shadow") !== f.boxShadow && b.components.convertToPx(h[3]) > 3 ? (a(this).blur(), void e.set({ status: "passed" })) : (a(this).blur(), void e.set({ status: "failed" })) }) }, b.formWithRequiredLabel = function(b, c, d) { var e, f = b.strings.redundant,
                                        g = !1;
                                    f.required[f.required.indexOf("*")] = /\*/g, c.get("$scope").each(function() { var h = a(this);
                                        h.find("label").each(function() { var h = a(this).text().toLowerCase(),
                                                i = a(this),
                                                j = c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this) })); for (var k in f.required) h.search(k) >= 0 && !c.get("$scope").find("#" + i.attr("for")).attr("aria-required") && j.set({ status: "failed" });
                                            g = i.css("color") + i.css("font-weight") + i.css("background-color"), e && g !== e && j.set({ status: "failed" }), e = g, "undefined" == typeof j.get("status") && j.set({ status: "passed" }) }) }) }, b.headerTextIsTooLong = function(b, c, d) { var e = 128;
                                    c.get("$scope").find("h1, h2, h3, h4, h5, h6").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: a(this).text().replace(/^\s+|\s+$/gm, "").length > e ? "failed" : "passed" });
                                        c.add(b) }) }, b.headersAttrRefersToATableCell = function(b, c, d) { c.get("$scope").find("table").each(function() { var b = this,
                                            e = d({ element: b, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e); var f = a(b).find("th[headers], td[headers]"); return 0 === f.length ? void e.set({ status: "inapplicable" }) : void f.each(function() { var c = a(this).attr("headers").split(/\s+/);
                                            a.each(c, function(c, d) { return "" === d || a(b).find("th#" + d + ",td#" + d).length > 0 ? void e.set({ status: "passed" }) : void e.set({ status: "failed" }) }) }) }) }, b.headersUseToMarkSections = function(b, c, d) { c.get("$scope").find("p").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b); var e = a(this);
                                        e.find("strong:first, em:first, i:first, b:first").each(function() { b.set({ status: e.text().trim() === a(this).text().trim() ? "failed" : "passed" }) }) }), c.get("$scope").find("ul, ol").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b); var e = a(this); if (e.prevAll(":header").length || e.find("li").length !== e.find("li:has(a)").length) return void b.set({ status: "passed" }); var f = !0;
                                        e.find("li:has(a)").each(function() { a(this).text().trim() !== a(this).find("a:first").text().trim() && (f = !1) }), f && b.set({ status: "failed" }) }) }, b.headersUsedToIndicateMainContent = function(b, c, d) { c.get("$scope").each(function() { var e = a(this),
                                            f = b.components.content.findContent(e);
                                        c.add(d("undefined" == typeof f || 0 !== f.find(":header").length && f.find(b.textSelector).first().is(":header") ? { element: f.get(0), expected: f.closest(".quail-test").data("expected"), status: "passed" } : { element: f.get(0), expected: f.closest(".quail-test").data("expected"), status: "failed" })) }) }, b.idRefHasCorrespondingId = function(b, c, d) { c.get("$scope").find("label[for], *[aria-activedescendant]").each(function() { var b = a(this),
                                            e = d({ element: this, expected: b.closest(".quail-test").data("expected") });
                                        c.add(e); var f = b.attr("for") || b.attr("aria-activedescendant");
                                        e.set(0 === c.get("$scope").find("#" + f).length ? { status: "failed" } : { status: "passed" }) }) }, b.idrefsHasCorrespondingId = function(b, c, d) {
                                    function e(b) { var c = [],
                                            d = ["headers", "aria-controls", "aria-describedby", "aria-flowto", "aria-labelledby", "aria-owns"]; return a.each(d, function(a, d) { var e = b.attr(d); return "undefined" != typeof e && e !== !1 ? void(c = e) : void 0 }), c.split(/\s+/) } c.get("$scope").each(function() { var b = a(this).find("td[headers], th[headers], [aria-controls], [aria-describedby], [aria-flowto], [aria-labelledby], [aria-owns]"); return 0 === b.length ? void c.add(d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "inapplicable" })) : void b.each(function() { var b = this,
                                                f = c.add(d({ element: this, expected: a(this).closest(".quail-test").data("expected") })),
                                                g = e(a(b)),
                                                h = "passed";
                                            a.each(g, function(b, c) { return "" !== c && 0 === a("#" + c).length ? void(h = "failed") : void 0 }), f.set({ status: h }) }) }) }, b.imgAltIsDifferent = function(b, c, d) { c.get("$scope").find("img:not([src])").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "inapplicable" });
                                        c.add(b) }), c.get("$scope").find("img[alt][src]").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(a(this).attr("src") === a(this).attr("alt") || a(this).attr("src").split("/").pop() === a(this).attr("alt") ? { status: "failed" } : { status: "passed" }) }) }, b.imgAltIsTooLong = function(b, c, d) { c.get("$scope").find("img[alt]").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set({ status: a(this).attr("alt").length > 100 ? "failed" : "passed" }) }) }, b.imgAltNotEmptyInAnchor = function(b, c, d) { c.get("$scope").find("a[href]:has(img)").each(function() { var e = a(this),
                                            f = e.text(),
                                            g = d({ element: this, expected: e.closest(".quail-test").data("expected") });
                                        c.add(g), e.find("img[alt]").each(function() { f += " " + a(this).attr("alt") }), g.set(b.isUnreadable(f) ? { status: "failed" } : { status: "passed" }) }) }, b.imgAltTextNotRedundant = function(b, c, d) { var e = {};
                                    c.get("$scope").find("img[alt]").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), "undefined" == typeof e[a(this).attr("alt")] ? e[a(this).attr("alt")] = a(this).attr("src") : b.set(e[a(this).attr("alt")] !== a(this).attr("src") ? { status: "failed" } : { status: "passed" }) }) }, b.imgGifNoFlicker = function(b, c, d) { c.get("$scope").find('img[src$=".gif"]').each(function() { var b = a(this),
                                            e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e), a.ajax({ url: b.attr("src"), dataType: "text", success: function(a) { e.set(-1 !== a.search("NETSCAPE2.0") ? { status: "failed" } : { status: "inapplicable" }) } }) }) }, b.imgHasLongDesc = function(b, c, d) { c.get("$scope").find("img[longdesc]").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e), e.set(a(this).attr("longdesc") !== a(this).attr("alt") && b.validURL(a(this).attr("longdesc")) ? { status: "passed" } : { status: "failed" }) }) }, b.imgImportantNoSpacerAlt = function(b, c, d) { c.get("$scope").find("img[alt]").each(function() { var e = a(this).width() ? a(this).width() : parseInt(a(this).attr("width"), 10),
                                            f = a(this).height() ? a(this).height() : parseInt(a(this).attr("height"), 10),
                                            g = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(g), g.set(b.isUnreadable(a(this).attr("alt").trim()) && a(this).attr("alt").length > 0 && e > 50 && f > 50 ? { status: "failed" } : { status: "passed" }) }) }, b.imgMapAreasHaveDuplicateLink = function(b, c, d) {
                                    var e = {};
                                    c.get("$scope").find("a").each(function() { e[a(this).attr("href")] = a(this).attr("href") }), c.get("$scope").find("img[usemap]").each(function() {
                                        var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b);
                                        var f = a(this),
                                            g = c.get("$scope").find(f.attr("usemap"));
                                        g.length || (g = c.get("$scope").find('map[name="' + f.attr("usemap").replace("#", "") + '"]')), g.length ? g.find("area").each(function() {
                                            b.set("undefined" == typeof e[a(this).attr("href")] ? { status: "failed" } : { status: "passed" })
                                        }) : b.set({ status: "inapplicable" })
                                    })
                                }, b.imgNonDecorativeHasAlt = function(b, c, d) { c.get("$scope").find("img[alt]").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e), e.set(b.isUnreadable(a(this).attr("alt")) && (a(this).width() > 100 || a(this).height() > 100) ? { status: "failed" } : { status: "passed" }) }) }, b.imgWithMathShouldHaveMathEquivalent = function(b, c, d) { c.get("$scope").find("img:not(img:has(math), img:has(tagName))").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), a(this).parent().find("math").length || b.set({ status: "failed" }) }) }, b.inputCheckboxRequiresFieldset = function(b, c, d) { c.get("$scope").find(":checkbox").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(a(this).parents("fieldset").length ? { status: "passed" } : { status: "failed" }) }) }, b.inputImageAltIsNotFileName = function(b, c, d) { c.get("$scope").find("input[type=image][alt]").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(a(this).attr("src") === a(this).attr("alt") ? { status: "failed" } : { status: "passed" }) }) }, b.inputImageAltIsShort = function(b, c, d) { c.get("$scope").find("input[type=image]").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(a(this).attr("alt").length > 100 ? { status: "failed" } : { status: "passed" }) }) }, b.inputImageAltNotRedundant = function(b, c, d) { c.get("$scope").find("input[type=image][alt]").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e), e.set(b.strings.redundant.inputImage.indexOf(b.cleanString(a(this).attr("alt"))) > -1 ? { status: "failed" } : { status: "passed" }) }) }, b.inputWithoutLabelHasTitle = function(b, c, d) { c.get("$scope").each(function() { var e = a(this).find("input, select, textarea"); if (0 === e.length) { var f = d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "inapplicable" }); return void c.add(f) } e.each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") }); return c.add(e), "none" === a(this).css("display") ? void e.set({ status: "inapplicable" }) : void e.set(c.get("$scope").find("label[for=" + a(this).attr("id") + "]").length || a(this).attr("title") && !b.isUnreadable(a(this).attr("title")) ? { status: "passed" } : { status: "failed" }) }) }) }, b.labelMustBeUnique = function(b, c, d) { var e = {};
                                    c.get("$scope").find("label[for]").each(function() { "undefined" == typeof e[a(this).attr("for")] && (e[a(this).attr("for")] = 0), e[a(this).attr("for")]++ }), c.get("$scope").find("label[for]").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: 1 === e[a(this).attr("for")] ? "passed" : "failed" });
                                        c.add(b) }) }, b.labelsAreAssignedToAnInput = function(b, c, d) { c.get("$scope").find("label").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(a(this).attr("for") ? c.get("$scope").find("#" + a(this).attr("for")).length && c.get("$scope").find("#" + a(this).attr("for")).is(":input") ? { status: "passed" } : { status: "failed" } : { status: "failed" }) }) }, b.languageChangesAreIdentified = function(b, c, d) { var e, f, g, h, i, j, k = c.get("$scope"),
                                        l = b.components.language.getDocumentLanguage(k, !0),
                                        m = function(c, d, e, f) { var g, h = c.find("[lang=" + d + "]"); return 0 === h.length ? !0 : (e = e.length, h.each(function() { g = b.getTextContents(a(this)).match(f), g && (e -= g.length) }), e > 0) },
                                        n = function(a) { return a.attr("lang") ? a.attr("lang").trim().toLowerCase().split("-")[0] : a.parents("[lang]").length ? a.parents("[lang]:first").attr("lang").trim().toLowerCase().split("-")[0] : b.components.language.getDocumentLanguage(k, !0) };
                                    k.find(b.textSelector).each(function() { i = this, h = a(this), l = n(h), e = b.getTextContents(h), j = !1, a.each(b.components.language.scriptSingletons, function(a, f) { a !== l && (g = e.match(f), g && g.length && m(h, a, g, f) && (c.add(d({ element: i, expected: function(a) { return b.components.resolveExpectation(a) }(i), info: { language: a }, status: "failed" })), j = !0)) }), a.each(b.components.language.scripts, function(a, k) {-1 === k.languages.indexOf(l) && (g = e.match(k.regularExpression), g && g.length && m(h, a, g, f) && (c.add(d({ element: i, expected: function(a) { return b.components.resolveExpectation(a) }(i), info: { language: a }, status: "failed" })), j = !0)) }), "undefined" != typeof guessLanguage && !h.find("[lang]").length && h.text().trim().length > 400 && guessLanguage.info(h.text(), function(a) { a[0] !== l && (c.add(d({ element: i, expected: function(a) { return b.components.resolveExpectation(a) }(i), info: { language: a[0] }, status: "failed" })), j = !0) }), j || c.add(d({ element: i, expected: function(a) { return b.components.resolveExpectation(a) }(i), status: "passed" })) }) }, b.languageDirAttributeIsUsed = function(b, c, d) {
                                    function e() { var e = a(this),
                                            g = e.attr("dir"); if (!g) { var h = e.closest("[dir]").attr("dir");
                                            g = h || g } "string" == typeof g && (g = g.toLowerCase()), "undefined" == typeof f[g] && (g = "ltr"); var i = "ltr" === g ? "rtl" : "ltr",
                                            j = b.getTextContents(e),
                                            k = j.match(f[i]); if (k) { var l = k.length;
                                            e.find("[dir=" + i + "]").each(function() { var a = e[0].textContent.match(f[i]);
                                                a && (l -= a.length) }); var m = c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this) }));
                                            m.set({ status: l > 0 ? "failed" : "passed" }) } } var f = b.components.language.textDirection;
                                    c.get("$scope").each(function() { a(this).find(b.textSelector).each(e) }) }, b.languageDirectionPunctuation = function(b, c, d) { var e = c.get("$scope"),
                                        f = {},
                                        g = /[\u2000-\u206F]|[!"#$%&'\(\)\]\[\*+,\-.\/:;<=>?@^_`{|}~]/gi,
                                        h = e.attr("dir") ? e.attr("dir").toLowerCase() : "ltr",
                                        i = "ltr" === h ? "rtl" : "ltr",
                                        j = b.components.language.textDirection;
                                    e.each(function() { var e = a(this);
                                        e.find(b.textSelector).each(function() { var e = a(this);
                                            h = e.attr("dir") ? e.attr("dir").toLowerCase() : e.parent("[dir]").first().attr("dir") ? e.parent("[dir]").first().attr("dir").toLowerCase() : h, "undefined" == typeof j[h] && (h = "ltr"), i = "ltr" === h ? "rtl" : "ltr"; var k = b.getTextContents(e),
                                                l = k.match(j[i]),
                                                m = c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this) })); if (!l) return void m.set({ status: "inapplicable" }); for (var n = k.search(j[i]), o = k.lastIndexOf(l.pop()); f = g.exec(k);)
                                                if (f.index === n - 1 || f.index === o + 1) return void m.set({ status: "failed" });
                                            m.set({ status: "passed" }) }) }) }, b.languageUnicodeDirection = function(b, c, d) { var e = c.get("$scope"),
                                        f = b.components.language.textDirection,
                                        g = b.components.language.textDirectionChanges;
                                    e.each(function() { var e = a(this);
                                        e.find(b.textSelector).each(function() { var e = c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this) })),
                                                h = a(this),
                                                i = h.text().trim(),
                                                j = -1 !== i.substr(0, 1).search(f.ltr) ? "rtl" : "ltr";
                                            e.set(-1 === i.search(f[j]) ? { status: "inapplicable" } : -1 !== i.search(g[j]) ? { status: "passed" } : { status: "failed" }) }) }) }, b.linkHasAUniqueContext = function(b, c, d) {
                                    function e(b) { for (var c = a(b), d = c, e = f(c.text()); !d.is("body, html") && -1 === j.indexOf(d.css("display"));) d = d.parent(); var g = d.text().match(/[^\.!\?]+[\.!\?]+/g);
                                        null === g && (g = [d.text()]); for (var h = 0; h < g.length; h += 1)
                                            if (-1 !== f(g[h]).indexOf(e)) return g[h].trim() }

                                    function f(a) { var b = a.match(/\w+/g); return null !== b && (a = b.join(" ")), a.toLowerCase() }

                                    function g(a, b) { return f("" + a) !== f("" + b) }

                                    function h(b, c) { if (b.href === c.href) return !1; if (g(b.title, c.title)) return !1; var d = a(b).closest("p, li, dd, dt, td, th"),
                                            h = a(c).closest("p, li, dd, dt, td, th"); if (0 !== d.length && 0 !== h.length && g(i(d), i(h))) return !1; if (d.is("td, th") && !h.is("td, th")) return !1; if (d.is("td, th") && h.is("td, th")) { var j = !1,
                                                k = []; if (d.tableHeaders().each(function() { k.push(f(a(this).text())) }), h.tableHeaders().each(function() { var b = f(a(this).text()),
                                                        c = k.indexOf(b); - 1 === c ? j = !0 : k.splice(c, 1) }), j || k.length > 0) return !1 } return g(e(b), e(c)) ? !1 : !0 }

                                    function i(a) { var b = a.text(); return a.find("img[alt]").each(function() { b += " " + this.alt.trim() }), f(b) } var j = ["block", "flex", "list-item", "table", "table-caption", "table-cell"];
                                    c.get("$scope").each(function() { var b = a(this),
                                            e = b.find("a[href]:visible"),
                                            f = {}; if (0 === e.length) { var g = d({ element: this, status: "inapplicable", expected: b.closest(".quail-test").data("expected") });
                                            c.add(g) } e.each(function() { var b = i(a(this)); "undefined" == typeof f[b] && (f[b] = []), f[b].push(this) }), a.each(f, function(b, e) { for (; e.length > 1;) { for (var f = e.pop(), g = !1, i = e.length - 1; i >= 0; i -= 1) { var j = e[i];
                                                    h(f, j) && (g = !0, e.splice(i, 1), c.add(d({ element: j, status: "failed", expected: a(j).closest(".quail-test").data("expected") }))) } c.add(d({ element: f, status: g ? "failed" : "passed", expected: a(f).closest(".quail-test").data("expected") })) } 1 === e.length && c.add(d({ element: e[0], status: "passed", expected: a(e[0]).closest(".quail-test").data("expected") })) }) }) }, b.listNotUsedForFormatting = function(b, c, d) { c.get("$scope").find("ol, ul").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(a(this).find("li").length < 2 ? { status: "failed" } : { status: "passed" }) }) }, b.listOfLinksUseList = function(b, c, d) { var e = /(♦|›|»|‣|▶|.|◦|>|✓|◽|•|—|◾|\||\*|&bull;|&#8226;)/g;
                                    c.get("$scope").find("a").each(function() { var f = c.add(d({ element: this })),
                                            g = a(this).closest(".quail-test").data("expected"); if (a(this).next("a").length) { var h = a(this).get(0).nextSibling.wholeText.replace(e, "");
                                            f.set(!a(this).parent("li").length && b.isUnreadable(h) ? { expected: g, status: "failed" } : { expected: g, status: "passed" }) } }) }, b.newWindowIsOpened = function(b, c, d) { var e, f = window.open;
                                    window.open = function(a) { c.each(function(b, c) { var d = c.get("element").href;
                                            d.indexOf(a) > -1 && c.set("status", "failed") }) }, c.get("$scope").find("a").each(function() { e = d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this) }), c.add(e), a(this).trigger("click") }), window.open = f }, b.pNotUsedAsHeader = function(b, c, d) { c.get("$scope").find("p").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e), a(this).text().search(".") >= 1 && e.set({ status: "inapplicable" }); var f = !1; if (a(this).text().search(".") < 1) { var g = a(this),
                                                h = g.prev("p");
                                            a.each(b.suspectPHeaderTags, function(b, c) { g.find(c).length && g.find(c).each(function() { a(this).text().trim() === g.text().trim() && (e.set({ status: "failed" }), f = !0) }) }), h.length && a.each(b.suspectPCSSStyles, function(a, b) { return g.css(b) !== h.css(b) ? (e.set({ status: "failed" }), f = !0, !1) : void 0 }), "bold" === g.css("font-weight") && (e.set({ status: "failed" }), f = !0) } f || e.set({ status: "passed" }) }) }, b.paragraphIsWrittenClearly = function(b, c, d) { c.get("$scope").find("p").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e); var f = b.components.textStatistics.cleanText(a(this).text());
                                        e.set(Math.round(206.835 - 1.015 * b.components.textStatistics.averageWordsPerSentence(f) - 84.6 * b.components.textStatistics.averageSyllablesPerWord(f)) < 60 ? { status: "failed" } : { status: "passed" }) }) }, b.preShouldNotBeUsedForTabularLayout = function(b, c, d) { c.get("$scope").find("pre").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b); var e = a(this).text().split(/[\n\r]+/);
                                        b.set({ status: e.length > 1 && a(this).text().search(/\t/) > -1 ? "failed" : "passed" }) }) }, b.scriptFocusIndicatorVisible = function() { b.html.find(b.focusElements).each(function() { var c, d, e, f;
                                        e = []; for (var g = 0, h = document.styleSheets.length; h > g; ++g) { c = document.styleSheets[g], d = c.cssRules || c.rules; for (var i = d.length - 1; i >= 0; --i) f = d[i], f.selectorText && -1 !== f.selectorText.indexOf(":focus") && (e.push({ css: f.cssText, index: i, sheet: g }), c.deleteRule(i)) } var j = { borderWidth: a(this).css("border-width"), borderColor: a(this).css("border-color"), backgroundColor: a(this).css("background-color"), boxShadow: a(this).css("box-shadow"), outlineWidth: a(this).css("outline-width"), outlineColor: a(this).css("outline-color") };
                                        a(this).focus(); var k = b.components.convertToPx(a(this).css("outline-width")); if (k > 2 && k !== b.components.convertToPx(j.outlineWidth)) return void a(this).blur(); if (j.backgroundColor !== a(this).css("background-color")) return void a(this).blur(); var l = b.components.convertToPx(a(this).css("border-width")); if (l > 2 && l !== b.components.convertToPx(j.borderWidth)) return void a(this).blur(); var m = a(this).css("box-shadow") && "none" !== a(this).css("box-shadow") ? a(this).css("box-shadow").match(/(-?\d+px)|(rgb\(.+\))/g) : !1; if (m && a(this).css("box-shadow") !== j.boxShadow && b.components.convertToPx(m[3]) > 3) return void a(this).blur();
                                        a(this).blur(); for (var n, o = e.length - 1; o >= 0; --g) n = e[o], document.styleSheets[n.sheet].insertRule(n.css, n.index);
                                        b.testFails("scriptFocusIndicatorVisible", a(this)) }) }, b.selectJumpMenu = function(b, c, d) { var e = c.get("$scope");
                                    0 !== e.find("select").length && e.find("select").each(function() { c.add(0 === a(this).parent("form").find(":submit").length && b.components.hasEventListener(a(this), "change") ? d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "failed" }) : d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "passed" })) }) }, b.siteMap = function(b, c, d) { var e = !0,
                                        f = d({ element: c.get("$scope").get(0), expected: c.get("$scope").data("expected") });
                                    c.add(f), c.get("$scope").find("a").each(function() { if ("passed" !== f.get("status")) { var c = a(this).text().toLowerCase(); return a.each(b.strings.siteMap, function(a, b) { return c.search(b) > -1 ? void(e = !1) : void 0 }), e === !1 ? void f.set({ status: "failed" }) : void(e && f.set({ status: "passed" })) } }) }, b.skipToContentLinkProvided = function(b, c, d) { c.get("$scope").each(function() { var e = a(this),
                                            f = !1;
                                        e.find('a[href*="#"]').each(function() { if (!f)
                                                for (var g = a(this), h = g.attr("href").split("#").pop(), i = e.find("#" + h), j = b.strings.skipContent.slice(); !f && j.length;) { var k = j.pop(); if (g.text().search(k) > -1 && i.length) { if (g.focus(), g.is(":visible") && "hidden" !== g.css("visibility")) return f = !0, void c.add(d({ element: g.get(0), expected: g.closest(".quail-test").data("expected"), status: "passed" }));
                                                        g.blur() } } }), f || c.add(d({ expected: e.data("expected") || e.find("[data-expected]").data("expected"), status: "failed" })) }) }, b.tabIndexFollowsLogicalOrder = function(b, c, d) { c.get("$scope").each(function() { var e = a(this),
                                            f = 0;
                                        e.find("[tabindex]").each(function() { var e = a(this),
                                                g = e.attr("tabindex");
                                            c.add(parseInt(g, 10) >= 0 && parseInt(g, 10) !== f + 1 ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" })), f++ }) }) }, b.tableAxisHasCorrespondingId = function(b, c, d) { c.get("$scope").find("[axis]").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(0 === a(this).parents("table").first().find("th#" + a(this).attr("axis")).length ? { status: "failed" } : { status: "passed" }) }) }, b.tableHeaderLabelMustBeTerse = function(b, c, d) { c.get("$scope").find("th, table tr:first td").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b), b.set(a(this).text().length > 20 && (!a(this).attr("abbr") || a(this).attr("abbr").length > 20) ? { status: "failed" } : { status: "passed" }) }) }, b.tableLayoutDataShouldNotHaveTh = function(b, c, d) { c.get("$scope").find("table").each(function() { var e = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(e), e.set(0 !== a(this).find("th").length ? b.isDataTable(a(this)) ? { status: "passed" } : { status: "failed" } : { status: "inapplicable" }) }) }, b.tableLayoutHasNoCaption = function(b, c, d) { c.get("$scope").find("table").each(function() { c.add(a(this).find("caption").length ? b.isDataTable(a(this)) ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "inapplicable" })) }) }, b.tableLayoutHasNoSummary = function(b, c, d) { c.get("$scope").each(function() { var e = a(this);
                                        e.find("table[summary]").each(function() { var e = c.add(d({ element: this, expected: a(this).closest(".quail-test").data("expected") }));
                                            e.set(b.isDataTable(a(this)) || b.isUnreadable(a(this).attr("summary")) ? { status: "passed" } : { status: "failed" }) }) }) }, b.tableLayoutMakesSenseLinearized = function(b, c, d) { c.get("$scope").find("table").each(function() { b.isDataTable(a(this)) || c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }) }, b.tableNotUsedForLayout = function(b, c, d) { c.get("$scope").find("table").each(function() { c.add(b.isDataTable(a(this)) ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }) }, b.tableShouldUseHeaderIDs = function(b, c, d) { c.get("$scope").find("table").each(function() { var e = a(this),
                                            f = !1;
                                        b.isDataTable(e) && (e.find("th").each(function() { f || a(this).attr("id") || (f = !0, c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }))) }), f || e.find("td[header]").each(function() { f || a.each(a(this).attr("header").split(" "), function(a, g) { e.find("#" + g).length || (f = !0, c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }))) }) })) }) }, b.tableSummaryDoesNotDuplicateCaption = function(b, c, d) { c.get("$scope").find("table[summary]:has(caption)").each(function() { c.add(b.cleanString(a(this).attr("summary")) === b.cleanString(a(this).find("caption:first").text()) ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" })) }) }, b.tableSummaryIsNotTooLong = function(b, c, d) { c.get("$scope").find("table[summary]").each(function() { a(this).attr("summary").trim().length > 100 && c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }) }, b.tableUseColGroup = function(b, c, d) { c.get("$scope").find("table").each(function() { b.isDataTable(a(this)) && !a(this).find("colgroup").length && c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }) }, b.tableUsesAbbreviationForHeader = function(b, c, d) { c.get("$scope").find("th:not(th[abbr])").each(function() { a(this).text().length > 20 && c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }) }, b.tableUsesScopeForRow = function(b, c, d) { c.get("$scope").find("table").each(function() { a(this).find("td:first-child").each(function() { var e = a(this).next("td");
                                            ("bold" === a(this).css("font-weight") && "bold" !== e.css("font-weight") || a(this).find("strong").length && !e.find("strong").length) && c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }), a(this).find("td:last-child").each(function() { var e = a(this).prev("td");
                                            ("bold" === a(this).css("font-weight") && "bold" !== e.css("font-weight") || a(this).find("strong").length && !e.find("strong").length) && c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }) }) }, b.tableWithMoreHeadersUseID = function(b, c, d) { c.get("$scope").find("table:has(th)").each(function() { var e = a(this),
                                            f = 0;
                                        e.find("tr").each(function() { a(this).find("th").length && f++, f > 1 && !a(this).find("th[id]").length && c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" })) }) }) }, b.tabularDataIsInTable = function(b, c, d) { c.get("$scope").find("pre").each(function() { c.add(a(this).html().search(" ") >= 0 ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" })) }) }, b.tagsAreNestedCorrectly = function(a, b, c) { a.components.htmlSource.getHtml(function(d) { var e = a.components.htmlTagValidator(d),
                                            f = c({ expected: b.get("$scope").filter(".quail-test").eq(0).data("expected") });
                                        b.add(f), f.set(e ? { status: "failed", html: e } : { status: "passed" }) }) }, b.textIsNotSmall = function(b, c, d) { c.get("$scope").find(b.textSelector).each(function() { var e = a(this).css("font-size");
                                        e.search("em") > 0 && (e = b.components.convertToPx(e)), e = parseInt(e.replace("px", ""), 10), c.add(10 > e ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" })) }) }, b.userInputMayBeRequired = function(b, c, d) { c.get("$scope").each(function() { var b = d({ element: this, expected: a(this).closest(".quail-test").data("expected") });
                                        c.add(b); var e = a(this).find("form"),
                                            f = 0,
                                            g = a(this).find("input:not(form input, [type=button],[type=reset],[type=image],[type=submit],[type=hidden])"); return e.each(function() { var b = a(this).find("input:not([type=button],[type=reset],[type=image],[type=submit],[type=hidden])");
                                            b.length > 1 && (f = b.length) }), f > 0 ? void b.set({ status: "cantTell" }) : g.length > 1 ? void b.set({ status: "cantTell" }) : void b.set({ status: "inapplicable" }) }) }, b.videoMayBePresent = function(b, c, d) { var e = ["webm", "flv", "ogv", "ogg", "avi", "mov", "qt", "wmv", "asf", "mp4", "m4p", "m4v", "mpg", "mp2", "mpeg", "mpg", "mpe", "mpv", "m2v", "3gp", "3g2"],
                                        f = ["//www.youtube.com/embed/", "//player.vimeo.com/video/"];
                                    c.get("$scope").each(function() { var b = a(this),
                                            g = !1;
                                        b.find("object, video").each(function() { g = !0, c.add(d({ element: this, expected: a(this).closest(".quail-test").data("expected"), status: "cantTell" })) }), b.find("a[href]").each(function() { var b = a(this),
                                                f = b.attr("href").split(".").pop(); - 1 !== a.inArray(f, e) && (g = !0, c.add(d({ element: this, expected: b.closest(".quail-test").data("expected"), status: "cantTell" }))) }), b.find("iframe").each(function() {
                                            (-1 !== this.src.indexOf(f[0]) || -1 !== this.src.indexOf(f[1])) && (g = !0, c.add(d({ element: this, expected: b.closest(".quail-test").data("expected"), status: "cantTell" }))) }), g || c.add(d({ element: this, status: "inapplicable", expected: a(this).closest(".quail-test").data("expected") })) }) }, b.videosEmbeddedOrLinkedNeedCaptions = function(a, b, c) { a.components.video.findVideos(b.get("$scope"), function(d, e) { b.add(e ? c({ element: d[0], expected: function(b) { return a.components.resolveExpectation(b) }(d), status: "passed" }) : c({ element: d[0], expected: function(b) { return a.components.resolveExpectation(b) }(d), status: "failed" })) }) }, b.whiteSpaceInWord = function(b, c, d) { var e, f;
                                    c.get("$scope").find(b.textSelector).each(function() { f = a(this).text() ? a(this).text().match(/[^\s\\]/g) : !1, e = a(this).text() ? a(this).text().match(/[^\s\\]\s[^\s\\]/g) : !1, c.add(f && e && e.length > 3 && e.length >= f.length / 2 - 2 ? d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "failed" }) : d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this), status: "passed" })) }) }, b.whiteSpaceNotUsedForFormatting = function(b, c, d) { c.get("$scope").find(b.textSelector).each(function() { var e = c.add(d({ element: this, expected: function(a) { return b.components.resolveExpectation(a) }(this) })); if (0 === a(this).find("br").length) return void e.set({ status: "passed" }); var f = a(this).html().toLowerCase().split(/(<br\ ?\/?>)+/),
                                            g = 0;
                                        a.each(f, function(a, b) {-1 !== b.search(/(\s|\&nbsp;){2,}/g) && g++ }), e.set(g > 1 ? { status: "failed" } : { status: "cantTell" }) }) }, b.lib.Case = function() {
                                    function b(a) { return new b.fn.init(a) } return b.fn = b.prototype = { constructor: b, init: function(a) { this.listeners = {}, this.timeout = null, this.attributes = a || {}; var b = this; return this.attributes.status && "untested" !== this.attributes.status ? setTimeout(function() { b.resolve() }, 0) : (this.attributes.status = "untested", this.timeout = setTimeout(function() { b.giveup() }, 350)), this }, attributes: null, get: function(a) { return this.attributes[a] }, set: function(a, b) { var c = !1; if ("object" == typeof a)
                                                for (var d in a) a.hasOwnProperty(d) && ("status" === d && (c = !0), this.attributes[d] = a[d]);
                                            else "status" === a && (c = !0), this.attributes[a] = b; return c && this.resolve(), this }, hasStatus: function(a) { "object" != typeof a && (a = [a]); for (var b = this.get("status"), c = 0, d = a.length; d > c; ++c)
                                                if (a[c] === b) return !0; return !1 }, resolve: function() { clearTimeout(this.timeout); var a, b = this.attributes.element;
                                            b && b.nodeType && 1 === b.nodeType && (this.attributes.selector = this.defineUniqueSelector(b), this.attributes.html || (this.attributes.html = "", "HTML" === b.nodeName || "BODY" === b.nodeName ? this.attributes.html = "<" + b.nodeName + ">" : "string" == typeof b.outerHTML && (a = b.outerHTML.trim().replace(/(\r\n|\n|\r)/gm, "").replace(/>\s+</g, "><"), a.length > 200 && (a = a.substr(0, 200) + "... [truncated]"), this.attributes.html = a))), this.dispatch("resolve", this) }, giveup: function() { clearTimeout(this.timeout), this.attributes.status = "notTested", this.dispatch("timeout", this) }, listenTo: function(a, b, c) { c = c.bind(this), a.registerListener.call(a, b, c) }, registerListener: function(a, b) { this.listeners[a] || (this.listeners[a] = []), this.listeners[a].push(b) }, dispatch: function(a) { if (this.listeners[a] && this.listeners[a].length) { var b = [].slice.call(arguments);
                                                this.listeners[a].forEach(function(a) { a.apply(null, b) }) } }, defineUniqueSelector: function(b) {
                                            function c(b) { return 1 === a(b).length }

                                            function d(a) { var b = "",
                                                    c = a.id || ""; return c.length > 0 && (b = "#" + c), b }

                                            function e(a) { var b = "",
                                                    c = a.className || ""; return c.length > 0 && (c = c.split(/\s+/), c = h(c, function(a) { return /active|enabled|disabled|first|last|only|collapsed|open|clearfix|processed/.test(a) }), c.length > 0) ? "." + c.join(".") : b }

                                            function f(a) { var b, c = "",
                                                    d = ["href", "type"]; if ("undefined" == typeof a || "undefined" == typeof a.attributes || null === a.attributes) return c; for (var e = 0, f = d.length; f > e; e++) b = a.attributes[d[e]] && a.attributes[d[e]].value, b && (c += "[" + d[e] + '="' + b + '"]'); return c }

                                            function g(a) { var b = "",
                                                    g = "",
                                                    h = !1,
                                                    i = !0;
                                                do { if (g = "", (g = d(a)).length > 0) { b = g + " " + b; break }!h && (g = e(a)).length > 0 && (b = g + " " + b, c(b) && (h = !0)), i && ((g = f(a)).length > 0 && (b = g + b), b = a.nodeName.toLowerCase() + b, i = !1), a = a.parentNode } while (a && 1 === a.nodeType && "BODY" !== a.nodeName && "HTML" !== a.nodeName); return b.trim() }

                                            function h(a, b) { for (var c = [], d = 0, e = a.length; e > d; d++) b.call(null, a[d]) || c.push(a[d]); return c } return b && g(b) }, push: [].push, sort: [].sort, concat: [].concat, splice: [].splice }, b.fn.init.prototype = b.fn, b }(), b.lib.Section = function() {
                                    function a(b, c) { return new a.fn.init(b, c) } return a.fn = a.prototype = { constructor: a, init: function(a, c) { if (!a) return this; if (this.id = a, c.techniques && c.techniques.length) { for (var d = 0, e = c.techniques.length; e > d; ++d) this.push(b.lib.Technique(c.techniques[d])); return this } return this }, length: 0, each: function(a) { for (var b = [].slice.call(arguments, 1), c = 0, d = this.length; d > c; ++c) b.unshift(this[c]), b.unshift(c), a.apply(this[c], b); return this }, find: function(a) { for (var b = 0, c = this.length; c > b; ++b)
                                                if (this[b].get("name") === a) return this[b]; return null }, set: function(a, c) { for (var d = 0, e = this.length; e > d; ++d)
                                                if (this[d].get("name") === a) return this[d].set(c), this[d]; var f = b.lib.Test(a, c); return this.push(f), f }, addTechnique: function(a) { this.push(a) }, regiterTechniqueTestResult: function() {}, push: [].push, sort: [].sort, splice: [].splice }, a.fn.init.prototype = a.fn, a }(), b.lib.SuccessCriteria = function() {
                                    function c(a) { return new c.fn.init(a) }

                                    function d(a) { return Object.keys(a).length } return c.fn = c.prototype = { constructor: c, init: function(a) { return this.listeners = {}, this.attributes = this.attributes || {}, this.attributes.status = "untested", this.attributes.results = {}, this.attributes.totals = {}, this.set(a || {}), this }, length: 0, attributes: null, get: function(b) { if ("$scope" === b) { var c = this.attributes.scope,
                                                    d = a(this.attributes.scope); return this.attributes[b] ? this.attributes[b] : c ? d : a(document) } return this.attributes[b] }, set: function(a, b) { var c = !1; if ("object" == typeof a)
                                                for (var d in a) a.hasOwnProperty(d) && ("status" === d && (c = !0), this.attributes[d] = a[d]);
                                            else this.attributes[a] = b; return this }, each: function(a) { for (var b = [].slice.call(arguments, 1), c = 0, d = this.length; d > c; ++c) { b.unshift(this[c]), b.unshift(c); var e = a.apply(this[c], b); if (e === !1) break } return this }, add: function(a) { this.find(a.get("selector")) || this.push(a) }, find: function(a) { for (var b = 0, c = this.length; c > b; ++b)
                                                if (this[b].get("selector") === a) return this[b]; return null }, registerTests: function(a) { var b = this.get("preEvaluator"),
                                                c = "undefined" != typeof b,
                                                d = !0;
                                            c && (d = b.call(this, a)), d || this.set("status", "inapplicable"), this.set("tests", a), this.listenTo(a, "complete", this.evaluate) }, filterTests: function(a) { var c = new b.lib.TestCollection,
                                                d = this.get("name"); if (!d) throw new Error("Success Criteria instances require a name in order to have tests filtered."); var e = d.split(":")[1]; return a.each(function(a, b) { var d = b.getGuidelineCoverage("wcag"); for (var f in d) d.hasOwnProperty(f) && f === e && c.add(b) }), c }, addConclusion: function(a, c) { this.get("results")[a] || (this.get("results")[a] = b.lib.Test()), this.get("results")[a].push(c), this.get("totals")[a] || (this.get("totals")[a] = 0), ++this.get("totals")[a], this.get("totals").cases || (this.get("totals").cases = 0), ++this.get("totals").cases }, evaluate: function(a, b) { if ("inapplicable" !== this.get("status")) { var c = this,
                                                    e = this.filterTests(b);
                                                0 === e.length ? this.set("status", "noTestCoverage") : (e.each(function(a, b) { b.each(function(a, b) { c.addConclusion(b.get("status"), b) }) }), 0 === d(this.get("results")) ? this.set("status", "noResults") : this.set("status", "tested")) } this.report() }, report: function() { var a = Array.prototype.slice.call(arguments);
                                            a = [].concat(["successCriteriaEvaluated", this, this.get("tests")], a), this.dispatch.apply(this, a) }, listenTo: function(a, b, c) { c = c.bind(this), a.registerListener.call(a, b, c) }, registerListener: function(a, b) { this.listeners[a] || (this.listeners[a] = []), this.listeners[a].push(b) }, dispatch: function(a) { if (this.listeners[a] && this.listeners[a].length) { var b = [].slice.call(arguments);
                                                this.listeners[a].forEach(function(a) { a.apply(null, b) }) } }, push: [].push, sort: [].sort, splice: [].splice }, c.fn.init.prototype = c.fn, c }(), b.lib.Technique = function() {
                                    function a(b, c) { return new a.fn.init(b, c) } return a.fn = a.prototype = { constructor: a, init: function(a, b) { return this.listeners = {}, a ? (this.attributes = b || {}, this.attributes.name = a, this) : this }, length: 0, attributes: {}, each: function(a) { for (var b = [].slice.call(arguments, 1), c = 0, d = this.length; d > c; ++c) b.unshift(this[c]), b.unshift(c), a.apply(this[c], b); return this }, get: function(a) { return this.attributes[a] }, set: function(a, b) { if ("object" == typeof a)
                                                for (var c in a) a.hasOwnProperty(c) && (this.attributes[c] = a[c]);
                                            else this.attributes[a] = b; return this }, addTest: function() {}, report: function(a, b) { window.console && window.console.log(this.get("name"), b.status, b, b[0] && b[0].status) }, listenTo: function(a, b, c) { c = c.bind(this), a.registerListener.call(a, b, c) }, registerListener: function(a, b) { this.listeners[a] || (this.listeners[a] = []), this.listeners[a].push(b) }, dispatch: function(a) { if (this.listeners[a] && this.listeners[a].length) { var b = [].slice.call(arguments);
                                                this.listeners[a].forEach(function(a) { a.apply(null, b) }) } }, push: [].push, sort: [].sort, splice: [].splice }, a.fn.init.prototype = a.fn, a }(), b.lib.Test = function() {
                                    function c(a, b) { return new c.fn.init(a, b) }

                                    function d(a) { a = "undefined" == typeof a ? !0 : a, this.each(function(b, c) { c.get("status") || (a = !1) }), a ? (this.testComplete = null, this.attributes.complete = !0, this.determineStatus()) : this.testComplete() }

                                    function e(a, b, c) { var d, e; return function() { var f = this,
                                                g = arguments,
                                                h = function() { d = null, c || (e = a.apply(f, g)) },
                                                i = c && !d; return clearTimeout(d), d = setTimeout(h, b), i && (e = a.apply(f, g)), e } }
                                    return c.fn = c.prototype = {
                                        constructor: c,
                                        init: function(a, b) { return this.listeners = {}, this.length = 0, a ? (this.attributes = b || {}, this.attributes.name = a, this.attributes.status = "untested", this.attributes.complete = !1, this) : this },
                                        length: 0,
                                        attributes: null,
                                        each: function(a) { for (var b = [].slice.call(arguments, 1), c = 0, d = this.length; d > c; ++c) b.unshift(this[c]), b.unshift(c), a.apply(this[c], b); return this },
                                        get: function(b) { if ("$scope" === b) { var c = this.attributes.scope,
                                                    d = a(this.attributes.scope); return this.attributes[b] ? this.attributes[b] : c ? d : a(document) } return this.attributes[b] },
                                        set: function(a, b) { var c = !1; if ("object" == typeof a)
                                                for (var d in a) a.hasOwnProperty(d) && ("status" === d && (c = !0), this.attributes[d] = a[d]);
                                            else "status" === a && (c = !0), this.attributes[a] = b; return c && this.resolve(), this },
                                        add: function(a) { return this.listenTo(a, "resolve", this.caseResponded), this.listenTo(a, "timeout", this.caseResponded), a.status && a.dispatch("resolve", a), this.push(a), a },
                                        invoke: function() {
                                            if (this.testComplete) throw new Error("The test " + this.get("name") + " is already running.");
                                            if (this.attributes.complete) throw new Error("The test " + this.get("name") + " has already been run.");
                                            var a = this.get("type"),
                                                c = this.get("options") || {},
                                                f = this.get("callback"),
                                                g = this;
                                            if (this.testComplete = e(d.bind(this), 400), this.testComplete(!1), "custom" === a)
                                                if ("function" == typeof f) try { f.call(this, b, g, b.lib.Case, c) } catch (h) { window.console && window.console.error && window.console.error(h) } else { if ("custom" !== a || "function" != typeof b[f]) throw new Error("The callback " + f + " cannot be invoked."); try { b[f].call(this, b, g, b.lib.Case, c) } catch (h) { window.console && window.console.error && window.console.error(h) } } else { if ("function" != typeof b.components[a]) throw new Error("The component type " + a + " is not defined."); try { b.components[a].call(this, b, g, b.lib.Case, c) } catch (h) { window.console && window.console.error && window.console.error(h) } }
                                            return this.testComplete(), this
                                        },
                                        findByStatus: function(a) { if (a) { var b = new c; "string" == typeof a && (a = [a]); for (var d = 0, e = a.length; e > d; ++d) { var f = a[d];
                                                    this.each(function(a, c) { var d = c.get("status");
                                                        d === f && b.add(c) }) } return b } },
                                        findCasesBySelector: function(a) { var b = this.groupCasesBySelector(); return b.hasOwnProperty(a) ? b[a] : new c },
                                        findCaseByHtml: function(a) { for (var c, d = 0, e = this.length; e > d; ++d)
                                                if (c = this[d], a === c.get("html")) return c; return b.lib.Case() },
                                        groupCasesBySelector: function() { var a = {}; return this.each(function(b, d) { var e = d.get("selector");
                                                a[e] || (a[e] = new c), a[e].add(d) }), a },
                                        groupCasesByHtml: function() { var a = {}; return this.each(function(b, d) { var e = d.get("html");
                                                a[e] || (a[e] = new c), a[e].add(d) }), a },
                                        getGuidelineCoverage: function(a) { var b = this.get("guidelines"); return b && b[a] || {} },
                                        caseResponded: function(a, b) { this.dispatch(a, this, b), "function" == typeof this.testComplete && this.testComplete() },
                                        determineStatus: function() { var a, c = this.get("type");
                                            b.components[c] && "function" == typeof b.components[c].postInvoke && (a = b.components[c].postInvoke.call(this, this)), this.set(a === !0 ? { status: "passed" } : this.findByStatus(["cantTell"]).length === this.length ? { status: "cantTell" } : this.findByStatus(["inapplicable"]).length === this.length ? { status: "inapplicable" } : this.findByStatus(["failed", "untested"]).length ? { status: "failed" } : { status: "passed" }) },
                                        resolve: function() { this.dispatch("complete", this) },
                                        testComplete: null,
                                        listenTo: function(a, b, c) { c = c.bind(this), a.registerListener.call(a, b, c) },
                                        registerListener: function(a, b) { this.listeners[a] || (this.listeners[a] = []), this.listeners[a].push(b) },
                                        dispatch: function(a) { if (this.listeners[a] && this.listeners[a].length) { var b = [].slice.call(arguments);
                                                this.listeners[a].forEach(function(a) { a.apply(null, b) }) } },
                                        push: [].push,
                                        sort: [].sort,
                                        concat: [].concat,
                                        splice: [].splice
                                    }, c.fn.init.prototype = c.fn, c
                                }(), b.lib.TestCollection = function() {
                                    function a(b) { return new a.fn.init(b) }

                                    function c() { var a = !0;
                                        this.each(function(b, c) { c.get("complete") || (a = !1) }), a ? (this.testsComplete = null, this.dispatch("complete", this)) : this.testsComplete() }

                                    function d(a, b, c) { var d, e; return function() { var f = this,
                                                g = arguments,
                                                h = function() { d = null, c || (e = a.apply(f, g)) },
                                                i = c && !d; return clearTimeout(d), d = setTimeout(h, b), i && (e = a.apply(f, g)), e } } return a.fn = a.prototype = { constructor: a, init: function(a, c) { if (this.listeners = {}, c = c || {}, !a) return this; if ("object" == typeof a) { var d; for (var e in a) a.hasOwnProperty(e) && (a[e].scope = a[e].scope || c.scope, d = new b.lib.Test(e, a[e]), this.listenTo(d, "results", this.report), this.push(d)); return this } return this }, length: 0, run: function(a) { var b = this; return a = a || {}, this.each(function(c, d) { a.preFilter && b.listenTo(d, "resolve", function(b, c, d) { var e = a.preFilter(b, c, d);
                                                    e === !1 && (d.attributes.status = "notTested", d.attributes.expected = null) }), a.caseResolve && b.listenTo(d, "resolve", a.caseResolve), a.testComplete && b.listenTo(d, "complete", a.testComplete) }), a.testCollectionComplete && b.listenTo(b, "complete", a.testCollectionComplete), this.testsComplete = d(c.bind(this), 500), this.each(function(a, b) { b.invoke() }), this.testsComplete(), this }, each: function(a) { for (var b = [].slice.call(arguments, 1), c = 0, d = this.length; d > c; ++c) { b.unshift(this[c]), b.unshift(c); var e = a.apply(this[c], b); if (e === !1) break } return this }, add: function(a) { this.find(a.get("name")) || this.push(a) }, find: function(a) { for (var b = 0, c = this.length; c > b; ++b)
                                                if (this[b].get("name") === a) return this[b]; return null }, findByGuideline: function(b) { var c = { wcag: function(c, d) {
                                                    function e(b, c, d) { var e = new a; return this.each(function(a, f) { var g = f.get("guidelines"),
                                                                h = g[b] && g[b][c] && g[b][c].techniques; if (h)
                                                                for (var i = 0, j = h.length; j > i; ++i) h[i] === d && (e.listenTo(f, "results", e.report), e.add(f)) }), e } var f = c.id,
                                                        g = d.get("name"); return f && g ? e.call(this, b, f, g) : void 0 } }; if (c[b]) { var d = [].slice.call(arguments, 1); return c[b].apply(this, d) } }, findByStatus: function(b) { if (b) { var c = new a; "string" == typeof b && (b = [b]); for (var d = 0, e = b.length; e > d; ++d) { var f = b[d];
                                                    this.each(function(a, b) { var d = b.get("status");
                                                        d === f && c.add(b) }) } return c } }, set: function(a, c) { for (var d = 0, e = this.length; e > d; ++d)
                                                if (this[d].get("name") === a) return this[d].set(c), this[d]; var f = b.lib.Test(a, c); return this.push(f), f }, testsComplete: null, report: function() { this.dispatch.apply(this, arguments) }, listenTo: function(a, b, c) { c = c.bind(this), a.registerListener.call(a, b, c) }, registerListener: function(a, b) { this.listeners[a] || (this.listeners[a] = []), this.listeners[a].push(b) }, dispatch: function(a) { if (this.listeners[a] && this.listeners[a].length) { var b = [].slice.call(arguments);
                                                this.listeners[a].forEach(function(a) { a.apply(null, b) }) } }, push: [].push, sort: [].sort, splice: [].splice }, a.fn.init.prototype = a.fn, a }(), b.lib.WCAGGuideline = function() { var a = function(b) { return new a.fn.init(b) }; return a.fn = a.prototype = { constructor: a, init: function(a) { if (!a) return this;
                                            this.techniques = []; var c, d, e, f, g; if ("object" == typeof a) { if (a.guidelines) { c = a.guidelines; for (var h in c)
                                                        if (c.hasOwnProperty(h)) { if (d = c[h], d.techniques && d.techniques.length && (e = d.techniques, delete d.techniques), d = b.lib.Section(h, d), e.length)
                                                                for (var i = 0, j = e.length; j > i; ++i) { if (f = e[i], !a.techniques[f]) throw new Error("Definition for Technique " + f + " is missing from the guideline specification");
                                                                    g = this.findTechnique(f), g || (g = b.lib.Technique(f, a.techniques[f]), this.techniques.push(g)), d.addTechnique(g) } this.push(d) } } return this } return this }, length: 0, each: function(a) { for (var b = [].slice.call(arguments, 1), c = 0, d = this.length; d > c; ++c) b.unshift(this[c]), b.unshift(c), a.apply(this[c], b); return this }, find: function(a) { for (var b = 0, c = this.length; c > b; ++b)
                                                if (this[b].get("name") === a) return this[b]; return null }, findTechnique: function(a) { for (var b = 0, c = this.techniques.length; c > b; ++b)
                                                if (this.techniques[b].get("name") === a) return this.techniques[b]; return null }, set: function(a, c) { for (var d = 0, e = this.length; e > d; ++d)
                                                if (this[d].get("name") === a) return this[d].set(c), this[d]; var f = b.lib.Test(a, c); return this.push(f), f }, evaluate: function() {}, results: function() {}, push: [].push, sort: [].sort, splice: [].splice }, a.fn.init.prototype = a.fn, a }(),
                                function(a) {
                                    function b(b, c, d, e) { var f = c.attr("rowspan") || 1,
                                            g = c.attr("scope"); if ("col" === g) return !0; if (-1 !== i.indexOf(g)) return !1; for (var h = 0; h < f * b[e].length - 1; h += 1) { var j = a(b[e + h % f][~~(h / f)]); if (j.is("td")) return !1 } return !0 }

                                    function c(c, d, e, f) { var g = d.attr("colspan") || 1,
                                            h = d.attr("scope"); if ("row" === h) return !0; if (-1 !== i.indexOf(h) || b(c, d, e, f)) return !1; for (var j = 0; j < g * c.length - 1; j += 1) { var k = a(c[~~(j / g)][e + j % g]); if (k.is("td")) return !1 } return !0 }

                                    function d(d, e, f, g, h) { var i, j, k = a(),
                                            l = a(d[f][e]),
                                            m = []; for (l.is("th") ? (j = [{ cell: l, x: e, y: f }], i = !0) : (i = !1, j = []); e >= 0 && f >= 0; e += g, f += h) { var n = a(d[f][e]),
                                                o = 0 === g ? "col" : "row"; if (n.is("th")) { i = !0, j.push({ cell: n, x: e, y: f }); var p = !1; - 1 === h && c(d, n, e, f) || -1 === g && b(d, n, e, f) ? p = !0 : a.each(m, function(b, c) { var d = +n.attr(o + "span") || 1,
                                                        i = +a(c.cell).attr(o + "span") || 1;
                                                    d === i && (-1 === h && c.x === e || -1 === g && c.y === f) && (p = !0) }), p === !1 && (k = k.add(n)) } else n.is("td") && i === !0 && (i = !1, m.push(j), j = a()) } return k }

                                    function e(b) { var c = b.closest("table"),
                                            d = b.attr("headers").split(/\s/),
                                            e = a(); return a.each(d, function(b, d) { e = e.add(a("th#" + d + ", td#" + d, c)) }), e }

                                    function f(a, b) { for (var c, d = 0, e = 0; void 0 === c;) { if (void 0 === a[e]) return;
                                            a[e][d] === b[0] ? c = d : d + 1 === a[e].length ? (e += 1, d = 0) : d += 1 } return { x: c, y: e } }

                                    function g(b, c) { var e, g = a(),
                                            h = f(c, b),
                                            i = +b.attr("rowspan") || 1,
                                            j = +b.attr("colspan") || 1; for (e = 0; j > e; e++) g = g.add(d(c, h.x + e, h.y, 0, -1)); for (e = 0; i > e; e++) g = g.add(d(c, h.x, h.y + e, -1, 0)); return g }

                                    function h(b, c) { var d = f(c, b),
                                            e = a();
                                        b.closest("thead, tbody, tfoot").find("th[scope=rowgroup]").each(function() { var b = f(c, a(this));
                                            b.x <= d.x && b.y <= d.y && (e = e.add(this)) }) } var i = ["row", "col", "rowgroup", "colgroup"];
                                    a.fn.getTableMap = function() { var b = []; return this.find("tr").each(function(c) { "undefined" == typeof b[c] && (b[c] = []); var d = b[c];
                                            a(this).children().each(function() { var e, f, g, h = a(this),
                                                    i = +h.attr("rowspan") || 1,
                                                    j = +h.attr("colspan") || 1; for (f = 0, g = d.length; g >= f; f += 1) void 0 === e && void 0 === d[f] && (e = f); for (f = 0, g = j * i; g > f; f += 1) void 0 === b[c + ~~(f / j)] && (b[c + ~~(f / j)] = []), b[c + ~~(f / j)][e + f % j] = this }) }), b }, a.fn.tableHeaders = function() { var b = a(); return this.each(function() { var c = a(this); if (!c.is(":not(td, th)"))
                                                if (c.is("[headers]")) b = b.add(e(c));
                                                else { var d = c.closest("table").getTableMap();
                                                    b = b.add(g(c, d)).add(h(c, d)) } }), b.not(":empty").not(this) } }(jQuery), b.lib.wcag2 = function() {
                                    function c(b) { b.wcag2Structure && b.accessibilityTests && b.preconditionTests ? d(b, b.wcag2Structure, b.accessibilityTests, b.preconditionTests) : a.when(a.ajax(b.jsonPath + "/wcag2.json", f), a.ajax(b.jsonPath + "/tests.json", f), a.ajax(b.jsonPath + "/preconditions.json", f)).done(function(a, c, e) { d(b, a[0], c[0], e[0]) }) }

                                    function d(c, d, f, g) { var h, i, j, k = [];
                                        h = a.map(d, function(a) { return new b.lib.wcag2.Criterion(a, f, g, c.subject) }), a.each(h, function(a, b) { k.push.apply(k, b.getTests()) }), j = [], i = [], a.each(k, function(a, b) {-1 === j.indexOf(b.title.en) && (j.push(b.title.en), i.push(b)) }), a(b.html).quail({ accessibilityTests: i, testCollectionComplete: e(h, c.testCollectionComplete) }) }

                                    function e(b, c) { return function(d, e) { "complete" === d && (e = a.map(b, function(a) { return a.getResult(e) })), c(d, e) } } var f = { async: !1, dataType: "json" }; return { run: c } }(), b.guidelines.wcag.successCriteria["1.1.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.1.1", preEvaluator: b }); return c.techniques = {}, c.failures = { F3: "Using CSS to include images that convey important information", F13: "Having a text alternative that does not include information that is conveyed by color differences in the image", F20: "Not updating text alternatives when changes to non-text content occur", F30: "Using text alternatives that are not alternatives (e.g., filenames or placeholder text)", F38: "Not marking up decorative images in HTML in a way that allows assistive technology to ignore them", F39: 'Providing a text alternative that is not null (e.g., alt="spacer" or alt="image") for images that should be ignored by assistive technology', F65: 'Omitting the alt attribute or text alternative on img elements, area elements, and input elements of type "image"', F67: "Providing long descriptions for non-text content that does not serve the same purpose or does not present the same information", F71: "Using text look-alikes to represent text without providing a text alternative", F72: "Using ASCII art without providing a text alternative" }, c }(b), b.guidelines.wcag.successCriteria["1.2.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.2.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.2", preEvaluator: b }); return c.techniques = { G93: "Providing open (always visible) captions", G87: "Providing closed captions" }, c.failures = { F74: "Not labeling a synchronized media alternative to text as an alternative", F75: "Providing synchronized media without captions when the synchronized media presents more information than is presented on the page", F8: "Captions omitting some dialogue or important sound effects" }, c }(b), b.guidelines.wcag.successCriteria["1.2.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.3", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.2.4"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.4", preEvaluator: b }); return c.techniques = { G9: "Creating captions for live synchronized media", G93: "Providing open (always visible) captions", G87: "Providing closed captions using any readily available media format that has a video player that supports closed captioning" }, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.2.5"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.5", preEvaluator: b }); return c.techniques = { G78: "Providing a second, user-selectable, audio track that includes audio descriptions", G173: "Providing a version of a movie with audio descriptions", "SC1.2.8": "Providing a movie with extended audio descriptions", G8: "Providing a movie with extended audio descriptions", G203: "Using a static text alternative to describe a talking head video" }, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.2.7"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.7", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.2.8"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.8", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.2.9"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.2.9", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.3.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.3.1", preEvaluator: b }); return c.techniques = { G115: "Using semantic elements to mark up structure AND H49: Using semantic markup to mark emphasized or special text", G117: "Using text to convey information that is conveyed by variations in presentation of text", G140: "Separating information and structure from presentation to enable different presentations", G138: "Using semantic markup whenever color cues are used", H48: "Using ol, ul and dl for lists or groups of links", H42: "Using h1-h6 to identify headings", SCR21: "Using functions of the Document Object Model (DOM) to add content to a page (Scripting)", H51: "Using table markup to present tabular information", H39: "Using caption elements to associate data table captions with data tables", H73: "Using the summary attribute of the table element to give an overview of data tables", H63: "Using the scope attribute to associate header cells and data cells in data tables", H43: "Using id and headers attributes to associate data cells with header cells in data tables", H44: "Using label elements to associate text labels with form controls", H65: "Using the title attribute to identify form controls when the label element cannot be used", H71: "Providing a description for groups of form controls using fieldset and legend elements", H85: "Using OPTGROUP to group OPTION elements inside a SELECT", ARIA11: "Using ARIA landmarks to identify regions of a page (ARIA)", ARIA12: "Using role=heading to identify headings (ARIA)", ARIA13: "Using aria-labelledby to name regions and landmarks (ARIA)", ARIA16: "Using aria-labelledby to provide a name for user interface controls (ARIA)", ARIA17: "Using grouping roles to identify related form controls (ARIA)" }, c.failures = { F2: "Using changes in text presentation to convey information without using the appropriate markup or text", F17: "Insufficient information in DOM to determine one-to-one relationships (e.g., between labels with same id) in HTML", F42: "Using scripting events to emulate links in a way that is not programmatically determinable", F43: "Using structural markup in a way that does not represent relationships in the content", F87: "Inserting non-decorative content by using :before and :after pseudo-elements and the content property in CSS", F46: "Using th elements, caption elements, or non-empty summary attributes in layout tables", F48: "Using the pre element to markup tabular information", F90: "Incorrectly associating table headers and content via the headers and id attributes", F91: "Not correctly marking up table headers", F33: "Using white space characters to create multiple columns in plain text content", F34: "Using white space characters to format tables in plain text content", F68: "Association of label and user interface controls not being programmatically determinable" }, c }(b), b.guidelines.wcag.successCriteria["1.3.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.3.2", preEvaluator: b }); return c.techniques = { G57: "Ordering the content in a meaningful sequence (scope: for all the content in the Web page)", H34: "Using a Unicode right-to-left mark (RLM) or left-to-right mark (LRM) to mix text direction inline (languageUnicodeDirection)", H56: "Using the dir attribute on an inline element to resolve problems with nested directional runs", C6: "Positioning content based on structural markup (CSS)", C8: "Using CSS letter-spacing to control spacing within a word", C27: "Making the DOM order match the visual order (CSS)" }, c.failures = { F49: "Using an HTML layout table that does not make sense when linearized", F32: "Using white space characters to control spacing within a word (whiteSpaceInWord)", F1: "Changing the meaning of content by positioning information with CSS", F34: "Using white space characters to format tables in plain text content (tabularDataIsInTable)", F33: "Using white space characters to create multiple columns in plain text content (tabularDataIsInTable)" }, c }(b), b.guidelines.wcag.successCriteria["1.3.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.3.3", preEvaluator: b }); return c.techniques = { G96: "Providing textual identification of items that otherwise rely only on sensory information to be understood" }, c.failures = { F14: "Identifying content only by its shape or location", F26: "Using a graphical symbol alone to convey information" }, c }(b), b.guidelines.wcag.successCriteria["1.4.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.4.2"] = function(b) {
                                    function c() { return !!a("audio, video, object, embed").length } var d = b.lib.SuccessCriteria({ name: "wcag:1.4.2", preEvaluator: c }); return d.techniques = { G60: "Playing a sound that turns off automatically within three seconds", G170: "Providing a control near the beginning of the Web page that turns off sounds that play automatically", G171: "Playing sounds only on user request" }, d.failures = { F23: "Playing a sound longer than 3 seconds where there is no mechanism to turn it off" }, d }(b), b.guidelines.wcag.successCriteria["1.4.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.3", preEvaluator: b }); return c.techniques = { G148: "Not specifying background color, not specifying text color, and not using technology features that change those defaults", G174: "Providing a control with a sufficient contrast ratio that allows users to switch to a presentation that uses sufficient contrast", G18: "Ensuring that a contrast ratio of at least 4.5:1 exists between text (and images of text) and background behind the text for situation A AND G145: Ensuring that a contrast ratio of at least 3:1 exists between text (and images of text) and background behind the text for situation B" }, c.failures = { F24: "Specifying foreground colors without specifying background colors or vice versa", F83: "Using background images that do not provide sufficient contrast with foreground text (or images of text)" }, c }(b), b.guidelines.wcag.successCriteria["1.4.4"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.4", preEvaluator: b }); return c.techniques = { G142: "Using a technology that has commonly-available user agents that support zoom", C12: "Using percent for font sizes", C13: "Using named font sizes", C14: "Using em units for font, sizes", SCR34: "Calculating size and ,position in a way that scales with text size (Scripting)", G146: "Using liquid layout", G178: "Providing controls on the Web page that allow users to incrementally change the size of all text on the page up to 200 percent", G179: "Ensuring that there is no loss of content or functionality when the text resizes and text containers do not change their width" }, c.failures = { F69: "Resizing visually rendered text up to 200 percent causes the text, image or controls to be clipped, truncated or obscured", F80: "Text-based form controls do not resize when visually rendered text is resized up to 200%" }, c }(b), b.guidelines.wcag.successCriteria["1.4.5"] = function(a) {
                                    function b() { return !!document.querySelectorAll("img, map").length } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.5", preEvaluator: b }); return c.techniques = { C22: "Using CSS to control visual presentation of text (CSS)", C30: "Using CSS to replace text with images of text and providing user interface controls to switch", G140: "Separating information and structure from presentation to enable different presentations" }, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.4.6"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.6", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.4.7"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.7", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.4.8"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.8", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["1.4.9"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:1.4.9", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.1.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.1.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.1.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.1.2", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.1.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.1.3", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.2.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.2.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.2.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.2.2", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.2.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.2.3", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.2.4"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.2.4", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.2.5"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.2.5", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.3.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.3.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.3.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.3.2", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.1", preEvaluator: b }); return c.techniques = { G1: "Adding a link at the top of each page that goes directly to the main content area", G123: "Adding a link at the beginning of a block of repeated content to go to the end of the block", G124: "Adding links at the top of the page to each area of the content", H69: "Providing heading elements at the beginning of each section of content", H70: "Using frame elements to group blocks of repeated material AND H64: Using the title attribute of the frame and iframe elements", SCR28: "Using an expandable and collapsible menu to bypass block of content" }, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.10"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.10", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.2", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.3", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.4"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.4", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.5"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.5", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.6"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.6", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.7"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.7", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.8"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.8", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["2.4.9"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:2.4.9", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.1.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.1.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.1.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.1.2", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.1.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.1.3", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.1.4"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.1.4", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.1.5"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.1.5", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.1.6"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.1.6", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.2.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.2.1", preEvaluator: b }); return c.techniques = { G107: 'Using "activate" rather than "focus" as a trigger for changes of context' }, c.failures = { F52: "Opening a new window as soon as a new page is loaded", F55: "Using script to remove focus when focus is received" }, c }(b), b.guidelines.wcag.successCriteria["3.2.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.2.2", preEvaluator: b }); return c.techniques = { G80: "Providing a submit button to initiate a change of context", H32: "Providing submit buttons", H84: "Using a button with a select element to perform an action", G13: "Describing what will happen before a change to a form control that causes a change of context to occur is made", SCR19: "Using an onchange event on a select element without causing a change of context" }, c.failures = { F36: "Automatically submitting a form and presenting new content without prior warning when the last field in the form is given a value", F37: "Launching a new window without prior warning when the status of a radio button, check box or select list is changed", F76: "Providing instruction material about the change of context by change of setting in a user interface element at a location that users may bypass" }, c }(b), b.guidelines.wcag.successCriteria["3.2.3"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.2.3", preEvaluator: b }); return c.techniques = { G61: "Presenting repeated components in the same relative order each time they appear" }, c.failures = { F66: "Presenting navigation links in a different relative order on different pages" }, c }(b), b.guidelines.wcag.successCriteria["3.2.4"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.2.4", preEvaluator: b }); return c.techniques = { G197: "Using labels, names, and text alternatives consistently for content that has the same functionality AND following the sufficient techniques for Success Criterion 1.1.1 and sufficient techniques for Success Criterion 4.1.2 for providing labels, names, and text alternatives." }, c.failures = { F31: "Using two different labels for the same function on different Web pages within a set of Web pages" }, c }(b), b.guidelines.wcag.successCriteria["3.2.5"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.2.5", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.3.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.3.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.3.2"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.3.2", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.3.3"] = function(a) {
                                    function b() {
                                        function a(a) { return !!this.querySelectorAll('[type="' + a + '"]').length }

                                        function b(a) { var b = Object.keys(a)[0]; return !!this.querySelectorAll("[" + b + '="' + a[b] + '"]').length } var c = ["checkbox", "color", "date", "datetime", "datetime-local", "email", "file", "hidden", "month", "number", "password", "radio", "range", "search", "tel", "time", "url", "week"],
                                            d = [{ required: "required" }, { "aria-required": "true" }]; return document.querySelectorAll("form").length ? c.some(a, document) || d.some(b, document) ? !0 : void 0 : !1 } var c = a.lib.SuccessCriteria({ name: "wcag:3.3.3", preEvaluator: b }); return c.techniques = { G83: "Providing text descriptions to identify required fields that were not completed", ARIA2: "Identifying a required field with the aria-required property", ARIA18: "Using aria-alertdialog to Identify Errors (ARIA)", G85: "Providing a text description when user input falls outside the required format or values", G177: "Providing suggested correction text", SCR18: "Providing client-side validation and alert (Scripting)", SCR32: "Providing client-side validation and adding error text via the DOM (Scripting)", G84: "Providing a text description when the user provides information that is not in the list of allowed values" }, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.3.4"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.3.4", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.3.5"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.3.5", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["3.3.6"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:3.3.6", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["4.1.1"] = function(a) {
                                    function b() { return !0 } var c = a.lib.SuccessCriteria({ name: "wcag:4.1.1", preEvaluator: b }); return c.techniques = {}, c.failures = {}, c }(b), b.guidelines.wcag.successCriteria["4.1.2"] = function(a) {
                                    function b() { return !0 }
                                    var c = a.lib.SuccessCriteria({ name: "wcag:4.1.2", preEvaluator: b });
                                    return c.techniques = { ARIA14: "Using aria-label to provide an invisible label where a visible label cannot be used", ARIA16: "Using aria-labelledby to provide a name for user interface controls", G108: "Using markup features to expose the name and role, allow user-settable properties to be directly set, and provide notification of changes using technology-specific techniques below:", H91: "Using HTML form controls and links", H44: "Using label elements to associate text labels with form controls", H64: "Using the title attribute of the frame and iframe elements", H65: "Using the title attribute to identify form controls when the label element cannot be used", H88: "Using HTML according to spec" }, c.failures = { F59: "Using script to make div or span a user interface control in HTML without providing a role for the control (This failure may be solved in the future using DHTML roadmap techniques.)", F20: "Not updating text alternatives when changes to non-text content occur", F68: "Association of label and user interface controls not being programmatically determined", F79: "Focus state of a user interface component not being programmatically determinable or no notification of change of focus state available", F86: "Not providing names for each part of a multi-part form field, such as a US telephone number", F89: "Using null alt on an image where the image is the only content in a link" }, c
                                }(b), b.lib.wcag2.Criterion = function() {
                                    function c(c, d) { var e = b.lib.wcag2.EarlAssertion.getResultPriority,
                                            f = { result: d }; return a.each(c, function(a, b) { e(f) < e(b) && (f.result = b.outcome.result) }), f }

                                    function d(d, e, f, g) { var h = [],
                                            i = {},
                                            j = d["default"] || "untested",
                                            k = d.id; if (a.isArray(d.testAggregators) && (h = a.map(d.testAggregators, function(a) { return new b.lib.wcag2.TestAggregator(a, e, g) })), a.isArray(d.preconditions)) { var l = { type: "stacking", tests: d.preconditions };
                                            h.push(new b.lib.wcag2.TestAggregator(l, f, g)) } return i.getResult = function(d) { var e, f = []; return a.each(h, function(a, b) { var c = b.getResults(d);
                                                f.push.apply(f, c) }), e = new b.lib.wcag2.EarlAssertion({ testRequirement: k, outcome: c(f, j), subject: g }), f.length > 0 && (e.hasPart = f), e }, i.getTests = function() { var b = []; return a.each(h, function(a, c) { b.push.apply(b, c.tests) }), b }, i } return d }(), b.lib.wcag2.EarlAssertion = function() {
                                    function b(b) { a.extend(this, b, e), this.outcome = a.extend({}, this.outcome) } var c, d = ["untested", "inapplicable", "passed", "cantTell", "failed"],
                                        e = { type: "assertion", subject: c, assertedBy: { type: "earl:Software", name: "QuailJS" }, mode: "automated" }; return window && window.location && (c = window.location.href), b.getResultPriority = function(a) { return "object" == typeof a && (a = a.outcome ? a.outcome.result : a.result), d.indexOf(a) }, b }(), b.lib.wcag2.TestAggregator = function() {
                                    function c(b, c) { a.each(b, function(a, b) { b.each(function() { c.call(this, b, this) }) }) }

                                    function d(b) { var c = [],
                                            d = []; return a.each(b, function(a, b) { var c = [];
                                            b.each(function() { c.push(this.get("element")), j.add(this) }), d.push(c) }), a.each(d, function(b, d) { if (0 === b) return void(c = d); var e = [];
                                            a.each(d, function(a, b) {-1 !== c.indexOf(b) && e.push(b) }), c = e }), c }

                                    function e(a) { var b = []; return c(a, function(a, c) { var d = c.get("element"); - 1 === b.indexOf(d) && (b.push(d), j.add(c)) }), b }

                                    function f(c, d) { var e = []; return a.each(c, function(a, c) { var f = new b.lib.wcag2.EarlAssertion(d);
                                            c && (f.outcome.pointer = j.getPointer(c)), e.push(f) }), e }

                                    function g(a, e) { var g = jQuery.unique(d(e)),
                                            h = f(jQuery.unique(g), { testCase: a.id, outcome: { result: "failed" } }); return c(e, function(c, d) { var e = d.get("status"),
                                                f = b.lib.wcag2.EarlAssertion.getResultPriority,
                                                i = h[g.indexOf(d.get("element"))]; if (a[e] && (e = a[e]), i && f(i) >= f(e)) { var j = i.outcome.pointer;
                                                i.outcome = { result: e, info: c.get("title") }, j && (i.outcome.pointer = j) } }), h }

                                    function h(a, d) { var g = e(d),
                                            h = f(g, { testCase: a.id, outcome: { result: "untested" } }); return c(d, function(c, d) { var e = d.get("status"),
                                                f = b.lib.wcag2.EarlAssertion.getResultPriority,
                                                i = h[g.indexOf(d.get("element"))];
                                            a[e] && (e = a[e]), i && f(i) < f(e) && (i.outcome = { result: e, info: c.get("title") }) }), h }

                                    function i(b, c, d) { a.extend(this, { id: b.tests.join("+"), subject: d }, b), this.tests = a.map(this.tests, function(a) { return c[a] }) } var j = { elms: [], pointers: [], add: function(a) { var b; - 1 === j.elms.indexOf(a.get("element")) && (a.get("html") && (b = [{ type: "CharSnippetCompoundPointer", chars: a.get("html"), CSSSelector: a.get("selector") }]), j.elms.push(a.get("element")), j.pointers.push(b)) }, getPointer: function(a) { var b = j.elms.indexOf(a); return j.pointers[b] } }; return i.prototype.filterDataToTests = function(b) { var c = a.map(this.tests, function(a) { return a.name }),
                                            d = []; return a.each(b, function(a, b) {-1 !== c.indexOf(b.get("name")) && d.push(b) }), d }, i.prototype.getResults = function(a) { var c, d, e = this.filterDataToTests(a); return 1 === e.length || "combined" === this.type ? c = g(this, e) : "stacking" === this.type ? c = h(this, e) : window && window.console.error("Unknown type for aggregator " + this.id), c ? (0 === c.length && (d = new b.lib.wcag2.EarlAssertion({ testCase: this.id, subject: this.subject, outcome: { result: "inapplicable" } }), c.push(d)), c) : void 0 }, i }()
                        }(jQuery);
                    }());

                    Quail = $.fn.quail;

                    /**
                     * @license Copyright (c) 2014-2016, CKSource - Frederico Knabben. All rights reserved.
                     * For licensing, see LICENSE.md or http://ckeditor.com/license
                     */

                    /**
                     * Engine driver class for updated [Quail](http://quailjs.org/) 2.2.8 implementation.
                     *
                     * @since 4.6.0
                     * @class CKEDITOR.plugins.a11ychecker.EngineQuail
                     * @constructor
                     */
                    function EngineQuail(plugin) {
                        this.jsonPath = (plugin ? plugin.path : '') + 'libs/quail/';

                        //this.config = this.createConfig();
                    }

                    EngineQuail.prototype = new Engine();
                    EngineQuail.prototype.constructor = EngineQuail;

                    /**
                     * @todo: Lets drop these types for the time being.
                     */
                    EngineQuail.prototype.fixesMapping = {
                        'imgHasAlt': ['ImgAlt'],
                        'imgImportantNoSpacerAlt': ['ImgAlt'],
                        'KINGUseLongDateFormat': ['DateUnfold'],
                        'aAdjacentWithSameResourceShouldBeCombined': ['AnchorsMerge'],
                        'imgAltNotEmptyInAnchor': ['ImgAlt'],
                        'imgAltIsDifferent': ['ImgAlt'],
                        'imgShouldNotHaveTitle': ['AttributeRenameDefault'],
                        'tableUsesCaption': ['AddTableCaption'],
                        'imgAltIsTooLong': ['ImgAlt'],
                        'pNotUsedAsHeader': ['ParagraphToHeader'],
                        'headerH1': ['ParagraphToHeader'],
                        'headerH2': ['ParagraphToHeader'],
                        'headerH3': ['ParagraphToHeader'],
                        'headerH4': ['ParagraphToHeader'],
                        'headerH5': ['ParagraphToHeader'],
                        'headerH6': ['ParagraphToHeader'],
                        'tableDataShouldHaveTh': ['TableHeaders'],
                        'imgWithEmptyAlt': ['ImgAltNonEmpty']
                    };

                    /**
                     * Object storing {@link CKEDITOR.plugins.a11ychecker.IssueDetails} instances. It uses
                     * Quail ID as keys.
                     *
                     *      {
                     *          imgHasAlt: <IssueDetails>,
                     *          aMustNotHaveJavascriptHref: <IssueDetails>
                     *      }
                     *
                     * **Very important:** This object is shared across all the EngineQuail instances!
                     *
                     * @member CKEDITOR.plugins.a11ychecker.EngineQuail
                     * @type {CKEDITOR.plugins.a11ychecker.IssueDetails[]}
                     */
                    EngineQuail.prototype.issueDetails = {};

                    /**
                     * Performs accessibility checking for current editor content.
                     *
                     * @member CKEDITOR.plugins.a11ychecker.EngineQuail
                     * @param {CKEDITOR.plugins.a11ychecker.Controller} a11ychecker
                     * @param {CKEDITOR.dom.element} contentElement DOM object of container whose content will be checked.
                     * @param {Function} callback
                     */
                    EngineQuail.prototype.process = function(a11ychecker, contentElement, callback) {
                        var $ = window.jQuery,
                            // Quail config, we'll have to override few options here.
                            config = a11ychecker.editor.config.a11ychecker_quailParams || {},
                            that = this,
                            // Options to be overriden in config, as they are essential for us.
                            quailConfigOverride = {
                                /**
                                 * @todo: Not sure if reset param is still needed in 2.2.8+ version.
                                 */
                                // Causes total.results to be new in each call.
                                reset: true,
                                guideline: this.config.guideline,
                                // Method to be executed after Quail checking is complete.
                                // It will extract the issues.
                                testCollectionComplete: function(evtName, collection) {
                                    var issueList = that.getIssuesFromCollection(collection, a11ychecker.editor);

                                    that.filterIssues(issueList, contentElement);

                                    if (callback) {
                                        callback(issueList);
                                    }
                                }
                            };

                        CKEDITOR.tools.extend(config, quailConfigOverride, true);

                        if (!config.jsonPath) {
                            config.jsonPath = this.jsonPath;
                        }

                        // Execute Quail checking.
                        $(contentElement.$).quail(config);
                    };

                    /**
                     * Transforms a Quail `collection` object (given to `testCollectionComplete` callback) into a
                     * {@link CKEDITOR.a11ychecker.plugins.IssuesList} object.
                     *
                     * @param {Object} collection
                     * @param {CKEDITOR.editor} editor
                     * @returns {CKEDITOR.a11ychecker.plugins.IssuesList}
                     */
                    EngineQuail.prototype.getIssuesFromCollection = function(collection, editor) {
                        var ret = new IssueList(),
                            that = this;

                        collection.each(function(index, test) {
                            var testId = test.get('name');

                            if (test.get('status') !== 'failed') {
                                // We're wroking only with failed tests, all other can be skipped.
                                return;
                            }

                            if (!that.issueDetails[testId]) {
                                // Test type is not known, so lets save its info.
                                that.issueDetails[testId] = that.getIssueDetailsFromTest(test, editor);
                            }

                            that.addIssuesFromTest(test, ret);
                        });

                        return ret;
                    };

                    /**
                     * Creates an `IssueDetails` object out of a Quail `Case` object.
                     *
                     * This function also requires an {@link CKEDITOR.editor} object, in order to determine preferred
                     * language for issue details.
                     *
                     * @todo: It makes sense to rename it to `getIssueDetailsFromCase()`.
                     *
                     * @param {Object} test A Quail `Case` instance.
                     * @param {CKEDITOR.editor} editor
                     * @returns {CKEDITOR.plugins.a11ychecker.IssueDetails}
                     */
                    EngineQuail.prototype.getIssueDetailsFromTest = function(test, editor) {
                        var path = [],
                            wcagGuideline = test.get('guidelines').wcag,
                            successCriteria = wcagGuideline && CKEDITOR.tools.objectKeys(wcagGuideline)[0];
                        /**
                         * @todo: Path logic is actually very similiar to the old interface, so it might be extracted
                         * to a common method.
                         */

                        function getLocalizedString(dictionary, editorConfig) {
                            var langs = CKEDITOR.tools.objectKeys(dictionary),
                                preferredLang = Localization.getPreferredLanguage(editorConfig.language, editorConfig.defaultLanguage, langs);

                            return String(dictionary[preferredLang]);
                        }

                        // Lets support WCAG only for the time being.
                        if (successCriteria) {
                            // Creating a path.
                            path.push('WCAG2.0');
                            // Success Criteria.
                            path.push(successCriteria);
                            // Techniques.
                            path.push(wcagGuideline[successCriteria].techniques.join(','));
                        }

                        var titleDictionary = test.get('title') || {},
                            descriptionDictionary = test.get('description') || {};

                        return new IssueDetails(
                            getLocalizedString(titleDictionary, editor.config),
                            getLocalizedString(descriptionDictionary, editor.config),
                            path
                        );
                    };

                    /**
                     * Extracts failed issues from a given Quail `Test` object and adds them to the `issueList` object.
                     *
                     * @param {Object} test Quail `Test` instance.
                     * @param {CKEDITOR.plugins.a11ychecker.IssueList} issueList An issue list where failed issues will be added.
                     */
                    EngineQuail.prototype.addIssuesFromTest = function(test, issueList) {
                        var that = this,
                            testId = test.get('name'),
                            testability = test.get('testability');

                        test.each(function(index, testCase) {
                            if (!that.isValidTestCase(testCase)) {
                                return;
                            }

                            var testAttribs = testCase.attributes,
                                newIssue;

                            if (testAttribs.status == 'failed') {
                                newIssue = new Issue({
                                    originalElement: new CKEDITOR.dom.element(testAttribs.element),
                                    testability: testability,
                                    id: testId
                                }, that);

                                issueList.addItem(newIssue);
                            }
                        });
                    };

                    /**
                     * Checks if given Quail `Test` is valid.
                     *
                     * @param {Object} test Quail `Test` instance.
                     * @returns {Boolean}
                     */
                    EngineQuail.prototype.isValidTestCase = function(test) {
                        var el = test.attributes.element;

                        return el instanceof HTMLElement && el.parentNode !== null;
                    };

                    /**
                     * Used to obtain issues' {@link CKEDITOR.plugins.a11ychecker.IssueDetails} object. This operation
                     * might be asynchronous.
                     *
                     * In case when no `IssueDetail` was found, `callback` will be called with `undefined` as the first argument.
                     *
                     * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue object whose details should be fetched.
                     * @param {Function} callback Callback to be called with the {@link CKEDITOR.plugins.a11ychecker.IssueDetails}
                     * object as a parameter.
                     */
                    EngineQuail.prototype.getIssueDetails = function(issue, callback) {
                        // In this case we have issue types available synchronously.
                        callback(this.issueDetails[issue.id]);
                    };

                    /**
                     * For comments see {@link CKEDITOR.plugins.a11ychecker.Engine#_filterIssue}.
                     *
                     * @member CKEDITOR.plugins.a11ychecker.EngineQuail
                     * @protected
                     */
                    EngineQuail.prototype._filterIssue = function(issue, contentElement) {
                        var originalElement = issue.originalElement,
                            originalElementPrivate;

                        // If originalElement is undefined or anything other, filter out.
                        if (originalElement instanceof CKEDITOR.dom.element === false) {
                            return false;
                        }

                        originalElementPrivate = originalElement.$;

                        // Ensure that private element has a valid type, because it's possible to create
                        // a CKEDITOR.dom.element with a string etc.
                        if (!originalElementPrivate || !originalElementPrivate.tagName) {
                            return false;
                        }

                        return true;
                    };

                    /**
                     * This method will return a config object. It will also check editor config if it has some customization to the
                     * config.
                     *
                     * @param {CKEDITOR.editor} editor
                     * @returns {CKEDITOR.plugins.a11ychecker.EngineQuailConfig}
                     */
                    EngineQuail.prototype.createConfig = function(editor) {
                        var ret = new EngineQuailConfig(),
                            instanceQuailConfig = editor.config.a11ychecker_quailParams;

                        if (instanceQuailConfig && instanceQuailConfig.guideline) {
                            ret.guideline = instanceQuailConfig.guideline;
                        }

                        return ret;
                    };



                    callback(EngineQuail);
                    /* jshint ignore:end */

                }
            };

            CKEDITOR.event.implementOn(editor._.a11ychecker);
        },

        /**
         * Returns skinName for which CSS is prepared. If there is not CSS for the
         * current skin, the default skinName (moono-lisa) is returned.
         *
         * @returns {String} Skin name which CSS files should be used.
         */
        getStylesSkinName: function() {
            // Default skin is moono-lisa.
            var skinName = 'moono-lisa';

            // Handle other skins for which CSS is also prepared.
            if (CKEDITOR.skinName == 'moono') {
                skinName = 'moono';
            }
            return skinName;
        }
    });

    CKEDITOR.plugins.a11ychecker = {
        /**
         * @member CKEDITOR.plugins.a11ychecker
         * @type {Boolean/Undefined}
         *
         * Tells whether plugin is in development version or not. For plugin builded version
         * this property will be `undefined`.
         */
        dev: true, // %REMOVE_LINE%
        rev: '%REV%'
    };

    /*
     * Editor command functions.
     * Defined here, so only one function instance is in memory, and they're shared across
     * editors.
     */
    function cmdNext(editor) {
        if (a11ycheckerInCheckingMode(editor)) {
            return generateCommand(editor, 'a11ychecker.next', 'next');
        }
    }

    function cmdPrev(editor) {
        if (a11ycheckerInCheckingMode(editor)) {
            return generateCommand(editor, 'a11ychecker.prev', 'prev');
        }
    }

    function cmdExec(editor) {
        return generateCommand(editor, 'a11ychecker', 'exec');
    }

    function cmdListen(editor) {
        return editor._.a11ychecker.listen();
    }

    function cmdClose(editor) {
        return editor._.a11ychecker.close();
    }

    // A function to generate an async command exec function.
    //
    // @param {CKEDITOR.editor} editor
    // @param {String} name Name of the command to be registered.
    // @param {String} controllerMethod Name of method in controller that should be called.
    // @returns {Mixed} Any value that related method will return.
    function generateCommand(editor, name, controllerMethod) {
        return editor._.a11ychecker[controllerMethod](function() {
            // Since the command is async, we need to fire afterCommandExec event
            // on our own.
            editor.fire('afterCommandExec', {
                name: name,
                command: editor.getCommand(name),
                commandData: {}
            });
        });
    }

    // Tmp helper method, returns true if given editor Accessibility Checker is in
    // CHECKING mode.
    function a11ycheckerInCheckingMode(editor) {
        var a11ychecker = editor._.a11ychecker;

        return (a11ychecker && a11ychecker.modeType === a11ychecker.constructor.modes.CHECKING);
    }

    // Function is a simply copy-n-paste editor.addContentsCss added in CKE 4.4.0.
    // Will be used if function is not available for better backward compatibility.
    function editorAddContentsCss(cssPath) {
        /*jshint validthis: true */
        var cfg = this.config,
            curContentsCss = cfg.contentsCss;

        // Convert current value into array.
        if (!CKEDITOR.tools.isArray(curContentsCss)) {
            cfg.contentsCss = curContentsCss ? [curContentsCss] : [];
        }

        cfg.contentsCss.push(cssPath);
    }

    /**
     * For every Accessibility Checker hotkey you may use `0` in order to disable it.
     *
     * @cfg {Object} a11ychecker_keystrokes
     * @cfg {Number} [a11ychecker_keystrokes.open = CKEDITOR.CTRL + CKEDITOR.ALT + 69 // E] Starts Accessibility Checker.
     * @cfg {Number} [a11ychecker_keystrokes.close = 27 // ESC] Closes Accessibility Checker.
     * @cfg {Number} [a11ychecker_keystrokes.next = CKEDITOR.CTRL + 69 // E] Go to next accessibility issue.
     * @cfg {Number} [a11ychecker_keystrokes.prev = CKEDITOR.CTRL + CKEDITOR.SHIFT + 69 // E] Go to previous
     * accessibility issue.
     * @cfg {Number} [a11ychecker_keystrokes.listen = CKEDITOR.SHIFT + 27 // ESC] Toggles listening mode.
     */

    /**
     * Prevents Accessibility Checker from storing `data-a11y-ignore` attributes in output
     * content.
     *
     * @cfg {Boolean} [a11ychecker_noIgnoreData=false]
     */

    //require("plugin.js");
    CKEDITOR.config.allowedContent = {
        $1: {
            // Use the ability to specify elements as an object.
            elements: CKEDITOR.dtd,
            attributes: true,
            styles: false,
            classes: true
        }
    };



    CKEDITOR.config.extraPlugins = 'cloudcms-image,balloonpanel,a11ychecker';
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    CKEDITOR.config.pasteFromWordRemoveStyles = true;
    CKEDITOR.config.pasteFromWordRemoveFontStyles = true;
    CKEDITOR.config.entities_processNumerical = true;
    CKEDITOR.config.disallowedContent = 'script; style; *[on*, border, width, height, cellpadding, valign, cellspacing, font]; *{*}';













});