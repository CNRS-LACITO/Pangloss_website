<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Language" content="fr">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
<?php

ini_set('display_errors', 'off'); 


$lg = $_GET["lg"];
$titre    = $_GET["titre"];
$chercheurs    = $_GET["chercheurs"];
$url_text   = $_GET["url_text"];
$url_sound    = $_GET["url_sound"];
$sponsor    = $_GET["sponsor"];
$id_sound    = $_GET["id"];
$id_text    = $_GET["idref"];
$date_sound    = $_GET["date_sound"];
$date_text    = $_GET["date_text"];

$date_courante = date('Y-m-d');
$date_temp=split("-",$date_sound);
$date_annee=$date_temp[0];

$lg=str_replace("\'","'",$lg) ;
$titre=str_replace("\'","'",$titre) ;


if ($chercheurs!=""){
echo "$chercheurs. ";
}

if ($date_annee!=""){
	echo "$date_annee. ";
}

if ($titre!=""){
	echo "<i>$titre</i>, ";
}

echo "$lg corpus. ";

echo " Pangloss Collection, LACITO-CNRS. ";

if ($sponsor!=""){
	echo "$sponsor, ";
}
echo "http://lacito.vjf.cnrs.fr/pangloss/resource/$id_sound&$id_text. ";



echo "Accessed $date_courante.";



 ?>      




</body>
</html>      
   