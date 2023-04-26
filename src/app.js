/**
 *
 * @type {DotenvConfigOutput}
 */
const Dotenv    = require('dotenv').config();

/**
 *
 * @type {yargs.Argv<{}> | yargs}
 */
const Yargs     = require('yargs');

/**
 *
 * @type {Utilities}
 */
const Utilities = require('./misc/utilities');

/**
 *
 * @type {Queuer}
 */
const Queuer    = require('./queuer/queuer');

/**
 * This variable will be used in the last processor
 * email_sender
 * @type {{}}
 */
global.tipFinderErrors = {};

/**
 * Start the process to get the tipfinder data into elastic search
 * call: npm start / node src/app start
 */
Yargs.command({
    command: 'start',
    describe: 'Start the tip-finder process',
    handler() {
        try {
            const events = Utilities.getEnvironment().events;

            Utilities.arrayIsEmpty(events, 'Events');

            Queuer.init(events);

        } catch (exception) {
            Utilities.handleExit(410, 'app', exception);
        }
    }
});
Yargs.parse();

/**
 * Log and exit when an unhandledRejection pops up
 */
process.on('unhandledRejection', (reason, p) => {
    Utilities.handleExit(410, 'unhandledRejection', reason);
});

/**
 * Log and exit when an uncaughtException was threw
 */
process.on('uncaughtException', function (exception) {
    Utilities.handleExit(410, 'uncaughtException', exception);
});

