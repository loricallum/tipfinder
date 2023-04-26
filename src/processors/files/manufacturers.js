/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');

const Utilities    = require('../../misc/utilities');

const { FilesEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class manufacturers extends processor_interface
{

    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.fs = Utilities.getFs();
        this.path = Utilities.getPath();
        this.manufacturers = {};
        this.iconv = Utilities.getIconv();
        this.jsonDecoding = this.environment.jsonDecoding;
        this.folderNameInMagentoPub = this.environment.tipfinder.folderNameInMagentoPub;
        this.pathToMagentoPub = this.environment.staticManufacturerFileLocation;
        this.storeCodes = this.environment.storeCodes;
        this.fileNameWithSuffix = this.environment.tipfinder.fileNameWithSuffix;
        this.filesExtension = this.environment.tipfinder.filesPatternFilter;
        this.stripTags = Utilities.getStripTags();
    }

    /**
     * Executes the processor
     *
     * @param lastProcessor
     * @returns {Promise<manufacturers>}
     */
    async run(lastProcessor) {
        try {

            let { pathToFiles, parsedFiles } = lastProcessor.getResult();

            for (const [storeCode, path] of Object.entries(pathToFiles)) {
                let data = this.fs.readFileSync(path);
                let documents = JSON.parse(this.iconv.decode(data, this.jsonDecoding));
                this.manufacturers[storeCode] = documents.map(function(document) {
                     let brand = {};
                     let brandName =  this.stripTags(document.name, [], ' ').trim();
                     brand[brandName] = document.children.map(function(child) {
                         let pipette_series = {};
                         let pipetteSeriesName = this.stripTags(child.name, [], ' ').trim();

                         if(this.areThePipetteSeriesChildrenEmpty(child.children)) { // If all empty continue
                             return;
                         }

                         pipette_series[pipetteSeriesName] = Object.assign(
                             {},
                             this.__.map(child.children, function(children){

                                 if(children.name.includes('null') || children.Article === '') { // This should not be done here but in the source file!
                                     return;
                                 }

                                 return this.stripTags(children.name, [], ' ').replace('', '-').trim();
                             }.bind(this))
                         );
                         return pipette_series;
                     }.bind(this));

                     brand[brandName] = brand[brandName].filter(Boolean);
                     return  brand;
                }.bind(this));
            }

            this.saveTheFilesInMagentoTipFinderFolder();

            this.result = { pathToFiles, parsedFiles };

            return this;

        } catch (error) {
            throw new FilesEventExceptions(error.message);
        }
    }

    /**
     * Check if all the Article children for a pipette series are empty
     *
     * @param children
     * @returns {boolean}
     */
    areThePipetteSeriesChildrenEmpty(children)
    {
        const skus = children.map(function(child) { return child.Article; });
        return skus.filter(Boolean).length <= 0;
    }

    /**
     * Saves the manufacturers als json
     */
    saveTheFilesInMagentoTipFinderFolder()
    {
        for(const [storeCode, fileData] of Object.entries(this.manufacturers)) {
            let fileName = `${this.fileNameWithSuffix}${this.storeCodes[storeCode]}${this.filesExtension}`;
            let fullpath = Utilities.buildPath([
                this.pathToMagentoPub,
                fileName
            ]);
            this.fs.writeFileSync(fullpath, JSON.stringify(fileData));
        }
    }
}
module.exports = manufacturers;
