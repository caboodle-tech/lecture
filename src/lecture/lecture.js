import DefaultConfig from '../reveal/config.js';
import DomReady from './dom-ready.js';
import MermaidShim from './mermaid-shim.js';
import Plugins from '../reveal/plugins/plugins.js';

window.DomReady = DomReady;

DomReady.whenReady(() => {
    if (!window.Reveal) {
        console.error('Unable to locate Reveal, make sure Reveal was loaded on this page before Lecture.');
    }
    if (!window.mermaid) {
        // eslint-disable-next-line max-len
        console.error('Unable to shim Mermaid with Lecture specific functions, make sure Mermaid was loaded on this page before Lecture.');
        return;
    }
    MermaidShim.shimMermaid(window.mermaid);
}, this);

// Polyfill prepend
// eslint-disable-next-line func-names
(function () {
    // Check for native implementation
    if (typeof Element.prototype.prepend !== 'function') {
        // eslint-disable-next-line func-names
        Element.prototype.prepend = function () {
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < arguments.length; i++) {
                // eslint-disable-next-line prefer-rest-params
                const element = arguments[i];
                fragment.appendChild(element instanceof Node ? element : document.createTextNode(String(element)));
            }
            this.insertBefore(fragment, this.firstChild);
        };
    }
}());

class Lecture {

    #autoInitialized = false;

    autoLoadedPresentations = [];

    #isEmbedded = false;

    constructor() {
        DomReady.whenReady(() => {
            const presentations = document.querySelectorAll('.lecture');
            if (presentations.length > 1) {
                this.#isEmbedded = true;
            }
            presentations.forEach((presentation, i) => {
                presentation.classList.add('reveal');
                if (this.#isEmbedded) {
                    // eslint-disable-next-line no-param-reassign
                    presentation.dataset.presentationNumber = i + 1;
                }
            });
            this.#autoInitialize();
        }, this);
    }

    #autoEnablePrintMode() {
        const params = this.#parseURLParameters(document.location.search);
        // Bail if we are not in print mode.
        if (!('print-pdf' in params)) { return false; }

        // If there are multiple presentations on the page determine which one to show.
        let numberToShow = -1;
        if ('print-number' in params) {
            try {
                numberToShow = parseInt(params['print-number'], 10);
            } catch (err) {
                console.error(`Could not determine which presentation to print:\n${err}`);
                numberToShow = -1;
            }
        }

        // Get all presentations on the page; there may only be one.
        const presentations = document.querySelectorAll('.reveal');
        if (presentations.length === 0) { return false; }
        let presentationToPrint = presentations[0]; // Default to the first presentation found.
        presentations.forEach((presentation, i) => {
            // If there are multiple presentations remove the extras.
            if (numberToShow > 0) {
                if ((i + 1) !== numberToShow) {
                    presentation.remove();
                    return;
                }
                // Disable embedded mode so the presentation being printed gets all the space.
                this.#isEmbedded = false;
                presentationToPrint = presentation;
            }
        });

        // Force print mode styles.
        this.#enablePrintMode(presentationToPrint);

        // Print mode is enabled.
        return true;
    }

    #autoInitialize() {
        // If the user is printing the presentation enable print mode for Lecture/Reveal.
        const isPrinting = this.#autoEnablePrintMode();

        // Check if we should auto load the presentation(s) only if NOT in print mode.
        if (!isPrinting) {
            const scriptElements = document.getElementsByTagName('script');
            for (let i = 0; i < scriptElements.length; i++) {
                const scriptElement = scriptElements[i];
                const src = scriptElement.getAttribute('src');
                if (src && src.includes('lecture.min.js')) {
                    const params = this.#parseURLParameters(src);
                    if (params.autoLoad && params.autoLoad === 'false') {
                        // The user does not want the page to auto initialize.
                        return;
                    }
                }
            }
        }

        // Only attempt auto initialization if this hasn't been run before.
        if (this.#autoInitialized) { return; }
        this.#autoInitialized = true;

        const presentations = document.querySelectorAll('.lecture');
        presentations.forEach((presentation) => {
            const reval = this.initialize(presentation);
            reval.initialize()
                .then((reveal) => {
                    this.autoLoadedPresentations.push(reveal);
                })
                .catch((err) => {
                    console.error(err);
                });
        });
    }

    #enablePrintMode(presentation) {
        const addHideElementClass = () => {
            const bodyChildren = document.body.children;
            for (let i = 0; i < bodyChildren.length; i++) {
                const child = bodyChildren[i];
                if (!child.classList.contains('reveal')) {
                    child.classList.add('hide-for-printing');
                }
            }
        };
        // Add styles to the page the force the presentation to take all available space.
        const style = document.createElement('STYLE');
        style.innerHTML = `
            html, body { height: 100% !important; }
            body { display: block !important;  }
            body .reveal { display: block; height 100%; }
            .hide-for-printing { display: none !important; }
        `.trim();
        document.head.appendChild(style);
        // Move the presentation up to the first child of the document body.
        document.body.prepend(presentation);
        // Hide all other children of the body; do twice to catch auto generated content.
        addHideElementClass();
        setTimeout(addHideElementClass, 3000);
    }

    getPlugins() {
        return Plugins;
    }

    getPluginsAsArray() {
        return Object.values(Plugins);
    }

    initialize(elem = null, options = {}) {

        // If no element was provided but an options object was make the correction.
        if (this.whatIs(elem) === 'object' && Object.keys(options).length === 0) {
            // eslint-disable-next-line no-param-reassign
            options = { ...elem };
            // eslint-disable-next-line no-param-reassign
            elem = null;
        }

        // Merge users options with the default options.
        const defaults = { ...DefaultConfig };
        Object.keys(options).forEach((key) => {
            defaults[key] = options[key];
        });

        // If there are multiple presentations force embedded mode.
        if (this.#isEmbedded) {
            defaults.embedded = true;
            defaults.keyboardCondition = 'focused';
        }

        // Add all the Lecture plugins.
        defaults.plugins = this.getPluginsAsArray();

        if (elem) {
            return new window.Reveal(elem, defaults);
        }
        return new window.Reveal(defaults);
    }

    #parseURLParameters(url) {
        const params = {};
        // eslint-disable-next-line no-param-reassign
        if (!url.includes('?')) { url = `?${url}`; }
        const urlWithoutBase = url.split('?')[1];

        if (!urlWithoutBase) {
            return params;
        }

        urlWithoutBase.split('&').forEach((param) => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });

        return params;
    }

    /**
     * The fastest way to get the actual type of anything in JavaScript.
     *
     * {@link https://jsbench.me/ruks9jljcu/2 | See benchmarks}.
     *
     * @param {*} unknown Anything you wish to check the type of.
     * @return {string|undefined} The type in lowercase of the unknown value passed in or undefined.
     */
    whatIs(unknown) {
        try {
            return ({}).toString.call(unknown).match(/\s([^\]]+)/)[1].toLowerCase();
        } catch (e) { return undefined; }
    }

}

export default new Lecture();
