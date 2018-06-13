<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Document
 *
 * @author imac
 */
class Document {

    public $user; //correspond au répertoire portant le nom de l'utilisateur/chercheur
    public $metadata_file = ''; //correspond au fichier metadata du document
    
    public $metadata;
    public $filepath;
    public $annotations;

    public function rules() {
        return array(
            array('directory,metadata_file', 'safe'),
        );
    }

    public function zipDoc() {
        $zip = new ZipArchive();
        $url = $this->filepath . '.zip';

        if (file_exists($url)) {
            $zip->open($url, ZipArchive::OVERWRITE);
        } else {
            $zip->open($url, ZipArchive::CREATE);
        }

        $path = explode($this->annotations->id, $this->annotations->filepath);

        foreach ($this->metadata->crdos as $crdo) {
            $formatOf = $crdo->isFormatOf[0];
            $formatOf = str_replace('xhtml', 'xml', $formatOf);
            $zip->addFile($path[0] . $formatOf, $formatOf);
        }


        $zip->addFile($this->filepath, $this->metadata_file);
        $zip->addFile($this->annotations->filepath, $this->annotations->id . '.xml');

        $filezip = $zip->filename;

        $zip->close();

        $filezip = explode('/', $filezip);
        $filezip_path_len = sizeof($filezip);
        return $filezip[$filezip_path_len - 1];
    }

    function __construct($args) {

        if ($args) {
            foreach ($args as $key => $val) {
                if (property_exists($this, "$key")) {
                    $this->{"$key"} = $val;
                }
            }


            //TEST CORRECTION BUG Message erreur lors de la création du document :
            //--> la propriété metadata_file peut-être renseignée alors que le fichier n'existe pas !
            if ($this->metadata_file != '' ) {
                $this->filepath = $this->existXML();
                
                if($this->filepath != FALSE)
                    $this->getFromXML();
            }
        }
    }

    public function __set($name, $value) {
        $this->data[$name] = $value;
    }

    public function delete($delcrdo = false) {
        $res = 0;
        if ($delcrdo) {// ON DETRUIT TOUTES LES RESSOURCES ASSOCIEES AU DOCUMENT
            foreach ($this->metadata->crdos as $crdo) {
                if (!$crdo->delFile())
                    $res++;
            }
        }

        if (file_exists($this->filepath)) {
            if (!unlink($this->filepath))
                $res++;
        }

        return $res;
    }

    public function existXML() {


        $srv_test = "";

        if (strpos($_SERVER['DOCUMENT_ROOT'], 'MAMP') > 0) {
            $srv_test = "/moon-light";
        }



        //CORRECTION BUG mise en prod test LACITO
        $phpversion = substr(phpversion(), 0, 3);
        //CORRECTION BUG PHP7 - localhost
        $uri = explode('/index.php/', $_SERVER['REQUEST_URI']);
        $file = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents';

        if ($phpversion == "5.4") {
            $file = $_SERVER['DOCUMENT_ROOT'] . $srv_test . '/documents';
        } else if ($phpversion == "5.3") {
            $uri = explode('/index.php/', $_SERVER['REQUEST_URI']);

            $file = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents';
        }



        $file = str_replace('//', '/', $file);
        //

        if (isset($this->user))
            $file.='/' . $this->user;

        if (isset($this->metadata_file))
            $file.='/' . $this->metadata_file;

        if (file_exists($file) && is_file($file)) {
            return $file;
        } else {
            return false;
        }
    }

