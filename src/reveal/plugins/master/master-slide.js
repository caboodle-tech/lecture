/**
 * Reveal module declaration: LectureMasterSlide
 *
 * Lecture plugin for Reveal that adds master slide support to presentations.
 * Anything you add to the master slide will be added to the background of every
 * slide. Do not place resource intensive elements in master slides! All elements
 * will be duplicated to every slide. Here is the default structure:
 *
 * <!-- This can be anywhere but for best performance place as the first slide. -->
 * <section class="master-slide">
 *     <!-- Logo to display in light mode. -->
 *     <img src="demo/assets/caboodle-tech-logo.webp" class="logo">
 *     <!-- Logo to display in dark mode. -->
 *     <img src="demo/assets/caboodle-tech-logo-dark.webp" class="logo dark-mode">
 *     <!-- Text to show in the copyright (smaller text in the corner) area. -->
 *     <p class="copyright">
 *         &copy; 2022&ndash;<script>document.write(new Date().getFullYear());</script> Caboodle Tech Inc.
 *     </p>
 * </section>
 *
 * @returns Reveal style plugin function.
 */
function MasterSlide() {

    let masterHTML = '';

    /**
     * Finds all backgrounds for this presentation and adds the master slide content to them.
     *
     * @param {HTMLElement} parent The root element for this presentation.
     */
    const addMaterTemplate = (parent) => {
        const backgrounds = parent.querySelectorAll('.slide-background .slide-background-content');
        backgrounds.forEach((background) => {
            // eslint-disable-next-line no-param-reassign
            background.innerHTML = masterHTML;
        });
    };

    /**
     * Check the presentation for the presence of master slides and then apply them to the presentation.
     *
     * @param {HTMLElement} deck The root element for this presentation.
     */
    const initialize = (deck) => {
        // If no master slide was found return now.
        const master = deck.querySelector('.master-slide');
        if (!master) { return; }

        // Master slide found, record its content and then remove it from the page.
        masterHTML = master.innerHTML;
        master.remove();

        // Create a new MutationObserver that waits until Reveal builds the slide backgrounds.
        const observer = new MutationObserver((mutationsList) => {
            for (let i = 0; i < mutationsList.length; i++) {
                const mutation = mutationsList[i];
                if (mutation.type === 'childList') {
                    // Loop through added nodes and check if they have the 'backgrounds' class
                    for (let j = 0; j < mutation.addedNodes.length; j++) {
                        const addedNode = mutation.addedNodes[j];
                        if (addedNode?.classList?.contains('backgrounds')) {
                            // The backgrounds have been added by Reveal, modify them now.
                            observer.disconnect();
                            addMaterTemplate(addedNode);
                            return;
                        }
                    }
                }
            }
        });

        // Start observing the target node with the specified configuration.
        observer.observe(deck, { childList: true, subtree: true });
    };

    return {
        id: 'lecture-master-slide',
        init: (deck) => {
            // Get the presentation root.
            const elem = deck.getRevealElement();

            // Find and copy the master slide to all slides.
            initialize(elem);
        }
    };
}

export default MasterSlide;
