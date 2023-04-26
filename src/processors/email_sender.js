/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('./processor_interface');
const mailer = require("../misc/mailer");

class email_sender extends processor_interface
{
    /**
     * Constructor
     */
    constructor() {
        super();
        this.mailer = mailer;
    }

    /**
     * Runs the processor
     * @param lastProcessor
     * @returns {Promise<void>}
     */
    async run(lastProcessor) {
        if(Object.keys(tipFinderErrors).length !== 0 ) {
            let body = JSON.stringify(tipFinderErrors, null, 2);
            await this.mailer.send({ body });
        }
    }

}
module.exports = email_sender;