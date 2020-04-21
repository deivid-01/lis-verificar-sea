'use strict'
//#region Libraries
const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const validation =require('./controllers/validation.controllers');
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

app.post('/verificardatosestudiante', (req, res) => {

    axios.post(`http://172.21.0.131:5000/api/test/consultainformacionacademicamares`, {
        "cedula": req.body.cedula,
        "categoria": req.body.categoria
    }).then(result => {    
        validation.Validate(result.data,req.body.categoria,res);
    }).catch(error => {       
       res.status(404).send({'ERROR':'Cedula mal ingresada o no existe'})       
    });

})
//#endregion

//#region Listener 
app.listen(port, function () {
    console.log(`The app is listening on the port :${port}`)

})
//#endregion