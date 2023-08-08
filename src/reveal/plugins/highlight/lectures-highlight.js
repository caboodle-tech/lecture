/**
 * Reveal module declaration: LecturesHighlight
 *
 * Handles code blocks in the presentation by using Highlight JS Lite (HLJSL).
 *
 * @returns Reveal style plugin function.
 */
function LecturesHighlight() {

    // Each presentation has its own HLJSL instance.
    let lectureHljsl;

    return {
        id: 'lecture-highlight',
        init: (deck) => {
            // Get the presentation root.
            const elem = deck.getRevealElement();

            // In case we are in embedded mode tag this deck with a unique id.
            const id = `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`.toUpperCase();
            elem.dataset.hljslContainer = id;

            // Configure our new instance of HLJSL; in embedded mode each deck gets its own instance.
            // eslint-disable-next-line no-undef
            lectureHljsl = new HLJSL({
                autoLoad: true,
                hideNumbers: false,
                onlyAutoProcess: [`[data-hljsl-container="${id}"]`]
            });

            // If the user is printing we need delay rendering.
            if (deck.isPrintingPDF()) {
                let timeouts = 0;
                const interval = setInterval(() => {
                    try {
                        if (timeouts === 20) { clearInterval(interval); }
                        const pages = elem.querySelectorAll('.pdf-page');
                        if (pages.length < deck.getTotalSlides()) {
                            timeouts += 1;
                            return;
                        }
                        clearInterval(interval);
                        // eslint-disable-next-line no-undef
                        lectureHljsl.highlightAll();
                    // eslint-disable-next-line no-console
                    } catch (e) { clearInterval(interval); console.error(e); }
                }, 250);
                return;
            }

            // Process all code blocks found within this deck.
            // eslint-disable-next-line no-undef
            lectureHljsl.highlightAll();
        },
        getHljslInstance: () => lectureHljsl
    };
}

export default LecturesHighlight;
