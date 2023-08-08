# Mermaid

We are currently using Mermaid v10.2.4 manually built from the [mermaid repository](https://github.com/mermaid-js/mermaid) and then slightly modified. We modify the code to change `startOnLoad` to `false` so we can control when when Mermaid diagrams are processed, we add a `placeErrorMessage` method that exposes some of the error handling features to us, and we tweak how the error text looks.

## How to Update

1. Delete the old mermaid files in this directory being careful not to delete files needed by Lectures.
2. In a location outside of Lectures clone the [mermaid repository](https://github.com/mermaid-js/mermaid) repository and build a local copy:

```bash
git clone https://github.com/mermaid-js/mermaid.git # Clone via https
# git clone git@github.com:mermaid-js/mermaid.git   # Clone via ssh
cd packages/mermaid
npm install --legacy-peer-deps # You may have to add the --force flag
cd ../../
npm install --legacy-peer-deps # You may have to add the --force flag
# You will most likely see errors after the install command proceed anyways
```

3. Modify the `errorRenderer.ts` file located at `packages > mermaid > src > diagrams > error` by replacing the code `.attr('x', 1250)` around line ~82 with `.attr('x', 1440)`.
4. Modify the `mermaid.ts` file located at `packages > mermaid > src` by changing `startOnLoad` to `false` near the very bottom of the file. The default config settings will still keep `true` but that does not affect the initial loading of Mermaid.
5. Modify the `mermaidAPI.ts` file located at `packages > mermaid > src` by adding the following additional method to the object exported as `mermaidAPI`. Look for the line with `export const mermaidAPI = Object.freeze({` near the end, but not very bottom, of the file:

```javascript
placeErrorMessage: (diagram: HTMLElement) => {
    // Do not create an error message if we do not have a proper diagram element.
    if (!diagram.classList.contains('mermaid')) {
        console.error('Could not generate error because a mermaid container was not provided.');
        return;
    }
    const id = `mermaid-${Math.random().toString(36).substring(2)}`;
    // Generate the styles for this error svg.
    const styles = getStyles('','', configApi.getConfig().themeVariables);
    const style = document.createElement('STYLE');
    style.innerHTML = serialize(compile(`#${id}{${styles}}`), stringify);
    /**
     * Create the error svg; there are better ways but this works so I don't have
     * to reverse engineer all of mermaid!
     */
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('xmlns', XMLNS_SVG_STD);
    svg.setAttribute('xmlns:xlink', XMLNS_XLINK_STD);
    svg.setAttribute('role', 'graphics-document document');
    svg.setAttribute('aria-roledescription', 'error');
    svg.prepend(document.createElement('G')); // Must have an empty element or display breaks.
    svg.prepend(style);
    // Add the error to the page so errorRenderer can draw it.
    svg.id = id;
    diagram.innerHTML = '';
    diagram.appendChild(svg);
    errorRenderer.draw('Syntax error see console for more information.', id, version);
},
```

6. Now build Mermaid by running the following command at the root of the repository: `npm run build:mermaid`
7. Copy the `mermaid.min.js` file located at `packages > mermaid > dist` into this directory.
8. Run `npm run build` to compile the entire application.