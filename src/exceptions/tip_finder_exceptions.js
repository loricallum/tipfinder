class tip_finder_exceptions extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * The sftp exceptions
 */
class SftpEventExceptions extends tip_finder_exceptions {
    constructor(message) {
        super(message);
    }
}

/**
 * The files reader exceptions
 */
class FilesEventExceptions extends tip_finder_exceptions {
    constructor(message) {
        super(message);
    }
}

/**
 * Elastic search exceptions
 */
class ElasticSearchEventExceptions extends tip_finder_exceptions {
    constructor(message) {
        super(message);
    }
}

/**
 * Usher exceptions
 */
class UsherEventExceptions extends tip_finder_exceptions {
    constructor(message) {
        super(message);
    }
}

module.exports = {
    SftpEventExceptions,
    FilesEventExceptions,
    ElasticSearchEventExceptions,
    UsherEventExceptions
};