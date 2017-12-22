var system = require('system');
var webPage = require('webpage');

var username = system.args[1];
var password = system.args[2];
var Link = system.args[3];

var first = Date.now();
var url = Link + '?fd=1';
var steps = [];
var testindex = 0;
var loadInProgress = false; //This is set to true when a page is still loading
var page = webPage.create();
var All = [];
var last = [];
var chronos = [];
var generalAverages = [];
var homework = [];
var schedules = [];


page.viewportSize = {
    width: 1280,
    height: 720
};

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.loadImages = false; //Faster
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true; //Need it

steps = [

    function() {

        page.open(url, function(status) {//Openning webpage

        });

    },
    function() {

        page.evaluate(function(username, password) {//Login

            localStorage.OPTIONS_ESPACE_PRONOTE = JSON.stringify({
                modeA_3: false
            });

            var inputs = document.querySelectorAll('input');
            inputs[0].value = username;
            inputs[1].value = password;
            var blurEvent = new Event('blur');
            var keyupEvent = new Event('keyup');
            inputs[0].dispatchEvent(keyupEvent);
            inputs[0].dispatchEvent(blurEvent);
            inputs[1].dispatchEvent(keyupEvent);
            inputs[1].dispatchEvent(blurEvent);
            inputs[2].onclick();

        }, username, password);

    },
    function() {

        page.evaluate(function() {//Find button and clicking it

            var link = Array.prototype.slice.call(document.getElementsByTagName('li')).filter(function(elem) {
                return elem.getAttribute('aria-label') === 'Détail des notes';
            })[0];
            link.focus();
            link.click();

        });

    },
    function() {

        All = page.evaluate(function() {//Getting marks
			try{
            return GInterface.Instances[1].Instances[1].Donnees.Donnees.ListeElements;
			}catch(e){}

        });

    },
    function() {

        last = page.evaluate(function() {//Getting last marks
			
		document.querySelectorAll('label.AvecMain.NoWrap.EspaceGauche10')[1].click();
				
		var chronology = [];
		try{
		var lastMarks = GInterface.Instances[1].Instances[1].Donnees.Donnees.ListeElements;
		
		for(g = 0; g < lastMarks.length; g++){
						
			if(lastMarks[g].Libelle === ""){

				chronology.push(JSON.parse('{"subject":"' + lastMarks[g].pere.Libelle + '","mark":' + parseFloat(lastMarks[g].note.note.replace(",", ".")) + ', "maxMark":' + parseFloat(lastMarks[g].noteMax.note.replace(",", ".")) + ', "minMark":' + parseFloat(lastMarks[g].noteMin.note.replace(",", ".")) + ', "over":' + parseFloat(lastMarks[g].bareme.note.replace(",", ".")) + ', "coefficient":' + parseFloat(lastMarks[g].coefficient) + ', "classAverage":' + parseFloat(lastMarks[g].moyenne.note.replace(",", ".")) + ', "name":"' + lastMarks[g].commentaire + '", "date":{"year":' + parseInt(((new Date(lastMarks[g].date)).getFullYear())) + ',"month":' + parseInt(((new Date(lastMarks[g].date)).getMonth() + 1)) + ', "day":' + parseInt(((new Date(lastMarks[g].date)).getUTCDate() + 1)) + '}}'));				
				
			}
			
		}
		
			return chronology;
		}catch(e){}
			
        });
		
		if(last == null){
			
			last = [];
			
		}
		
		generalAverages = page.evaluate(function() {//Getting general averages
			try{
     		return JSON.parse('{"average":' + GInterface.Instances[1].donnees.moyenneGenerale.note.valeur + ', "classAverage":' + GInterface.Instances[1].donnees.moyenneGenerale.noteClasse.valeur + '}');
			}catch(e){}
        });
		
		if(generalAverages == null){
			
			generalAverages = [];
			
		}
				
    },
	function(){
				
		page.evaluate(function(){
			
		    var link = Array.prototype.slice.call(document.getElementsByTagName('li')).filter(function(elem) {
                return elem.getAttribute('aria-label') === 'Travail à faire';
            })[0];
            link.focus();
            link.click();
			
		});
				
	},
	function(){
		
		homework = page.evaluate(function(){
			
			return GInterface.Instances[1].ListeTravailAFaire.ListeElements;
			
		});
			
	},
	function(){
		
		page.evaluate(function(){
		
			Array.prototype.slice.call(document.getElementsByTagName('li')).filter(function(elem) {
				return elem.getAttribute('aria-label') === 'Emploi du temps';
			})[0].click();
		
		});
	
	},
	function(){
		
		schedules = page.evaluate(function(){
			
			var schedules = GInterface.Instances[1].Instances[1].Instances[0].ListeCours.ListeElements;
			var Schedules = [];
			
					
		function getDayName(nn){
			
			var arr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			return arr[nn];
			
		}
		
		function getMonthName(nn){
			
			var arr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			return arr[nn];
			
		}
			
		schedules[0].ListeContenus.ListeElements[0].Libelle;
		
			for(j = 0; j < schedules.length; j++){
			
				Schedules.push({"date":{"day":(new Date(schedules[j].DateDuCours)).getUTCDate(), "month":(new Date(schedules[j].DateDuCours)).getMonth() + 1, "year":(new Date(schedules[j].DateDuCours)).getFullYear(), "dayName":getDayName((new Date(schedules[j].DateDuCours)).getDay()), "monthName":getMonthName((new Date(schedules[j].DateDuCours)).getMonth())}, "start":schedules[j].Debut, "end":schedules[j].Fin, "content":[]});
				
				for(k = 0; k < schedules[j].ListeContenus.ListeElements.length; k++){
					
					Schedules[j].content.push(schedules[j].ListeContenus.ListeElements[k].Libelle);
					
				}
			
			}
		
		if(Schedules.length < 1){
			return [];
			
		}else{
		
		return Schedules;
		}

		});
	}
];

