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
 *     <!-- Element to use for background colors or images via custom css. You can also add elements inside. -->
 *     <div class="background"></div>
 * </section>
 *
 * @returns Reveal style plugin function.
 */
function MasterSlide() {

    const masterSlides = {
        __default: null
    };

    /**
     * Finds all backgrounds for this presentation and adds the master slide content to them.
     *
     * @param {HTMLElement} parent The root element for this presentation.
     */
    const addMaterTemplates = (parent) => {
        // First check all the slides for which template they should be using.
        const masterMap = [];
        const slides = parent.parentElement.querySelectorAll('.slides section');
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            // Everything starts as default.
            let templateName = '__default';
            if (slide.dataset.template) {
                templateName = slide.dataset.template;
            }
            // If a stack is encountered and had as template apply it to all it's children.
            if (slide.classList.contains('stack')) {
                const children = slide.querySelectorAll('section');
                children?.forEach(() => {
                    masterMap[i] = templateName;
                    i += 1;
                });
            }
            // Record the template for this slide; or the last slide in a nested section.
            masterMap[i] = templateName;
        }

        // Now apply the correct template to each slide.
        const backgrounds = parent.querySelectorAll('.slide-background .slide-background-content');
        backgrounds.forEach((background, i) => {
            // eslint-disable-next-line no-param-reassign
            background.innerHTML = masterSlides[masterMap[i]] || '';
            // Add the template name as a class so users can style it easier.
            if (masterMap[i] !== '__default') {
                background.classList.add(masterMap[i]);
            } else {
                background.classList.add('defualt');
            }
        });
    };

    /**
     * Check the presentation for the presence of master slides and then apply them to the presentation.
     *
     * @param {HTMLElement} deck The root element for this presentation.
     */
    const initialize = (deck) => {
        // If no master slide was found return now.
        const masters = deck.querySelectorAll('.slide-template');
        if (!masters || masters.length < 1) { return; }

        // At least one master slide was found, record its content and then remove it from the page.
        masters.forEach((master) => {
            if (master.dataset.template) {
                masterSlides[master.dataset.template] = master.innerHTML;
            // eslint-disable-next-line no-underscore-dangle
            } else if (!masterSlides.__default) { // First template without a name.
                // eslint-disable-next-line no-underscore-dangle
                masterSlides.__default = master.innerHTML;
            }
            master.remove();
        });

        // Double check that we assigned a default template.
        // eslint-disable-next-line no-underscore-dangle
        if (!masterSlides.__default) {
            // eslint-disable-next-line no-underscore-dangle
            masterSlides.__default = masters[0].innerHTML;
        }

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
                            addMaterTemplates(addedNode);
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
