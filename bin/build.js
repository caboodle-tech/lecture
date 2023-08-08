/* eslint-disable import/extensions */
import * as Sass from 'sass';
import Fs from 'fs';
import Path from 'path';
import Terser from '@rollup/plugin-terser';
import { fileURLToPath } from 'url';
import { rollup as Rollup } from 'rollup';
import Print from './print.js';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = Path.dirname(__filename);

class Builder {

    #instructions = [];

    #outputDir = '';

    #sourceDir = '';

    constructor() {
        this.#outputDir = Path.join(__dirname, '../dist');
        this.#sourceDir = Path.join(__dirname, '../src');
    }

    async build() {
        this.#loadInstructions();
        if (!await this.#processBuilds()) { return; }
        if (!await this.#processCopies()) { return; }
        Print.success('Building Lectures completed without errors.');
    }

    copyDirectory(src, dest) {
        if (!Fs.existsSync(dest)) {
            Fs.mkdirSync(dest, { recursive: true });
        }

        const files = Fs.readdirSync(src);

        files.forEach((file) => {
            const sourcePath = Path.join(src, file);
            const destinationPath = Path.join(dest, file);

            if (Fs.lstatSync(sourcePath).isDirectory()) {
                this.copyDirectory(sourcePath, destinationPath);
            } else {
                this.copyFile(sourcePath, destinationPath);
            }
        });
    }

    copyFile(src, dest) {
        if (!Fs.existsSync(Path.dirname(dest))) {
            Fs.mkdirSync(Path.dirname(dest), { recursive: true });
        }

        if (!this.#isProcessingNecessary(src, dest)) {
            Print.info(`Skipped copying: ${src}`);
            return;
        }

        try {
            Fs.copyFileSync(src, dest);
            Print.success(`✔ cp ${src}\n   → ${dest}`);
        } catch (err) {
            Print.warn(`X cp ${src} → ${dest}`);
            Print.error(`Could not copy: ${src}\n${err}`);
        }
    }

    #isProcessingNecessary(src, dest) {
        // If the file doesn't exist at the destination build it.
        if (!Fs.existsSync(dest)) { return true; }
        // If the file exits but the src was modified since build it.
        try {
            const srcTime = Fs.statSync(src).mtime;
            const destTime = Fs.statSync(dest).mtime;
            if (srcTime > destTime) { return true; }
        } catch (err) {
            Print.error(`Error determining modification time:\n${err}`);
            return true;
        }
        // No need to process destination file exists and is current.
        return false;
    }

    #loadInstructions() {
        const recursivelyLoadInstructions = (dir) => {
            const items = Fs.readdirSync(dir, { withFileTypes: true });
            items.forEach((item) => {
                const fileOrDir = Path.join(dir, item.name);
                if (item.isDirectory()) {
                    recursivelyLoadInstructions(fileOrDir);
                    return;
                }
                if (item.name !== 'build.json') {
                    return;
                }
                const data = Fs.readFileSync(fileOrDir, { encoding: 'utf-8' });
                try {
                    const json = JSON.parse(data);
                    // eslint-disable-next-line max-len
                    json.root = dir.substring(dir.indexOf('src') + 4); // Keep track of where this instructions was loaded from.
                    this.#instructions.push(json);
                } catch (err) {
                    Print.error(`Could not parse instructions from: ${fileOrDir}\n${err}`);
                }
            });
        };
        recursivelyLoadInstructions(this.#sourceDir);
    }

    async #processBuilds() {

        const OUTPUT_FILE = 0;
        const OUTPUT_NAME = 1;

        const instructions = this.#instructions;

        for (let i = 0; i < instructions.length; i++) {
            const inst = instructions[i];
            if (!inst.build) {
                continue;
            }
            const filenames = Object.keys(inst.build);
            if (filenames.length < 1) {
                continue;
            }

            const { root } = inst;
            for (let f = 0; f < filenames.length; f++) {
                const instruction = inst.build[filenames[f]];
                const sourceFile = Path.join(this.#sourceDir, root, filenames[f]);
                let outputFile = Path.join(this.#outputDir, root, instruction[OUTPUT_FILE]);

                if (Path.extname(sourceFile) === '.scss') {
                    outputFile = outputFile.replace(/scss/g, 'css');

                    if (!this.#isProcessingNecessary(sourceFile, outputFile)) {
                        Print.info(`Skipped building: ${sourceFile}`);
                        continue;
                    }

                    Print.notice(`Building: ${Path.basename(instruction[OUTPUT_FILE])}`);

                    try {
                        const sourceMappingURL = `${Path.basename(outputFile)}.map`;
                        const scss = Sass.compile(sourceFile, { style: 'compressed', sourceMap: true });
                        // eslint-disable-next-line max-len
                        const result = this.writeFile(outputFile, `${scss.css}\n/*# sourceMappingURL=./${sourceMappingURL} */`);
                        this.writeFile(`${outputFile}.map`, JSON.stringify(scss.sourceMap));
                        if (result !== true) {
                            Print.error(`Could not write out built file: ${sourceFile}\n${result}`);
                            return false;
                        }
                        Print.success(`Successfully built: ${outputFile}`);
                        continue;
                    } catch (err) {
                        Print.error(`Could not build: ${sourceFile}\n${err}`);
                        return false;
                    }
                }

                if (!this.#isProcessingNecessary(sourceFile, outputFile)) {
                    Print.info(`Skipped building: ${sourceFile}`);
                    continue;
                }

                let outputName = null;
                if (instruction[OUTPUT_NAME]) {
                    outputName = instruction[OUTPUT_NAME];
                }

                const inputObj = {
                    input: sourceFile,
                    onwarn: (warning, warn) => {
                        // Suppress the 'this' keyword warning but pass on other warnings.
                        if (warning.code === 'THIS_IS_UNDEFINED') { return; }
                        warn(warning);
                    }
                };

                const outputObj = {
                    file: outputFile,
                    format: 'iife',
                    name: outputName,
                    plugins: [Terser()],
                    sourcemap: true
                };

                Print.notice(`Building: ${outputName}`);

                if (!outputName) {
                    delete outputObj.name;
                }

                try {
                    // Create a Rollup bundle.
                    // eslint-disable-next-line no-await-in-loop
                    const bundle = await Rollup(inputObj);
                    // Save the generated (bundled) code.
                    // eslint-disable-next-line no-await-in-loop
                    await bundle.write(outputObj);
                    Print.success(`Successfully built: ${sourceFile}`);
                } catch (err) {
                    Print.error(`Could not build: ${sourceFile}\n${err}`);
                    return false;
                }
            }
        }

        return true;
    }

    #processCopies() {
        let encounteredError = false;

        const instructions = this.#instructions;

        for (let i = 0; i < instructions.length; i++) {
            const inst = instructions[i];
            if (!inst.copy) {
                continue;
            }
            const sources = Object.keys(inst.copy);
            if (sources.length < 1) {
                continue;
            }

            const { root } = inst;

            for (let s = 0; s < sources.length; s++) {
                const alterPath = inst.copy[sources[s]];
                const src = Path.join(this.#sourceDir, root, sources[s]);
                const dest = Path.join(this.#outputDir, root, alterPath, sources[s]);

                if (!Fs.existsSync(src)) {
                    encounteredError = true;
                    Print.error(`Unable to copy non-existent file: ${src}`);
                    continue;
                }

                if (Fs.lstatSync(src).isDirectory()) {
                    this.copyDirectory(src, dest);
                    continue;
                }

                this.copyFile(src, dest);
            }
        }

        return !encounteredError;
    }

    writeFile(file, data) {
        if (!Fs.existsSync(Path.dirname(file))) {
            Fs.mkdirSync(Path.dirname(file), { recursive: true });
        }
        try {
            Fs.writeFileSync(file, data);
            return true;
        } catch (err) {
            return err;
        }
    }

}

const builder = new Builder();

/**
 * Determine what command to run:
 */
let buildCmd = '';

if (process.argv && process.argv.length > 2) {
    // eslint-disable-next-line prefer-destructuring
    buildCmd = process.argv[2];
}

/**
 * Run the chosen command or default to building everything.
 */
switch (buildCmd) {
    default:
        builder.build();
}
