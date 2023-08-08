// Temporary fake zoom instance.
let zoom = {
    to: () => {},
    out: () => {},
    magnify: () => {},
    reset: () => {},
    zoomLevel: () => {}
};

(function () {
    // Switch the fake zoom instance out with the real instance.
    function onDocumentBodyStyleAvailable() {
        zoom = realZoom();
    }

    // Check if document.body.style exists
    if (document.body?.style) {
        onDocumentBodyStyleAvailable();
    } else {
        // If it doesn't exist, set up a MutationObserver to wait for changes
        const observeBody = new MutationObserver((mutationsList, observer) => {
            const mutationsLength = mutationsList.length;
            for (let i = 0; i < mutationsLength; i++) {
                const mutation = mutationsList[i];
                if (mutation.type === 'childList') {
                    const addedNodesLength = mutation.addedNodes.length;
                    for (let j = 0; j < addedNodesLength; j++) {
                        const node = mutation.addedNodes[j];
                        if (node.nodeName === 'BODY') {
                            // <body> element is now available
                            onDocumentBodyStyleAvailable(observer);
                            observer.disconnect();
                            return;
                        }
                    }
                }
            }
        });

        // Start observing the document.body for changes to attributes
        observeBody.observe(document, { childList: true, subtree: true });
    }
}());

/*!
 * zoom.js 0.3 (modified for use with reveal.js)
 * http://lab.hakim.se/zoom-js
 * MIT licensed
 *
 * Copyright (C) 2011-2014 Hakim El Hattab, http://hakim.se
 */
