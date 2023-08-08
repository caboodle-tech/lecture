/**
 * A static helper class that allows printing colorful node console messages.
 */
class Print {

    static formatMessage(message, colorCode) {
        const resetCode = '\x1b[0m';
        return `${colorCode}${message}${resetCode}`;
    }

    static output(message) {
        console.log(Print.formatMessage(message, '\x1b[37m')); // White color
    }

    static success(message) {
        console.log(Print.formatMessage(message, '\x1b[32m')); // Green color
    }

    static info(message) {
        console.log(Print.formatMessage(message, '\x1b[36m')); // Cyan color
    }

    static notice(message) {
        console.log(Print.formatMessage(message, '\x1b[34m')); // Blue color
    }

    static warn(message) {
        console.warn(Print.formatMessage(message, '\x1b[33m')); // Yellow color
    }

    static error(message) {
        console.error(Print.formatMessage(message, '\x1b[31m')); // Red color
    }

}

export default Print;
