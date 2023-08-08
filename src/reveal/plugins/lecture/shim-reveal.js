/* eslint-disable no-param-reassign */

/**
 * Reveal module declaration: LectureShimReveal
 *
 * Shims Reveal to add additional functionality used by Lecture.
 *
 * @returns Reveal style plugin function.
 */
function ShimReveal() {

    let darkMode = false;

    let privateRevealRef = null;

    function addKeyBinding(binding, callback) {
        privateRevealRef.addKeyBinding(binding, callback);
    }

    function determineAndSetColorMode() {
        // Things to check.
        const userSavedMode = localStorage.getItem('dark-mode');
        const userPrefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const searchStr = window.location.search.substring(1);
        // Check local storage first.
        if (userSavedMode) {
            darkMode = isTrue(userSavedMode);
        // Next check the users browser setting.
        } else if (userPrefersDarkMode) {
            darkMode = true;
        // Check the URL for the dark mode setting.
        } else if (searchStr.includes('dark-mode=1')) {
            darkMode = true;
        }
        // Set color mode which also records it in local storage.
        if (darkMode) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    }

    function disableDarkMode() {
        document.documentElement.classList.remove('dark-mode');
        // eslint-disable-next-line no-undef
        mermaid.disableDarkMode();
        darkMode = false;
        localStorage.setItem('dark-mode', false);

        if (window.mermaid && window.mermaid.renderAll) {
            window.mermaid.renderAll();
        }
    }

    function enableDarkMode() {
        document.documentElement.classList.add('dark-mode');
        // eslint-disable-next-line no-undef
        mermaid.enableDarkMode();
        darkMode = true;
        localStorage.setItem('dark-mode', true);

        if (window.mermaid && window.mermaid.renderAll) {
            window.mermaid.renderAll();
        }
    }

    function isTrue(str) {
        if (typeof (str) === 'string') {
            str = str.trim().toLowerCase();
        }
        switch (str) {
            case true:
            case 'true':
            case 1:
            case '1':
            case 'on':
            case 'yes':
                return true;
            default:
                return false;
        }
    }

    function openPrintPage(evt) {
        if (!evt.shiftKey) { return false; }
        const reveal = privateRevealRef.getRevealElement();
        const uri = window.location.origin + window.location.pathname;
        const params = [];
        if (darkMode) {
            params.push('dark-mode=1');
        }
        if (reveal.dataset.presentationNumber) {
            params.push(`print-number=${reveal.dataset.presentationNumber}`);
        }
        let paramString = '';
        params.forEach((param) => {
            paramString += `&${param}`;
        });
        window.open(`${uri}?print-pdf${paramString}`, '_blank');
        return true;
    }

    return {
        id: 'lecture-shim-reveal',
        init: (deck) => {
            // eslint-disable-next-line no-console
            if (!deck) { console.warn('Could not shim Reveal with Lecture features.'); }

            // Keep a private reference to this deck.
            privateRevealRef = deck;

            // Determine color mode and set accordingly.
            determineAndSetColorMode();

            // If in print mode we do not need to register any key bindings.
            if (deck.isPrintingPDF()) {
                return;
            }

            // Toggle dark theme mode.
            addKeyBinding(
                { keyCode: 68, key: 'D', description: 'Enable dark theme' },
                enableDarkMode
            );

            // Toggle light theme mode.
            addKeyBinding(
                { keyCode: 76, key: 'L', description: 'Enable light theme' },
                disableDarkMode
            );

            // Open print view.
            addKeyBinding(
                { keyCode: 80, key: 'Shift P', description: 'Open print view' },
                openPrintPage
            );
        }
    };
}

export default ShimReveal;
