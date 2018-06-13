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
$lieu = $_GET["lieu"];
$chercheurs    = $_GET["chercheurs"];
$sponsor    = $_GET["sponsor"];

$date_courante = date('Y-m-d');


$lg=str_replace("\'","'",$lg) ;
$titre=str_replace("\'","'",$titre) ;


if ($lg=="Croate du Burgenland"){
	echo "Breu, W., Meinzer, J., Scholze, L. &Utschitel, M. 2013. Oral texts in Burgenland Croatian (Austria).In Adamou, E., Breu, W., Drettas, G. & Scholze, L. (eds.). 2013. EuroSlav2010: Elektronische Datenbank bedrohter slavischer Varietäten in nichtslavophonen Ländern Europas – Base de données électronique de variétés slaves menacées dans des pays européens non slavophones. Konstanz: Universität / Paris: Lacito (Internet Publication).
http://lacito.vjf.cnrs.fr/pangloss/corpus/Croate%20du%20Burgenland.htm
";
}
elseif ($lieu=="Acquaviva"){
	echo "Breu, W., Mader Skender, M. B. & Piccoli, G. 2013. Oral texts in Molise Slavic (Italy): Acquaviva Collecroce.In Adamou, E., Breu, W., Drettas, G. & Scholze, L. (eds.). 2013. EuroSlav2010: Elektronische Datenbank bedrohter slavischer Varietäten in nichtslavophonen Ländern Europas – Base de données électronique de variétés slaves menacées dans des pays européens non slavophones. Konstanz: Universität / Paris: Lacito (Internet Publication).
http://lacito.vjf.cnrs.fr/pangloss/corpus/Na-na%C5%A1u&lieu=Acquaviva.htm
";
}
elseif ($lieu=="Montemitro"){
	echo "Breu, W., Mader Skender, M. B. & Piccoli, G. 2013. Oral texts in Molise Slavic (Italy): Montemitro.In Adamou, E., Breu, W., Drettas, G. & Scholze, L. (eds.). 2013. EuroS-lav2010: Elektronische Datenbank bedrohter slavischer Varietäten in nichtslavophonen Ländern Europas – Base de données électronique de variétés slaves menacées dans des pays européens non slavophones. Konstanz: Universität / Paris: Lacito (Internet Publication).
http://lacito.vjf.cnrs.fr/pangloss/corpus/Na-na%C5%A1u&lieu=Montemitro.htm
";
}
elseif ($lieu=="San Felice"){
	echo "Breu, W., MaderSkender, M. B. & Piccoli, G. 2013. Oral texts in Molise Slavic (Italy): San Felice del Molise.InAdamou, E., Breu, W., Drettas, G. & Scholze, L. (eds.). 2013. EuroSlav2010: Elektronische Datenbank bedrohter slavischer Varietäten in nichtslavo-phonen Ländern Europas – Base de données électronique de variétés slaves menacées dans des pays européens non slavophones. Konstanz: Universität / Paris: Lacito (Internet Publication).
http://lacito.vjf.cnrs.fr/pangloss/corpus/Na-na%C5%A1u&lieu=San%20Felice.htm

";
}
elseif ($lg=="Sorabe supérieur (courant)"){
	echo "Breu, W.,  Scholze, L. &Utschitel, M. 2013. Oral texts in Colloquial Upper Sorbian (Germany).InAdamou, E., Breu, W., Drettas, G. & Scholze, L. (eds.). 2013. EuroS-lav2010: Elektronische Datenbank bedrohter slavischer Varietäten in nichtslavophonen Ländern Europas – Base de données électronique de variétés slaves menacées dans des pays européens non slavophones. Konstanz: Universität / Paris: Lacito (Internet Publication). 
http://lacito.vjf.cnrs.fr/pangloss/corpus/Sorabe%20sup%C3%A9rieur%20(courant).htm

";
}


else {

if ($chercheurs!=""){
echo "$chercheurs. ";
}


echo "$lg corpus. ";



echo " Pangloss Collection, LACITO-CNRS. ";

if ($sponsor!=""){
	echo "$sponsor, ";
}
echo "http://lacito.vjf.cnrs.fr/pangloss/corpus/$lg. ";



echo "Accessed $date_courante";


}
 ?>      




</body>
</html>      
   