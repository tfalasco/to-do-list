export { Log, Level };

/**
 * Level
 * 
 * An enum used to set the maximum logging level
 * 
 * The logger will log messages up to and including the static level
 * that is set on the Log class.
 */
const Level = Object.freeze( {
    CRITICAL: 0,
    DEBUG: 1,
    VERBOSE: 2,
});

class Log {
    static #logLevel = Level.VERBOSE;

    /**
     * Make constructor "private" by throwing an error if it is called.
     */
    constructor() {
        throw new Error("Cannot instantiate static class.");
    }

    /**
     * e
     * 
     * Log an error message
     * 
     * @param {String} errorString
     */
    static e(errorString) {
        console.log(errorString);
    }

    /**
     * d
     * 
     * Log a debug message
     * 
     * This requires the logLevel to be set to DEBUG or higher
     * 
     * @param {String} debugString 
     */
    static d(debugString) {
        if (this.#logLevel >= Level.DEBUG) {
            console.log(debugString);
        }
    }

    /**
     * v
     * 
     * Log a verbose message
     * 
     * This requires the logLevel to be set to VERBOSE or higher
     * 
     * @param {String} verboseString
     */
    static v(verboseString) {
        if (this.#logLevel >= Level.VERBOSE) {
            console.log(verboseString);
        }
    }

    /**
     * @param {Level} newLevel
     */
    static set logLevel(newLevel) {
        if ((newLevel >= Level.CRITICAL) &&
            (newLevel <= Level.VERBOSE)) {
                this.#logLevel = newLevel;
        }
        else {
            this.e("Could not set invalid log level.");
        }
    }
}