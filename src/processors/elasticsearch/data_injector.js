/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');
const Utilities = require("../../misc/utilities");
const { ElasticSearchEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class data_injector extends processor_interface
{
    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.storeIndexIdSuffixes = this.environment.storeIndexIdSuffixes;
        this.filesLocation = [];
        this.numberOfDocumentsInProductIndex = undefined;

    }

    /**
     * Executes the processor. High cyclomatic complexity.
     *
     * @param lastProcessor
     * @returns {Promise<data_injector>}
     */
    async run(lastProcessor) {
        try {
            let { pathToFiles, esClient, parsedFiles, indexName } = lastProcessor.getResult();

            this.numberOfDocumentsInProductIndex = await this.getNumberOfDocumentsInProductIndex( {esClient, indexName});

            const allDocumentIds = await this.getAllDocumentIds({ esClient, indexName });

            for( let locale in parsedFiles) { // first level store code
                try {
                    let tipFinderBody = [];
                    for (let localeIndex in parsedFiles[locale]) { // second level data in the store
                        for (let tipfinderIndex in parsedFiles[locale][localeIndex]) {  // Third level tip finder data
                            let sku = parsedFiles[locale][localeIndex][tipfinderIndex].sku;
                            let tipFinderData = parsedFiles[locale][localeIndex][tipfinderIndex].data;
                            let documentId = this.getDocumentIdInEs({ sku, locale, allDocumentIds });

                            if(!documentId) {
                                console.log(`Product sku: ${sku} in the ES index: ${indexName}_${locale} was not found`);
                                continue;
                            }
                            
                            if(this.__.isNil(tipFinderBody[documentId])) {
                                tipFinderBody[documentId] = {tip_finder : []};
                            }
                            tipFinderBody[documentId].tip_finder.push(tipFinderData);
                        }
                    }

                    for (const [key, value] of Object.entries(tipFinderBody)) {
                        let body = [];
                        let update = { update: {_index: indexName, _type: "product", _id: key}};
                        let doc = { doc: {tip_finder: value.tip_finder}};
                        body.push(update);
                        body.push(doc);
                        try {
                            await this.addTipfinderData({esClient, body});
                            console.log(`Product Id: ${key} was in ES correctly updated.`);
                        } catch (error) {
                            console.log(`Product Id: ${key} was in ES not updated. Error: ${error.message}`);
                            this.filesLocation[pathToFiles[locale]] = false;
                        }
                    }

                    this.filesLocation[pathToFiles[locale]] = true;

                } catch (error) {
                    this.filesLocation[pathToFiles[locale]] = false;
                }
            }

            let filesLocation = this.filesLocation;

            this.result = { filesLocation };

            return this;

        } catch (error) {
            throw new ElasticSearchEventExceptions(error.message);
        }
    }

    /**
     * Get all the document ids from ES
     *
     * @param esClient
     * @param indexName
     * @returns {Promise<*[]>}
     */
    async getAllDocumentIds({ esClient, indexName })
    {
        let skuDocumentIds = [];
        let searchAfter = [];
        let lastHitInResponse;

        const breakNumberIntoEvenParts = (num, parts) =>
            [...Array(parts)].map((_,i) =>
                0 | num/parts + (i < num % parts) );

        let sizes = breakNumberIntoEvenParts(this.numberOfDocumentsInProductIndex, 5); //5 := number of stores in Starlab

        for (let i = 0; i < sizes.length; i++) {

            let body = {
                _source: ["sku"],
                size: sizes[i],
                query: { match_all: {}},
                sort: { "_id": "desc", "_score": "desc"}
            };

            if(searchAfter.length === 2) {
                body.search_after = searchAfter;
            }

            let response =  await esClient.search( {
                index: indexName,
                body: body
            });

            if(response.body.hits.hits.length <= 0) {
                throw new Error('Document _ids couldn\'t be retrieved ');
            }

            this.__.mapValues(response.body.hits.hits, (hit) => {
                skuDocumentIds[hit._id] = hit._source.sku;
            });

            lastHitInResponse = response.body.hits.hits[response.body.hits.hits.length - 1];
            searchAfter[0] = lastHitInResponse.sort[0];
            searchAfter[1] = lastHitInResponse.sort[1];
        }

        return skuDocumentIds;
    }

    /**
     * Get all the ids in ES
     * @param sku
     * @param locale
     * @param allDocumentIds
     * @returns {*}
     */
    getDocumentIdInEs({ sku, locale, allDocumentIds })
    {
        // Find all the id were this sku exists
        return this.__.findKey(allDocumentIds, function (skuInDocument, idInElasticSearch) {
            if(sku === skuInDocument) {
                let storeSuffixRegexp = new RegExp(this.storeIndexIdSuffixes[locale]);
                if(storeSuffixRegexp.test(idInElasticSearch)) { //Get the current document id using the store code Ex.: 123_en_US
                    return idInElasticSearch;
                }
            }
        }.bind(this));
    }

    /**
     * Add the data to the document by id
     *
     *
     * @param esClient
     * @param body
     * @returns {Promise<void>}
     */
    async addTipfinderData({ esClient, body})
    {
        await esClient.bulk({
            refresh: false,
            _source: false,
            body : body
        });
    }

    /**
     * Get the total number of documents in the product index
     * @param esClient
     * @param indexName
     * @returns {Promise<TotalHits | number>}
     */
    async getNumberOfDocumentsInProductIndex({ esClient, indexName })
    {
        let response =  await esClient.count( {
            index: indexName,
            body: { query: { match_all: {}} }
        });

        if(response.body.count <= 0 || response.statusCode !== 200) {
            throw new Error('Number of documents can\'t be retrieved ');
        }

        return response.body.count;
    }

}
module.exports = data_injector;