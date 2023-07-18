require('dotenv').config()
const compression = require('compression')
const express = require('express')
const {default: helmet} = require('helmet')
const morgan = require('morgan')
const app = express()

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// init database
require('./dbs/init.mongodb')
// const { checkOverload } = require('./helpers/check.connection')
// checkOverload()

// init routers
app.use('', require('./routes'))

// handle errors

module.exports = app