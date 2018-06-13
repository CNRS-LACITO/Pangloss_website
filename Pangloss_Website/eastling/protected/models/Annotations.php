<?php

/*
 * Cette classe permet de manipuler le fichier des annotations 
 * qui contient les transcriptions et traductions des phrases et mots d'un document
 */

/**
 * Description of Document
 *
 * @author imac
 */
class Annotations {

    public $document_filepath; //suppression de l'objet car boucle infinie lors du rattachement
    public $lang;
    public $title = array();
    public $id;
    public $filepath;
    public $sentences = array();
    public $words = array();
    public $last_sentence_id = 0;
    public $last_word_id = 0;

    public function rules() {
        return array(
            array('document, id, sentences, words', 'safe'),
        );
    }

    private static function sortLang($a, $b){
        if ($a['lang'] === $b['lang']) {
            return 0;
        }
        return ($a['lang'] < $b['lang']) ? -1 : 1;
    }
    
    function __construct($args) {

        if ($args) {
            foreach ($args as $key => $val) {
                if (property_exists($this, "$key")) {
                    $this->{"$key"} = $val;
                }
            }


            //if ($this->document_filepath != '') {

            $this->filepath = str_replace('metadata_', '', $this->document_filepath);

            $paths = explode("/", $this->filepath);
            $index = sizeof($paths);

            //$this->id = str_replace('.xml', '', $paths[$index - 1]);
            
            $this->id = $paths[$index - 2]; //version JSON : no more XML



            $this->getFromXML(); /////PROBLEME SUR TRANSL
            //}
        }
    }

    public function __set($name, $value) {
        $this->data[$name] = $value;
    }

    public function delete() {
        
    }

    public function existXML() {//OK
        if (file_exists($this->filepath) && is_file($this->filepath)) {
            return $this->filepath;
        } else {
            return false;
        }
    }

    public function createXML() {//OK
        if (!$this->existXML()) {

            $newfile = fopen($this->filepath, "w");

            //UNUSED $document = new Document(array(''));
            //29/04/2015 AJOUT BALISE DOCTYPE
            $txt = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE TEXT SYSTEM "../../Archive_v2.dtd"><TEXT xmlns="http://crdo.risc.fr/schemas/annotation" 
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
      xsi:schemaLocation="http://crdo.risc.fr/schemas/annotation http://cocoon.huma-num.fr/schemas/archive.xsd" 
      id="' . $this->id . '" 
      xml:lang="' . $this->lang . '">
    <HEADER>';

            foreach ($this->title as $title) {
                $txt.='<TITLE xml:lang="' . $title['lang'] . '">' . $title['title'] . '</TITLE>';
            }
            $txt.='</HEADER></TEXT>';

            fwrite($newfile, $txt);
            fclose($newfile);

            $this->filepath = $this->existXML();

            return $this;
        } else {
            return false;
        }
    }

