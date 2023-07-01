// I WISH I FOUNND THIS SOONER!!!!!
// https://stackoverflow.com/a/75878414/3193156

function processDiagram(diagram) {
    const id = `mermaid-${Math.random().toString(36).substring(2)}`;
    const existing = diagram.querySelector('[data-graph-definition]');
    let graphDefinition = diagram.textContent.trim();
    if (existing) {
        graphDefinition = existing.textContent.trim();
    }
    Mermaid.render(id, graphDefinition)
        .then(({ svg, bindFunctions }) => {
            // eslint-disable-next-line no-param-reassign
            diagram.innerHTML = `
            <div data-graph-definition style="display:none;">${graphDefinition}</div>
            ${svg}
            `;
            bindFunctions?.(diagram);
        })
        .catch((error) => {
            console.log(error);
        });
}

function CtlMermaid() {

    let deck;
    let diagrams;
    let ready = false;

    return {
        id: 'ctl-mermaid',
        disableDarkMode: () => {
            if (!ready) {
                return;
            }
            const { ...mermaidConfig } = deck.getConfig().mermaid;
            mermaidConfig.theme = 'neutral';
            mermaidConfig.darkMode = false;

            // This is dumb but the only thing that works!
            // Mermaid setups the theme options in the init step.
            Mermaid.mermaidAPI.initialize({
                startOnLoad: false,
                ...mermaidConfig
            });

            diagrams.forEach((diagram) => {
                processDiagram(diagram);
            });
        },
        enableDarkMode: () => {
            if (!ready) {
                return;
            }
            const { ...mermaidConfig } = deck.getConfig().mermaid;
            mermaidConfig.theme = 'dark';
            mermaidConfig.darkMode = true;

            // This is dumb but the only thing that works!
            // Mermaid setups the theme options in the init step.
            Mermaid.mermaidAPI.initialize({
                startOnLoad: false,
                ...mermaidConfig
            });

            diagrams.forEach((diagram) => {
                processDiagram(diagram);
            });
        },
        init: (reveal) => {

            deck = reveal;

            diagrams = deck.getRevealElement().querySelectorAll('.mermaid');

            if (diagrams.length < 1) {
                return;
            }

            const base = deck.getUrlBase();
            if (!base) {
                return;
            }

            const processDiagrams = () => {
                diagrams.forEach((diagram) => {
                    processDiagram(diagram);
                });
            };

            deck.loadScript([`${base}/js/plugins/mermaid.min.js`]).then(() => {
                if (deck.isReady()) {
                    processDiagrams();
                    ready = true;
                } else {
                    deck.on('ready', processDiagrams.bind(this));
                    ready = true;
                }
            });
        }
    };
}

module.exports = CtlMermaid;
