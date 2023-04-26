const { processorsInterfaceFactory } = require('../processors/processor_interface');
const email_sender = require('../processors/email_sender');

/**
 *
 * @type {Utilities}
 */
const Utilities = require('../misc/utilities');

/**
 *
 * @type {string}
 */
const processorsPath = '../processors/';

class Queuer {
    /**
     * constructor
     */
    constructor() {
        this.__ = Utilities.getLodash();
        this.logger = Utilities.getLogger();
        this.lastProcessor = null;
    }

    /**
     * Push the events and its processors in the queue
     * @param events
     * @returns {number}
     */
    async init(events) {
        try {
            for (const [processor, eventsArray] of Object.entries(events)) {
                for (const event of eventsArray) {
                    let processorFilePath = processorsPath + processor + '/' + event;
                    this.lastProcessor = await processorsInterfaceFactory(require(processorFilePath), this.lastProcessor);
                }
            }
            //if not already closed finish the process here
            process.exit(0);
        } catch (error) {
            Utilities.handleExit(424, this.lastProcessor ? this.lastProcessor.getProcessorName() : null, error);
            //send email and stop
            this.lastProcessor = await processorsInterfaceFactory(email_sender, null);
            process.exit(1, error)
        }
    }
}
module.exports = new Queuer();