'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const {createTokenPair, verifyJWT} = require("../auth/authUtils")
const {getInfoData} = require("../utils");
const {ConflictRequestError, BadRequestError, UnauthorizedRequestError} = require("../core/error.response");
const {findByEmail} = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /*
     * Refresh token
     * 1. Check this token used
     */
    static handleRefreshToken = async (refeshToken) => {
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refeshToken)
        if (foundToken) {
            // decode to check who is the user
            const { userId, email } = await verifyJWT(refeshToken, foundToken.privateKey)
            console.log({userId, email})
            // delete
            await KeyTokenService.deleteKeyById(userId)
            throw new ConflictRequestError('Something wrong happened! Please try to login again.')
        }

        // No token found
        const holderToken = await KeyTokenService.findByRefreshToken(refeshToken)
        if (!holderToken) throw new UnauthorizedRequestError('Shop not registered')

        // verify token
        const { userId, email } = await verifyJWT(refeshToken, holderToken.privateKey)
        // check user_id
        const foundShop = await findByEmail({email})
        if (!foundShop) throw new UnauthorizedRequestError('Shop not registered')

        // create token pairs
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokenUsed: refeshToken // đã đc sử dụng để lấy token mới
            }
        })

        return {
            user: {userId, email},
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey
    }
    /*
     * Login
     * 1. check email exists
     * 2. match password
     * 3. create access token (at) and refresh token (rt) and save
     * 4. generate tokens
     * 5.return data
     */
    static login = async ({email, password, refreshToken = null}) => {
        const foundShop = await findByEmail({email})
        if (!foundShop) throw new BadRequestError('Email not found')

        const match = bcrypt.compare(password.toString(), foundShop.password)
        if (!match) throw new UnauthorizedRequestError('Invalid password')

        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        const {_id: userId} = foundShop
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId,
            privateKey,
            publicKey,
            refreshToken: tokens.refreshToken,
        })

        return {
            shop: getInfoData(['_id', 'name', 'email'], foundShop),
            tokens
        }
    }

    static signUp = async ({name, email, password}) => {
        // step 1: check email exists?
        const holderShop = await shopModel.findOne({email}).lean()

        if (holderShop) {
            throw new ConflictRequestError('Email already exists')
        }

        const passwordHash = await bcrypt.hash(password.toString(), 10)

        // step 2: create a new shop
        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // create privateKey, publicKey
            // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     }
            // })
            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            console.log({privateKey, publicKey}) // save collection KeyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            })

            if (!keyStore) {
                throw new ConflictRequestError('Failed to create key')
            }

            // create a token pair
            const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
            console.log(`Create token success::`, tokens)

            return {
                shop: getInfoData(['_id', 'name', 'email'], newShop),
                tokens
            }
        }

        return {}
    }

}

module.exports = AccessService