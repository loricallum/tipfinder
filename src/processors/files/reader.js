/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');

const Utilities    = require('../../misc/utilities');

const { FilesEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class reader extends processor_interface
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
        this.filesPatternFilter = this.environment.tipfinder.filesPatternFilter;
        this.filesWithStoreCodes = this.environment.tipfinder.filesWithStoreCodes;
    }

    /**
     * Executes the processor
     * @param lastProcessor
     * @returns {Promise<reader>}
     */
    async run(lastProcessor) {
        try {
            const pathToNewFolder = lastProcessor.getResult();
            this.__.forEach(this.filesWithStoreCodes, function (file, code) {
                let pathToFile = Utilities.buildPath([pathToNewFolder, file]);
                if(!this.fs.existsSync(pathToFile)) {
                    delete this.filesWithStoreCodes[code];
                }
            }.bind(this));
            this.result = this.filesWithStoreCodes;
            return this;
        } catch (error) {
            throw new FilesEventExceptions(error.message);
        }
    }
}
module.exports = reader;