/**
 *
 * @type {processor_interface}
 */
const { processor_interface } = require('../processor_interface');

/**
 *
 * @type {Utilities}
 */
const Utilities     = require('../../misc/utilities');


const { SftpEventExceptions } = require('../../exceptions/tip_finder_exceptions');


class login extends processor_interface
{

    /**
     * Constructor
     */
    constructor() {
        super();
        this.environment = Utilities.getEnvironment();
        this.opts = {
            host        : this.environment.sftp.host,
            port        : this.environment.sftp.port,
            username    : this.environment.sftp.user,
            password    : this.environment.sftp.password,
            autoClose   : this.environment.sftp.autoClose,
            readyTimeout: this.environment.sftp.readyTimeout,
            retries     : 0
        };

        this.sftp = Utilities.getSftpClient();
    }

    /**
     * Executes the processor
     * @param lastProcessor
     * @returns {Promise<login>}
     */
    async run(lastProcessor) {
        try {
            await this.sftp.connect(this.opts);
            this.result = this.sftp;
            return this;
        } catch (error) {
            throw new SftpEventExceptions(error.message);
        }
    }
}

module.exports = login;