    public function getFromXML() {// compléter avec les mots
        if ($file = $this->existXML()) {

            $xml = simplexml_load_file($file);

            $namespaces = $xml->getDocNamespaces(true);

            foreach ($namespaces as $prefix => $ns) {
                $xml->registerXPathNamespace($prefix, $ns);
            }

            $this->sentences = array();
            $this->words = array();
            $this->last_sentence_id = 1;
            $this->last_word_id = 1;

            foreach ($xml->S as $sentence) {

                $selection = new Selection();

                //BUFIXING : 16/04/2017
                // il faut fixer les ID de phrases et mots lorsqu'on importe du XML > JSON

                /*$selection->id = $sentence->attributes()->id->__toString();
                $str_explode = str_replace('crdo-', '', $this->id) . '_S';
                $id_parts = explode($str_explode, $selection->id);

                $current_sentence_id = intval(ltrim($id_parts[sizeof($id_parts) - 1], "0"));


                if ($current_sentence_id > $this->last_sentence_id)
                    $this->last_sentence_id = $current_sentence_id;

                    */

                $selection->id = $this->id.'_S'.$this->last_sentence_id++;

                if(count($sentence->children('AUDIO'))>0){    
                        $selection->startPosition = $sentence->AUDIO->attributes()->start->__toString();
                        $selection->endPosition = $sentence->AUDIO->attributes()->end->__toString();
                    }else{
                        $selection->startPosition = 0;
                        $selection->endPosition = 0;
                    }

                


                foreach ($sentence->FORM as $form) {
                    $attributes = $form->attributes();
                    $langform = "";

                    if(isset($attributes['kindOf'])){
                        $langform = $form->attributes()->kindOf->__toString();
                    }

                    $selection->transcriptions[] = array(
                        'lang' => $langform,
                        'transcription' => $form->__toString()
                    );
                }


                foreach ($sentence->TRANSL as $transl) {

                    $attr_transl = $transl->attributes('xml', TRUE); //$attr_crdo = $crdo->attributes($namespaces['crdo']);

                    $lang = (string) $attr_transl->lang;

                    $selection->traductions[] = array(
                        'lang' => $lang,
                        'traduction' => $transl->__toString()
                    );
                }


                //ATTENTION CETTE BALISE N'EXISTE PAS DANS LES ANCIENS FORMATS PANGLOSS
                //if($sentence->AREA){ //KO
                if(count($sentence->children('AREA'))>0){
                    foreach ($sentence->AREA as $area) {
                        //new DTD
                        $position = explode(',',$area->attributes()->coords->__toString());
                        

                        $w = intval($position[2]) - intval($position[0]);
                        $h = intval($position[3]) - intval($position[1]);

                        $selection->areas[] = array(
                            'image' => $area->attributes()->image->__toString(),
                            'x1' => $position[0],
                            'y1' => $position[1],
                            'x2' => $position[2],
                            'y2' => $position[3],
                            'w' => $w,
                            'h' => $h
                        );
                    }
                }else{
                    $selection->areas[] = array(
                        'image' => '',
                        'x1' => 0,
                        'y1' => 0,
                        'x2' => 0,
                        'y2' => 0,
                        'w' => 0,
                        'h' => 0
                    );
                }
                


                foreach ($sentence->W as $word) {

                    $selection_w = new Selection();
                    /* 26/10/2016 : 
                    ATTENTION les ID de Word n'existent pas dans les versions de document pré-Eastling
                    */
                    /*
                    if($word->attributes()->id)
                        $selection_w->id = $word->attributes()->id->__toString();

                    $str_explode = str_replace('crdo-', '', $this->id) . '_W';
                    $id_parts = explode($str_explode, $selection_w->id);

                    $current_word_id = intval(ltrim($id_parts[sizeof($id_parts) - 1], "0"));

                    if ($current_word_id > $this->last_word_id)
                        $this->last_word_id = $current_word_id;
                        */

                    $selection_w->id = $this->id.'_W'.$this->last_word_id++;


                    /* 26/10/2016 : 
                    ATTENTION les balises AUDIO de Word n'existent pas dans les versions de document pré-Eastling
                    */
                    //if($word->AUDIO){
                    if(count($word->children('AUDIO'))>0){    
                        $selection_w->startPosition = $word->AUDIO->attributes()->start->__toString();
                        $selection_w->endPosition = $word->AUDIO->attributes()->end->__toString();
                    }else{
                        $selection_w->startPosition = 0;
                        $selection_w->endPosition = 0;
                    }
                    


                    foreach ($word->FORM as $form) {
                        /* 26/10/2016 : 
                        ATTENTION les balises AUDIO de Word n'existent pas dans les versions de document pré-Eastling
                        */
                        $kindOf = "";

                        if($form->attributes()->kindOf) $kindOf = $form->attributes()->kindOf->__toString();

                        $selection_w->transcriptions[] = array(
                            'lang' => $kindOf,
                            'transcription' => $form->__toString()
                        );
                    }


                    foreach ($word->TRANSL as $transl) {

                        $attr_transl = $transl->attributes('xml', TRUE); //$attr_crdo = $crdo->attributes($namespaces['crdo']);

                        $lang = (string) $attr_transl->lang;

                        $selection_w->traductions[] = array(
                            'lang' => $lang,
                            'traduction' => $transl->__toString()
                        );
                    }

                    if(count($word->children('AREA'))>0){

                        foreach ($word->AREA as $area) {
                            //old format
                            //$position = explode(',', $area->__toString());

                            //new DTD
                            $position = explode(',',$area->attributes()->coords->__toString());
                            
                            $w = intval($position[2]) - intval($position[0]);
                            $h = intval($position[3]) - intval($position[1]);
                            $selection_w->areas[] = array(
                                'image' => $area->attributes()->image->__toString(),
                                'x1' => $position[0],
                                'y1' => $position[1],
                                'x2' => $position[2],
                                'y2' => $position[3],
                                'w' => $w,
                                'h' => $h
                            );
                        }
                    }else{
                        $selection_w->areas[] = array(
                            'image' => '',
                            'x1' => 0,
                            'y1' => 0,
                            'x2' => 0,
                            'y2' => 0,
                            'w' => 0,
                            'h' => 0
                        );
                    }
                    
                    usort($selection_w->transcriptions,array($this,'sortLang'));
                    usort($selection_w->traductions,array($this,'sortLang'));
                    
                    $this->words[] = $selection_w;
                    $selection->children[] = $selection_w;
                }

                usort($selection->transcriptions,array($this,'sortLang'));
                usort($selection->traductions,array($this,'sortLang'));
                
                $this->sentences[] = $selection;
            }
            
        }
    }


