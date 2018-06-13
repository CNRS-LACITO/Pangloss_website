
<?php

ini_set('display_errors','off'); 

	function SuppAccents($chaine){
		return(str_replace(explode(' ', '� � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �'),
explode(' ', 'a a a a a c e e e e i i i i n o o o o o u u u u y y A A A A A C E E E E I I I I N O O O O O U U U U Y'),
$chaine) );
	}
	

	
	/*function SuppMajuscules($chaine){
		return(strtolower  ($chaine));
	}*/

	// retourne la liste des textes
	// la langue est sp�cifi�e par son code langue : $lg et la langue de la page pr�c�dente
	function Xslt_list_texts($lg,$aff_lang) {
	
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/listRsc.xsl');
			  $xsl->load('listRsc.xsl');
			  
			  $xp->setParameter('', 'lg', $lg);
			  $xp->setParameter('', 'aff_lang', $aff_lang);

			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML datat
			  $xml_doc = new DomDocument;
			  //$xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');


			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}

	// retourne les metadata du fichier audio selectionn�
	// le texte interlin�aire est sp�cifi� par son id : $id
	function Xslt_sound_metadata($id,$lg,$language) {
				
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metaRsc.xsl');
			  $xsl->load('metaRsc.xsl');
			
			 
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'lg', $lg);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			 
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	 
		 
	 // retourne la liste des textes en fonction d'un lieu (dcterms:spatial)
	// la langue est sp�cifi�e par son code langue : $lg et la langue de la page pr�c�dente
	function Xslt_list_texts_lieu($lg,$aff_lang,$lieu) {
	
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/listRsc.xsl');
			  $xsl->load('listRsc_lieu.xsl');
			  
			  $xp->setParameter('', 'lg', $lg);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->setParameter('', 'lieu', $lieu);

			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML datat
			  $xml_doc = new DomDocument;
			  //$xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');


			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}

		 
	 // retourne les metadata du fichier d'annotations selectionn�
	// le texte interlin�aire est sp�cifi� par son id : $id
	function Xslt_text_metadata($id,$lg,$language) {
				
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metaRsc_text.xsl');
			  $xsl->load('metaRsc_text.xsl');
		
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'lg', $lg);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	 
	 function Xslt_show_url_sound($id) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textRsc.xsl');
			 
			  $xp->setParameter('', 'id', $id);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
			
					$url_sound_wav = $XML->url_sound_wav;
				 
			  }
			 
			  return $url_sound_wav;
	 }
	 
	 
	  function Xslt_show_url_requiredby($id, $extension) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('urlRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'extension', $extension);
			  $xp->importStylesheet($xsl);
			  
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
			
					$url = $XML->url;
				
			  }
			  
			  return $url;
	 }
	 
	
	
	
	
	function Xslt_create_pdf($id){

 		$xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound_wav = $XML->url_sound_wav;
					$titre     = $XML->titre;
					$lg        = $XML->lg;
					$xp->setParameter('', 'titre',     $titre);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_text',  $url_text);
					
					
					$xsl = new DomDocument;
					//$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
					$xsl->load('TransformationPdf.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
				  if ($html = $xp->transformToXML($xml_doc)) {
					  echo $html;
				  } else {
					  trigger_error('XSL transformation failed.', E_USER_ERROR);
				  }
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
}
	
	
	
	
	 
	 
/*function Xslt_create_rtf($id){

 		$xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound_wav = $XML->url_sound_wav;
					$titre     = $XML->titre;
					$lg        = $XML->lg;
					$xp->setParameter('', 'titre',     $titre);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_text',  $url_text);
					
					
					$xsl = new DomDocument;
					//$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
					$xsl->load('TransformationRtf.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
				  if ($html = $xp->transformToXML($xml_doc)) {
					  echo $html;
				  } else {
					  trigger_error('XSL transformation failed.', E_USER_ERROR);
				  }
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
}
*/

 function Xslt_show_other($id,$id_ref) {
	// echo ("0");
	
	
	   $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'id_ref', $id_ref);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					/*elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { echo " Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { echo "Safari"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) { echo "IE"; }*/
					else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_pdf = $XML->url_pdf;
					$url_sound_wav = $XML->url_sound_wav;
					$url_sound_mp3 = $XML->url_sound_mp3;
					$titre     = $XML->titre;
					$lg        = $XML->lg;
					$xp->setParameter('', 'titre',     $titre);
					$lg=utf8_decode($lg);
					
	
	

					
					// pour afficher correctement la fiche langue : traitement de la chaine de langue
							
					$lg=str_replace(explode(' ', '� � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �'),
					explode(' ', 'a a a a a c e e e e i i i i n o o o o o u u u u y y A A A A A C E E E E I I I I N O O O O O U U U U Y'),
					$lg) ;
					$lg=str_replace(' ','_',$lg) ;
					$lg=utf8_encode($lg);
					
					/*$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 'id_ref',        $id_ref);*/
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_sound_mp3', $url_sound_mp3);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'url_pdf',  $url_pdf);
					$xp->setParameter('', 'navigator',  $navigator);
					
										
						
					
					$xsl = new DomDocument;
					//$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
					$xsl->load('showOtherText.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
						// echo ("2");
				  if ($html = $xp->transformToXML($xml_doc)) {
					
					  echo $html;
				  } else {
					  trigger_error('XSL transformation failed.', E_USER_ERROR);					
				  }
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
				  					
			  }
	 
	 }


	// retourne le texte selectionn�
	// le texte interlin�aire est sp�cifi� par son id : $id
	/*function Xslt_show_text_old($id,$aff_lang) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					/*elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { echo " Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { echo "Safari"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) { echo "IE"; }*/
					/*else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound_wav = $XML->url_sound_wav;
					$url_sound_mp3 = $XML->url_sound_mp3;
					$titre     = $XML->titre;
					$lg        = $XML->lg;
					$xp->setParameter('', 'titre',     $titre);
					$lg=utf8_decode($lg);
					
					// pour afficher correctement la fiche langue : traitement de la chaine de langue
					//echo $url_sound_mp3;		
					$lg=str_replace(explode(' ', '� � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �'),
					explode(' ', 'a a a a a c e e e e i i i i n o o o o o u u u u y y A A A A A C E E E E I I I I N O O O O O U U U U Y'),
					$lg) ;
					$lg=str_replace(' ','_',$lg) ;
					$lg=utf8_encode($lg);
					
					$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_sound_mp3', $url_sound_mp3);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'navigator',  $navigator);
					
										
					
					
					$xsl = new DomDocument;
					//$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
				
					$xsl->load('showText.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
				  if ($html = $xp->transformToXML($xml_doc)) {
					  echo $html;
				  } else {
					  trigger_error('XSL transformation failed.', E_USER_ERROR);
				  }
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }*/
	 
	 
	 
	 
	 
	 
	 // retourne le texte selectionn�
	// le texte interlin�aire est sp�cifi� par son id : $id
	function Xslt_show_text($id, $id_ref, $aff_lang) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  
			 /* echo "$id_ref et $id";*/
			 $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			 // $xsl->load('textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'id_ref', $id_ref);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			  $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  //$xml_doc->load('metadata_lacito.xml');
			/*echo $_SERVER['HTTP_USER_AGENT'];*/
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { $navigator=" Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { $navigator="Safari"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Chrome' ) !== FALSE ) {  $navigator="Chrome"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) {  $navigator="Explorer"; }
					else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound_wav = $XML->url_sound_wav;
					$url_sound_mp3 = $XML->url_sound_mp3;
					$titre     = $XML->titre;
					$date_sound     = $XML->date_sound;
					$date_text     = $XML->date_text;
					$chercheurs     = $XML->chercheurs;
					$locuteurs     = $XML->locuteurs;
					$lg        = $XML->lg;
					$sponsor        = $XML->sponsor;
					$lg_code       = $XML->lg_code;
					
					
			
					
				/*	echo "$url_text";*/
				
			 if ($lg == "Futunien"){
					$lg_rect="East_Futunan";
	 		}
			else if ($lg == "Kurde_central"){
					$lg_rect="Kurdish";
	 		}
			else if ($lg == "Wallisien"){
				$lg_rect="East_Uvean";
	 		}
		else {$lg_rect=$lg;}
	
	 

					
					$xp->setParameter('', 'titre',     $titre);
					$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'lg_rect',        $lg_rect);
					$xp->setParameter('', 'lg_code',        $lg_code);
					$xp->setParameter('', 'chercheurs',        $chercheurs);
					$xp->setParameter('', 'locuteurs',        $locuteurs);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_sound_mp3', $url_sound_mp3);
					$xp->setParameter('', 'date_sound',  $date_sound);
					$xp->setParameter('', 'sponsor',  $sponsor);
					$xp->setParameter('', 'date_text',  $date_text);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'navigator',  $navigator);
					
										
				
					$xsl = new DomDocument;
					$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
					/*$xsl->load('showText.xsl');*/
					//$xsl->load('showText.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
				  if ($html = $xp->transformToXML($xml_doc)) {
					  echo $html;
				  } else {
					  trigger_error('XSL transformation failed.', E_USER_ERROR);
				  }
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	 
	 
	 
	 
	 
	  // retourne le texte selectionn�
	// le texte interlin�aire est sp�cifi� par son id : $id
	function Xslt_show_ex($id,$s,$aff_lang) {
		
			  $xp = new XsltProcessor();
			 
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textRsc.xsl');
			 
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			/*echo $_SERVER['HTTP_USER_AGENT'];*/
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { $navigator=" Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { $navigator="Safari"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Chrome' ) !== FALSE ) {  $navigator="Chrome"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) {  $navigator="Explorer"; }
					else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
				  
				 
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound_wav = $XML->url_sound_wav;
					$url_sound_mp3 = $XML->url_sound_mp3;
					$titre     = $XML->titre;
					$chercheurs     = $XML->chercheurs;
					$locuteurs     = $XML->locuteurs;
					$lg        = $XML->lg;
					$xp->setParameter('', 'titre',     $titre);
					$lg=utf8_decode($lg);
					
					// pour afficher correctement la fiche langue : traitement de la chaine de langue
					//echo $url_sound_mp3;		
					$lg=str_replace(explode(' ', '� � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � � �'),
					explode(' ', 'a a a a a c e e e e i i i i n o o o o o u u u u y y A A A A A C E E E E I I I I N O O O O O U U U U Y'),
					$lg) ;
					$lg=str_replace(' ','_',$lg) ;
					$lg=utf8_encode($lg);
					
					$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 's', $s);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'chercheurs',        $chercheurs);
					$xp->setParameter('', 'locuteurs',        $locuteurs);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_sound_mp3', $url_sound_mp3);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'navigator',  $navigator);
					
										
					
					
					$xsl = new DomDocument;
					//$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
					/*$xsl->load('showText.xsl');*/
					$xsl->load('showEx.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
				  if ($html = $xp->transformToXML($xml_doc)) {
					  echo $html;
				  } else {
					  trigger_error('XSL transformation failed.', E_USER_ERROR);
				  }
			  } else {
				 
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	

	 // permet l'affichage et l'�coute d'un fichier audio
	// le fichier audio est sp�cifi� par son id : $id
	function Xslt_show($id,$aff_lang) {
			   $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  $xsl->load('textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  $xml_doc->load('metadata_lacito.xml');
			/*echo $_SERVER['HTTP_USER_AGENT'];*/
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { $navigator=" Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { $navigator="Safari"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Chrome' ) !== FALSE ) {  $navigator="Chrome"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) {  $navigator="Explorer"; }
					else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound_wav = $XML->url_sound_wav;
					$url_sound_mp3 = $XML->url_sound_mp3;
					$titre     = $XML->titre;
					$date_sound     = $XML->date_sound;
					$date_text     = $XML->date_text;
					$chercheurs     = $XML->chercheurs;
					$locuteurs     = $XML->locuteurs;
					$lg        = $XML->lg;
					$sponsor = $XML->sponsor;
					
					$lg_code       = $XML->lg_code;
					
					
					
					
					
					
				
			 if ($lg == "Futunien"){
					$lg_rect="East_Futunan";
	 		}
			else if ($lg == "Kurde_central"){
					$lg_rect="Kurdish";
	 		}
			else if ($lg == "Wallisien"){
				$lg_rect="East_Uvean";
	 		}
		else {$lg_rect=$lg;}
	
	 

					
					$xp->setParameter('', 'titre',     $titre);
					$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'lg_rect',        $lg_rect);
					$xp->setParameter('', 'lg_code',        $lg_code);
					$xp->setParameter('', 'chercheurs',        $chercheurs);
					$xp->setParameter('', 'locuteurs',        $locuteurs);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_sound_mp3', $url_sound_mp3);
					$xp->setParameter('', 'date_sound',  $date_sound);
					$xp->setParameter('', 'sponsor',  $sponsor);
					$xp->setParameter('', 'date_text',  $date_text);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'navigator',  $navigator);
					
					
					$xsl = new DomDocument;
					//$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
					
					
					$xsl->load('show.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
				  if ($html = $xp->transformToXML($xml_doc)) {
					  echo $html;
				  } else {
					  trigger_error('XSL transformation failed.', E_USER_ERROR);
				  }
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	 

	// retourne un moteur de recherche sur les metadonnees
	function Xslt_moteur_de_recherche($lang) {
		
		
		$term       = isset($_GET["term"])    ? ($_GET["term"])    : "";
		$field      = isset($_GET["field"])   ? ($_GET["field"])   : "All";
		$mode       = isset($_GET["mode"])    ? ($_GET["mode"])    : "contains";
		$participant     = isset($_GET["participant"])  ? ($_GET["participant"])  : "*";
		$langue     = isset($_GET["langue"])  ? ($_GET["langue"])  : "*";
		$howmany    = isset($_GET["howmany"]) ? ($_GET["howmany"]) : "15";
		$from       = isset($_GET["from"])    ? ($_GET["from"])    : "1";

		$xml = simplexml_load_file('metadata_lacito.xml');
		
		$xml->registerXPathNamespace('dc',      'http://purl.org/dc/elements/1.1/');
		$xml->registerXPathNamespace('xsi',     'http://www.w3.org/2001/XMLSchema-instance');
		$xml->registerXPathNamespace('oai',     'http://www.openarchives.org/OAI/2.0/');
		$xml->registerXPathNamespace('dcterms', 'http://purl.org/dc/terms/');
		$xml->registerXPathNamespace('olac',    'http://www.language-archives.org/OLAC/1.1/');
		
if ($lang=='fr'){
	
		echo '<form action="" method="GET">';
		echo '<table class="crdo-request">';
		echo '	<tr>';
		echo '		<th>Mots cl&eacute;s</th>';
		//echo '		<th>Cat&eacute;gorie</th>';
		//echo '		<th>Op&eacute;rateur</th>';
		echo '		<th>Chercheur(s)/Depositaire(s)</th>';
		echo '		<th>Langue(s)</th>';
		echo '		<th> </th>';
		echo '	</tr>';
		echo '  <tr>';
		echo '     <td>';
		//echo "         <input type='hidden' name='who' value='".$who."'/>";
		//echo "         <input type='hidden' name='lab' value='".$lab."'/>";
		echo "         <input type='text'   name='term' size='20' value='$term'/>";
		echo '     </td>';
		
		echo'<td>';
		echo '<select name="participant">';
		echo '<option value="*">Tous</option>';

		$result = $xml->xpath('//dc:contributor[@olac:code="researcher"]|//dc:contributor[@olac:code="depositor"]');
		
		$attente = array_unique($result);
		
		for ($i=0; $i<sizeof($attente);$i++){
		$attente[$i]=trim($attente[$i]);
		
		
		}
		
		$distincts = array_unique($attente);
		

		
	
		natsort($distincts);
		
		while(list( , $node) = each($distincts)) {
		
		
		
		$test=eregi("(.*),(.*)",$node);
		
		if ($test==1){
		
			if ($node == $participant) {
				echo '<option selected="selected">',$node, '</option>';
			} else {
				echo '<option>',$node,'</option>';
			}
			}
			
		}
		echo '</select>';
	
		
		echo '</select>';
		
		echo '</td><td>';
		echo '<select name="langue">';
		echo '<option value="*">Tous</option>';
	
		$result = $xml->xpath('//dc:subject[@xsi:type="olac:language"]');
		
		
		
		$distincts = array_unique($result);
		natsort($distincts);
		
		
		while(list( , $node) = each($distincts)) {
			if ($node == $langue) {
				echo '<option selected="selected">',$node, '</option>';
			} else {
				echo '<option>',$node,'</option>';
			}
		}
		echo '</select>';
		//echo count($attente);
		echo '</td><td>';
		echo '<input type="submit" value="Rechercher"/></nobr>';
		echo '     </td>';
		echo '	</tr>';
		echo '</table>';
		echo '</form>';
	
}
else {

		echo '<form action="" method="GET">';
		echo '<table class="crdo-request">';
		echo '	<tr>';
		echo '		<th>Keyword(s)</th>';
		//echo '		<th>Cat&eacute;gorie</th>';
		//echo '		<th>Op&eacute;rateur</th>';
		echo '		<th>Researcher(s)/Depositor(s)</th>';
		echo '		<th>Language(s)</th>';
		echo '		<th> </th>';
		echo '	</tr>';
		echo '  <tr>';
		echo '     <td>';
		//echo "         <input type='hidden' name='who' value='".$who."'/>";
		//echo "         <input type='hidden' name='lab' value='".$lab."'/>";
		echo "         <input type='text'   name='term' size='20' value='$term'/>";
		echo '     </td>';
		
		echo'<td>';
		echo '<select name="participant">';
		echo '<option value="*">All</option>';

		$result = $xml->xpath('//dc:contributor[@olac:code="researcher"]|//dc:contributor[@olac:code="depositor"]');
		
		$attente = array_unique($result);
		
		for ($i=0; $i<sizeof($attente);$i++){
		$attente[$i]=trim($attente[$i]);
		
		
		}
		
		$distincts = array_unique($attente);
		

		
	
		natsort($distincts);
		
		while(list( , $node) = each($distincts)) {
		
		
		
		$test=eregi("(.*),(.*)",$node);
		
		if ($test==1){
		
			if ($node == $participant) {
				echo '<option selected="selected">',$node, '</option>';
			} else {
				echo '<option>',$node,'</option>';
			}
			}
			
		}
		echo '</select>';
	
		
		echo '</select>';
		
		echo '</td><td>';
		echo '<select name="langue">';
		echo '<option value="*">All</option>';
	
		$result = $xml->xpath('//dc:subject[@xsi:type="olac:language"]');
		
		
		
		$distincts = array_unique($result);
		natsort($distincts);
		
		
		while(list( , $node) = each($distincts)) {
			if ($node == $langue) {
				echo '<option selected="selected">',$node, '</option>';
			} else {
				echo '<option>',$node,'</option>';
			}
		}
		echo '</select>';
		//echo count($attente);
		echo '</td><td>';
		echo '<input type="submit" value="Search"/></nobr>';
		echo '     </td>';
		echo '	</tr>';
		echo '</table>';
		echo '</form>';
}
		$min = "'abcdefghijklmnopqrstuvwxyz'";
		$maj = "'ABCDEFGHIJKLMNOPQRSTUVWXYZ'";

		if(isset($_GET["term"])) {
		
		$search=split(' ',$term);
		$identity=split(',',$participant);
		
			
			$condLangue = '';
			if ($langue != '*') {
				$condLangue = "[dc:subject = '".$langue."']";
			}
			
			$condParticipant='';
			if ($participant != '*') {

				$condParticipant = "[dc:contributor[@olac:code='researcher' or 'depositor'] [contains(.,'".$identity[0]."')] [contains(.,'".$identity[1]."')]]";
				
			
			}
			
			
			
			
			$f = ".";
			/*if ($field == "Publisher") {
				$f = "dc:publisher";
			} else if ($field == "Contributor") {
				$f = "dc:contributor|dc:contributor/@olac:code";
			} else if ($field == "Title") {
				$f = "dc:title|dcterms:alternative";
			} else if ($field == "Description") {
				$f = "dc:description|dcterms:tableOfContents|dcterms:abstract";
			} else if ($field == "Subject") {
				$f = "dc:subject|dc:subject/@olac:code";
			} else if ($field == "Date") {
				$f = "dc:date|dcterms:created|dcterms:valid|dcterms:available|dcterms:issued|dcterms:modified|dcterms:dateAccepted|dcterms:dateCopyrighted|dcterms:dateSubmitted";
			} else if ($field == "Type") {
				$f = "dc:type|dc:type/@olac:code";
			} else if ($field == "Format") {
				$f = "dc:format|dcterms:extent";
			} else if ($field == "Identifier") {
				$f = "dc:identifier|dcterms:bibliographicCitation";
			} else if ($field == "Source") {
				$f = "dc:source";
			} else if ($field == "Language") {
				$f = "dc:language|dc:language/@olac:code";
			} else if ($field == "Relation") {
				$f = "dc:relation|dcterms:isVersionOf|dcterms:hasVersion|dcterms:isReplacedBy|dcterms:replaces|dcterms:isRequiredBy|dcterms:requires|dcterms:isPartOf|dcterms:hasPart|dcterms:isReferencedBy|dcterms:references|dcterms:isFormatOf|dcterms:hasFormat|dcterms:conformsTo";
			} else if ($field == "Coverage") {
				$f = "dc:coverage|dcterms:spatial|dcterms:temporal";
			} else if ($field == "Rights") {
				$f = "dc:rights|dcterms:accessRights";
			} else if ($field == "Creator") {
				$f = "dc:creator|dc:creator/@olac:code";
			} else {
				$f = "dc:contributor|dc:contributor/@olac:code|dc:subject|dc:subject/@olac:code|dc:type/@olac:code|dc:language/@olac:code|dc:creator/@olac:code|dc:title|dcterms:alternative";
				
				
			}*/
$expr = "";

if ($term!=""){

			$f = "dc:contributor|dc:contributor/@olac:code|dc:subject|dc:subject/@olac:code|dc:type/@olac:code|dc:language/@olac:code|dc:creator/@olac:code|dc:title|dcterms:alternative";

			
			$min = "'abcdefghijklmnopqrstuvwxyz'";
			$maj = "'ABCDEFGHIJKLMNOPQRSTUVWXYZ'";
			$t = "'".strtr($term, $maj, $min)."'";
			
			
			
			$delim = '|';
			if($t != '') {
				$tab = explode($delim, $f);
				$i = 1;
				$expr = "[";
				foreach($tab as $e) {
					if ($i > 1) {
						$expr .= " or ";
					}
					if ($mode == 'exact') {
						$expr .= "(translate($e, $maj, $min) = $t)";
					} else {
					$expr .="$e ";
					for ($l=0;$l<sizeof($search);$l++){
					$t1 = "'".strtr($search[$l], $maj, $min)."'";
					
						$expr .="[contains(translate(.,$maj, $min),$t1)]";
					}	
						
					}
					$i++;
				}
				$expr .= "]";
			}
			
			}
			
			/*echo "on a cette requete : ",'//oai:record[.//olac:olac[contains(dc:format,"audio")][not (contains(dcterms:accessRights, "protected"))]'.$condLangue.$condParticipant.$expr.']';*/
			
			
			$result = $xml->xpath('//oai:record[.//olac:olac[contains(dc:format,"audio")][not (contains(dcterms:accessRights, "protected"))]'.$condLangue.$condParticipant.$expr.']');
			
			
			
			$total_reponse=sizeof($result);
			
			if ($lang=='fr'){
				echo '<table class="resultats" width="100%" border="0" align="left">';
			$i = 0;
			echo '<tr>';
			echo'<th><div align="left"><font size="-1"></font></div></th>';
			//echo'<th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1"></font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">TITRE</font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">LANGUE</font></div></th>';
			//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">CHERCHEUR(S)</font></div></th>';
    		//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">LOCUTEUR(S)</font></div></th>';
			echo'</tr>';	
				
				echo $total_reponse." r&eacute;sultats";
				
			}
			else {
				
				echo '<table class="resultats" width="100%" border="0" align="left">';
			$i = 0;
			echo '<tr>';
			echo'<th><div align="left"><font size="-1"></font></div></th>';
			//echo'<th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1"></font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">TITLE</font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">LANGUAGE</font></div></th>';
			//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">RESEARCHER(S)</font></div></th>';
    		//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">SPEAKER(S)</font></div></th>';
			echo'</tr>';	
				
				echo $total_reponse." results";
				
				
			}
			
				
			
			
			while(list( , $node) = each($result)) {
			
			
			
			 	if (1&$i) {
			 		echo '<tr>';
					
			 	} else {
			 		echo '<tr class="odd">';
					
			 	}
				

				
				echo '<td valign="top">';
				$tit         = @Xpath_first_value($node, '//dc:title');
				$titre       = $tit;
				
				
				if (strlen($tit) > 25) {
					$tit = substr($tit, 0, 24) . '...';
				}
				
				$id          = substr(@Xpath_first_value($node, '//header/identifier'), strlen('oai:crdo.risc.cnrs.fr:')-1);
				
				$href        = @Xpath_first_value($node, '//dc:identifier');
			
				$has_transcr = @Xpath_first_value($node, '//dcterms:isRequiredBy');
				
				$idref          = substr(@Xpath_first_value($node, '//dcterms:isRequiredBy'), strlen('oai:crdo.risc.cnrs.fr:')-1);
				
				if ($has_transcr) {
					$href_trans = 'show_text.php?id='.$id.'&amp;idref='.$idref;
				}
				$researchers = @Xpath_values($node, '//dc:contributor[@olac:code="researcher"]');
				
				//coupure entre les noms des differents chercheurs (s'il y en a plus d'un)
				$researcher = split(';',$researchers);
				
				$fn_researchers='';
				
				
				
				// s il n y a qu un chercheur
				if (sizeof($researcher)==0){
				// coupure entre le nom et le prenom du chercheur
					$temp_researcher=split(',',$researchers);
					$fn_researchers=$temp_researcher[0];
				}
				//s il y a plusieurs chercheurs
				else{
				
					for ($k=0;$k<sizeof($researcher);$k++){
					// coupure entre le nom et le prenom de chaque chercheur liste
						$temp_researcher=split(',',$researcher[$k]);
						
						if (($fn_researchers!='') and (sizeof($temp_researcher[0])>0)){
							
								$fn_researchers=$fn_researchers.' ; '.$temp_researcher[0];
				
						}
						else {
							
							$fn_researchers=$temp_researcher[0];
						}
				
					}
				}
				
				
				$locutor = @Xpath_values($node, '//dc:contributor[@olac:code="speaker"]');
				$locutors = $locutor;
				
				
				if (strlen($fn_researchers) > 25) {
					$fn_researchers = substr($fn_researchers, 0, 24) . '...';
				}
				
				if (strlen($locutor) > 25) {
					$locutor = substr($locutor, 0, 24) . '...';
				}
				
				
				$language = @Xpath_values($node, '//dc:subject[@xsi:type="olac:language"]');


				$l_temp=split(";",$language);
				
				
				if( sizeof($l_temp)>1){
									
					if($l_temp[0] != $l_temp[1]){$language=$l_temp[0]."/".$l_temp[1];}
					else {$language=$l_temp[0];}
				}
		
		
		
				echo '<a href="', $href,'" title ="Ecouter ce texte" target="_blank" >';
				//onClick="flvFPW1(this.href, \'popupLink\',\'width=640,height=400,scrollbars=yes,resizable=yes\',1);return document.MM_returnValue"
				echo '<img class="sansBordure" border=0 src="../../images/icones/sound1_bleu.jpg"/></a>';
				echo '</td>';
				echo '<td valign="top">';
				if ($has_transcr) {
					
				echo '<a href="', $href_trans,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img class="sansBordure" border=0 src="../../images/icones/Txt_Inter_parchemin.jpg"/></a>'; 
				}
echo '</td>';
				echo '<td valign="top">';
				echo '<a href="show_metadatas.php?id=',$id,'" title="A propos de ',$titre,'" target="_blank" onClick="window.open(this.href,"popupLink","width=640,height=400,scrollbars=yes,resizable=yes",1);return false">';
				echo '<img class="sansBordure" border=0 src="../../images/icones/info_marron.jpg"/></a>';
				echo '</td>';
				//echo '<td valign="top"> </td>';				
				
				echo "<td title='$titre'>$tit</td>";
				//echo '<td valign="top"> </td>';
				echo "<td title='$language'>$language</td>";
				//echo '<td valign="top"> </td>';
				echo "<td title='$researchers'>$fn_researchers</td>";
				//echo '<td valign="top"> </td>';
				echo "<td title='$locutors'>$locutor</td>";
				echo '</tr>';
				$i++;
			}
			echo '</table></center>';
		} else {
			
			if ($lang=='fr'){
				echo 'Pas de requ&ecirc;te';
			}
			else {			
				echo 'There is no request';
			}
		}



	}

	function Xpath_first_value($node, $xpath) {
		$x = simplexml_load_string($node->asXML());
		

		
		$x->registerXPathNamespace('dc',      'http://purl.org/dc/elements/1.1/');
		$x->registerXPathNamespace('xsi',     'http://www.w3.org/2001/XMLSchema-instance');
		$x->registerXPathNamespace('oai',     'http://www.openarchives.org/OAI/2.0/');
		$x->registerXPathNamespace('dcterms', 'http://purl.org/dc/terms/');
		$x->registerXPathNamespace('olac',    'http://www.language-archives.org/OLAC/1.1/');
		
		$xx = $x->xpath($xpath);
		while(list( , $n) = each($xx)) {
			return $n;
		}
	}
	function Xpath_values($node, $xpath) {
	
		$x = simplexml_load_string($node->asXML());
		$x->registerXPathNamespace('dc',      'http://purl.org/dc/elements/1.1/');
		$x->registerXPathNamespace('xsi',     'http://www.w3.org/2001/XMLSchema-instance');
		$x->registerXPathNamespace('oai',     'http://www.openarchives.org/OAI/2.0/');
		$x->registerXPathNamespace('dcterms', 'http://purl.org/dc/terms/');
		$x->registerXPathNamespace('olac',    'http://www.language-archives.org/OLAC/1.1/');

		$xx = $x->xpath($xpath);
		$result = "";
		while(list( , $n) = each($xx)) {
		
			if (($result!='')){
					$result .= ";$n";
				}
				else {
					$result .= "$n";
				}
			
		}
		
		return $result;
	}
	function Xpath_values1($node, $xpath) {
	
		$x = simplexml_load_string($node->asXML());
		$x->registerXPathNamespace('dc',      'http://purl.org/dc/elements/1.1/');
		$x->registerXPathNamespace('xsi',     'http://www.w3.org/2001/XMLSchema-instance');
		$x->registerXPathNamespace('oai',     'http://www.openarchives.org/OAI/2.0/');
		$x->registerXPathNamespace('dcterms', 'http://purl.org/dc/terms/');
		$x->registerXPathNamespace('olac',    'http://www.language-archives.org/OLAC/1.1/');

		$xx = $x->xpath($xpath);
		$result = "";
		while(list( , $n) = each($xx)) {
		
				$result .= "$n ";
			
		}
		
		return $result;
	}
        
        	 // retourne le texte selectionn� en JSON pour EASTLing !
	// le texte interlin�aire est sp�cifi� par son id : $id
	function Xslt_get_text4eastling($id, $id_ref, $aff_lang) {
                        
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  
			 /* echo "$id_ref et $id";*/
			 $xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/textRsc.xsl');
			  //$xsl->load('textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'id_ref', $id_ref);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			  $xml_doc->load('http://lacito.vjf.cnrs.fr/pangloss/tools/metadata_lacito.xml');
			  //$xml_doc->load('metadata_lacito.xml');
			/*echo $_SERVER['HTTP_USER_AGENT'];*/
                          
                          
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { $navigator=" Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { $navigator="Safari"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Chrome' ) !== FALSE ) {  $navigator="Chrome"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) {  $navigator="Explorer"; }
					else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound_wav = $XML->url_sound_wav;
					$url_sound_mp3 = $XML->url_sound_mp3;
					$titre     = $XML->titre;
					$date_sound     = $XML->date_sound;
					$date_text     = $XML->date_text;
					$chercheurs     = $XML->chercheurs;
					$locuteurs     = $XML->locuteurs;
					$lg        = $XML->lg;
					$sponsor        = $XML->sponsor;
					$lg_code       = $XML->lg_code;
					
					echo $url_text;
                                        echo '<br>';
                                        echo $url_sound_mp3;
                                        echo '<br>';
                                        
                                        
					
				/*	echo "$url_text";*/
				
			 if ($lg == "Futunien"){
					$lg_rect="East_Futunan";
	 		}
			else if ($lg == "Kurde_central"){
					$lg_rect="Kurdish";
	 		}
			else if ($lg == "Wallisien"){
				$lg_rect="East_Uvean";
	 		}
		else {$lg_rect=$lg;}
						
					$xp->setParameter('', 'titre',     $titre);
					$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'lg_rect',        $lg_rect);
					$xp->setParameter('', 'lg_code',        $lg_code);
					$xp->setParameter('', 'chercheurs',        $chercheurs);
					$xp->setParameter('', 'locuteurs',        $locuteurs);
					$xp->setParameter('', 'url_sound_wav', $url_sound_wav);
					$xp->setParameter('', 'url_sound_mp3', $url_sound_mp3);
					$xp->setParameter('', 'date_sound',  $date_sound);
					$xp->setParameter('', 'sponsor',  $sponsor);
					$xp->setParameter('', 'date_text',  $date_text);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'navigator',  $navigator);
					
										
				
					$xsl = new DomDocument;
					$xsl->load('http://lacito.vjf.cnrs.fr/pangloss/tools/showText.xsl');
					/*$xsl->load('showText.xsl');*/
					//$xsl->load('showText.xsl');
					
					$xp->importStylesheet($xsl);
					$xml_doc = new DomDocument;
					$xml_doc->load($url_text);
                                        
                                        echo $xml_doc;
//				  if ($html = $xp->transformToXML($xml_doc)) {
//					  echo $html;
//				  } else {
//					  trigger_error('XSL transformation failed.', E_USER_ERROR);
//				  }
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	 
	 
	 
	 


?>
