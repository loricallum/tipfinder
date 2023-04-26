/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');

const Utilities    = require('../../misc/utilities');

const { FilesEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class parser extends processor_interface
{
    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.fs = Utilities.getFs();
        this.sourceFolderName = Utilities.buildPath([
            this.environment.tipfinder.folderName,
            this.environment.tipfinder.newFolderName
        ]);
        this.iconv = Utilities.getIconv();
        this.jsonDecoding = this.environment.jsonDecoding;
        this.stripTags = Utilities.getStripTags();
    }

    /**
     * Executes the processor
     * @param lastProcessor
     * @returns {Promise<parser>}
     */
    async run(lastProcessor)
    {
        try {
            let filesToParse = lastProcessor.getResult();
            let pathToFiles = [];
            let parsedFiles = [];
            this.__.forEach(filesToParse, function (file, code) {
                let pathToFile = Utilities.buildPath([this.sourceFolderName, file]);
                let data = this.fs.readFileSync(pathToFile);
                parsedFiles[code] = this.buildDocuments(data);
                pathToFiles[code] = pathToFile;
            }.bind(this));

            this.result = { pathToFiles, parsedFiles };

            return this;

        } catch (error) {
            throw new FilesEventExceptions(error.message);
        }
    }

    /**
     * Prepare the doc for the update in ES
     * The cyclomatic complexity of this function is very high 'cause the json we receive is quite complex.
     *
     * @param data
     */
    buildDocuments(data)
    {
        let documents = JSON.parse(this.iconv.decode(data, this.jsonDecoding));
        var manufacturer, pipetteSeries, specification, productsFamily = [];

        this.__.mapValues(documents, (brand) => { // first level brand
            manufacturer = brand.name;
            this.__.mapValues(brand.children, (children) => { //second level brand children
                pipetteSeries = children.name;
                this.__.mapValues(children.children, (products) => { // third level brand children skus
                    specification = products.name;

                    if(products.Article === '') { // Some articles does not have skus on it
                        return;
                    }

                    let productSkus = products.Article.split(','); // convert string to array

                    // Push all the info into the current family
                    productsFamily.push(
                        this.prepareTipFinderData({
                            productSkus,
                            manufacturer,
                            pipetteSeries,
                            specification
                        })
                    );

                });
            });
        });

       return productsFamily;

    }

    /**
     *
     * @param productSkus
     * @param manufacturer
     * @param pipetteSeries
     * @param specification
     * @returns {*[]}
     */
    prepareTipFinderData({ productSkus, manufacturer, pipetteSeries, specification })
    {
        let data =[];
        for(const sku of productSkus) {
          let esSku = sku.replace(/^SL/g, ''); // in ES the SL prefix on the sku' does not exists
          data.push(
              {
                sku: esSku,
                data: {
                    manufacturer: this.stripTags(manufacturer, [], ' ').trim(), // replace tags with spaces
                    pipette_series: this.stripTags(pipetteSeries, [], ' ').trim(), // replace tags with spaces
                    specification: this.stripTags(specification, [], ' ').replace('', '-').trim() // remove special char
                }
              }
          );
        }

        return data;
    }

}
module.exports = parser;