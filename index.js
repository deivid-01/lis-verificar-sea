'use strict'
//#region Libraries

const express = require('express')
const bodyParser = require('body-parser')
//#endregion

//#region Settings
const app = express()
const port = process.env.port || 5000
//#endregion

//#region Middewares
app.use(bodyParser.urlencoded({ extended: false }))
//Admitir mensajes en formato de mensaje tipo Json
app.use(bodyParser.json())
//#endregion

//#region  POST Request

app.use('/api/',require('./routes/validation.routes'));

//#endregion

//#region Listener 
app.listen(port, function () {
    console.log(`The app is listening on the port :${port}`)
})
//#endregion