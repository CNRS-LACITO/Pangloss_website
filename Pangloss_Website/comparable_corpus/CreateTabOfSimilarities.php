<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<title>Corpus</title>
<link href="styles.css" rel="stylesheet" type="text/css"/>

</head>

<body>

<!-- Body -->
<div class="container">
	
	
      <?php
		

	
	$filesim=  isset($_GET["filesim"])    ? $_GET["filesim"]    : "*";
	$file1=  isset($_GET["file1"])    ? $_GET["file1"]    : "*";
	$file2=  isset($_GET["file2"])    ? $_GET["file2"]    : "*";
	$file3=  isset($_GET["file3"])    ? $_GET["file3"]    : "*";
	$file4=  isset($_GET["file4"])    ? $_GET["file4"]    : "*";
	$file5=  isset($_GET["file5"])    ? $_GET["file5"]    : "*";
	$file6=  isset($_GET["file6"])    ? $_GET["file6"]    : "*";
	$nbsim=  isset($_GET["nbsim"])    ? $_GET["nbsim"]    : "*";
	
		
	  set_time_limit(0); 
	  
	  
	
		
		CreateTabOfSimilarities($filesim, $file1, $file2, $file3, $file4, $file5, $file6, $nbsim);
	 


	 
function CreateTabOfSimilarities($filesim, $file1, $file2, $file3, $file4, $file5, $file6, $nbsim) {
	
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			
			
			  $xsl->load('CreateTab.xsl');
	
			  $xp->setParameter('', 'filesim', $filesim); 
			  $xp->setParameter('', 'file1', $file1);
			  $xp->setParameter('', 'file2', $file2);						  			  $xp->setParameter('', 'file3', $file3);   
			  $xp->setParameter('', 'file4', $file4);
			  $xp->setParameter('', 'file5', $file5);
			  $xp->setParameter('', 'file6', $file6);
			  $xp->setParameter('', 'nbsim', $nbsim);
			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML data
			  $xml_doc = new DomDocument;
			  $xml_doc->load($filesim);


			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
				  
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}	


	?>
    </div>

</body>
</html>