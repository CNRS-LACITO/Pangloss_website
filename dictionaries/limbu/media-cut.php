<?php

ini_set('display_errors', 'off'); 


$fichier  = $_GET["file"];
$start    = $_GET["start"];
$end      = $_GET["end"];
$diff = $end - $start;
$tmp = tempnam("/tmp", "mediacut_");
unlink($tmp);

$tmpfname = "$tmp.wav";
if (ereg ("\.mp4$", $fichier, $regs)) {
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


if (ereg ("\.wav$", $fichier, $regs) or ereg ("\.WAV$", $fichier, $regs)) {
	shell_exec("ffmpeg -i $fichier -ss $debut -t $duration $tmpfname");
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

exit(0); 
?>
