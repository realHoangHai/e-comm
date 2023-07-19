'use strict'

const StatusCode = {
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    Conflict: 409
}

const Reason = {
    BadRequest: 'Bad Request',
    Unauthorized: 'Unauthorized',
    Forbidden: 'Forbidden',
    Conflict: 'Conflict'
}

class ErrorResponse extends Error {

    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = Reason.BadRequest, statusCode = StatusCode.BadRequest) {
        super(message, statusCode);
    }
}

class UnauthorizedRequestError extends ErrorResponse {
    constructor(message = Reason.Unauthorized, statusCode = StatusCode.Unauthorized) {
        super(message, statusCode);
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = Reason.Conflict, statusCode = StatusCode.Forbidden) {
        super(message, statusCode);
    }
}


module.exports = {
    BadRequestError,
    UnauthorizedRequestError,
    ConflictRequestError
}