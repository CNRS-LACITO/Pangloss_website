
<?php

ini_set('display_errors','off'); 

	function SuppAccents($chaine){
		return(str_replace(explode(' ', 'à á â ã ä ç è é ê ë ì í î ï ñ ò ó ô õ ö ù ú û ü ụ ý ÿ À Á Â Ã Ä Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ù Ú Û Ü Ý'),
explode(' ', 'a a a a a c e e e e i i i i n o o o o o u u u u u y y A A A A A C E E E E I I I I N O O O O O U U U U Y'),
$chaine) );
	}
	

	
	/*function SuppMajuscules($chaine){
		return(strtolower  ($chaine));
	}*/

/* OUI */

	function Xslt_list_languages($tri, $aff_lang) {
	
			
			  
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/listRsc.xsl');
			  $xsl->load('xsl/listLanguages.xsl');
			  
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->setParameter('', 'tri', $tri);
			
			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML data
			  $xml_doc = new DomDocument;
			  //$xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/corpora_list.xml');

			  

			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}


	// retourne la liste des textes
	// la langue est spécifiée par son code langue : $lg et la langue de la page précédente
	function Xslt_list_texts($lg, $name, $aff_lang, $tri) {
	
			  if ($tri == 'title'){
				 $ordre='dc:title';
			  }
			  if ($tri == 'researcher'){
				 $ordre='dc:contributor[@olac:code=\'researcher\']';
			  } 
			  if ($tri == 'speaker'){
				 $ordre='dc:contributor[@olac:code=\'speaker\']';
			  }
			  
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/listRsc.xsl');
			  $xsl->load('xsl/listRsc.xsl');
			  
			  $xp->setParameter('', 'lg', $lg);
			  $xp->setParameter('', 'name', $name);
			  $xp->setParameter('', 'ordre', $ordre);
			  $xp->setParameter('', 'aff_lang', $aff_lang);


			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML data
			  $xml_doc = new DomDocument;
			  //$xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');


			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}

	// retourne les metadata du fichier audio selectionné
	// le texte interlinéaire est spécifié par son id : $id
	function Xslt_sound_metadata($id,$lg,$language) {
				
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metaRsc.xsl');
			  $xsl->load('xsl/metaRsc.xsl');
			
			 
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'lg', $lg);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');
			 
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	 
/* OUI */		 
	 // retourne la liste des textes en fonction d'un lieu (dcterms:spatial)
	// la langue est spécifiée par son code langue : $lg et la langue de la page précédente
	function Xslt_list_texts_lieu($lg, $name, $aff_lang,$lieu) {
	
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/listRsc.xsl');
			  $xsl->load('xsl/listRsc_lieu.xsl');
			  
			  $xp->setParameter('', 'lg', $lg);
			  $xp->setParameter('', 'name', $name);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->setParameter('', 'lieu', $lieu);

			  // import the XSL styelsheet into the XSLT process
			  $xp->importStylesheet($xsl);


			// create a DOM document and load the XML datat
			  $xml_doc = new DomDocument;
			  //$xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');


			  // transform the XML into HTML using the XSL file
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	}

		 
	 // retourne les metadata du fichier d'annotations selectionné
	// le texte interlinéaire est spécifié par son id : $id
	function Xslt_text_metadata($id,$lg,$language) {
				
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			  //$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metaRsc_text.xsl');
			  $xsl->load('xsl/metaRsc_text.xsl');
		
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'lg', $lg);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');
			
			  if ($html = $xp->transformToXML($xml_doc)) {
				  echo $html;
			  } else {
				  trigger_error('XSL transformation failed.', E_USER_ERROR);
			  }
	 }
	 
	 
	 function Xslt_show_url_sound($id) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/textRsc.xsl');
			  $xsl->load('xsl/textRsc.xsl');
			 
			  $xp->setParameter('', 'id', $id);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
			
					$url_sound = $XML->url_sound;
				 
			  }
			 
			  return $url_sound;
	 }
	 
	 
	  function Xslt_show_url_requiredby($id, $extension) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/textRsc.xsl');
			  $xsl->load('xsl/urlRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'extension', $extension);
			  $xp->importStylesheet($xsl);
			  
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
			
					$url = $XML->url;
				
			  }
			  
			  return $url;
	 }
	 
	
	
	
	
	function Xslt_create_pdf($id){

 		$xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/textRsc.xsl');
			  $xsl->load('xsl/textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');
			
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
					//$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/showText.xsl');
					$xsl->load('xsl/TransformationPdf.xsl');
					
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
			 // $xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/textRsc.xsl');
			  $xsl->load('xsl/textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');
			
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
					//$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/showText.xsl');
					$xsl->load('xsl/TransformationRtf.xsl');
					
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

 function Xslt_show_other($id,$id_ref, $aff_lang) {
	// echo ("0");
	
	
	   $xp = new XsltProcessor();
			 $xp = new XsltProcessor();
			  $xsl = new DomDocument;


			 
			  $xsl->load('xsl/textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'id_ref', $id_ref);
			  
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			
			  $xml_doc->load('xsl/metadata_lacito.xml');
		
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { $navigator=" Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { $navigator="Safari"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Chrome' ) !== FALSE ) {  $navigator="Chrome"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) {  $navigator="Explorer"; }
					else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_pdf  = $XML->url_pdf;
					$url_sound = $XML->url_sound;
					$url_sound_bis = $XML->url_sound_bis;
					$url_sound_ter = $XML->url_sound_ter;
					$titre     = $XML->titre;
					$date_text     = $XML->date_text;
					$chercheurs     = $XML->chercheurs;
					$locuteurs     = $XML->locuteurs;
					$lg        = $XML->lg;
					$sponsor        = $XML->sponsor;
					$lg_code       = $XML->lg_code;
					$title       = $XML->title;
					$title_fr       = $XML->title_fr;
					$title_en       = $XML->title_en;
					$alternative       = $XML->alternative;
					$spatial_fr     = $XML->spatial_fr;
					$spatial_en     = $XML->spatial_en;
					$spatial_autre     = $XML->spatial_autre;
					$created     = $XML->created;
					$extent		 = $XML->extent;
					$north		 = $XML->north;
					$east		 = $XML->east;
					
					
			//echo "$north et $east";
					//echo "son $url_sound et $url_sound_bis et $url_sound_ter";
				
					
					$xp->setParameter('', 'titre',     $titre);
					$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 'id_ref',        $id_ref);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'lg_rect',        $lg_rect);
					$xp->setParameter('', 'lg_code',        $lg_code);
					$xp->setParameter('', 'chercheurs',        $chercheurs);
					$xp->setParameter('', 'locuteurs',        $locuteurs);
					$xp->setParameter('', 'url_sound', $url_sound);
					$xp->setParameter('', 'url_sound_bis', $url_sound_bis);
					$xp->setParameter('', 'url_sound_ter', $url_sound_ter);
					$xp->setParameter('', 'date_sound',  $date_sound);
					$xp->setParameter('', 'sponsor',  $sponsor);
					$xp->setParameter('', 'date_text',  $date_text);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'url_pdf',  $url_pdf);
					$xp->setParameter('', 'navigator',  $navigator);
					$xp->setParameter('', 'title',  $title);
					$xp->setParameter('', 'title_fr',  $title_fr);
					$xp->setParameter('', 'title_en',  $title_en);
					$xp->setParameter('', 'alternative',  $alternative);
					$xp->setParameter('', 'aff_lang',  $aff_lang);
					$xp->setParameter('', 'spatial_fr',  $spatial_fr);
					$xp->setParameter('', 'spatial_en',  $spatial_en);
					$xp->setParameter('', 'spatial_autre',  $spatial_autre);
					$xp->setParameter('', 'created',  $created);
					$xp->setParameter('', 'extent',  $extent);
					$xp->setParameter('', 'north',  $north);
					$xp->setParameter('', 'east',  $east);
					
										
				
					$xsl = new DomDocument;
					
					$xsl->load('xsl/showOtherText.xsl');
					
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


	// retourne le texte selectionné
	// le texte interlinéaire est spécifié par son id : $id
	/*function Xslt_show_text_old($id,$aff_lang) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;
			 // $xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/textRsc.xsl');
			  $xsl->load('xsl/textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'aff_lang', $aff_lang);
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			 // $xml_doc->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/metadata_lacito.xml');
			  $xml_doc->load('xsl/metadata_lacito.xml');
			
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
					$lg=str_replace(explode(' ', 'à á â ã ä ç è é ê ë ì í î ï ñ ò ó ô õ ö ù ú û ü ý ÿ À Á Â Ã Ä Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ù Ú Û Ü Ý'),
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
					//$xsl->load('xsl/http://lacito.vjf.cnrs.fr/pangloss/corpus/xsl/showText.xsl');
				
					$xsl->load('xsl/showText.xsl');
					
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
	 
	 
	 
	 
	 
/* OUI */	
	 function Xslt_show_text($id, $id_ref, $aff_lang) {
			  $xp = new XsltProcessor();
			  $xsl = new DomDocument;


			 
			  $xsl->load('xsl/textRsc.xsl');
			  
			  $xp->setParameter('', 'id', $id);
			  $xp->setParameter('', 'id_ref', $id_ref);
			  
			  $xp->importStylesheet($xsl);
			  $xml_doc = new DomDocument;
			
			  $xml_doc->load('xsl/metadata_lacito.xml');
		
			if ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Firefox' ) !== FALSE ) { $navigator="Firefox"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Opera' ) !== FALSE ) { $navigator=" Opera"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Safari' ) !== FALSE ) { $navigator="Safari"; }
					elseif ( strpos( $_SERVER['HTTP_USER_AGENT'], 'Chrome' ) !== FALSE ) {  $navigator="Chrome"; }
					elseif ( strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE' ) !== FALSE ) {  $navigator="Explorer"; }
					else { $navigator="Other"; }
					
			
			  if ($res = $xp->transformToXML($xml_doc)) {
					$XML = new SimpleXMLElement($res);
					$url_text  = $XML->url_text;
					$url_sound = $XML->url_sound;
					$url_sound_bis = $XML->url_sound_bis;
					$url_sound_ter = $XML->url_sound_ter;
					$titre     = $XML->titre;
					$date_text     = $XML->date_text;
					$chercheurs     = $XML->chercheurs;
					$locuteurs     = $XML->locuteurs;
					$autres_contributeurs_audio     = $XML->autres_contributeurs_audio;
					$autres_contributeurs_texte     = $XML->autres_contributeurs_texte;
					$lg        = $XML->lg;
					$sponsor        = $XML->sponsor;
					$lg_code       = $XML->lg_code;
					$title       = $XML->title;
					$title_fr       = $XML->title_fr;
					$title_en       = $XML->title_en;
					$alternative       = $XML->alternative;
					$spatial_fr     = $XML->spatial_fr;
					$spatial_en     = $XML->spatial_en;
					$spatial_autre     = $XML->spatial_autre;
					$created     = $XML->created;
					$extent		 = $XML->extent;
					$north		 = $XML->north;
					$east		 = $XML->east;
					$available		 = $XML->available;
					$license		 = $XML->license;
										
			//echo "$north et $east";
					//echo "son $url_sound et $url_sound_bis et $url_sound_ter";
				
			
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
	
	/* echo ("on affiche $url_sound et $url_sound_bis\n");*/
$lg_rect=str_replace(explode(' ', 'à á â ã ä ă ạ ç è é ê ë ì í î ï ñ ò ó ô õ ö ố ờ ổ ù ú û ü ứ ụ ư ý ÿ À Á Â Ã Ä Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Ù Ú Û Ü Ý'),
explode(' ', 'a a a a a a a c e e e e i i i i n o o o o o o o o u u u u u u u y y A A A A A C E E E E I I I I N O O O O O U U U U Y'),
$lg_rect) ;


$lg_rect=str_replace(' ','_',$lg_rect) ;
$lg_rect=str_replace("\'",'_',$lg_rect) ;

					
					$xp->setParameter('', 'titre',     $titre);
					$xp->setParameter('', 'id',        $id);
					$xp->setParameter('', 'id_ref',        $id_ref);
					$xp->setParameter('', 'lg',        $lg);
					$xp->setParameter('', 'lg_rect',        $lg_rect);
					$xp->setParameter('', 'lg_code',        $lg_code);
					$xp->setParameter('', 'chercheurs',        $chercheurs);
					$xp->setParameter('', 'locuteurs',        $locuteurs);
					$xp->setParameter('', 'autres_contributeurs_audio',        $autres_contributeurs_audio);
					$xp->setParameter('', 'autres_contributeurs_texte',        $autres_contributeurs_texte);
					$xp->setParameter('', 'url_sound', $url_sound);
					$xp->setParameter('', 'url_sound_bis', $url_sound_bis);
					$xp->setParameter('', 'url_sound_ter', $url_sound_ter);
					$xp->setParameter('', 'date_sound',  $date_sound);
					$xp->setParameter('', 'sponsor',  $sponsor);
					$xp->setParameter('', 'date_text',  $date_text);
					$xp->setParameter('', 'url_text',  $url_text);
					$xp->setParameter('', 'navigator',  $navigator);
					$xp->setParameter('', 'title',  $title);
					$xp->setParameter('', 'title_fr',  $title_fr);
					$xp->setParameter('', 'title_en',  $title_en);
					$xp->setParameter('', 'alternative',  $alternative);
					$xp->setParameter('', 'aff_lang',  $aff_lang);
					$xp->setParameter('', 'spatial_fr',  $spatial_fr);
					$xp->setParameter('', 'spatial_en',  $spatial_en);
					$xp->setParameter('', 'spatial_autre',  $spatial_autre);
					$xp->setParameter('', 'created',  $created);
					$xp->setParameter('', 'extent',  $extent);
					$xp->setParameter('', 'north',  $north);
					$xp->setParameter('', 'east',  $east);
					$xp->setParameter('', 'available',  $available);
					$xp->setParameter('', 'license',  $license);
					
										
				
					$xsl = new DomDocument;
					
					$xsl->load('xsl/showText.xsl');
					
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
	function Xslt_moteur_de_recherche($lang, $keywords) {
		
		
		$term       = isset($_GET["term"])    ? ($_GET["term"])    : "";
		
		if ($term=="" or $term=="*"){
		$term=$keywords;	
		}
		
		$field      = isset($_GET["field"])   ? ($_GET["field"])   : "All";
		$mode       = isset($_GET["mode"])    ? ($_GET["mode"])    : "contains";
		$participant     = isset($_GET["participant"])  ? ($_GET["participant"])  : "*";
		$langue     = isset($_GET["langue"])  ? ($_GET["langue"])  : "*";
		$type    = isset($_GET["type"])  ? ($_GET["type"])  : "*";
		$howmany    = isset($_GET["howmany"]) ? ($_GET["howmany"]) : "15";
		$from       = isset($_GET["from"])    ? ($_GET["from"])    : "1";

//echo "coucou";
		$xml = simplexml_load_file('xsl/metadata_lacito.xml');
		
		$xml->registerXPathNamespace('dc',      'http://purl.org/dc/elements/1.1/');
		$xml->registerXPathNamespace('xsi',     'http://www.w3.org/2001/XMLSchema-instance');
		$xml->registerXPathNamespace('oai',     'http://www.openarchives.org/OAI/2.0/');
		$xml->registerXPathNamespace('dcterms', 'http://purl.org/dc/terms/');
		$xml->registerXPathNamespace('olac',    'http://www.language-archives.org/OLAC/1.1/');
	
	
if ($lang=='fr'){
		echo '<div class="row">';
		echo '<form action="" method="GET">';
		echo '<table class="table crdo-request">';
		echo '	<tr>';
		echo '		<th>Mots cl&eacute;s</th>';
		//echo '		<th>Cat&eacute;gorie</th>';
		//echo '		<th>Op&eacute;rateur</th>';
		echo '		<th>Chercheur(s)/Depositaire(s)</th>';
		echo '		<th>Langue(s)</th>';
		echo '		<th>Format</th>';
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
		echo '</td>';
		
		
		/*ajout*/
		
		echo'<td>';
		echo '<select name="type">';
		echo '<option value="*">Tous</option>';

		$result = $xml->xpath('//dc:format[@xsi:type="dcterms:IMT"]');
		
			/*foreach ($result as $val){
				if ($val == 'audio/x-wav'){$val='wav';}
				if ($val == 'application/pdf'){$val='pdf';}
				if ($val == 'audio/flac'){$val='flac';}
				if ($val == 'audio/x-flac'){$val='flac';}
				if ($val == 'text/xml'){$val='xml';}
}	*/
		
		
		$distincts = array_unique($result);
		natsort($distincts);
		
		$pdf=0;
		$xml1=0;
		$audio=0;
		$video=0;
		$image=0;
		$texte=0;
		while(list( , $node) = each($distincts)) {
		
				if ($node=='application/pdf'){
					$val='pdf';
					$pdf+=1;
					if ($pdf==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				if (($node=='text/xml') or ($node=='application/xml')){
					$val='xml';
					$xml1+=1;
					if ($xml1==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				if (($node=='audio/x-wav') or ($node=='audio/wav') or ($node=='audio/x-flac') or ($node=='audio/flac')){
					$val='audio';
					$audio+=1;
					if ($audio==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				if ($node=='video/mp4'){
					$val='video';
					$video+=1;
					if ($video==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				/*if ($node=='image/jpeg'){
					$val='image';
					$image+=1;
					if ($image==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}*/
				/*if ($node=='text/plain'){
					$val='texte';
					$texte+=1;
					if ($texte==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}*/
			}
		echo '</select>';
		//echo count($attente);
		echo '</td>';
			/*fin ajout*/
		
		
		
		echo'<td>';
		echo '<input type="submit" value="Rechercher"/></nobr>';
		echo '     </td>';
		echo '	</tr>';
		echo '</table>';
		echo '</form>';
	
}
else {

		echo '<form action="" method="GET">';
		echo '<table class="table crdo-request">';
		echo '	<tr>';
		echo '		<th>Keyword(s)</th>';
		//echo '		<th>Cat&eacute;gorie</th>';
		//echo '		<th>Op&eacute;rateur</th>';
		echo '		<th>Researcher(s)/Depositor(s)</th>';
		echo '		<th>Language(s)</th>';
		echo '		<th>Type de la ressource</th>';
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
		echo '</td>';
		
		/*ajout*/
		
		echo'<td>';
		echo '<select name="type">';
		echo '<option value="*">Tous</option>';

		$result = $xml->xpath('//dc:format[@xsi:type="dcterms:IMT"]');
		
		
		
		$distincts = array_unique($result);
		natsort($distincts);
		
		$pdf=0;
		$xml1=0;
		$audio=0;
		$video=0;
		$image=0;
		$texte=0;
		while(list( , $node) = each($distincts)) {
		
				if ($node=='application/pdf'){
					$val='pdf';
					$pdf+=1;
					if ($pdf==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				if ($node=='text/xml'){
					$val='xml';
					$xml1+=1;
					if ($xml1==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				if ($node=='audio/x-wav'){
					$val='audio';
					$audio+=1;
					if ($audio==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				if ($node=='video/mp4'){
					$val='video';
					$video+=1;
					if ($video==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}
				/*if ($node=='image/jpeg'){
					$val='image';
					$image+=1;
					if ($image==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}*/
				/*if ($node=='text/plain'){
					$val='texte';
					$texte+=1;
					if ($texte==1){
						if ($val == $type) {
							echo '<option selected="selected">',$val, '</option>';
						} 
						else {
							echo '<option>',$val,'</option>';
						}
					}
				}*/
			}
		echo '</select>';
		//echo count($attente);
		echo '</td>';
			/*fin ajout*/
		
		echo'<td>';
		echo '<input type="submit" value="Search"/></nobr>';
		echo '     </td>';
		echo '	</tr>';
		echo '</table>';
		echo '</form>';
}
		$min = "'abcdefghijklmnopqrstuvwxyz'";
		$maj = "'ABCDEFGHIJKLMNOPQRSTUVWXYZ'";

		if(isset($_GET["term"]) or $term!='') {
		
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
			$condType = '';
			if ($type != '*') {
				if ($type=='pdf'){
					$val='application/pdf';
				}
				if ($type=='xml'){
					$val='text/xml';
				}
				if ($type=='audio'){
					$val='audio/x-wav';
				}
				/*if ($type=='flac'){
					$val='audio/x-flac';
				}*/
				if ($type=='video'){
					$val='video/mp4';
				}
				$condType = "[dc:format = '".$val."']";
			}
			
			
			
			
			$f = ".";
			
$expr = "";

if ($term!=""){

			$f = "dc:contributor|dc:contributor/@olac:code|dc:subject|dc:subject/@olac:code|dc:type/@olac:code|dc:format|dc:language/@olac:code|dc:creator/@olac:code|dc:title|dcterms:alternative";

			
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
			
			
			$result = $xml->xpath('//oai:record[.//olac:olac[not (contains(dcterms:accessRights, "protected"))]'.$condLangue.$condParticipant.$condType.$expr.']');
			
			
			
			$total_reponse=sizeof($result);
			
			if ($lang=='fr'){
				echo '<table class="table resultats" width="100%" border="0" align="left">';
			$i = 0;
			echo '<tr style="background-color:#BCE4C4">';
			echo'<th><div align="left"><font size="-1"></font></div></th>';
			//echo'<th><div align="left"><font size="-1"></font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			/*echo'<th><div align="left"><font size="-1"></font></div></th>';*/
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">Titre</font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">Langue</font></div></th>';
			//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">Chercheur(s)</font></div></th>';
    		//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">Locuteur(s)</font></div></th>';
			
			echo'</tr>';	
				
				echo $total_reponse." r&eacute;sultats";
				
			}
			else {
				
				echo '<table class="table resultats" width="100%" border="0" align="left">';
			$i = 0;
			echo '<tr>';
			echo'<th><div align="left"><font size="-1"></font></div></th>';
			/*echo'<th><div align="left"><font size="-1"></font></div></th>';*/
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
		//	echo'<th><div align="left"><font size="-1"></font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">Title</font></div></th>';
	 		//echo'<th><div align="left"><font size="-1"></font></div></th>';
			echo'<th><div align="left"><font size="-1">Language</font></div></th>';
			//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">Researcher(s)</font></div></th>';
    		//echo' <th><div align="left"><font size="-1"></font></div></th>';
	 		echo'<th><div align="left"><font size="-1">Speaker(s)</font></div></th>';
			
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
				
				
				if (strlen($tit) > 45) {
					$tit = substr($tit, 0, 40) . '...';
				}
				
				$id          = substr(@Xpath_first_value($node, '//header/identifier'), strlen('oai:crdo.risc.cnrs.fr:')-1);
				
				/*$href        = @Xpath_first_value($node, '//dc:identifier');*/
			
				$has_transcr = @Xpath_first_value($node, '//dcterms:isRequiredBy');
				
				$idref          = substr(@Xpath_first_value($node, '//dcterms:isRequiredBy'), strlen('oai:crdo.risc.cnrs.fr:')-1);
				
				if ($has_transcr) {
					$href_trans = 'show_text.php?id='.$id.'&amp;idref='.$idref;
				}
				
				$hrefs        = @Xpath_values($node, '//dc:identifier');
				
				$href = split(';',$hrefs);
				
				$hrefs='';
				
				
				$researchers = @Xpath_values($node, '//dc:contributor[@olac:code="researcher"]');
				
				//coupure entre les noms des differents chercheurs (s'il y en a plus d'un)
				$researcher = split(';',$researchers);
				
				$fn_researchers='';
				
				
				
				// s il n y a qu un chercheur
				if (sizeof($researcher)==0){
				// coupure entre le nom et le prenom du chercheur
					$temp_researcher=split(',',$researchers);
					//$fn_researchers=$temp_researcher[0];
					$fn_researchers=$researchers;
				}
				//s il y a plusieurs chercheurs
				else{
				
					for ($k=0;$k<sizeof($researcher);$k++){
						
						if ($k==0){
							$fn_researchers=$researcher[0];
						}
						else {
						$fn_researchers=$fn_researchers.' ; '.$researcher[$k];
						}
					// coupure entre le nom et le prenom de chaque chercheur liste
						/*$temp_researcher=split(',',$researcher[$k]);
						
						if (($fn_researchers!='') and (sizeof($temp_researcher[0])>0)){
							
								$fn_researchers=$fn_researchers.' ; '.$temp_researcher[0];
				
						}
						else {
							
							$fn_researchers=$temp_researcher[0];
						}*/
				
					}
				}
				
				
				$locutor = @Xpath_values($node, '//dc:contributor[@olac:code="speaker"]');
				$locutors = $locutor;
				
				
				/*if (strlen($fn_researchers) > 25) {
					$fn_researchers = substr($fn_researchers, 0, 24) . '...';
				}
				
				if (strlen($locutor) > 25) {
					$locutor = substr($locutor, 0, 24) . '...';
				}*/
				
				
				$language = @Xpath_values($node, '//dc:subject[@xsi:type="olac:language"]');


				$l_temp=split(";",$language);
				
				
				if( sizeof($l_temp)>1){
									
					if($l_temp[0] != $l_temp[1]){$language=$l_temp[0]."/".$l_temp[1];}
					else {$language=$l_temp[0];}
				}
				
				
				
		
				


				
				
				
				
				$type = @Xpath_values($node, '//dc:format[xsi:type="dcterms:DCMIType"]');

		
				$id_s  = @Xpath_values($node, '//dcterms:requires');


				$idSound=split(";",$id_s);

			
		
				
				/*echo '<a href="', $href,'" title ="Ecouter ce texte" target="_blank" >';

				echo '<img class="sansBordure" border=0 src="../../images/images_pangloss/haut_parleur_s.png"/></a>';*/
			
				
				if (sizeof($href)==0){
				if (strpos($href,'.wav')){
					echo '<a href="show_text.php?id=', $id,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img class="sansBordure" border=0 src="../../images/images_pangloss/haut_parleur_s.png" height="25" width="25" /></a>';}
				elseif (strpos($href,'.mp4') == true){
					echo '<a href="show_text.php?id=', $id,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img class="sansBordure" border=0 src="../../images/icones/video.png" height="25" width="25" /></a>';}

				elseif  (strpos($href,'.xml') == true){
			
			for ($k=0;$k<sizeof($idSound);$k++){ 	
				echo '<a href="show_text.php?id=', substr($idSound[$k], strlen('oai:crdo.risc.cnrs.fr:')-1),'&amp;idref=', $id,'" title ="Ecouter ce texte" target="_blank" >';
			}
				echo '<img class="sansBordure" border=0 src="../../images/icones/Txt_Inter_parchemin.jpg" height="25" width="30" /></a>';}
				
				elseif  (strpos($href,'.pdf') == true){
				echo '<a href="show_other.php?id=', $idSound,'&amp;idref=', $id,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img height="25" width="25" class="sansBordure" border=0 src="../../images/icones/pdf_son2.png"/></a>';}
				}
				//s il y a plusieurs href
				else{
					
				
					for ($k=0;$k<sizeof($href);$k++){
						if (strpos($href[$k],'.wav')){
					echo '<a href="show_text.php?id=', $id,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img class="sansBordure" border=0 src="../../images/icones/logo_son.jpg" height="25" width="25" /></a>';}
				elseif (strpos($href[$k],'.mp4') == true){
					echo '<a href="show_text.php?id=', $id,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img class="sansBordure" border=0 src="../../images/icones/video.png" height="25" width="25" /></a>';}

				elseif  (strpos($href[$k],'.xml') == true){
			
			for ($k=0;$k<sizeof($idSound);$k++){ 	
			
				echo '<a href="show_text.php?id=', substr($idSound[$k], strlen('oai:crdo.risc.cnrs.fr:')-1),'&amp;idref=', $id,'" title ="Ecouter ce texte" target="_blank" >';
			
				
				echo '<img class="sansBordure" border=0 src="../../images/icones/Txt_Inter_parchemin.jpg" height="25" width="30" /></a>';}
			}
				
				elseif  (strpos($href[$k],'.pdf') == true){
				echo '<a href="show_other.php?id=', $idSound,'&amp;idref=', $id,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img height="25" width="25" class="sansBordure" border=0 src="../../images/icones/pdf_son2.png"/></a>';}
					}
				}
				
				/*
				echo '<a href="', $href,'" title ="Ecouter ce texte" target="_blank" >Accès</a>';
				
				echo '</td>';
				echo '<td valign="top">';
				if ($has_transcr) {
					
				echo '<a href="', $href_trans,'" title ="Ecouter ce texte" target="_blank" >';
				echo '<img class="sansBordure" border=0 src="../../images/icones/Txt_Inter_parchemin.jpg"/></a>'; 
				}*/
echo '</td>';
				/*echo '<td valign="top">';
				echo '<a href="show_metadatas.php?id=',$id,'" title="A propos de ',$titre,'" target="_blank" onClick="window.open(this.href,"popupLink","width=640,height=400,scrollbars=yes,resizable=yes",1);return false">';
				echo '<img class="sansBordure" border=0 src="../../images/icones/info_marron.jpg"/></a>';
				echo '</td>';*/
				//echo '<td valign="top"> </td>';				
				
				echo "<td title='$titre'>$tit</td>";
				//echo '<td valign="top"> </td>';
				echo "<td title='$language'>$language</td>";
				
				
				//echo '<td valign="top"> </td>';
				echo "<td title='$researchers'>$fn_researchers</td>";
				//echo '<td valign="top"> </td>';
				echo "<td title='$locutors'>$locutor</td>";
				
				echo "<td title='$type'>$type</td>";
				echo '</tr>';
				$i++;
			}
			echo '</table></center>';
		} else {
			
			if ($lang=='fr'){
				echo '<div class="alert alert-danger"><b>Pas de requ&ecirc;te</b></div>';
			}
			else {			
				echo '<div class="alert alert-danger"><b>There is no request</b></div>';
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

?>