function executeRequestsStepByStep() {

    var hasLoaded = page.evaluate(function() {//Detect if there is a blocking element on the page or loading thing

        if (document.querySelectorAll('#id_1_bloquer').length > 0) {

            if (document.querySelector('#id_1_bloquer').style.display == 'none') {

                return true;

            } else {

                return false;

            }

        } else {

            return true;

        }

    });

    if (loadInProgress == false && typeof steps[testindex] == "function" && hasLoaded == true) {
		
		console.log('r' + testindex);

        if (testindex == 1) {

            var haveSpawned = page.evaluate(function() {//Wait for login inputs to apear

                return document.querySelectorAll('input').length > 2;

            });


            if (haveSpawned) {

                steps[testindex]();
                testindex++;

            }

        } else {

            steps[testindex]();
            testindex++;

        }
    }

    if (typeof steps[testindex] != "function") {//When finished
		console.log('rr' + testindex);
        mixAll(All); //Mix and clear data
		
		clearInterval(interval);
        //phantom.exit(); //Exit program
    }

}

if(typeof username == "undefined" || typeof Link == "undefined" || typeof password == "undefined"){

var finalResult = {};
finalResult.loginSuccess = false;
finalResult.error = "Info missing.";
console.log(JSON.stringify(finalResult));

}else{

interval = setInterval(executeRequestsStepByStep, 1);
	
}

function mixAll(array) {

    var b = 0;
    var subjects = [];
    var finalResult = {};
	var Schedules = [];

    if (array != null){

        for (var a = 0; a < array.length; a++) {//Getting infos about subjects

            if (array[a].Libelle != "") {

                subjects[b] = JSON.parse('{"name":"' + array[a].Libelle + '", "marks":[], "averages":{"average":' + parseFloat(array[a].moyEleve.note.replace(",", ".")) + ', "maxAverage":' + parseFloat(array[a].moyMax.note.replace(",", ".")) + ', "minAverage":' + parseFloat(array[a].moyMin.note.replace(",", ".")) + ', "classAverage":' + parseFloat(array[a].moyClasse.note.replace(",", ".")) + '}}');
                b++;

            }

        }

        var c = -1;
        var f = 0;

        for (var a = 0; a < array.length; a++) {

            if (array[a].hasOwnProperty('pere')) {//Getting infos about marks

                subjects[c].marks[f] = JSON.parse('{"marks":{"mark":' + parseFloat(array[a].note.note.replace(",", ".")) + ', "maxMark":' + parseFloat(array[a].noteMax.note.replace(",", ".")) + ', "minMark":' + parseFloat(array[a].noteMin.note.replace(",", ".")) + ', "over":' + parseFloat(array[a].bareme.note.replace(",", ".")) + ', "coefficient":' + parseFloat(array[a].coefficient) + '}, "classAverage":' + parseFloat(array[a].moyenne.note.replace(",", ".")) + ', "name":"' + array[a].commentaire + '", "date":{"year":' + parseInt(((new Date(array[a].date)).getFullYear())) + ',"month":' + parseInt(((new Date(array[a].date)).getMonth() + 1)) + ', "day":' + parseInt(((new Date(array[a].date)).getUTCDate() + 1)) + '}}');
                f++;

            } else {

                c++;
                f = 0;

            }

        }
		
	}else{
		
		
		finalResult.subjects = [];
		
	}
	
	if(homework != null){
		
		var Homework = [];
		
		for(var h = 0; h < homework.length; h++){
			
			Homework.push({"given":{"year":new Date(homework[h].DonneLe).getFullYear(), "month":new Date(homework[h].DonneLe).getMonth() + 1, "day":new Date(homework[h].DonneLe).getUTCDate() + 1}, "for":{"year":new Date(homework[h].PourLe).getFullYear(), "month":new Date(homework[h].PourLe).getMonth() + 1, "day":new Date(homework[h].PourLe).getUTCDate() + 1}, "subject":homework[h].Matiere.Libelle, "text":homework[h].descriptif.replace('<div>','').replace('</div>','')});
			
		}
		
	}
		
		function convert(timestamp){
			
			var dt = new Date(timestamp);
			var sec = dt.getSeconds();
			var millis = dt.getMilliseconds();
			
			var rs = {
				
				"seconds":sec,
				"milliseconds":millis
			
			}
			
			return rs;
			
		}
		
		var stats = {
			
			"started":first,
			"finished":Date.now(),
			"timestamp":Date.now() - first,
			"converted":convert(Date.now() - first)
			
		}
		
        finalResult = {

            "loginSuccess": true,
            "subjects": subjects,
			"generalAverages":generalAverages,
			"chronology":last,
			"homework":Homework,
			"schedules":schedules,
			"stats":stats

        }

        console.log(JSON.stringify(finalResult).replace(/'/g, "\\'"));
    

}

page.onLoadStarted = function() {
    loadInProgress = true;
};
page.onLoadFinished = function() {
    loadInProgress = false;
};
