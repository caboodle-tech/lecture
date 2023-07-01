const enableCorrectColorMode = () => {
    const searchStr = window.location.search.substring(1);
    if (searchStr.includes('dark-mode=1')) {
        document.body.classList.add('dark-mode');
    }
};

const enablePrintMode = (deck, intervalObj) => {
    const reveal = deck.getRevealElement();
    const master = reveal.querySelector('.master-slide');
    if (!master || intervalObj.count > 10) {
        clearInterval(intervalObj.id);
        return;
    }
    const pages = reveal.querySelectorAll('.pdf-page');
    if (pages.length < deck.getTotalSlides()) {
        // eslint-disable-next-line no-param-reassign
        intervalObj.count += 1;
        return;
    }
    pages.forEach((page) => {
        const masterCopy = document.createElement('DIV');
        masterCopy.classList.add('master-slide');
        masterCopy.innerHTML = master.innerHTML;
        page.appendChild(masterCopy);
    });
    clearInterval(intervalObj.id);
};

const getUrlBase = () => {
    const { scripts } = window.document;
    let base;
    for (let i = 0; i < scripts.length; i++) {
        const name = scripts[i].src;
        if (name.includes('plugins/ctl-lectures')) {
            base = scripts[i].src;
            break;
        }
    }
    if (!base || !base.includes('assets/js')) {
        return '';
    }
    return base.substring(0, base.indexOf('assets') + 6);
};

const loadCss = (src, ver = '0.0.0') => {
    const url = new URL(src);
    url.searchParams.set('ver', ver);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url.toString();
    document.head.appendChild(link);
};

/**
 * Loads a JavaScript file and returns a Promise for when it is loaded
 * Credits: https://aaronsmith.online/easily-load-an-external-script-using-javascript/
 */
const loadScript = (src, ver = '0.0.0') => new Promise((resolve, reject) => {
    const url = new URL(src);
    url.searchParams.set('ver', ver);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = resolve;
    script.onerror = reject;
    script.src = url.toString();
    document.head.append(script);
});

async function loadScripts(urls) {
    for (let i = 0; i < urls.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await loadScript(urls[i]);
    }
}

const relocateMaterSlide = (deck, intervalObj) => {
    const reveal = deck.getRevealElement();
    const master = reveal.querySelector('.master-slide');
    if (!master) {
        clearInterval(intervalObj.id);
        return;
    }
    let background = reveal.querySelector('.backgrounds');
    if (!background) {
        if (intervalObj.count < 10) {
            // eslint-disable-next-line no-param-reassign
            intervalObj.count += 1;
            return;
        }
        background = reveal.lastElementChild;
    }
    background.insertAdjacentElement('afterend', master);
    clearInterval(intervalObj.id);
};

const CtlLectures = () => {

    let darkMode = false;

    const intervals = {
        print: { id: null, count: 0 },
        relocate: { id: null, count: 0 }
    };

    return {
        id: 'lectures',
        init: (deck) => {

            deck.getUrlBase = getUrlBase;
            deck.loadCss = loadCss;
            deck.loadScript = loadScript;
            deck.loadScripts = loadScripts;

            deck.addKeyBinding(
                {
                    keyCode: 68,
                    key: 'D',
                    description: 'Enable Dark Mode'
                },
                () => {
                    deck.getPlugin('ctl-mermaid').enableDarkMode();
                    document.body.classList.add('dark-mode');
                    darkMode = true;
                }
            );

            deck.addKeyBinding(
                {
                    keyCode: 76,
                    key: 'L',
                    description: 'Disable Dark Mode'
                },
                () => {
                    deck.getPlugin('ctl-mermaid').disableDarkMode();
                    document.body.classList.remove('dark-mode');
                    darkMode = false;
                }
            );

            deck.addKeyBinding(
                {
                    keyCode: 80,
                    key: 'P',
                    description: 'Open Print Mode'
                },
                () => {
                    const uri = window.location.origin + window.location.pathname;
                    if (darkMode) {
                        window.open(`${uri}?print-pdf&dark-mode=1`, '_blank');
                        return;
                    }
                    window.open(`${uri}?print-pdf`, '_blank');
                }
            );

            intervals.relocate.id = setInterval(
                relocateMaterSlide.bind(null, deck, intervals.relocate),
                100
            );

            if (deck.isPrintingPDF()) {
                enableCorrectColorMode();
                intervals.print.id = setInterval(
                    enablePrintMode.bind(null, deck, intervals.print),
                    300
                );
            }
        }
    };
};

module.exports = CtlLectures;