    public function addSelection($new_selection, $motphrase = 'phrase') {

        $return = "";

        if ($file = $this->existXML()) {
            //$return .="Fichier annotations existe ";
            $xml = simplexml_load_file($file);

            $namespaces = $xml->getDocNamespaces(true);

            foreach ($namespaces as $prefix => $ns) {
                $xml->registerXPathNamespace($prefix, $ns);
            }


            if ($motphrase == 'phrase') {
                $this->last_sentence_id++;

                $motphrase_letter = 'S';
                $selection = $xml->addChild('S');
                $id_selection = str_replace('crdo-', '', $this->id) . '_' . $motphrase_letter . str_pad($this->last_sentence_id, 3, '0', STR_PAD_LEFT);

                $return .="OK";
            } else {
                $this->last_word_id++;
                //il faut placer la nouvelle sélection de mot dans la phrase correspondante, 
                //en se repérant par rapport à la position dans l'audio
                $motphrase_letter = 'W';

                $find_sentence = false;

                foreach ($xml->S as $sentence) {

                    if ($find_sentence == true)
                        break;

                    $start_selection = $new_selection->startPosition;
                    $end_selection = $new_selection->endPosition;

                    if(($end_selection != '') && ($end_selection != 0)){ // on ajoute le mot à la bonne phrase selon le positionnement audio ...
                        $return .=' Sel by AUDIO ';
                        $start_sentence = $sentence->AUDIO->attributes()->start->__toString();
                        $end_sentence = $sentence->AUDIO->attributes()->end->__toString();

                        if (($start_selection >= $start_sentence) && ($start_selection <= $end_sentence)) {
                            if ($end_selection <= $end_sentence) {
                                $find_sentence = true;
                                $sentence_to_add = $sentence;
                            } else {
                                if (($end_sentence - $start_selection) > ($end_selection - $end_sentence)) {
                                    $find_sentence = true;
                                    $sentence_to_add = $sentence;
                                }
                            }
                        } else {
                            if ($end_selection <= $end_sentence) {
                                $find_sentence = true;
                                $sentence_to_add = $sentence;
                            }
                        } 
                    }else{ //... ou selon le positionnement visuel
                        $return .=' Sel by AREA ';
                        
                        $y1=$new_selection->areas[0]['area']['y1'];
                        $y2=$new_selection->areas[0]['area']['y2'];
                        
                        $baricentre = ($y1 + $y2) / 2;
                        
                        $coords = $sentence->AREA->__toString();
                        //TODO : modifier (new DTD Jacobson)

                        $coords_array = explode(',',$coords);
                        
                        if(($baricentre > $coords_array[1]) && ($baricentre < $coords_array[3]) ){
                            $find_sentence = true;
                            $sentence_to_add = $sentence;
                        }                        
                        
                    }
                    
                }

                //$selection = $xml->addChild('W');
                $selection = $sentence_to_add->addChild('W');

                $id_selection = str_replace('crdo-', '', $this->id) . '_' . $motphrase_letter . str_pad($this->last_word_id, 3, '0', STR_PAD_LEFT);
                $return .="OK";
            }

            $selection->addAttribute('id', $id_selection);

            $audio = $selection->addChild('AUDIO');
            $audio->addAttribute('start', $new_selection->startPosition);
            $audio->addAttribute('end', $new_selection->endPosition);

            foreach ($new_selection->transcriptions as $transcription) {
                $form = $selection->addChild('FORM', $transcription['transcription']);
                $form->addAttribute('kindOf', $transcription['lang']);
            }

            if($new_selection->traductions){
                foreach ($new_selection->traductions as $traduction) {
                    $transl = $selection->addChild('TRANSL', $traduction['traduction']);
                    $transl->addAttribute('xmlns:xml:lang', $traduction['lang']);
                }
            }
            
            if($new_selection->areas){
                foreach ($new_selection->areas as $area) {
                    //TODO : modifier (new DTD Jacobson)
                    $area_tag = $selection->addChild('AREA', $area['area']['x1'] . "," . $area['area']['y1'] . "," . $area['area']['x2'] . "," . $area['area']['y2']);
                    $area_tag->addAttribute('image', $area['image']);
                }
            }

            $xml->asXML($file);

            $this->getFromXML();
            $this->cleanXML();

            return $return;
        }
    }

