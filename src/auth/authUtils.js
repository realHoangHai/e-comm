'use strict'

const JWT = require('jsonwebtoken')
const {findByUserId} = require("../services/keyToken.service");
const {UnauthorizedRequestError} = require("../core/error.response");
const asyncHandler = require('../helpers/asyncHandler')
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        })

        // refresh token
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        // 
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`error verify::`, err)
            } else {
                console.log(`decode verify::`, decode)
            }
        })
        return {accessToken, refreshToken}
    } catch (error) {

    }
}

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new UnauthorizedRequestError('Invalid request')

    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new UnauthorizedRequestError('Invalid request')

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new UnauthorizedRequestError('Invalid request')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new UnauthorizedRequestError('Invalid user')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }

})

module.exports = {
    createTokenPair,
    authentication
}