/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');
const Utilities = require("../../misc/utilities");
const { ElasticSearchEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class index_attribute_injector extends processor_interface
{

    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.attributeIndexNameSuffix = this.environment.attributeIndexNameSuffix;
        this.attributeData = this.environment.attributeData;
        this.storeCode = this.environment.storeCodes;
    }

    /**
     * Runs the processor
     *
     * @param lastProcessor
     * @returns {Promise<index_attribute_injector>}
     */
    async run(lastProcessor) {

        try {
            let { pathToFiles, esClient, parsedFiles, indexName } = lastProcessor.getResult();
            const attributeIndexName = indexName.replace('product', this.attributeIndexNameSuffix);

            let lastAddedDocIdInIndex = await this.lastAddedDocIdInIndex({ esClient, attributeIndexName });
            lastAddedDocIdInIndex++; //increment it
            this.attributeData.id = lastAddedDocIdInIndex;

            for(let code in this.storeCode) {
                this.attributeData.locale = code;

                await esClient.index({ // Add the new documents in the attr index
                    index: attributeIndexName,
                    id : `${lastAddedDocIdInIndex}_${code}`,
                    type: this.attributeIndexNameSuffix,
                    body: this.attributeData
                });
            }

            this.result = { pathToFiles, esClient, parsedFiles, indexName };

            return this;

        } catch (error) {
            throw new ElasticSearchEventExceptions(error.message);
        }

    }

    /**
     * Get the last document id added to the index
     *
     * @param esClient
     * @param attributeIndexName
     * @returns {Promise<any>}
     */
    async lastAddedDocIdInIndex({ esClient, attributeIndexName })
    {
        let response =  await esClient.search({
            index: attributeIndexName,
            _source: "id",
            size: 1,
            sort: "id:desc",
            body: {
                "query": {
                    "match_all": {}
                }
            }
        });

        if(response.statusCode === 200 && response.body.hits.hits.length === 1) {
            let hit =  response.body.hits.hits.shift();
            return hit._source.id;
        } else {
            throw new Error(`The last document id in the index ${attributeIndexName} cannot be retrieved`);
        }
    }
}

module.exports = index_attribute_injector;