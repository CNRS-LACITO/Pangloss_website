var before = 0;
var currentSentenceId = 0;

function getplayer(id) {
	var player = document.getElementById(id);
	return player;
}

function boutonStop() {
	getplayer('player').pause();
}

function playFrom(id) {
	
	var node = document.getElementById('karaoke');
	if (node && node.checked) {
	
	var i=0;
	while ((i<idlist.length) && (idlist[i] != id)) {
		i++;
	}
	var time = timelist_starts[i]/1000;
	var player = getplayer('player');
	if (player) {	
		//player.addEventListener("seeked", placement(player,time), true);
		player.addEventListener("seeked", function() { player.play(); }, true);
		setposition(id,time);
		player.addEventListener("timeupdate", timeUpdate, true);  
	
	//stoptime=timelist_ends[i]-timelist_starts[i];
	//setTimeout(function() { player.pause() }, stoptime*1000);
		/*if (player.currentTime>=timelist_ends[i]){
			getplayer('player').pause();
		
			}*/
	
	}
	
	}
	else {
		playOne(id);
	}
}

function playOne(id) {
var i=0;
	while ((i<idlist.length) && (idlist[i] != id)) {
		i++;
	}
	var time = timelist_starts[i]/1000;

	var player = getplayer('player');
	if (player) {	
		//player.addEventListener("seeked", placement(player,time), true);
		player.addEventListener("seeked", function() { player.play(); }, true);
		setposition(id,time);
		player.addEventListener("timeupdate", timeUpdate, true);  
	
	duration=timelist_ends[i]-timelist_starts[i];
	setTimeout(function() { player.pause() }, duration);
		
	
	}
		
	
}

function playFrom_W(id) {
	var i=0;
	while ((i<idlist.length) && (idlist[i] != id)) {
		i++;
	}
	var time = timelist_starts[i]/1000;

	var player = getplayer('player');
	if (player) {	
		//player.addEventListener("seeked", placement(player,time), true);
		player.addEventListener("seeked", function() { player.play(); }, true);
		setposition(id,time);
		player.addEventListener("timeupdate", timeUpdate, true);  
	
	duration=timelist_ends[i]-timelist_starts[i];
	setTimeout(function() { player.pause() }, duration);
		if (player.currentTime>=timelist_ends[i]){
			getplayer('player').pause();
		
			}
	
	}
		
	
}

function placement(player,time){

	var player = getplayer('player');
	player.currentTime = time;
	
	player.play();
	//dohighlight(time);
	
    dohighlight(player.currentTime);
	
}

function timeUpdate() {  
	var player = getplayer('player');
    dohighlight(player.currentTime);
	  
}  

function setposition(id,time) {
	var player = getplayer('player');
	
	player.currentTime = time;
	
	dohighlight(time);
	 
}

//Fonction ajoutée par Matthew DEO pour surlignage des mots en temps réel
function dohighlight(time) {

	time=time*1000;
                           
    for (var i=0;i<timelist_starts.length;i++) {
        var sentence = $('.eastlingShape#'+idlist[i]).parent().find('.segmentInfo');
        if ((timelist_starts[i]) < time) {
            if ((timelist_ends[i]) > time) {
                    sentence.css('background-color',highlight_color);
                    $(document).scrollTop(sentence.position().top);

                    if(currentSentenceId!=i){
                    	currentSentenceId = i;
                    	console.log(i);
                    }
                    

                    break;
            } 
            else {
                sentence.css('background-color','');
            }
        }
    }

    //surlignage du mot en cours de lecture
    /*
	for (var i=0;i<timewordlist_starts.length;i++) {
		var word = $('#'+idwordlist[i]);
		if ((timewordlist_starts[i]) < time) {

			if ((timewordlist_ends[i]) > time) {
				word.mouseover();
				break;
			} 
			else {
				$('#'+idwordlist[i]).mouseout();
			}
		}
	}
	*/
	var idSentence = idlist[currentSentenceId];

	$.each(timewordlist_starts2[idSentence],function(i){

		if(this < time && timewordlist_ends2[idSentence][i] > time){
			var word = $('#'+idwordlist2[idSentence][i]);
			word.mouseover();
			return false;
			
		}else{
			$('#'+idwordlist2[idSentence][i]).mouseout();
		}
	});


}
