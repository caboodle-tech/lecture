/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

// Global variables that will be scoped to the iife when built.
let __darkMode = false;
let __darkTheme = 'dark';
let __lightTheme = 'neutral';
const __allowedThemes = ['default', 'neutral', 'dark', 'forest', 'base'];

/**
 * Run a function only after an event has not occured within a set amount of time.
 *
 * @private
 * @param {function} func The function to call after the debounce.
 * @param {number} delay How long in milliseconds to debounce for.
 */
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Public method to disable dark mode; you must manually rerender diagrams.
 *
 * @public
 */
function disableDarkMode() {
    __darkMode = false;
    // eslint-disable-next-line no-undef
    mermaid.initialize();
}

/**
 * Public method to enable dark mode; you must manually rerender diagrams.
 *
 * @public
 */
function enableDarkMode() {
    __darkMode = true;
    // eslint-disable-next-line no-undef
    mermaid.initialize();
}

/**
 * Helper method to get the active theme.
 *
 * @private
 * @returns {string} The active theme name.
 */
function getActiveTheme() {
    let theme = __lightTheme;
    if (__darkMode) {
        theme = __darkTheme;
    }
    return theme;
}

/**
 * Modify the text for a Mermaid diagram to include the active theme.
 *
 * @private
 * @param {string} definition The Mermaid diagram in text form.
 * @param {string} theme The active theme name.
 *
 * @returns {string} The modified Mermaid diagram text with theme included.
 */
function getDefinitionWithInitString(definition, theme) {

    // The init string that sets the theme represented as an object.
    const init = {
        darkMode: __darkMode,
        theme,
        themeVariables: {
            darkMode: __darkMode
        }
    };

    // TODO: Allow respecting the users init but still switching color modes?

    const initCode = definition.match(/%%({init:.*?})%%/s);
    if (!initCode) {
        // No init string was set so add our own that sets the theme.
        return `%%{init: ${JSON.stringify(init)}}%%\n${definition}`;
    }
    // If the user set their own init string respect it.
    return definition;
}

/**
 * A helper method that forces a redraw on Mermaid svg's when the page resizes
 * so they all look proper; some diagrams get skewed on page resizes.
 *
 * @private
 */
function redraw() {
    const diagrams = document.querySelectorAll('.mermaid[data-processed]');
    diagrams.forEach((diagram) => {
        const svg = diagram.querySelector('svg');
        if (!svg) { return; }
        svg.setAttribute('viewBox', svg.getAttribute('viewBox'));
        svg.style.transform = 'scale(0.0001)';
        const styleTag = document.createElement('style');
        styleTag.textContent = 'g { transform: scale(0.0001); }';
        svg.prepend(styleTag);
        setTimeout(async () => {
            svg.style.transform = '';
            svg.removeChild(styleTag);
        }, 0);
    });
}

/**
 * Renders all Mermaid diagrams found within an element.
 *
 * @public
 * @param {HTMLElement} container The element to process all diagrams within.
 */
function renderAll(container) {
    if (!container) { container = document; }
    const diagrams = container.querySelectorAll('.mermaid');
    diagrams.forEach((diagram) => {
        // eslint-disable-next-line no-undef
        mermaid.renderSingle(diagram, getActiveTheme());
    });
}

/**
 * The Mermaid diagram to process.
 *
 * @public
 * @param {HTMLElement} diagram The diagram to process; this should be the wrapper element.
 * @param {string} theme The theme to apply to this diagram.
 */
function renderSingle(diagram, theme = null) {
    if (!theme) {
        theme = getActiveTheme();
    }
    // Do not process or reprocess diagrams already in an error state.
    if (diagram.classList.contains('error-state')) {
        return;
    }
    // Do not process or reprocess diagrams where nothing has changed.
    if (diagram.dataset.processed && diagram.dataset.processed === theme) {
        return;
    }
    /**
     * If we processed this graph already we should have the original graph
     * definition hidden.
     */
    let graphDefinition = diagram.textContent.trim();
    const existingDefinition = diagram.querySelector('[data-graph-definition]');
    if (existingDefinition) {
        graphDefinition = existingDefinition.textContent.trim();
    }
    // Every time we process a diagram we need to assign it a unique id.
    const id = `mermaid-${Math.random().toString(36).substring(2)}`;
    /**
     * Have mermaid process this diagram now keeping the original data in case
     * we need to rerender this diagram; changing color modes/ themes for example.
     */
    const definitionWithTheme = getDefinitionWithInitString(graphDefinition, theme);
    // Tag the diagram as processed.
    diagram.dataset.processed = theme;
    // eslint-disable-next-line no-undef
    mermaid.render(id, definitionWithTheme)
        .then(({ svg, bindFunctions }) => {
            diagram.innerHTML = `
            <div data-graph-definition style="display:none;">${graphDefinition}</div>
            ${svg}
            `.trim();
            bindFunctions?.(diagram);
        })
        .catch((err) => {
            diagram.classList.add('error-state');
            // eslint-disable-next-line no-undef
            mermaid.mermaidAPI.placeErrorMessage(diagram);
            console.error(`Could not process diagram #${id}:\n${err}`);
        });
}

/**
 * Allows changing the dark mode theme; mostly pointless but allows some public
 * access to Lectures process.
 *
 * @public
 * @param {string} theme The name of the theme to use for dark mode.
 */
function setDarkTheme(theme = '') {
    theme = theme.toLowerCase().trim();
    if (__allowedThemes.includes(theme)) {
        __darkTheme = theme;
    }
}

/**
 * Allows changing the light mode theme; mostly pointless but allows some public
 * access to Lectures process.
 *
 * @public
 * @param {string} theme The name of the theme to use for light mode.
 */
function setLightTheme(theme = '') {
    theme = theme.toLowerCase().trim();
    if (__allowedThemes.includes(theme)) {
        __lightTheme = theme;
    }
}

class MermaidShim {

    #loaded = false;

    /**
     * Wait for Mermaid to exist on the window before attempting to shim.
     *
     * @param {number} timeout Time in milliseconds before timing out.
     * @returns {Promise} A promise that resolves when Mermaid exits or rejects
     *                    after the timeout period has elapsed.
     */
    #ensureMermaidExists(timeout = 5000) {
        const start = Date.now();

        const wait = (resolve, reject) => {
            if (window.mermaid) {
                resolve(window.mermaid);
            } else if (timeout && (Date.now() - start) >= timeout) {
                reject();
            } else {
                setTimeout(wait.bind(this, resolve, reject), 25);
            }
        };

        return new Promise(wait);
    }

    /**
     * Public getter to get the shims state.
     *
     * @returns {boolean} Is the shim was applied.
     */
    isLoaded() {
        return this.#loaded;
    }

    /**
     * Shim the mermaid library with additional features.\
     *
     * @param {mermaid} mermaid The mermaid library object.
     */
    shimMermaid(mermaid) {
        if (this.isLoaded()) { return; }

        // Apply shims.
        mermaid.disableDarkMode = disableDarkMode;
        mermaid.enableDarkMode = enableDarkMode;
        mermaid.renderAll = renderAll;
        mermaid.renderSingle = renderSingle;
        mermaid.setDarkTheme = setDarkTheme;
        mermaid.setLightTheme = setLightTheme;

        // Determine current color mode of page and initialize mermaid accordingly.
        const html = document.querySelector('html');
        if (html.classList.contains('dark') || html.classList.contains('dark-mode')) {
            enableDarkMode();
            return;
        }
        disableDarkMode();

        // Listen for resize events.
        window.addEventListener('resize', debounce(redraw, 500));
    }

}

export default new MermaidShim();
