/**
 *
 * @type {Utilities}
 */
const Utilities     = require('../misc/utilities');

var Promise = require("bluebird");

class processor_interface
{
    /**
     * constructor
     */
    constructor() {
        this.result = null;
        this.className = this.constructor.name;
        this.eventEmitter = Utilities.getEvents();
        this.__ = Utilities.getLodash();
    }

    /**
     * Get the processor result
     * @returns {null}
     */
    getResult()
    {
        return this.result;
    }

    /**
     * Get the processor name
     * @returns {*}
     */
    getProcessorName()
    {
        return this.className;
    }

    /**
     * Starting the processor
     */
    async start() {
        console.log(`The process ${this.getProcessorName()} was started`);
    }

    /**
     * Executes the processor
     * @param lastProcessor
     * @returns {bluebird<processor_interface>}
     */
    async run(lastProcessor){
        return this;
    }

    /**
     * Ends the processor
     */
    async end() {
        console.log(`The process ${this.getProcessorName()} was finalized`);
    }
}

/**
 * Using factories for the processors instantiation
 *
 * @param processorClass
 * @param lastProcessor This var contains the last processor instance to access its result in the next processor
 * @returns {bluebird<*>}
 */
async function processorsInterfaceFactory(processorClass, lastProcessor) {
    var processor = new processorClass();
    await processor.start();
    await processor.run(await lastProcessor);
    await processor.end();
    return processor;
}

module.exports = { processor_interface, processorsInterfaceFactory };