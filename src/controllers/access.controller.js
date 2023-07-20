'use strict'

const AccessService = require("../services/access.service")
const {Created, SuccessResponse} = require("../core/success.response");

class AccessController {

    handleRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: 'Refresh token successfully!',
            metadata: await AccessService.handleRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            }),
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login successfully!',
            metadata: await AccessService.login(req.body),
        }).send(res)
    }
    signUp = async (req, res, next) => {
        new Created({
            message: 'Registered successfully!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 1,
            }
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout successfully!',
            metadata: await AccessService.logout(req.keyStore),
        }).send(res)
    }
}

module.exports = new AccessController