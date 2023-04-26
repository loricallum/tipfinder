/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');

const Utilities     = require('../../misc/utilities');

const { SftpEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class files_search extends processor_interface
{
    /**
     * constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.newFolder = Utilities.buildPath([
            this.environment.sftp.tipFinderPath,
            this.environment.tipfinder.newFolderName
        ]);
        this.filesPatternFilter = this.environment.tipfinder.filesPatternFilter;
    }

    /**
     * Executes the processor
     * @param lastProcessor
     * @returns {Promise<files_search>}
     */
    async run(lastProcessor) {
        try {
            const sftpClient = lastProcessor.getResult();
            const listOfNewFiles = await sftpClient.list(this.newFolder, this.filesPatternFilter);
            if(listOfNewFiles.length > 0) {
               this.result = sftpClient;
            } else {
                sftpClient.end();
                throw new Error('New Folder is empty on the SFTP server');
            }
            return this;
        } catch (error) {
            throw new SftpEventExceptions(error.message);
        }
    }
}
module.exports = files_search;