    public function createXML() {
        $srv_test = "";
        if (!$this->existXML()) {


            $uri = explode('/index.php/', $_SERVER['REQUEST_URI']);
            $file = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents';            
            $file = str_replace('//', '/', $file);           


            if (isset($this->user))
                $file.='/' . $this->user;

            if (isset($this->metadata_file)) {
                $file.='/' . $this->metadata_file;
                $newfile = fopen($file, "w");

                $txt = '<?xml version="1.0" encoding="UTF-8" ?><catalog xmlns="http://crdo.risc.cnrs.fr/schemas/" 
         xmlns:dc="http://purl.org/dc/elements/1.1/" 
         xmlns:oai="http://www.openarchives.org/OAI/2.0/" 
         xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" 
         xmlns:olac="http://www.language-archives.org/OLAC/1.1/" 
         xmlns:dcterms="http://purl.org/dc/terms/" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="http://cocoon.huma-num.fr/schemas/ http://cocoon.huma-num.fr/schemas/metadata.xsd"></catalog>';
                
                $txt = '<?xml version="1.0" encoding="UTF-8" ?><crdo:catalog xmlns:dc="http://purl.org/dc/elements/1.1/" '
                        . 'xmlns="http://crdo.risc.cnrs.fr/schemas/" '
                        . 'xmlns:oai="http://www.openarchives.org/OAI/2.0/" '
                        . 'xmlns:olac="http://www.language-archives.org/OLAC/1.1/" '
                        . 'xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" '
                        . 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                        . 'xmlns:dcterms="http://purl.org/dc/terms/"></crdo:catalog>';

                fwrite($newfile, $txt);
                fclose($newfile);
            }
            $this->filepath = $this->existXML();

            return $this;
        } else {
            return false;
        }
    }

