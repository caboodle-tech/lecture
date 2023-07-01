#!/usr/bin/env node
const Fs = require('fs');
const Parser = require('node-html-parser');
const Path = require('path');

class Lecture {

    #plugins = ['CtlLectures', 'RevealHighlight', 'RevealMarkdown', 'CtlMath.KaTeX', 'RevealMermaid', 'RevealNotes', 'RevealZoom'];

    #regex = {
        boolean: /^true$|^false$/i,
        buildBin: /build[\\/]{1,2}bin/,
        float: /^\d+\.{0,1}\d+$/,
        number: /^\d+$/,
        presentation: /\.rv\.html$/
    };

    #root;

    #settings = {
        autoAnimate: false,
        controls: true,
        embedded: true,
        hash: true,
        hashOneBasedIndex: true,
        history: true,
        plugins: 'CtlLectures, RevealHighlight, RevealMarkdown, CtlMath.KaTeX, CtlMermaid, RevealNotes, RevealZoom',
        progress: true,
        mermaid: { theme: 'neutral' },
        slideNumber: true,
        transition: 'fade',
        helpButtonDisplay: 'always'
    };

    #template;

    constructor() {
        this.#root = Path.resolve(Path.join(__dirname, '..'));
        this.#template = Fs.readFileSync(Path.join(this.#root, 'out/assets', 'template.html')).toString();
    }

    #build() {
        this.#createBuildDir();
        const lectures = Fs.readdirSync(Path.join(this.#root, 'lectures'));
        lectures.forEach((lecture) => {
            this.#buildLecture(Path.join(this.#root, 'lectures', lecture));
        });
        this.#copyAssets();
    }

    #buildLecture(path) {
        const meta = this.#getMeta(Path.join(path, 'meta.json'));

        const items = Fs.readdirSync(path, { withFileTypes: true });

        items.forEach((item) => {
            const filename = Path.basename(item.name);
            // If this is the meta file ignore it.
            if (item.name === 'meta.json') {
                return;
            }
            // If item is a dir process the dir recursively.
            if (item.isDirectory()) {
                this.#buildLecture(Path.join(path, item.name));
                return;
            }
            const dest = Path.join(this.#getBuildPath(path), item.name);
            const src = Path.join(path, item.name);
            // If item is a file not a presentation just copy it over.
            if (!this.#regex.presentation.test(filename)) {
                this.#copyFile(src, dest);
                return;
            }
            this.#processPresentationFile(src, dest);
        });

    }

    #copyAssets() {
        // const userAssets = Path.join(this.#root, 'assets');
        // this.#copyAssetsRecursively(userAssets);

        const ctlAssets = Path.join(this.#root, 'out', 'assets');
        this.#copyAssetsRecursively(ctlAssets);
    }

    #copyAssetsRecursively(path) {
        const assets = Fs.readdirSync(path, { withFileTypes: true });
        assets.forEach((asset) => {
            const dest = Path.join(this.#root, this.#getBuildPath(path), asset.name);
            const src = Path.join(path, asset.name);
            if (asset.isDirectory()) {
                const destDir = Path.join(path, asset.name);
                if (!Fs.existsSync(destDir)) {
                    Fs.mkdirSync(destDir, { recursive: true });
                }
                this.#copyAssetsRecursively(destDir);
                return;
            }
            this.#copyFile(src, dest);
        });
    }

    #copyFile(src, dest) {
        // Get the directory name of the destination path.
        const destDir = Path.dirname(dest);
        // If the path does not exist create it first.
        if (!Fs.existsSync(destDir)) {
            Fs.mkdirSync(destDir, { recursive: true });
        }
        // Perform copy.
        Fs.copyFileSync(src, dest);
    }

    #createBuildDir() {
        const buildDir = Path.join(this.#root, 'build');
        if (!Fs.existsSync(buildDir)) {
            Fs.mkdirSync(buildDir);
            // TODO: Catch creation error.
        }

        const lectures = Path.join(this.#root, 'build', 'lectures');
        if (!Fs.existsSync(lectures)) {
            Fs.mkdirSync(lectures);
            // TODO: Catch creation error.
        }
    }

    #getBuildPath(src) {
        const rel = src.replace(Path.join(this.#root, 'out'), '');
        const buildPath = Path.join('build', rel.replace(this.#root, '').substring(1));
        return buildPath.replace(this.#regex.buildBin, 'build');
    }

    #getRelativePath(path) {
        return '../'.repeat((path.match(/[\\/]/g) || []).length - 1);
    }

    #getMeta(path) {
        const defaults = {
            name: Path.basename(path),
            description: ''
        };
        if (Fs.existsSync(path)) {
            const json = JSON.parse(Fs.readFileSync(path));
            Object.keys(json).forEach((key) => {
                defaults[key] = json[key];
            });
            // TODO: Catch errors
        }
        return defaults;
    }

    #parseSettings(str) {
        const results = {};
        const lines = str.split('\n');
        lines.forEach((line) => {
            const parts = line.split('=');
            if (parts.length === 2) {
                const key = parts[0].trim();
                let val = parts[1].trim();
                if (key === 'plugins') {
                    const ary = val.split(',');
                    for (let i = 0; i < ary.length; i++) {
                        if (this.#plugins.includes(ary[i].trim())) {
                            ary.splice(i, 1);
                            i -= 1;
                        }
                    }
                    val = ary.join(',').trim();
                } else if (val.includes(',')) {
                    val = val.split(', ');
                } else if (this.#regex.boolean.test(val)) {
                    val = (val === 'true');
                } else if (this.#regex.float.test(val)) {
                    val = parseFloat(val);
                } else if (this.#regex.number.test(val)) {
                    val = parseInt(val, 10);
                }
                results[key] = val;
            }
        });
        return results;
    }

    #processPresentationFile(src, dest) {
        // TODO: Support loading different template.
        // console.log(Parser);
        // return;

        const html = Fs.readFileSync(src).toString();
        const dom = Parser.parse(html);
        const root = this.#getRelativePath(dest);

        let presentation = '';
        let script = '';
        let style = '';
        let master = '';
        let meta = '';
        let template = this.#template;
        let title = '';
        const initialize = JSON.parse(JSON.stringify(this.#settings));
        dom.childNodes.forEach((elem) => {
            // eslint-disable-next-line default-case
            switch (elem.tagName) {
                case 'LINK':
                    style += `${elem.outerHTML}\n`;
                    break;
                case 'META':
                    meta += elem.outerHTML;
                    break;
                case 'SCRIPT':
                    script += `${elem.outerHTML}\n`;
                    break;
                case 'SECTION':
                    if ('data-master-slide' in elem.attributes) {
                        master = elem.innerHTML;
                        break;
                    }
                    presentation += elem.outerHTML;
                    break;
                case 'SETTINGS':
                    // eslint-disable-next-line no-case-declarations
                    const settings = this.#parseSettings(elem.innerText.trim());
                    Object.keys(settings).forEach((key) => {
                        if (key === 'plugins') {
                            initialize.plugins += `, ${settings[key]}`;
                            return;
                        }
                        initialize[key] = settings[key];
                    });
                    break;
                case 'STYLE':
                    style += `${elem.outerHTML}\n`;
                    break;
                case 'TITLE':
                    title = elem.innerText;
                    break;
            }
        });

        if (master.length > 0) {
            master = `<div class="master-slide">${master}</div>`;
        }

        const keepPluginsRef = `${initialize.plugins}`;
        initialize.plugins = '{{PLUGINS}}';

        template = template.replace(/{{INITIALIZE}}/, `<script>Reveal.initialize(${JSON.stringify(initialize)});</script>`);
        template = template.replace(/{{SCRIPT}}/, script.trim());
        template = template.replace(/{{MASTER_SLIDE}}/, master);
        template = template.replace(/{{PRESENTATION}}/, presentation.trim());
        template = template.replace(/{{META}}/, meta.trim());
        template = template.replace(/{{STYLE}}/, style.trim());
        template = template.replace(/{{TITLE}}/, title.trim());
        template = template.replace(/{{LANG}}/g, 'en'); // TODO: Allow modify
        template = template.replace(/{{ROOT}}/g, root);

        template = template.replace(/"{{PLUGINS}}"/, `[${keepPluginsRef}]`);

        this.#writeFile(dest.replace('.rv.html', '.html'), template);
    }

    run(args) {
        this.#build();
    }

    #writeFile(dest, contents) {
        // Get the directory name of the destination path.
        const destDir = Path.dirname(dest);
        // If the path does not exist create it first.
        if (!Fs.existsSync(destDir)) {
            Fs.mkdirSync(destDir, { recursive: true });
        }
        // Write file.
        Fs.writeFileSync(dest, contents);
    }

}

const lecture = new Lecture();
lecture.run(process.argv);
