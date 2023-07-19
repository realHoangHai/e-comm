'use strict'

const StatusCode = {
    Ok: 200,
    Created: 201,
}

const Reason = {
    Ok: "Success",
    Created: "Created",
}

class SuccessResponse {

    constructor({message, statusCode = StatusCode.Ok, reason = Reason.Ok, metadata = {}}) {
        this.message = !message ? reason : message
        this.status = statusCode
        this.metadata = metadata
    }

    send(res, headers = {}) {
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({message, metadata}) {
        super({message, metadata})

    }
}

class Created extends SuccessResponse {
    constructor({ options = {}, message, statusCode = StatusCode.Created, reason = Reason.Created, metadata}) {
        super({message, statusCode, reason, metadata})
        this.options = options
    }
}

module.exports = {
    OK,
    Created,
    SuccessResponse
}