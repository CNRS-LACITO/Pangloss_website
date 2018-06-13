<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<title>Corpus</title>
<link href="styles.css" rel="stylesheet" type="text/css"/>

</head>

<body>

<?php
		
	  $color=  isset($_GET["color"])    ? $_GET["color"]    : "*";
	  $nsim=  isset($_GET["similarity"])    ? $_GET["similarity"]    : "*";
	  $filesim=  isset($_GET["filesim"])    ? $_GET["filesim"]    : "*";
	  
$lg=  isset($_GET["lg"])    ? $_GET["lg"]    : "*";


	  $file=  isset($_GET["file"])    ? $_GET["file"]    : "*";
	  $sentence=  isset($_GET["sentence"])    ? $_GET["sentence"]    : "*";
	  
	
	$file1=  isset($_GET["file1"])    ? $_GET["file1"]    : "*";
	$file2=  isset($_GET["file2"])    ? $_GET["file2"]    : "*";
	$file3=  isset($_GET["file3"])    ? $_GET["file3"]    : "*";
	$file4=  isset($_GET["file4"])    ? $_GET["file4"]    : "*";
	$file5=  isset($_GET["file5"])    ? $_GET["file5"]    : "*";
	$file6=  isset($_GET["file6"])    ? $_GET["file6"]    : "*";
	
	


		/*echo "Similarité : $similarity\n";
		echo "Couleur : $color\n";*/
		
	if(isset($_POST['mot'])){
		$mot=htmlspecialchars($_POST['mot']);
		/*echo "CreateConcordanceOneWord";*/
		CreateConcordanceOneWord($mot);
	 }
	 else{
	 $mot=  isset($_GET["mot"])    ? $_GET["mot"]    : "*";
	 }


			if ($sentence!="" and $sentence!="*"){
					/*echo "ViewOneSentence";*/
					ViewOneSentence($filesim, $file, $sentence, $mot);
				}
			else if ($filesim!=""and $filesim!="*"){
					/*echo "ViewOneSimilarity";*/
					ViewOneSimilarity($filesim, $color, $mot, $file, $file1, $file2, $file3, $file4, $file5, $file6, $nsim);
				}
	
			
			
	
		function viewOneSentence($filesim, $file, $sentence, $mot) {
	
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/listRsc.xsl');
			  $xsl->load('ShowOneSentence.xsl');
			  
			  $xp->setParameter('', 'file', $file);
			  $xp->setParameter('', 'filesim', $filesim);
			   $xp->setParameter('', 'sentence', $sentence);
			   $xp->setParameter('', 'mot', $mot);
			 
			
			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML datat
			  $xml_doc = new DomDocument;
			  //$xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load($filesim);


			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}	
				



function ViewOneSimilarity($filesim, $color, $mot, $file, $file1, $file2, $file3, $file4, $file5, $file6, $nsim) {
	
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/listRsc.xsl');
			  $xsl->load('ShowOneSimilarityWord.xsl');
			  
			   $xp->setParameter('', 'color', $color);
			   
			    $xp->setParameter('', 'file', $file);
			    $xp->setParameter('', 'file1', $file1);
			  $xp->setParameter('', 'file2', $file2);
			  $xp->setParameter('', 'file3', $file3);
			  $xp->setParameter('', 'file4', $file4);
			  $xp->setParameter('', 'file5', $file5);
			  $xp->setParameter('', 'file6', $file6);
			  
			  $xp->setParameter('', 'nsim', $nsim);
			  
			  
			  $xp->setParameter('', 'filesim', $filesim);
			 
			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML datat
			  $xml_doc = new DomDocument;
			  //$xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load($filesim);


			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}	


	?>
</body>
</html>