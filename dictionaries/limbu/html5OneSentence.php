<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<script type="text/javascript">

    var before     = 0;
function getplayer(id) {
	var player = document.getElementById('player');
	return player;
}

function boutonStop() {
	getplayer('player').pause();
	
}


function playOne(start,end) {
/*	document.write("<B>start</B> " + start);*/
/*	document.write("<B>end</B> " + end);*/
/*	var time = start/1000;*/
	var starttime = start*1000/60;
	var endtime = end*1000/60;
	var duration = (end-start)*1000;
	/*document.write("<B>start</B> " + starttime);*/
	/*document.write("<B>endtime</B> " + endtime);*/
	/*document.write("<B>stoptime</B> " + stoptime);*/
	var player = getplayer('player');
	if (player) {	
	/*document.write("<B>coucou</B> ");*/
		/*player.addEventListener("seeked", function() { player.play(); }, true);*/

   player.addEventListener("play", function() {player.currentTime = start; }, true);
player.addEventListener("canplay", function() {
  player.play();}, true);
 

    /*player.play();*/
/*player.addEventListener("load",player.play(),true);			*/
		/*setposition('player',starttime);*/

		/*player.addEventListener("timeupdate", timeUpdate, true);  */
	
	
	setTimeout(function() { player.pause() }, duration);
/*	stoptime=end-start+0.1;
	setTimeout(function() { player.pause() }, stoptime);
		if (player.currentTime>=end){
			getplayer('player').pause();
		
			}*/
	
	}
		
	
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
</script>

</head>
<body onBlur="self.close();">


<link rel="stylesheet" type="text/css" href="DicoStyle.css">



<?php

ini_set('display_errors', 'off'); 

/*echo "coucou\n";*/

/*$file_audio  = $_GET["file_audio"];
$file_xml  = $_GET["file_xml"];*/

$num_s=  isset($_GET["num_s"])    ? utf8_encode($_GET["num_s"])    : "*";
$id=  isset($_GET["id"])    ? utf8_encode($_GET["id"])    : "*";


/*echo ("$num_s\n");
echo ("on a : $id\n");*/

	
			 $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textInfo.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('../tools/metadata_lacito.xml');
			  
			   if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$file_audio  = $XML->file_audio;
					$file_xml = $XML->file_xml;
			   }



 			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('getStartEnd.xsl');
			  
			  $xp->setParameter('', 'num_s', $num_s);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load($file_xml);
			  
			   if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$start  = $XML->s_start;
					$end = $XML->s_end;
					$form  = $XML->s_form;
					$transl = $XML->s_transl;
			   }


/*echo ("$file_audio\n");*/
echo"<div>\n";
echo"<p>\n";

echo"<audio id=\"player\" name=\"player\" preload=\"auto\">\n";
			echo"<source src=$file_audio type=\"audio/x-wav\"/>\n";
			echo"Your browser does not support the audio tag \n";
		echo"</audio>\n";

echo"</p>\n";

echo"<script language=\"Javascript\">playOne($start,$end)</script>\n";

echo"<div>Transcription :<span class=\"transcription\"> $form </span></div>\n";
echo("</br>");
echo"<div>Translation : <span class=\"translation\"> $transl </span></div>\n";

echo"</p>\n";
echo"</div>\n";;
 /*echo "<script>playOne($start,$end)</script>\n";*/
 /*playOne($start,$end);*/



/*echo("<a href=\"html5OneSentence.php?num_s=$num_s&amp;id_sound=$id\" onClick=\"window.open(this.href,'popupLink','width=500,height=500,scrollbars=yes,resizable=yes',1);return false\"><img src=\"../../images/icones/sound1.gif\" width=\"20\" height=\"22\"> </a>\n");*/
 ?>      




</body>
</html>      
   