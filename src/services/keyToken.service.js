'use strict'

const keytokenModel = require("../models/keytoken.model")
const {Types} = require("mongoose");

class KeyTokenService {

    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
        try {

            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // })
            //
            // return tokens ? tokens.publicKey : null

            const filter = {user: userId},
                update = {
                    publicKey,
                    privateKey,
                    refreshTokenUsed: [],
                    refreshToken
                },
                options = {upsert: true, new: true}
            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    static removeKeyById = async (id) => {
        return keytokenModel.deleteOne(id);
    }

    static findByUserId = async (userId) => {
        let uid = new Types.ObjectId(userId)
        let keyStore = await keytokenModel.findOne({user: uid}).lean();
        // console.log(keyStore)
        return keyStore
    }
}

module.exports = KeyTokenService