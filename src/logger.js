export { Log };

const Level = Object.freeze( {
    CRITICAL: 0,
    DEBUG: 1,
    VERBOSE: 2,
});

class Log {
    static logLevel = Level.VERBOSE;

    static e(errorString) {
        console.log(errorString);
    }

    static d(debugString) {
        if (this.logLevel >= Level.DEBUG) {
            console.log(debugString);
        }
    }

    static v(verboseString) {
        if (this.logLevel >= Level.VERBOSE) {
            console.log(verboseString);
        }
    }
}