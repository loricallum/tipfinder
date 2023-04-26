/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');
const Utilities = require("../../misc/utilities");
const { UsherEventExceptions } = require('../../exceptions/tip_finder_exceptions');

class usher extends processor_interface
{

    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.__ = Utilities.getLodash();
        this.fs = Utilities.getFs();
        this.moment = Utilities.getMoment();
        this.folderName = this.environment.tipfinder.folderName;
        this.newFolderName = this.environment.tipfinder.newFolderName;
        this.doneFolderName = this.environment.tipfinder.doneFolderName;
        this.errorFolderName = this.environment.tipfinder.errorFolderName;
    }

    /**
     *
     * @param lastProcessor
     * @returns {Promise<usher>}
     */
    async run(lastProcessor) {

        try {
            const { filesLocation } = lastProcessor.getResult();

            this.createDirectories();

            for(const path in filesLocation) {
                let oldPath = path;
                let newPath;

                newPath = (filesLocation[path]) ? path.replace(this.newFolderName, this.doneFolderName)
                    : path.replace(this.newFolderName, this.errorFolderName);

                this.moveFileToFolder({ oldPath, newPath });

            }

            return this;

        } catch (error) {
            throw new UsherEventExceptions(error.message);
        }
    }

    /**
     * Create the done and error folder if they not exists
     */
    createDirectories()
    {
        for( const directory of [this.doneFolderName, this.errorFolderName].values()) {
            let fullPath = Utilities.buildPath([this.folderName, directory]);
            if (!this.fs.existsSync(fullPath)){
                this.fs.mkdirSync(fullPath);
            }
        }
    }

    /**
     * Move the file to the correct folder
     *
     * @param oldPath
     * @param newPath
     */
    moveFileToFolder({ oldPath, newPath })
    {
        // Add current date + time to the parsed file
        newPath = newPath + this.moment(Date.now()).format('_YYYY.MM.DD_hh:mm:ss');
        this.fs.rename(oldPath, newPath, function (err) {
            if (err) throw err;
            console.log(`File successfully moved from ${oldPath} to ${newPath}`);
        });
    }
}
module.exports = usher;