<?php

ini_set('display_errors', 'off'); 


/*$file_audio  = $_GET["file_audio"];
$file_xml  = $_GET["file_xml"];*/

$id = $_GET["id_sound"];
$num_s    = $_GET["num_s"];

	
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
			   }


/*$start et $end*/


$diff = $end - $start;
$tmp = tempnam("/tmp", "mediacut_");
unlink($tmp);

$tmpfname = "$tmp.wav";
if (ereg ("\.mp4$", $file_audio, $regs)) {
	$tmpfname = "$tmp.mp4";
}

//supression des fichiers presentes depuis plus de 5 minutes
$now = time();
foreach (glob("/tmp/mediacut*.*") as $filename) {
   if ($now > filemtime($filename) + (60*5)) {
   	unlink($filename);
   }
}


if (ereg ("([0-9]+)(\.([0-9]+))?", $start, $regs)) {
	$part_ent      = $regs[1];
	$part_dec     = $regs[3];
	$m = (int)($part_ent / 60); 
	$s = $part_ent % 60;
	$h = (int)($m / 60); 
	$m = $m % 60;
	if ($h < 10) {$hh = "0$h";} else {$hh = $h;}
	if ($m < 10) {$mm = "0$m";} else {$mm = $m;}
	if ($s < 10) {$ss = "0$s";} else {$ss = $s;}
	$debut = "$hh:$mm:$ss.$part_dec";
}
if (ereg ("([0-9]+)(\.([0-9]+))?", $diff, $regs)) {
	$part_ent      = $regs[1];
	$part_dec     = $regs[3];
	$m = (int)($part_ent / 60); 
	$s = $part_ent % 60;
	$h = (int)($m / 60); 
	$m = $m % 60;
	if ($h < 10) {$hh = "0$h";} else {$hh = $h;}
	if ($m < 10) {$mm = "0$m";} else {$mm = $m;}
	if ($s < 10) {$ss = "0$s";} else {$ss = $s;}
	$duration = "$hh:$mm:$ss.$part_dec";
}


if (ereg ("\.wav$", $file_audio, $regs) or ereg ("\.WAV$", $file_audio, $regs)) {
	shell_exec("ffmpeg -i $file_audio -ss $debut -t $duration $tmpfname");
	header("Expires: 0\n");
	header("Content-type: audio/x-wav;\n");
	header("Content-Transfer-Encoding: binary");
	$len = filesize($tmpfname);
	header("Content-Length: $len;\n");
	$outname="downfile.wav";
	header("Content-Disposition: inline; filename=\"$outname\";\n\n");

	readfile($tmpfname);
}



unlink($tmpfname);

?>
