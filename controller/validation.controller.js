const axios = require('axios')
const controller = {}
var  obstacle = {} ;
var aux = {};
controller.Validate =(req, res) => {
    
    axios.post(`http://172.21.0.131:5000/api/test/consultainformacionacademicamares`, {
        "cedula": req.body.cedula       
    }).then(semesters => {
        
        var category=req.body.categoria;     
        var programa= semesteres.data[0].programa;
        var semestre = semesteres.data[0].semestre;
        var tipoHomolog ="TODAS";
        
        //#region post consultamateriasestudiantemares
        axios.post(`http://172.21.0.131:5000/api/test/consultamateriasestudiantemares`, {
            "cedula": req.body.cedula,
            "programa": programa,
            "semestre": semestre,
            "tipoHomolog":tipoHomolog     
        }).then(actualSemesterSubjects => {

          
            Check(semesters.data,actualSemesterSubjects.data,category,res);
        }).catch(error2 => {     

            res.status(error2.statusCode).send({'ERROR':error2})       
         });
         //#endregion   
        
       
    }).catch(error => {       
        res.status(error.statusCode).send({'ERROR':error})//res.status(404).send({'ERROR':'Cedula mal ingresada o no existe'})       
    });

}
function Check(semesters,actualSemesterSubjects,category,res){

    ToValidatecategory(category,res)
    if (CheckRequirements(semesters,actualSemesterSubjects, category)) {
        res.status(200).send({ message: `El estudiante SI cumple con los requisitos` })
    }
    else {
         res.status(200).send(obstacle)
    }
}



function ToValidatecategory (category,res) {

    if (!(category === "adm") && !(category === "pro")) {

        res.status(404).send({'ERROR':'Categoria mal ingresada'}) 
    }
}

function CheckRequirements(semesters,actualSemesterSubjects, category,res) {

    ResetObstacle(); //reset unmet requirements
    var cT=TotalCredits(semesters, category);//Admin: 20 creditos aprobados,Monitor,40% creditos aprobados
    var cS=ActualSemCred(actualSemesterSubjects);//12 créditos matriculados semestre actual
    var mP= LostSubject(semesters[1]); //No haber perdido materias en el semestre anterior
    var tS=TercioSuperior(semesters[1]); //3.8 o Tercio Superior en el semestre anterior
    var  mA= MinAvarage(semesters[1]); //3.8 o Tercio Superior en el semestre anterior 

   if(!cT || !cS || !mP ||( !tS ||!mA )){
       return false;
   }
   return true;

}
function ActualSemCred(actualSemesterSubjects) {
    
    var total=0;
    actualSemesterSubjects.foreach( function(subject){
        total+=subject.creditos;
    });
    
    if (total < 12) {
        obstacle.creditosSemestreActual = num;
        return false;
    }
    return true;
   
}

function TotalCredits(semesters, category) {

    for (let i = Object.keys(semesters).length - 1; i >= 0; i--) {
 
        if (semesters[i].estadoAlumnoPrograma === 'ACTIVO') {
            if (category === 'adm') {

                var total = semesters[i].creditosfaltantes - semesters[0].creditosfaltantes;

                if (total > 20) {
                    return true;
                }
                obstacle.totalCreditosAprobados;
                return false
            }
            else if ((category === 'pro')) {
                var total = (1 - semesters[0].creditosfaltantes / semesters[i].creditosfaltantes);
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

module.exports = controller;