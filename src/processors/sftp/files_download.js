/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');

const Utilities     = require('../../misc/utilities');

const { SftpEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class files_download extends processor_interface
{
    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.source = Utilities.buildPath([
            this.environment.sftp.tipFinderPath,
            this.environment.tipfinder.newFolderName
        ]);
        this.destination = Utilities.buildPath([
            this.environment.tipfinder.folderName,
            this.environment.tipfinder.newFolderName
        ]);
    }

    /**
     * Executes the processor
     * @param lastProcessor
     * @returns {Promise<files_download>}
     */
    async run(lastProcessor) {
        try {

            const sftpClient = lastProcessor.getResult();

            await sftpClient.downloadDir(this.source, this.destination);

            this.result = this.destination;
            return this;
        } catch (error) {
            throw new SftpEventExceptions(error.message);
        }
    }
}
module.exports = files_download;