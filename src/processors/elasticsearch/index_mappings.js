/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');
const Utilities = require("../../misc/utilities");
const { ElasticSearchEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class index_mappings extends processor_interface
{

    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.mappingName = this.environment.elasticsearch.mappingName;
        this.tipfinderMapping = this.environment.elasticsearch.mapping;
        this.tipfinderMappingType = this.environment.elasticsearch.mappingType;
    }

    /**
     * Runs the processor
     *
     * @param lastProcessor
     * @returns {Promise<index_mappings>}
     */
    async run(lastProcessor) {

        try {
            let { pathToFiles, esClient, parsedFiles, indexName } = lastProcessor.getResult();

            let response = await esClient.indices.getMapping( { index: indexName });

            if(!this.tipfinderMappingExists(response, indexName)) {
                await esClient.indices.putMapping({
                    index: indexName,
                    include_type_name: true,
                    type: this.tipfinderMappingType,
                    body: this.tipfinderMapping
                });
            }

            this.result = { pathToFiles, esClient, parsedFiles, indexName };

            return this;

        } catch (error) {
            throw new ElasticSearchEventExceptions(error.message);
        }

    }

    /**
     * Check if the tip finder mapping exists in the index
     *
     * @param response
     * @param indexName
     * @returns {boolean}
     */
    tipfinderMappingExists(response, indexName)
    {
        let mappings = response.body[indexName].mappings.properties;
        return mappings.hasOwnProperty(this.mappingName);
    }
}
module.exports = index_mappings;