    public function getFromXML() {

        if ($file = $this->existXML()) {

            $catalog = simplexml_load_file($file);
            $namespaces = $catalog->getDocNamespaces(true);
            //Register them with their prefixes 
            foreach ($namespaces as $prefix => $ns) {
                $catalog->registerXPathNamespace($prefix, $ns);
            }

            $crdo_items = $catalog->children('crdo', TRUE)->item; //$crdo_items = $catalog->children($namespaces['crdo'])->item;

            foreach ($crdo_items as $crdo) {

                $o_crdo = new Crdo();

                $attr_crdo = $crdo->attributes('crdo', TRUE); //$attr_crdo = $crdo->attributes($namespaces['crdo']);   

                $o_crdo->directory = $this->user;
                $o_crdo->datestamp = $attr_crdo['datestamp']->__toString();
                $o_crdo->id = $attr_crdo['id']->__toString();

                $tag_dc = $crdo->children('dc', TRUE);
                $tag_dcterms = $crdo->children('dcterms', TRUE);


                $dc_subject = $tag_dc->subject;

                foreach ($dc_subject as $subject) {
                    $attr_dc_subject = $subject->attributes('olac', TRUE);
                    $codelang = $attr_dc_subject['code']->__toString();

                    $o_crdo->subject[] = array(
                        "codelang" => $codelang,
                        "subject" => $subject->__toString(),
                    );
                }                

                $dc_language = $tag_dc->language;

                foreach ($dc_language as $langue) {

                    $attr_dc_language_olac = $langue->attributes('olac', TRUE);
                    $attr_dc_language_xsi = $langue->attributes('xsi', TRUE);

                    $lang = $attr_dc_language_olac['code']->__toString();
                    $type = $attr_dc_language_xsi['type']->__toString();

                    $o_crdo->languages[] = array(
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

                    $o_crdo->spatial[] = array(
                        "lang" => $langsp,
                        "type" => $typesp,
                        "spatial" => $sp->__toString(),
                    );
                }

                $dc_item = $tag_dc->title; //$dc_item = $crdo->children($namespaces['dc'])->title;

                foreach ($dc_item as $dc) {

                    $attr_dc = $dc->attributes('xml', TRUE); //$attr_dc = $dc->attributes("http://www.w3.org/XML/1998/namespace");    
                    $dc_lang = $attr_dc['lang']->__toString();

                    $o_crdo->title = array(
                        "lang" => $dc_lang,
                        "title" => $dc->__toString(),
                    );
                }

                $dcterms_alternatives = $tag_dcterms->alternative; //$dc_item = $crdo->children($namespaces['dc'])->title;

                foreach ($dcterms_alternatives as $alternative) {

                    $attr_dc = $alternative->attributes('xml', TRUE); //$attr_dc = $dc->attributes("http://www.w3.org/XML/1998/namespace");    
                    $dc_lang = $attr_dc['lang']->__toString();

                    $o_crdo->alternatives[] = array(
                        "lang" => $dc_lang,
                        "alternative" => $alternative->__toString(),
                    );
                }


                $dc_contributor = $tag_dc->contributor;

                foreach ($dc_contributor as $contributor) {
                    //$attr_xsi_contributor = $contributor->attributes('xsi', TRUE);    
                    $attr_olac_contributor = $contributor->attributes('olac', TRUE);
                    $code_contributor = $attr_olac_contributor['code']->__toString();

                    $o_crdo->contributors[] = array(
                        "code" => $code_contributor,
                        "contributor" => $contributor->__toString(),
                    );
                }
                // CORRECTION BUG : publisher est devenu un Array 
                $dc_publisher = $tag_dc->publisher;
                foreach ($dc_publisher as $publisher) {
                    $o_crdo->publisher[] = $publisher->__toString();
                }

                $o_crdo->format = $tag_dc->format->__toString();
                $o_crdo->source = $tag_dc->source->__toString();
                $o_crdo->type = $tag_dc->type->__toString();
                $o_crdo->identifier = $tag_dc->identifier->__toString();
                $o_crdo->rights = $tag_dc->rights->__toString();

                $o_crdo->created = $tag_dcterms->created->__toString();
                $o_crdo->isRequiredBy = $tag_dcterms->isRequiredBy->__toString();
                $o_crdo->accessRights = $tag_dcterms->accessRights->__toString();
                $o_crdo->isPartOf = $tag_dcterms->isPartOf->__toString();
                $o_crdo->available = $tag_dcterms->available->__toString();
                $o_crdo->license = $tag_dcterms->license->__toString();

                $o_crdo->collection = $crdo->children('crdo', TRUE)->collection->__toString();

                
                
                $formatof = $tag_dcterms->isFormatOf;

                foreach ($formatof as $f) {
                    $o_crdo->isFormatOf[] = $f->__toString();
                }


                $this->metadata->crdos[] = $o_crdo;
            }

            $this->metadata->title = $this->metadata->crdos[0]->title;
            $this->metadata->alternatives = $this->metadata->crdos[0]->alternatives;
            $this->metadata->languages = $this->metadata->crdos[0]->languages;
            $this->metadata->subject = $this->metadata->crdos[0]->subject;
            $this->metadata->spatial = $this->metadata->crdos[0]->spatial;
            $this->metadata->contributors = $this->metadata->crdos[0]->contributors;
            $this->metadata->publisher = $this->metadata->crdos[0]->publisher;
            $this->metadata->accessRights = $this->metadata->crdos[0]->accessRights;
            $this->metadata->isPartOf = $this->metadata->crdos[0]->isPartOf;
            $this->metadata->collection = $this->metadata->crdos[0]->collection;
            $this->metadata->available = $this->metadata->crdos[0]->available;
            $this->metadata->license = $this->metadata->crdos[0]->license;
            $this->metadata->rights = $this->metadata->crdos[0]->rights;
            $this->metadata->requires = $this->metadata->crdos[0]->requires;

            $annotations = new Annotations(array(
                'document_filepath' => $this->filepath,
                'lang' => $this->metadata->crdos[0]->subject[0]['codelang'],
                'title' => $this->metadata->crdos[0]->title));

            $this->annotations = $annotations;
        }
    }

    public function addCrdo($new_crdo) {

        $catalog = simplexml_load_file($this->filepath);
        $namespaces = $catalog->getDocNamespaces(true);

        foreach ($namespaces as $prefix => $ns) {
            $catalog->registerXPathNamespace($prefix, $ns);
        }

        //$doc = new DOMDocument('1.0', 'utf-8');
        $doc = new DOMDocument();
        //paramètres pour un formattage XML "propre"
        $doc->preserveWhiteSpace = FALSE;
        $doc->formatOutput = TRUE;
        //$doc->encoding = "utf-8";

        $doc->loadXML($catalog->asXML());

        $root = $doc->documentElement;

        //EN ERREUR LORSQU'AUCUN CRDO N'EXISTE !!!
        $crdo_item_root = $doc->getElementsByTagNameNS($namespaces['crdo'], 'item')->item(0);


        $crdo_item = $doc->createElementNS($namespaces['crdo'], 'crdo:item', '');


        if ($crdo_item_root) {
            // Balise dcterms:requires pour le premier crdo=XML
            $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:requires', $new_crdo->id);
            $new_tag_attr = new DOMAttr('xsi:type');
            $new_tag_attr->value = "dcterms:URI";
            $new_tag->appendChild($new_tag_attr);
            $crdo_item_root->appendChild($new_tag);
        }

        $new_tag_attr = new DOMAttr('crdo:datestamp');
        $new_tag_attr->value = $new_crdo->datestamp;
        $crdo_item->appendChild($new_tag_attr);

        $new_tag_attr = new DOMAttr('crdo:id');
        $new_tag_attr->value = $new_crdo->id;
        $crdo_item->appendChild($new_tag_attr);


        // Balise dc:title
        /* CORRECTION REVUE LACITO 08/01/2015 : 1 seul balise dc:title, les autres titres en dcterms:alternative */
        $cpt_title = 0;

        foreach ($new_crdo->title as $title) {
            $cpt_title++;

            if ($cpt_title == 1) {
                $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:title', $title['title']);
                $new_tag_attr = new DOMAttr('xml:lang');
                $new_tag_attr->value = $title['lang'];
                $new_tag->appendChild($new_tag_attr);
            } else {

                $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:alternative', $title['title']);
                $new_tag_attr = new DOMAttr('xml:lang');
                $new_tag_attr->value = $title['lang'];
                $new_tag->appendChild($new_tag_attr);
            }

            $crdo_item->appendChild($new_tag);
        }

        /* CORRECTION REVUE LACITO 08/01/2015 : ajout balises dc:language */
        foreach ($new_crdo->language as $language) {

            $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:language', '');

            $new_tag_attr = new DOMAttr('xsi:type');
            $new_tag_attr->value = "olac:language";
            $new_tag->appendChild($new_tag_attr);

            $new_tag_attr = new DOMAttr('olac:code');
            //$new_tag_attr->value = $language;
            $new_tag_attr->value = $language['code']; // CORRECTION BUG 18/03/2105 : String $language était devenu Array
            $new_tag->appendChild($new_tag_attr);

            $crdo_item->appendChild($new_tag);
        }
        /**/

        // Balise dc:subject
        /* CORRECTION REVUE LACITO 27/05/2015 : plusieurs subject possibles */
        foreach ($new_crdo->subject as $subject) {
            $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:subject', $subject['subject']);
            $new_tag_attr = new DOMAttr('xsi:type');
            $new_tag_attr->value = "olac:language";
            $new_tag->appendChild($new_tag_attr);
            $new_tag_attr = new DOMAttr('olac:code');
            $new_tag_attr->value = $subject['codelang'];
            $new_tag->appendChild($new_tag_attr);
            $crdo_item->appendChild($new_tag);
        }
        

        // Balise dcterms:spatial
        foreach ($new_crdo->spatial as $spatial) {
            /* CORRECTION REVUE LACITO 08/01/2015 : caractères diacritiques et non code hex */
            $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:spatial', $spatial['spatial']);

            if ($spatial['lang'] != '' && $spatial['lang'] != null) {
                $new_tag_attr = new DOMAttr('xml:lang');
                $new_tag_attr->value = $spatial['lang'];
                $new_tag->appendChild($new_tag_attr);
            } elseif ($spatial['type'] != '' && $spatial['type'] != null) {
                $new_tag_attr = new DOMAttr('xsi:type');
                $new_tag_attr->value = $spatial['type'];
                $new_tag->appendChild($new_tag_attr);
            }
            $crdo_item->appendChild($new_tag);
        }

        // Balise dc:contributor
        foreach ($new_crdo->contributors as $contributor) {
            $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:contributor', $contributor['contributor']);

            $new_tag_attr = new DOMAttr('xsi:type');
            $new_tag_attr->value = "olac:role";
            $new_tag->appendChild($new_tag_attr);

            $new_tag_attr = new DOMAttr('olac:code');
            $new_tag_attr->value = $contributor['code'];
            $new_tag->appendChild($new_tag_attr);

            $crdo_item->appendChild($new_tag);
        }


        // Balise dc:publisher
        /* CORRECTION BUG OUBLI 06/03/2015 : plusieurs balises publisher possible */
        foreach ($new_crdo->publisher as $publisher) {

            $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:publisher', $publisher);
            $crdo_item->appendChild($new_tag);
        }
        /**/

        // Balise dc:format
        $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:format', $new_crdo->format);
        $new_tag_attr = new DOMAttr('xsi:type');
        $new_tag_attr->value = "dcterms:IMT";
        $new_tag->appendChild($new_tag_attr);
        $crdo_item->appendChild($new_tag);

        // Balise dc:source
        $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:source', $new_crdo->source);
        $crdo_item->appendChild($new_tag);

        // Balise dc:type
        $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:type', $new_crdo->type);
        $new_tag_attr = new DOMAttr('xsi:type');
        $new_tag_attr->value = "dcterms:DCMIType";
        $new_tag->appendChild($new_tag_attr);
        $crdo_item->appendChild($new_tag);


        // Balise dcterms:created
        $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:created', $new_crdo->created);
        $new_tag_attr = new DOMAttr('xsi:type');
        $new_tag_attr->value = "dcterms:W3CDTF";
        $new_tag->appendChild($new_tag_attr);
        $crdo_item->appendChild($new_tag);

        // Balise dcterms:extent
        $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:extent', '');
        $crdo_item->appendChild($new_tag);

        if ($crdo_item_root) {
            // Balise dcterms:isRequiredBy
            $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:isRequiredBy', $new_crdo->isRequiredBy);
            $new_tag_attr = new DOMAttr('xsi:type');
            $new_tag_attr->value = "dcterms:URI";
            $new_tag->appendChild($new_tag_attr);
            $crdo_item->appendChild($new_tag);
        }


        // Balise dcterms:identifier
        $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:identifier', $new_crdo->identifier);
        $new_tag_attr = new DOMAttr('xsi:type');
        $new_tag_attr->value = "dcterms:URI";
        $new_tag->appendChild($new_tag_attr);
        $crdo_item->appendChild($new_tag);



        foreach ($new_crdo->isFormatOf as $isformatof) {
            // Balise dcterms:isFormatOf
            $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:isFormatOf', $isformatof);
            $new_tag_attr = new DOMAttr('xsi:type');
            $new_tag_attr->value = "dcterms:URI";
            $new_tag->appendChild($new_tag_attr);
            $crdo_item->appendChild($new_tag);
        }


        // Balise dcterms:accessRights
        $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:accessRights', $new_crdo->accessRights);
        $crdo_item->appendChild($new_tag);


        // Balise dcterms:isFormatOf
        $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:isPartOf', $new_crdo->isPartOf);
        $new_tag_attr = new DOMAttr('xsi:type');
        $new_tag_attr->value = "dcterms:URI";
        $new_tag->appendChild($new_tag_attr);
        $crdo_item->appendChild($new_tag);


        // Balise dcterms:accessRights
        $new_tag = $doc->createElementNS($namespaces['crdo'], 'crdo:collection', $new_crdo->collection);
        $crdo_item->appendChild($new_tag);


        // Balise dcterms:available
        $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:available', $new_crdo->available);
        $new_tag_attr = new DOMAttr('xsi:type');
        $new_tag_attr->value = "dcterms:W3CDTF";
        $new_tag->appendChild($new_tag_attr);
        $crdo_item->appendChild($new_tag);

        // Balise dcterms:license
        $new_tag = $doc->createElementNS($namespaces['dcterms'], 'dcterms:license', $new_crdo->license);
        $new_tag_attr = new DOMAttr('xsi:type');
        $new_tag_attr->value = "dcterms:URI";
        $new_tag->appendChild($new_tag_attr);
        $crdo_item->appendChild($new_tag);


        // Balise dcterms:accessRights
        $new_tag = $doc->createElementNS($namespaces['dc'], 'dc:rights', $new_crdo->rights);
        $crdo_item->appendChild($new_tag);


        $root->appendChild($crdo_item);

        $doc->save($this->filepath);

        $this->metadata->crdos[] = $new_crdo;
    }

    public function delCrdo($id_crdo) {
        
                       
        //suppression de la balise CRDO ITEM dans le fichier metadata
        $catalog = simplexml_load_file($this->filepath);
        $namespaces = $catalog->getDocNamespaces(true);

        foreach ($namespaces as $prefix => $ns) {
            $catalog->registerXPathNamespace($prefix, $ns);
        }

        $crdo_items = $catalog->children('crdo', TRUE)->item;

        $crdo_root = $crdo_items[0];

        $doc = new DOMDocument();
        $dom_crdo = new DOMNode();
        $dom_dcterms_requires = new DOMNode();

        $doc->loadXML($catalog->asXML());

        $root = $doc->documentElement;
        $dom_crdo_root = $root->getElementsByTagNameNS($namespaces['crdo'], 'item')->item(0);

        $i_crdo = 0;
        foreach ($crdo_items as $crdo) {

            $attr_crdo = $crdo->attributes('crdo', TRUE);
            $id_crdo_file = $attr_crdo['id']->__toString();

            if ($id_crdo_file == $id_crdo) {

                $dom_crdo = $root->getElementsByTagNameNS($namespaces['crdo'], 'item')->item($i_crdo);
                $action_delete_crdo = $root->removeChild($dom_crdo);
            }

            $i_crdo++;
        }

        //$dom_requires = $crdo_root->getElementsByTagNameNS($namespaces['dcterms'], 'requires')->item;

        $dcterms_requires = $crdo_root->children('dcterms', TRUE)->requires;

        $i_dcterms_requires = 0;

        foreach ($dcterms_requires as $dr) {

            $dom_dcterms_requires = $dom_crdo_root->getElementsByTagNameNS($namespaces['dcterms'], 'requires')->item($i_dcterms_requires);

            if ($dr->__toString() == $id_crdo)
                $action_delete_crdo = $dom_crdo_root->removeChild($dom_dcterms_requires);
            //$response = "deletion ".$dr->__toString();

            $i_dcterms_requires++;
        }


        $doc->save($this->filepath);

        //suppression physique du fichier CRDO --> OK en PROD (LACITO)
        foreach ($this->metadata->crdos as $o_crdo) {
            if ($o_crdo->id == $id_crdo) {
                //$delete_file_crdo = $o_crdo->delFile();
                $o_crdo->delFile();                
            }
        }
        //return $action_delete_crdo;
        echo $id_crdo;

        //echo $response;
    }

    // 06/03/2015
    //fonction de nettoyage du fichier XML : 
    // ordonnancement des sélection en fonction des positions
    // identifiants de sélection
    public function cleanXML() {

        if ($file = $this->existXML()) {

            $xml = simplexml_load_file($file);

            /* 29/04/2015 : nettoyage des attributs namespace
              déjà déclarés dans la balise mère CATALOG
             */

            /**/

            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->substituteEntities = TRUE;
            //paramètres pour un formattage XML "propre"
            $doc->preserveWhiteSpace = FALSE;
            $doc->formatOutput = TRUE;

            $string = $xml->asXML();
            
            $string = str_replace('xmlns:dc="http://purl.org/dc/elements/1.1/"', '', $string);
            $string = str_replace('xmlns:dcterms="http://purl.org/dc/terms/"', '', $string);
            
 

            $doc->loadXML($string);


            $doc->save($file);
            
        }
    }

    // 26/10/2016
    // attribution d'ID pour les mots -> fichier Hang sans ID
    // à utiliser uniquement lors d'import de documents au format pré-Eastling
    public function putWordID() {

        if ($file = $this->annotations->existXML()) {
            
            $xml = simplexml_load_file($file);

            /* 29/04/2015 : nettoyage des attributs namespace
              déjà déclarés dans la balise mère CATALOG
             */
              $w_id = 1;
              
                $idElements = explode('metadata_', str_replace('crdo-','',str_replace('.xml', '', $this->metadata_file)));

              foreach ($xml->S as $sentence) {
                
                foreach ($sentence->W as $word) {
                    $word->attributes()->id = $idElements[1].'_W'.str_pad($w_id++, 3, '0', STR_PAD_LEFT);
                    //$word->addAttribute('id' , $idElements[0].'_W'.str_pad($w_id++, 3, '0', STR_PAD_LEFT));
                }
              }
            /**/

            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->substituteEntities = TRUE;
            //paramètres pour un formattage XML "propre"
            $doc->preserveWhiteSpace = FALSE;
            $doc->formatOutput = TRUE;

            $string = $xml->asXML();
            
            $string = str_replace('xmlns:dc="http://purl.org/dc/elements/1.1/"', '', $string);
            $string = str_replace('xmlns:dcterms="http://purl.org/dc/terms/"', '', $string);
            
            $doc->loadXML($string);
            $doc->save($file);
            echo 'OK';
        }
    }

}

?>
