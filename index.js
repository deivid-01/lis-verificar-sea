'use strict'
//#region Libraries
const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
//#endregion

//#region Const Variables
const app = express()
const port = process.env.port || 3000

//#region  aux

var obstacle ;

//#endregion
//#endregion

//#region Wtf? But it works
app.use(bodyParser.urlencoded({ extended: false }))
//Admitir mensajes en formato de mensaje tipo Json
app.use(bodyParser.json())
//#endregion

//#region  POST Request

app.post('/verificardatosestudiante', (req, res) => {

    axios.post(`http://172.21.0.131:5000/api/prod//consultainformacionacademicamares`, {
        "cedula": req.body.cedula,
        "categoria": req.body.categoria
    }).then(result => {

        ToValidateCategoria(req.body.categoria)
        ToValidate(result.data, req.body.categoria, res)

        //res.status(200).send( ) //Show to Front
    }).catch(error => {


        if (error === "categoriaWrong") {
            res.status(404).send({ message: "ERROR: Categoria está mal ingresada. Debes ingresar 'adm'=Auxiliar Administrativo o 'pro'=Monitor / Auxiliar de Programación" });      //error.response.data

        }
        else{
            res.status(404).send({message:"ERROR"})
        }

    });

})
//#endregion Verification Methods

//#region Validation Methods
const ToValidate = (semestres, categoria, res) => {
  
    if (CumpleRequisitos(semestres, categoria)) {
        return res.status(200).send({ message: `El estudiante SI cumple con los requisitos` })
    }
    else {
        return res.status(200).send(obstacle)
    }
}
function ToValidateCategoria(categoria) {

    if (!(categoria === "adm") && !(categoria === "pro")) {

        throw "categoriaWrong"
    }
}

function CumpleRequisitos(semestres, categoria) {

    ResetObstacle();
    var cT=TotalCredits(semestres, categoria);//Admin: 20 creditos aprobados,Monitor,40% creditos aprobados
    var cS=ActualSemCred(semestres);//12 créditos matriculados semestre actual
    var mP= LostSubject(semestres[1]); //No haber perdido materias en el semestre anterior
    var tS=TercioSuperior(semestres[1]); //3.8 o Tercio Superior en el semestre anterior
    var  mA= MinAvarage(semestres[1]); //3.8 o Tercio Superior en el semestre anterior
 

   if(!cT || !cS || !mP ||( !tS ||!mA )){
       return false;
   }
   return true;

}
function ActualSemCred(semestres) {
    var num = semestres[1].creditosfaltantes - semestres[0].creditosfaltantes;
    if (num < 12) {
        obstacle.creditosSemestreActual = num;
        return false;
    }
    return true;
   


}

function TotalCredits(semestres, categoria) {

    for (let i = Object.keys(semestres).length - 1; i >= 0; i--) {

        if (semestres[i].estadoAlumnoPrograma === 'ACTIVO') {


            if (categoria === 'adm') {

                var total = semestres[i].creditosfaltantes - semestres[0].creditosfaltantes;

                if (total > 20) {
                    return true;
                }
                obstacle.totalCreditosAprobados;
                return false

            }
            else if ((categoria === 'pro')) {
                var total = (1 - semestres[0].creditosfaltantes / semestres[i].creditosfaltantes);
                if (total > 0.4) {
                    return true;
                }
                obstacle.porcentajeDeCreditosAprobados = total * 100;
                return false;
            }


        }

    }






    return false;
}

function LostSubject(semestreAnterior) {

    var num = semestreAnterior.numeroPerdidas
 
    if (num == 0) {
        return true;
    }
    obstacle.numMateriasPerdidas = num;
    return false;
}

function TercioSuperior(semestreAnterior) {

    var ts = semestreAnterior.tercioProgramaNivel;
    if ( ts=="TS") {
        return true;
    }
    obstacle.tercioProgramaNivel=ts;
    return false;
}

function MinAvarage(semestreAnterior) {
    
    var prom = semestreAnterior.promedioSemestre;
    if (prom >= 3.8 ) {
        return true;
    }
    obstacle.promedioSemestre=prom;
    return false;
}
function ResetObstacle(){

    obstacle= {
        message: `El estudiante NO cumple con los requisitos`
    

    }
}

//#endregion

//#region Listener 
app.listen(port, function () {
    console.log(`API REST corriendo casi bien en http://localhost:${port}`)

})
//#endregion