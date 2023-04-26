/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');
const Utilities = require("../../misc/utilities");

class end extends processor_interface
{
    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.fs = Utilities.getFs();
        this.pathToMagentoPub = this.environment.staticManufacturerFileLocation;
        this.successfullyFlagFileName = this.environment.successfully_flag_file_name;
    }

    /**
     * Runs the processor
     * @param lastProcessor
     * @returns {Promise<void>}
     */
    async run(lastProcessor) {

        let fullpath = Utilities.buildPath([
            this.pathToMagentoPub,
            this.successfullyFlagFileName
        ]);

        if(Object.keys(tipFinderErrors).length === 0 ) { // everything ok! create the file
            this.fs.writeFileSync(fullpath, '');
        } else { // somethng went wrong! delete the file
            this.fs.unlinkSync(fullpath);
        }

        //The process was successful
        process.exit(0);

    }

}
module.exports = end;