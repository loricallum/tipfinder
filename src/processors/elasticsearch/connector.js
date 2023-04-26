/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');
const Utilities = require("../../misc/utilities");
const { ElasticSearchEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class connector extends processor_interface
{
    /**
     * constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.connectionOptions = {
            node : [this.environment.elasticsearch.host, this.environment.elasticsearch.port].join(':'),
            requestTimeout : this.environment.elasticsearch.requestTimeout, //milliseconds
            maxRetries : this.environment.elasticsearch.maxRetries,
            apiVersion: this.environment.elasticsearch.apiVersion,
            ssl: {
                rejectUnauthorized: false,
            }
        };
    }

    /**
     * Executes the processor
     *
     * @param lastProcessor
     * @returns {Promise<connector>}
     */
    async run(lastProcessor) {

        try {

            let { pathToFiles, parsedFiles } = lastProcessor.getResult();
            let esClient = new (Utilities.getElasticSearch()).Client(this.connectionOptions);

            await esClient.ping(); // is ES alive

            this.result = { pathToFiles, parsedFiles, esClient };

            return this;

        } catch (error) {
            throw new ElasticSearchEventExceptions(error.message);
        }
    }
}
module.exports = connector;