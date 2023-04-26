/**
 * Lodash module
 *
 * @type {(function(*): (*))|{_?: function(*): (*)}}
 * @private
 */
const __ = require('lodash');

/**
 * Winsoton module
 *
 * @type {winston}
 */
const Winston = require('winston');
const { combine, timestamp, prettyPrint } = Winston.format;

/**
 *config module
 *
 * @type {Config}
 */
const Environment   = require("config");

/**
 * sftp module
 *
 * @type {SftpClient}
 */
const SftpClient = require('ssh2-sftp-client');

/**
 * Statuses module
 *
 * @type {function((string|number)): number}
 */
const statuses = require('statuses');

/**
 * Event emitter
 *
 * @type {EventEmitter}
 */
const events = require('events');

/**
 * Get path
 *
 * @type {path.PlatformPath | path}
 */
const path = require('path');

/**
 * Fs module
 *
 * Node js default file system module
 */
const fs = require('fs');

/**
 * iconv module
 *
 * @type {{"module:iconv-lite", EncoderStream: EncoderStream, Options: Options, DecoderStream: DecoderStream}}
 */
const iconv = require('iconv-lite');

/**
 * Elastic search module
 *
 * @type {{RequestEvent, ApiError, ConnectionPool, Serializer, ClientExtendsCallbackOptions: ClientExtendsCallbackOptions, estypes, errors, CloudConnectionPool, ClientOptions: ClientOptions, RequestParams, ResurrectEvent, Transport, BaseConnectionPool, NodeOptions: NodeOptions, events: {SERIALIZATION: string, REQUEST: string, DESERIALIZATION: string, RESPONSE: string, SNIFF: string, RESURRECT: string}, Connection, ApiResponse, Client: Client}}
 */
const elasticsearch = require('@opensearch-project/opensearch');

/**
 * Get moment module
 *
 * @type {moment | ((inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean) => moment.Moment) | ((inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean) => moment.Moment) | ((inp?: moment.MomentInput, strict?: boolean) => moment.Moment)}
 */
const moment = require('moment');

/**
 * Strip tag module
 * @type {((html: string, allowedTags?: (string | string[]), tagReplacement?: string) => string) | striptags}
 */
const striptags = require('striptags');


/**
 * Class with utilities to use
 */
class Utilities {
    /**
     * Constructor
     */
    constructor() {
        this.lodash = __;
        this.logger = this.loggerInit();
        this.environment = Environment;
        this.events = new events();
        this.statusCodes = statuses;
        this.path = path;
        this.fs = fs;
        this.elasticSearch = elasticsearch;
        this.iconv = iconv;
        this.moment = moment;
        this.stripTags = striptags;
    }

    /**
     *
     * @returns {(function(*): *)|{_?: (function(*): *)}}
     */
    getLodash()
    {
        return this.lodash;
    }

    /**
     *
     * @returns {Logger}
     */
    getLogger(){
        return this.logger;
    }

    /**
     *
     * @returns {Config}
     */
    getEnvironment()
    {
        return this.environment;
    }

    /**
     * Get the sftp Client
     * @returns {*}
     */
    getSftpClient()
    {
        return new SftpClient('tip-finder');
    }

    /**
     * Get event emitter module
     * @returns {module:events.EventEmitter}
     */
    getEvents()
    {
        return this.events;
    }

    /**
     * get path module
     * @returns {path.PlatformPath | path}
     */
    getPath()
    {
        return this.path;
    }

    /**
     * Get Fs module
     * Node js default file system module
     * @returns {module:fs}
     */
    getFs()
    {
        return this.fs;
    }

    /**
     * Get the official elasticsearch package
     *
     * @returns {{RequestEvent, ApiError, ConnectionPool, Serializer, ClientExtendsCallbackOptions: ClientExtendsCallbackOptions, estypes, errors, CloudConnectionPool, ClientOptions: ClientOptions, RequestParams, ResurrectEvent, Transport, BaseConnectionPool, NodeOptions: NodeOptions, events: {SERIALIZATION: string, REQUEST: string, DESERIALIZATION: string, RESPONSE: string, SNIFF: string, RESURRECT: string}, Connection, ApiResponse, Client: Client}}
     */
    getElasticSearch()
    {
        return this.elasticSearch;
    }

    /**
     * Gt the iconv lite node package
     *
     * @returns {{"module:iconv-lite", EncoderStream: EncoderStream, Options: Options, DecoderStream: DecoderStream}}
     */
    getIconv()
    {
        return this.iconv;
    }

    /**
     * Get Moment package
     *
     * @returns {moment | ((inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean) => moment.Moment) | ((inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean) => moment.Moment) | ((inp?: moment.MomentInput, strict?: boolean) => moment.Moment)}
     */
    getMoment()
    {
        return this.moment;
    }

    /**
     * Get strip tag package
     * @returns {(function(string, (string|string[])=, string=): string)|striptags}
     */
    getStripTags()
    {
        return this.stripTags;
    }

    /**
     *
     * @returns {Logger}
     */
    loggerInit()
    {
        return Winston.createLogger({
            format: combine(
                timestamp(),
                prettyPrint()
            ),
            transports: [
                new Winston.transports.Console(),
                new Winston.transports.File({ filename: 'tipfinder.log' })
            ]
        });
    }

    /**
     * Check if an array is empty using lodash
     * @param array
     * @param $variableName
     * @returns {boolean}
     */
    arrayIsEmpty(array, $variableName)
    {
        if(__.isEmpty(array)) {
            throw new Error(`${$variableName} must not be empty`);
        }
        return false;
    }

    // Using a single function to handle multiple signals
    handleExit(signal, channel, error)
    {
        this.logger.log({
            level: 'error',
            channel: channel,
            message: error.message,
            stack: error.stack,
            internalStatus: this.statusCodes(signal)
        });
        tipFinderErrors[channel] = JSON.stringify(error.stack, null, 2);
        console.log('Exit signal received, Please check the log file!');
        process.exitCode = 1;
    }

    /**
     * Build a path to folder or file
     * @returns {string}
     * @param paths
     */
    buildPath(paths = [])
    {
        return paths.join('/');
    }
}
module.exports = new Utilities();