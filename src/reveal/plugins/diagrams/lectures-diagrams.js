/**
 * Reveal module declaration: LecturesDiagrams
 *
 * Handles mermaid diagrams in the presentation.
 *
 * @returns Reveal style plugin function.
 */
function LecturesDiagrams() {
    return {
        id: 'lecture-diagrams',
        init: (deck) => {
            // Get the presentation root.
            const elem = deck.getRevealElement();

            // If the user is printing we need to delay rendering.
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
                        mermaid.renderAll(elem);
                    // eslint-disable-next-line no-console
                    } catch (e) { clearInterval(interval); console.error(e); }
                }, 250);
                return;
            }

            // eslint-disable-next-line no-undef
            mermaid.renderAll(elem);
        }
    };
}

export default LecturesDiagrams;