const realZoom = function () {

    // The current zoom level (scale)
    let level = 1;

    // The current mouse position, used for panning
    let mouseX = 0;
    let mouseY = 0;

    // Timeout before pan is activated
    let panEngageTimeout = -1;
    let panUpdateInterval = -1;

    // Check for transform support so that we can fallback otherwise
    const supportsTransforms = 'transform' in document.body.style;

    if (supportsTransforms) {
        // The easing that will be applied when we zoom in/out
        document.body.style.transition = 'transform 0.8s ease';
    }

    // Zoom out if the user hits escape
    document.addEventListener('keyup', (event) => {
        if (level !== 1 && event.keyCode === 27) {
            zoom.out();
        }
    });

    // Monitor mouse movement for panning
    document.addEventListener('mousemove', (event) => {
        if (level !== 1) {
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    });

    /**
	 * Applies the CSS required to zoom in, prefers the use of CSS3
	 * transforms but falls back on zoom for IE.
	 *
	 * @param {Object} rect
	 * @param {Number} scale
	 */
    function magnify(rect, scale) {

        const scrollOffset = getScrollOffset();

        // Ensure a width/height is set
        rect.width = rect.width || 1;
        rect.height = rect.height || 1;

        // Center the rect within the zoomed viewport
        rect.x -= (window.innerWidth - (rect.width * scale)) / 2;
        rect.y -= (window.innerHeight - (rect.height * scale)) / 2;

        if (supportsTransforms) {
            // Reset
            if (scale === 1) {
                document.body.style.transform = '';
            }
            // Scale
            else {
                const origin = `${scrollOffset.x}px ${scrollOffset.y}px`;
                const transform = `translate(${-rect.x}px,${-rect.y}px) scale(${scale})`;

                document.body.style.transformOrigin = origin;
                document.body.style.transform = transform;
            }
        } else {
            // Reset
            if (scale === 1) {
                document.body.style.position = '';
                document.body.style.left = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.height = '';
                document.body.style.zoom = '';
            }
            // Scale
            else {
                document.body.style.position = 'relative';
                document.body.style.left = `${-(scrollOffset.x + rect.x) / scale}px`;
                document.body.style.top = `${-(scrollOffset.y + rect.y) / scale}px`;
                document.body.style.width = `${scale * 100}%`;
                document.body.style.height = `${scale * 100}%`;
                document.body.style.zoom = scale;
            }
        }

        level = scale;

        if (document.documentElement.classList) {
            if (level !== 1) {
                document.documentElement.classList.add('zoomed');
            } else {
                document.documentElement.classList.remove('zoomed');
            }
        }
    }

    /**
	 * Pan the document when the mosue cursor approaches the edges
	 * of the window.
	 */
    function pan() {
        const range = 0.12;
        const rangeX = window.innerWidth * range;
        const rangeY = window.innerHeight * range;
        const scrollOffset = getScrollOffset();

        // Up
        if (mouseY < rangeY) {
            window.scroll(scrollOffset.x, scrollOffset.y - (1 - (mouseY / rangeY)) * (14 / level));
        }
        // Down
        else if (mouseY > window.innerHeight - rangeY) {
            window.scroll(scrollOffset.x, scrollOffset.y + (1 - (window.innerHeight - mouseY) / rangeY) * (14 / level));
        }

        // Left
        if (mouseX < rangeX) {
            window.scroll(scrollOffset.x - (1 - (mouseX / rangeX)) * (14 / level), scrollOffset.y);
        }
        // Right
        else if (mouseX > window.innerWidth - rangeX) {
            window.scroll(scrollOffset.x + (1 - (window.innerWidth - mouseX) / rangeX) * (14 / level), scrollOffset.y);
        }
    }

    function getScrollOffset() {
        return {
            x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
            y: window.scrollY !== undefined ? window.scrollY : window.pageYOffset
        };
    }

    return {
        /**
		 * Zooms in on either a rectangle or HTML element.
		 *
		 * @param {Object} options
		 *   - element: HTML element to zoom in on
		 *   OR
		 *   - x/y: coordinates in non-transformed space to zoom in on
		 *   - width/height: the portion of the screen to zoom in on
		 *   - scale: can be used instead of width/height to explicitly set scale
		 */
        to(options) {

            // Due to an implementation limitation we can't zoom in
            // to another element without zooming out first
            if (level !== 1) {
                zoom.out();
            } else {
                options.x = options.x || 0;
                options.y = options.y || 0;

                // If an element is set, that takes precedence
                if (options.element) {
                    // Space around the zoomed in element to leave on screen
                    const padding = 20;
                    const bounds = options.element.getBoundingClientRect();

                    options.x = bounds.left - padding;
                    options.y = bounds.top - padding;
                    options.width = bounds.width + (padding * 2);
                    options.height = bounds.height + (padding * 2);
                }

                // If width/height values are set, calculate scale from those values
                if (options.width !== undefined && options.height !== undefined) {
                    options.scale = Math.max(Math.min(window.innerWidth / options.width, window.innerHeight / options.height), 1);
                }

                if (options.scale > 1) {
                    options.x *= options.scale;
                    options.y *= options.scale;

                    magnify(options, options.scale);

                    if (options.pan !== false) {

                        // Wait with engaging panning as it may conflict with the
                        // zoom transition
                        panEngageTimeout = setTimeout(() => {
                            panUpdateInterval = setInterval(pan, 1000 / 60);
                        }, 800);

                    }
                }
            }
        },

        /**
		 * Resets the document zoom state to its default.
		 */
        out() {
            clearTimeout(panEngageTimeout);
            clearInterval(panUpdateInterval);

            magnify({ x: 0, y: 0 }, 1);

            level = 1;
        },

        // Alias
        magnify(options) { this.to(options); },
        reset() { this.out(); },

        zoomLevel() {
            return level;
        }
    };

};

/*!
 * reveal.js Zoom plugin
 */
const Plugin = {

    id: 'zoom',

    init(reveal) {

        reveal.getRevealElement().addEventListener('mousedown', (event) => {
            const defaultModifier = /Linux/.test(window.navigator.platform) ? 'ctrl' : 'alt';

            const modifier = `${reveal.getConfig().zoomKey ? reveal.getConfig().zoomKey : defaultModifier}Key`;
            const zoomLevel = (reveal.getConfig().zoomLevel ? reveal.getConfig().zoomLevel : 2);

            if (event[modifier] && !reveal.isOverview()) {
                event.preventDefault();

                zoom.to({
                    x: event.clientX,
                    y: event.clientY,
                    scale: zoomLevel,
                    pan: false
                });
            }
        });

    },

    destroy: () => {

        zoom.reset();

    }

};

export default () => Plugin;
