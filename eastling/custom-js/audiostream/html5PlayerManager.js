var before     = 0;
function getplayer(id) {
	var player = document.getElementById('player');
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

function dohighlight(time) {
	for (var i=0;i<timelist_starts.length;i++) {
		var node = document.getElementById(idlist[i]);
		if ((timelist_starts[i]/1000) < time) {
			if ((timelist_ends[i]/1000) > time) {
			
				node.style.backgroundColor="#D9D9F3";
				var elt = node.getElementsByTagName('a');
					
					
     
     			
								
				if (elt) {
					//elt[elt.length -1].focus();
				
				}
			} 
			else {
				node.style.backgroundColor="";
				
				//player.pause();
				
			}
		} else {
			node.style.backgroundColor="";
			
				//player.pause();
				
		}
		
	}

}