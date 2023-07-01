const Babel = require('@rollup/plugin-babel');
const CommonJS = require('@rollup/plugin-commonjs');
const Terser = require('@rollup/plugin-terser');
const Fs = require('fs');
const Path = require('path');
const Rollup = require('rollup');
const Sass = require('sass');

module.exports = class DevBuilder {

    #root;

    #jsFiles = [];

    #scssFiles = [];

    build() {
        this.#root = Path.join(__dirname, '..');
        this.#processJs();
        this.#processScss();
        this.#copyPrecompiledAssets(Path.join(this.#root, 'src/precompiled'));
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

    #copyPrecompiledAssets(path) {
        Fs.readdirSync(path, { withFileTypes: true }).forEach((file) => {
            if (file.isDirectory()) {
                this.#copyPrecompiledAssets(Path.join(path, file.name));
                return;
            }
            const src = Path.join(path, file.name);
            const dest = src.replace(
                Path.join(this.#root, 'src/precompiled'),
                Path.join(this.#root, 'out/assets')
            );
            this.#copyFile(src, dest);
        });
    }

    #processJs() {
        this.#jsFiles.forEach((obj) => {
            const src = Path.join(this.#root, 'src/js', obj.path);
            let dest = src.replace(
                Path.join(this.#root, 'src'),
                Path.join(this.#root, 'out/assets')
            );
            dest = dest.replace('.js', '.min.js');
            this.#rollup(obj.name, src, dest);
        });
    }

    #processScss() {
        this.#scssFiles.forEach((rel) => {
            let src;
            let dest;
            if (rel.substring(0, 6) === 'themes') {
                src = Path.join(this.#root, 'src', rel);
                dest = src.replace(
                    Path.join(this.#root, 'src', 'themes'),
                    Path.join(this.#root, 'out/assets/themes')
                );
            } else {
                src = Path.join(this.#root, 'src/scss', rel);
                dest = src.replace(
                    Path.join(this.#root, 'src', 'scss'),
                    Path.join(this.#root, 'out/assets/css')
                );
            }
            dest = dest.replace('.scss', '.min.css');
            const compressed = Sass.compile(
                src,
                {
                    sourceMap: false,
                    style: 'compressed'
                }
            );
            this.#writeFile(dest, compressed.css);
        });
    }

    registerJs(name, path) {
        if (!name) {
            return;
        }
        if (Path.extname(path) !== '.js') {
            return;
        }
        this.#jsFiles.push({ name, path });
    }

    registerScss(path) {
        if (Path.extname(path) !== '.scss') {
            return;
        }
        this.#scssFiles.push(path);
    }

    async #rollup(name, src, dest) {

        const output = {
            name,
            compact: true,
            file: dest,
            format: 'iife',
            generatedCode: {
                constBindings: true
            },
            inlineDynamicImports: true,
            sourcemap: false
        };

        const input = {
            input: src,
            output: [output],
            plugins: [
                Babel({ babelHelpers: 'bundled', compact: true }),
                CommonJS(),
                Terser()
            ]
        };
        const bundle = await Rollup.rollup(input);
        await bundle.write(output);
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

};