    public function delSelection($id_selection, $motphrase = 'phrase') {

        $msg = 'Nothing happened';
        $dom = new DOMNode();
        
        if ($file = $this->existXML()) {
            $msg .= '. File exists';
            $xml = simplexml_load_file($file);

            $namespaces = $xml->getDocNamespaces(true);

            foreach ($namespaces as $prefix => $ns) {
                $xml->registerXPathNamespace($prefix, $ns);
            }


            foreach ($xml->S as $sentence) {
                if ($motphrase == 'phrase') {
                    $msg .=' Phrase to delete : '.$id_selection;
                    
                    $selection_id = $sentence->attributes()->id->__toString();

                    if ($selection_id == $id_selection) {
                        $msg.=". Found !";
                        $dom = dom_import_simplexml($sentence);
                        $dom->parentNode->removeChild($dom);
                        
                        $msg = "Phrase ".$selection_id. " supprimée";
                    }
                } else {
                    foreach ($sentence->W as $word) {

                        $selection_id = $word->attributes()->id->__toString();


                        if ($selection_id == $id_selection) {

                            $dom = dom_import_simplexml($word);
                            $dom->parentNode->removeChild($dom);

                            $msg = "Mot ".$selection_id. " supprimé";
                        }                       
                    }
                }
            }
            $doc = new DOMDocument();
            $doc->loadXML($xml->asXML());
            $doc->save($file);

            $this->cleanXML();
        }
        return $msg;
    }

