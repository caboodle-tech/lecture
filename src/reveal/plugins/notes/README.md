# Notes Plugin for Reveal

This is a modified version of Reveals zoom plugin. The default plugin fires to earlier and must be loaded after the bodies elements or deferred. Since we do not want to delay the running with defer and prefer to load all of Lectures code first we modified this plugin to load as fast as possible without triggering an error.

## How to Update

1. Delete all content in the `notes.esm.js` file. You will rebuild this file from the [plugins source](https://github.com/hakimel/reveal.js/blob/master/plugin/notes/notes.js) by copy-pasting parts in a specific order.
2. Paste the following code at the top of the file:

```javascript
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
```

3. From the zoom plugins source code, copy and paste the `zoom` function that starts with `var zoom = (function(){` and ends with `})();` below the code from the last step.
4. Modify the code you just copied by making the following changes:
    - Replace `var zoom = (function(){` with `const realZoom = function () {` instead.
    - Replace `})();` with `};` instead.
5. From the zoom plugins source code, copy and paste the `Plugin` code that starts with `const Plugin = {` ends with `};` but also include the line `export default () => Plugin;` below the code from the last step.
6. Run `npm run build` to compile the entire application.