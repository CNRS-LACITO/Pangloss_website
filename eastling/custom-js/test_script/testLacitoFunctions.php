<?php

//$id=  isset($_GET["id"])    ? utf8_encode($_GET["id"])    : "*";
//$idref=  isset($_GET["idref"])    ? utf8_encode($_GET["idref"])    : "*";

//$id="crdo-TWH_T19";
//$idref="crdo-TWH_T19";
$idref = $_GET["idref"];


$prefixe_id = "oai:crdo.vjf.cnrs.fr:";
$identifier = $prefixe_id.$idref;
$metadatafile = 'metadata_lacito.xml';

$xml = simplexml_load_file($metadatafile);


$namespaces = $xml->getDocNamespaces(true);
//Register them with their prefixes 
foreach ($namespaces as $prefix => $ns) {
    $xml->registerXPathNamespace($prefix, $ns);
    
    
}

$metadata = array();
$url_image = array();

foreach ($xml->children() as $op) {
    foreach($op->ListRecords->record as $record){
        if($identifier == $record->header->identifier->__toString()){
            
            $tag_olac = $record->metadata->children('olac', TRUE);
            $olac = $tag_olac->olac;
            
            $tag_dc = $olac->children('dc', TRUE);
            $tag_dcterms = $olac->children('dcterms', TRUE);
                       
            $dc_identifier = $tag_dc->identifier;
            
            $dcterms_requires = $tag_dcterms->requires;
            
            foreach($dcterms_requires as $requires){
                $id_requires = $prefixe_id;
                $id_requires .= $requires->__toString();
                
                foreach ($xml->children() as $op2) {
                    foreach($op2->ListRecords->record as $record2){
                        if($id_requires == $record2->header->identifier->__toString()){
                            $tag_olac2 = $record2->metadata->children('olac', TRUE);
                            $olac2 = $tag_olac2->olac;

                            $tag_dc2 = $olac2->children('dc', TRUE);
                            $tag_dcterms2 = $olac2->children('dcterms', TRUE);

                            $type = $tag_dc2->type->__toString();

                            if($type == "Image"){
                               $url_image[] = $tag_dcterms2->isFormatOf->__toString();  
                            }elseif($type == "Sound"){
                               $url_audio = $tag_dcterms2->isFormatOf->__toString(); 
                            }
                        }
                    }
                }
            }
                
            
            $metadata["identifier"] = $dc_identifier->__toString();
                
            $dc_subject = $tag_dc->subject;

                foreach ($dc_subject as $subject) {
                    $attr_dc_subject = $subject->attributes('olac', TRUE);
                    $code_lang = $attr_dc_subject['code']->__toString();

                    $metadata["subject"][] = array(
                        "code_lang" => $code_lang,
                        "subject" => $subject->__toString(),
                    );
                }                

                $dc_language = $tag_dc->language;

                foreach ($dc_language as $langue) {

                    $attr_dc_language_olac = $langue->attributes('olac', TRUE);
                    $attr_dc_language_xsi = $langue->attributes('xsi', TRUE);

                    $lang = $attr_dc_language_olac['code']->__toString();
                    $type = $attr_dc_language_xsi['type']->__toString();

                    $metadata["language"][] = array(
                        "code" => $lang,
                        "type" => $type,
                    );
                }

                $dc_spatial = $tag_dcterms->spatial;

                foreach ($dc_spatial as $sp) {

                    $attr_dc_spatial_xml = $sp->attributes('xml', TRUE);
                    $attr_dc_spatial_xsi = $sp->attributes('xsi', TRUE);

                    $langsp = "";
                    $typesp = "";

                    if ($attr_dc_spatial_xml['lang']) {
                        $langsp = $attr_dc_spatial_xml['lang']->__toString();
                    }
                    if ($attr_dc_spatial_xsi['type']) {
                        $typesp = $attr_dc_spatial_xsi['type']->__toString();
                    }

                    $metadata["spatial"][] = array(
                        "lang" => $langsp,
                        "type" => $typesp,
                        "spatial" => $sp->__toString(),
                    );
                }

                //RECUPERATION DU TITRE PRINCIPAL + ALTERNATIFS
                $dc_title = $tag_dc->title; //$dc_title = $crdo->children($namespaces['dc'])->title;

                foreach ($dc_title as $dc) {

                    $attr_dc = $dc->attributes('xml', TRUE); //$attr_dc = $dc->attributes("http://www.w3.org/XML/1998/namespace");    
                    $dc_lang = $attr_dc['lang']->__toString();

                    $metadata["title"][] = array(
                        "lang" => $dc_lang,
                        "title" => $dc->__toString(),
                    );
                }
                
                $dc_title_alter = $tag_dcterms->alternative; //$dc_title = $crdo->children($namespaces['dc'])->title;

                foreach ($dc_title_alter as $dc) {

                    $attr_dc = $dc->attributes('xml', TRUE); //$attr_dc = $dc->attributes("http://www.w3.org/XML/1998/namespace");    
                    $dc_lang = $attr_dc['lang']->__toString();

                    $metadata["title"][] = array(
                        "lang" => $dc_lang,
                        "title" => $dc->__toString(),
                    );
                }

                $dc_contributor = $tag_dc->contributor;

                foreach ($dc_contributor as $contributor) {
                    //$attr_xsi_contributor = $contributor->attributes('xsi', TRUE);    
                    $attr_olac_contributor = $contributor->attributes('olac', TRUE);
                    $code_contributor = $attr_olac_contributor['code']->__toString();

                    $metadata["contributors"][] = array(
                        "code" => $code_contributor,
                        "contributor" => $contributor->__toString(),
                    );
                }
                // CORRECTION BUG : publisher est devenu un Array 
                $dc_publisher = $tag_dc->publisher;
                foreach ($dc_publisher as $publisher) {
                    $metadata["publisher"][] = $publisher->__toString();
                }

                $metadata["format"] = $tag_dc->format->__toString();
                $metadata["source"] = $tag_dc->source->__toString();
                $metadata["type"] = $tag_dc->type->__toString();
                $metadata["rights"] = $tag_dc->rights->__toString();

                $metadata["created"] = $tag_dcterms->created->__toString();
                $metadata["isRequiredBy"] = $tag_dcterms->isRequiredBy->__toString();
                $metadata["accessRights"] = $tag_dcterms->accessRights->__toString();
                $metadata["isPartOf"] = $tag_dcterms->isPartOf->__toString();
                $metadata["available"] = $tag_dcterms->available->__toString();
                $metadata["license"] = $tag_dcterms->license->__toString();

                //$metadata["collection"] = $crdo->children('crdo', TRUE)->collection->__toString();

                $formatof = $tag_dcterms->isFormatOf;

                foreach ($formatof as $f) {
                    $metadata["isFormatOf"][] = $f->__toString();
                }

                //echo CJSON::encode($metadata);
                
        }
    }
}