    public function updateAnnotation($update_selection, $motphrase = 'S', $type, $textbeforeupdate, $langbeforeupdate) {

        $id_selection = $update_selection->id;
        $message = "Update annotation : ";

        if ($file = $this->existXML()) {

            $xml = simplexml_load_file($file);

            $i = 0;
            $find = false;



            foreach ($xml->S as $sentence) {


                if ($motphrase == 'S') {
                    $message .="Sentence ";
                    $selection_id = $sentence->attributes()->id->__toString();

                    if ($selection_id == $id_selection) {
                        $message .=$id_selection . " ";

                        if ($type == 'transcription') {
                            foreach ($sentence->FORM as $form) {
                                //unset($form[0][0]);
                                if (($form->attributes()->kindOf->__toString() == $langbeforeupdate) && ($form->__toString() == $textbeforeupdate)) {
                                    $dom = dom_import_simplexml($form);
                                    $dom->parentNode->removeChild($dom);

                                    foreach ($update_selection->transcriptions as $transcription) {
                                        $form = $sentence->addChild('FORM', $transcription['transcription']);
                                        $form->addAttribute('kindOf', $transcription['lang']);
                                    }
                                }
                            }
                        } else if ($type == 'traduction') {
                            foreach ($sentence->TRANSL as $transl) {
                                //unset($form[0][0]);
                                if (($transl->attributes('xml', TRUE)->lang->__toString() == $langbeforeupdate) && ($transl->__toString() == $textbeforeupdate)) {
                                    $dom = dom_import_simplexml($transl);
                                    $dom->parentNode->removeChild($dom);

                                    foreach ($update_selection->traductions as $traduction) {
                                        $transl = $sentence->addChild('TRANSL', $traduction['traduction']);
                                        $transl->addAttribute('xmlns:xml:lang', $traduction['lang']);
                                    }
                                }
                            }
                        }
                    }
                } else if ($motphrase == 'W') {  

                    foreach ($sentence->W as $word) {

                        $selection_id = $word->attributes()->id->__toString();

                        if ($selection_id == $id_selection) {
                            $message .="Word ";
                            $message .=$id_selection . " ";

                            if ($type == 'transcription') {
                                foreach ($word->FORM as $form) {
                                    //unset($form[0][0]);
                                    if (($form->attributes()->kindOf->__toString() == $langbeforeupdate) && ($form->__toString() == $textbeforeupdate)) {
                                        $dom = dom_import_simplexml($form);
                                        $dom->parentNode->removeChild($dom);

                                        foreach ($update_selection->transcriptions as $transcription) {
                                            $form = $word->addChild('FORM', $transcription['transcription']);
                                            $form->addAttribute('kindOf', $transcription['lang']);
                                        }
                                    }
                                }
                            } else if ($type == 'traduction') {
                                foreach ($word->TRANSL as $transl) {
                                    //unset($form[0][0]);
                                    if (($transl->attributes('xml', TRUE)->lang->__toString() == $langbeforeupdate) && ($transl->__toString() == $textbeforeupdate)) {
                                        $dom = dom_import_simplexml($transl);
                                        $dom->parentNode->removeChild($dom);

                                        foreach ($update_selection->traductions as $traduction) {
                                            $transl = $word->addChild('TRANSL', $traduction['traduction']);
                                            $transl->addAttribute('xmlns:xml:lang', $traduction['lang']);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        $message.=$type;

        $doc = new DOMDocument();
        $doc->loadXML($xml->asXML());
        $doc->save($file);

        $this->cleanXML();
        echo $message;
    }

    public function updatePosition($update_selection, $motphrase = 'S', $type, $position) {
        
        $id_selection = $update_selection->id;
        $message = "Update position : ";

        if($type == "audio"){
            $position = CJSON::decode($position); //OK
        }
                
        if ($file = $this->existXML()) { //OK
                       
            $xml = simplexml_load_file($file);

            $i = 0;
            $find = false;

            foreach ($xml->S as $sentence) {

                if ($motphrase == 'S') {
                    $message .="Sentence ";
                    $selection_id = $sentence->attributes()->id->__toString();

                    if ($selection_id == $id_selection) {
                        $message .=$id_selection . " ";

                        if($type == "audio"){
                            
                            foreach ($sentence->AUDIO as $audio) {
                            //unset($form[0][0]);
                                                              
                                $dom = dom_import_simplexml($audio);
                                $dom->parentNode->removeChild($dom);
                                $audio = $sentence->addChild('AUDIO');
                                
                                $audio->addAttribute('start', $position['start']);
                                $audio->addAttribute('end', $position['end']);
                                
                            }
                        }else if($type == "image"){
                            foreach ($sentence->AREA as $area) {
                            //unset($form[0][0]);
                                
                                $dom = dom_import_simplexml($area);
                                $dom->parentNode->removeChild($dom);

                            }
                            
                            foreach($position as $area_image){
                                //TODO : modifier (new DTD Jacobson)

                               $position2string = $area_image['area']['x1'].",".$area_image['area']['y1'].",".$area_image['area']['x2'].",".$area_image['area']['y2'];
                                
                                $area = $sentence->addChild('AREA',$position2string);
                                $area->addAttribute('image', $area_image['image']); 
                            }
                            
                            
                        }
                        
                        
                        break; 
                    }
                } else if ($motphrase == 'W') {
                    
                    foreach ($sentence->W as $word) {

                        $selection_id = $word->attributes()->id->__toString();

                        if ($selection_id == $id_selection) {
                            $message .="Word ";
                            $message .=$id_selection . " ";
                            
                            if($type == "audio"){
                                
                                foreach ($word->AUDIO as $audio) {
                                //unset($form[0][0]);                                   
                                                                      
                                    $dom = dom_import_simplexml($audio);
                                    $dom->parentNode->removeChild($dom);
                                    $audio = $word->addChild('AUDIO');
                                    $audio->addAttribute('start', $position['start']);
                                    $audio->addAttribute('end', $position['end']);

                                }
                            }else if($type == "image"){
                                foreach ($word->AREA as $area) {
                                //unset($form[0][0]);
                                    $dom = dom_import_simplexml($area);
                                    $dom->parentNode->removeChild($dom);

                                }
                                
                                foreach($position as $area_image){
                                    //TODO : modifier (new DTD Jacobson)

                                    $position2string = $area_image['area']['x1'].",".$area_image['area']['y1'].",".$area_image['area']['x2'].",".$area_image['area']['y2'];

                                     $area = $word->addChild('AREA',$position2string);
                                     $area->addAttribute('image', $area_image['image']); 
                                 }
                            }
                            
                            
                            
                        }
                    }
                }
            }
        }

        $message.=$type;

        $doc = new DOMDocument();
        $doc->loadXML($xml->asXML());
        $doc->save($file);
        
        $this->cleanXML();
        echo $message;
    }

    
    public function addAnnotation($update_selection, $motphrase = 'S', $type) {

        $id_selection = $update_selection->id;
        $message = "Add annotation : ";

        if ($file = $this->existXML()) {

            $xml = simplexml_load_file($file);

            foreach ($xml->S as $sentence) {

                if ($motphrase == 'S') {
                    $message .="Sentence ";
                    $selection_id = $sentence->attributes()->id->__toString();

                    if ($selection_id == $id_selection) {

                        $message .=$id_selection . " ";

                        if ($type == 'transcription') {
                            foreach ($update_selection->transcriptions as $transcription) {
                                $form = $sentence->addChild('FORM', $transcription['transcription']);
                                $add = $form->addAttribute('kindOf', $transcription['lang']);
                            }
                        } else if ($type == 'traduction') {
                            foreach ($update_selection->traductions as $traduction) {
                                $transl = $sentence->addChild('TRANSL', $traduction['traduction']);
                                $add = $transl->addAttribute('xmlns:xml:lang', $traduction['lang']);
                            }
                        }
                    }
                } else if ($motphrase == 'W') {
                    $message .="Word ";

                    foreach ($sentence->W as $word) {

                        $selection_id = $word->attributes()->id->__toString();

                        if ($selection_id == $id_selection) {

                            $message .=$id_selection . " ";

                            if ($type == 'transcription') {
                                foreach ($update_selection->transcriptions as $transcription) {
                                    $form = $word->addChild('FORM', $transcription['transcription']);
                                    $add = $form->addAttribute('kindOf', $transcription['lang']);
                                }
                            } else if ($type == 'traduction') {
                                foreach ($update_selection->traductions as $traduction) {
                                    $transl = $word->addChild('TRANSL', $traduction['traduction']);
                                    $add = $transl->addAttribute('xmlns:xml:lang', $traduction['lang']);
                                }
                            }
                        }
                    }
                }
            }


            $message.=$type;

            $doc = new DOMDocument();
            $doc->loadXML($xml->asXML());
            $doc->save($file);

            $this->cleanXML();
            echo $message;
        }
    }

    // 05/03/2015
    // suppression d'une annotation 
    public function delAnnotation($del_selection, $motphrase = 'S', $type) {

        $id_selection = $del_selection->id;

        if ($file = $this->existXML()) {

            $xml = simplexml_load_file($file);

            $i = 0;
            $find = false;


            foreach ($xml->S as $sentence) {


                if ($motphrase == 'S') {

                    $selection_id = $sentence->attributes()->id->__toString();

                    if ($selection_id == $id_selection) {

                        if ($type == 'transcription') {

                            $transcription = $del_selection->transcriptions[0];

                            foreach ($sentence->FORM as $form) {
                                //unset($form[0][0]);
                                if (($form->attributes()->kindOf->__toString() == $transcription['lang']) && ($form->__toString() == $transcription['transcription'])) {
                                    $dom = dom_import_simplexml($form);
                                    $dom->parentNode->removeChild($dom);
                                }
                            }
                        } else if ($type == 'traduction') {

                            $traduction = $del_selection->traductions[0];

                            foreach ($sentence->TRANSL as $transl) {
                                //unset($form[0][0]);
                                if (($transl->attributes('xml', TRUE)->lang->__toString() == $traduction['lang']) && ($transl->__toString() == $traduction['traduction'])) {
                                    $dom = dom_import_simplexml($transl);
                                    $dom->parentNode->removeChild($dom);
                                }
                            }
                        }
                    }
                } else if ($motphrase == 'W') {
                    foreach ($sentence->W as $word) {

                        $selection_id = $word->attributes()->id->__toString();

                        if ($selection_id == $id_selection) {

                            if ($type == 'transcription') {

                                $transcription = $del_selection->transcriptions[0];

                                foreach ($word->FORM as $form) {
                                    //unset($form[0][0]);
                                    if (($form->attributes()->kindOf->__toString() == $transcription['lang']) && ($form->__toString() == $transcription['transcription'])) {
                                        $dom = dom_import_simplexml($form);
                                        $dom->parentNode->removeChild($dom);
                                    }
                                }
                            } else if ($type == 'traduction') {

                                $traduction = $del_selection->traductions[0];

                                foreach ($word->TRANSL as $transl) {
                                    //unset($form[0][0]);
                                    if (($transl->attributes('xml', TRUE)->lang->__toString() == $traduction['lang']) && ($transl->__toString() == $traduction['traduction'])) {
                                        $dom = dom_import_simplexml($transl);
                                        $dom->parentNode->removeChild($dom);
                                    }
                                }
                            }
                        }
                    }
                }
            }


            $doc = new DOMDocument();
            $doc->loadXML($xml->asXML());
            $doc->save($file);

            $this->cleanXML();
        }
    }

    // 04/03/2015
    //fonction de nettoyage du fichier XML : 
    // ordonnancement des sélection en fonction des positions
    // identifiants de sélection
    public function cleanXML() {

        if ($file = $this->existXML()) {

            $xml = simplexml_load_file($file);
            $sentences=array();
            //routine de tri des phrases 

            $audio_tag_exist = 0;

            foreach ($xml->S as $phrase) {

                $phrase_id = $phrase->attributes()->id->__toString();
                
                $audio_start = $phrase->AUDIO->attributes()->start->__toString();
                //TODO : modifier (new DTD Jacobson)
                $coords = $phrase->AREA->__toString();
                $coords_array = explode(',',$coords);

                $sentences[] = array('id' => $phrase_id, 'audio_start' => $audio_start, 'x1' => $coords_array[0]);
                     

                $words[$phrase_id] = array();

                foreach ($phrase->W as $word) {
                    $word_id = $word->attributes()->id->__toString();

                    if($word->AUDIO){
                        $audio_start = $word->AUDIO->attributes()->start->__toString();
                        $audio_tag_exist++;
                    }else{
                        $audio_start = 0;
                    }
                    
                    //TODO : modifier (new DTD Jacobson)
                    $coords = $word->AREA->__toString();
                    $coords_array = explode(',',$coords);

                    $words[$phrase_id][] = array('id' => $word_id, 'audio_start' => $audio_start, 'x1' => $coords_array[0]);
                        
                }
            }

            function build_sorter($key1) {
                return function($a, $b) use ($key1) {
                    //return strcmp($a[$key], $b[$key]); 
                    return ($a[$key1] < $b[$key1]) ? -1 : (($a[$key1] > $b[$key1]) ? 1 : 0);
                };
            }

            if(sizeof($sentences)>0) usort($sentences, build_sorter('audio_start'));
            //usort($sentences, build_sorter('x1'));
            //OK: bien trié par audio_start

            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->substituteEntities = TRUE;
            //paramètres pour un formattage XML "propre"
            $doc->preserveWhiteSpace = FALSE;
            $doc->formatOutput = TRUE;

            $string = $xml->asXML();
            //$string = mb_convert_encoding($string, 'html-entities', 'utf-8');

            $doc->loadXML($string);

            //$doc = dom_import_simplexml($xml);
            //TRI DES PHRASES
            foreach ($sentences as $s) {
                if (sizeof($words[$s['id']]) > 0){
                    if($audio_tag_exist > 0){
                        usort($words[$s['id']], build_sorter('audio_start'));
                    }else{
                        usort($words[$s['id']], build_sorter('x1'));
                    }
                }
                
                //tri OK

                foreach ($doc->getElementsByTagName('S') as $sentence) {

                    $selection_id = $sentence->getAttribute('id');

                    if ($selection_id == $s['id']) {
                        /*
                         * 06/03/2015 ORDONNANCEMENT DES BALISES ? in progress ->test pour ordonnancer directement à l'ajout d'annotation
                         */
                        // Importation du noeud, ainsi que tous ses fils, dans le document
                        $sentence = $doc->importNode($sentence, true);
                        // Et on l'ajoute dans le le noeud racine "<root>"
                        $doc->documentElement->appendChild($sentence);
                    }
                }
            }

            //TRI DES MOTS DANS LES PHRASES
            foreach ($doc->getElementsByTagName('S') as $sentence) {

                $selection_id = $sentence->getAttribute('id');

                foreach ($words[$selection_id] as $w) {
                    foreach ($sentence->getElementsByTagName('W') as $word) {

                        $word_id = $word->getAttribute('id');

                        if ($word_id == $w['id']) {
                            $word = $sentence->appendChild($word);
                        }
                    }
                }
            }

            $i_s = 1;
            $i_w = 1;

            foreach ($doc->getElementsByTagName('S') as $sentence) {

                $selection_id = $sentence->getAttribute('id');

                $idElements = explode('_', $selection_id);
                //$clone = $sentence->cloneNode(true);
                $sentence->setAttribute('id', $idElements[0] . '_' . $idElements[1] . '_S' . str_pad($i_s++, 3, '0', STR_PAD_LEFT));
            }

            foreach ($doc->getElementsByTagName('W') as $word) {

                $selection_id = $word->getAttribute('id');

                $idElements = explode('_', $selection_id);
                //$clone = $sentence->cloneNode(true);
                $word->setAttribute('id', $idElements[0] . '_' . $idElements[1] . '_W' . str_pad($i_w++, 3, '0', STR_PAD_LEFT));
            }

            foreach ($doc->getElementsByTagName('FORM') as $form) {
                //$text = htmlspecialchars_decode($form->nodeValue,ENT_HTML5);
                $text = $form->nodeValue;
                //$res[] = $text;
                //$form->nodeValue = $text;
            }
            $doc->save($file);
        }
    }

}

?>
