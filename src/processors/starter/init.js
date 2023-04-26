/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');

class init extends processor_interface
{
    /**
     * Executes the processor
     * @param lastProcessor
     * @returns {Promise<init>}
     */
    async run(lastProcessor) {
        this.result = "Im in the init processor";
        return this;
    }
}

module.exports = init;