$xml = simplexml_load_file($metadata['identifier']);


$namespaces = $xml->getDocNamespaces(true);

foreach ($namespaces as $prefix => $ns) {
    $xml->registerXPathNamespace($prefix, $ns);
}

$sentences = array();
$words = array();

foreach ($xml->S as $sentence) {
    echo $sentence->asXML();
    
    $selection = array();

    $selection["id"] = $sentence->attributes()->id->__toString();

    $str_explode = str_replace('crdo-', '', $idref) . '_S';
    $id_parts = explode($str_explode, $selection->id);


    $selection["startPosition"] = $sentence->AUDIO->attributes()->start->__toString();
    $selection["endPosition"] = $sentence->AUDIO->attributes()->end->__toString();


    foreach ($sentence->FORM as $form) {
        $selection["transcriptions"][] = array(
            'lang' => $form->attributes()->kindOf->__toString(),
            'transcription' => $form->__toString()
        );
    }


    foreach ($sentence->TRANSL as $transl) {

        $attr_transl = $transl->attributes('xml', TRUE); //$attr_crdo = $crdo->attributes($namespaces['crdo']);

        $lang = (string) $attr_transl->lang;

        $selection["traductions"][] = array(
            'lang' => $lang,
            'traduction' => $transl->__toString()
        );
    }

//    foreach ($sentence->AREA as $area) {
//        $position = explode(',', $area->__toString());
//        $w = intval($position[2]) - intval($position[0]);
//        $h = intval($position[3]) - intval($position[1]);
//        $selection["areas"][] = array(
//            'image' => $area->attributes()->image->__toString(),
//            'x1' => $position[0],
//            'y1' => $position[1],
//            'x2' => $position[2],
//            'y2' => $position[3],
//            'w' => $w,
//            'h' => $h
//        );
//    }

    
    $selection["words"] = array();
 /*           
    foreach ($sentence->W as $word) {

        $selection2 = array();

        $selection2["id"] = $word->attributes()->id->__toString();

        $str_explode = str_replace('crdo-', '', $idref) . '_W';
        $id_parts = explode($str_explode, $selection2->id);

        $selection2["startPosition"] = $word->AUDIO->attributes()->start->__toString();
        $selection2["endPosition"] = $word->AUDIO->attributes()->end->__toString();


        foreach ($word->FORM as $form) {
            $selection2["transcriptions"][] = array(
                'lang' => $form->attributes()->kindOf->__toString(),
                'transcription' => $form->__toString()
            );
        }


        foreach ($word->TRANSL as $transl) {

            $attr_transl = $transl->attributes('xml', TRUE); //$attr_crdo = $crdo->attributes($namespaces['crdo']);

            $lang = (string) $attr_transl->lang;

            $selection2["traductions"][] = array(
                'lang' => $lang,
                'traduction' => $transl->__toString()
            );
        }

        foreach ($word->AREA as $area) {
            $position = explode(',', $area->__toString());
            $w = intval($position[2]) - intval($position[0]);
            $h = intval($position[3]) - intval($position[1]);
            $selection2["areas"][] = array(
                'image' => $area->attributes()->image->__toString(),
                'x1' => $position[0],
                'y1' => $position[1],
                'x2' => $position[2],
                'y2' => $position[3],
                'w' => $w,
                'h' => $h
            );
        }

        $words[] = $selection2;
        $selection["words"][] = $selection2;
    }
  */  
    $sentences[] = $selection;
}

$result = array(
    metadata => $metadata,
    url_image => $url_image,
    url_audio => $url_audio,
    annotations => $sentences
);


echo json_encode($result);
					                                    
?>