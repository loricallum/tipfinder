/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');
const Utilities = require("../../misc/utilities");
const { ElasticSearchEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class index_checker extends processor_interface
{

    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.indexAlias =  this.environment.elasticsearch.indexAlias;
    }

    /**
     * Executes the processor
     *
     * @param lastProcessor
     * @returns {Promise<index_checker>}
     */
    async run(lastProcessor) {

        try {
            let indexAliases = [], indexName;
            let { pathToFiles, parsedFiles, esClient } = lastProcessor.getResult();

            for(let code in parsedFiles) { // Get store codes from parsed files array
                let indexAlias = this.indexAlias.replace('%STORE_CODE%', code.split('_')[0]); // replace it with the store code
                indexAliases.push(indexAlias);
            }

            let response = await this.getAliasesResponse(esClient, indexAliases);

            indexName = this.getMainIndexName(response);

            this.result = { pathToFiles, esClient, parsedFiles, indexName };

            return this;

        } catch (error) {
            throw new ElasticSearchEventExceptions(error.message);
        }
    }

    /**
     * Trigger an ES request and get the response
     *
     * @param esClient
     * @param indexAliases
     * @returns {Promise<ApiResponse<CatAliasesResponse, unknown>>}
     */
    async getAliasesResponse(esClient, indexAliases)
    {
        let response = await esClient.cat.aliases({ name: indexAliases, format: 'json' });

        if(response.statusCode !== 200) {
            throw new Error(`There was an error getting the main index`);
        }

        return response;
    }

    /**
     * Get the main index name from the aliases
     *
     * @param response
     * @returns {*}
     */
    getMainIndexName(response)
    {
        let indexName;

        indexName = this.__.uniq( //Get unique value from array
            Object.values( // get object values
                this.__.mapValues(response.body, function(item) { return item.index; }) // map index name from response
            )
        ).shift(); // Get first array element

        if(indexName === null) {
            throw new Error('The main index name was not identified');
        }

        return indexName;
    }

}
module.exports = index_checker;