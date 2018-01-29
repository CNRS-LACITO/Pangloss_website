<?php

class EastlingController extends Controller {
    /**
	 * @return array action filters
	 */
	public function filters()
	{
		return array(
			'accessControl', // perform access control for CRUD operations
		);
	}
	/**
	 * Specifies the access control rules.
	 * This method is used by the 'accessControl' filter.
	 * @return array access control rules
	 */
	public function accessRules()
	{
            return array(
                array('deny',  // deny all users
                                'users'=>array('?'),
                ),
            );
	}
    /**
     * Declares class-based actions.
     */
    public function actions() {
        return array(
            // captcha action renders the CAPTCHA image displayed on the contact page
            'captcha' => array(
                'class' => 'CCaptchaAction',
                'backColor' => 0xFFFFFF,
            ),
            // page action renders "static" pages stored under 'protected/views/site/pages'
            // They can be accessed via: index.php?r=site/page&view=FileName
            'page' => array(
                'class' => 'CViewAction',
            ),
        );
    }

    /**
     * This is the default 'index' action that is invoked
     * when an action is not explicitly requested by users.
     */
    public function actionIndex() {
        // renders the view file 'protected/views/site/index.php'
        // using the default layout 'protected/views/layouts/main.php'
        $this->render('index');
    }

    /**
     * This is the action to handle external exceptions.
     */
    public function actionError() {
        if ($error = Yii::app()->errorHandler->error) {
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }

    /**
     * Displays the contact page
     */
    public function actionEditor() {
        if (Yii::app()->user->isGuest) {
            $this->redirect(Yii::app()->createUrl('site/login'));
        } else {
            $this->render('editor');
            //$this->render('editor-test');

        }
    }
    
    /**
     * Displays the contact page
     */
    public function actionTestupload() {
        if (Yii::app()->user->isGuest) {
            $this->redirect(Yii::app()->createUrl('site/login'));
        } else {
            $this->render('testupload');
        }
    }

    public function actionGetListDocUser() {
        
        if (isset($_POST['user'])) {
            $user = $_POST['user'];
        } else {
            $user = "all";
        }

        // create an array to hold directory list
        $results = array();
        $appli = '';
        if ($_SERVER['DOCUMENT_ROOT'] == '/Applications/MAMP/htdocs')
            $appli = '/moon-light';
// Note our use of ===.  Simply == would not work as expected
// because the position of 'a' was the 0th (first) character.
        //$directory = $_SERVER['DOCUMENT_ROOT'] . $srv_test . '/documents/' . $_POST['user'];
        
        
        //BUG mise en prod test LACITO
        $phpversion = substr(phpversion(),0,3);
        
        if($phpversion == "5.4"){
            $directory = $_SERVER['DOCUMENT_ROOT'] . $appli . '/documents';
            
        }else if($phpversion == "5.3"){
            $uri = explode('/index.php/',$_SERVER['REQUEST_URI']);
            
            $directory = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents';
            
        }
        //bug avec v7
        $uri = explode('/index.php/',$_SERVER['REQUEST_URI']);
        $directory = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents';
        
        $directory = str_replace('//','/',$directory);

// create a handler for the directory

        $handler = opendir($directory);

// open directory and walk through the filenames

        while ($entry = readdir($handler)) {

            if (($entry != "." && $entry != "..") && is_dir($directory . '/' . $entry) && ($user == "all" || ($user != "all" && $user == $entry) )) {

                $handler2 = opendir($directory . '/' . $entry);

                while ($entry2 = readdir($handler2)) {
                    // if file isn't this directory or its parent, add it to the results
                    if ($entry2 != "." && $entry2 != "..") {
                        // check with regex that the file format is what we're expecting and not something else
                        if (preg_match("#^metadata.*(xml)$#", $entry2)) {
                            //03/04/2015 TODO : ajouter un check sur la validité du format XML 
                            //pour éviter les erreurs lors du chargement des documents d'un user
                            // ==>ne charger que les documents valides
                            $document = new Document(array('directory' => $entry, 'metadata_file' => $entry2));
                            $results[] = $document;
                        }
                    }
                }
            }
        }
        //echo $id;
        echo CJSON::encode($results);
        //echo $results;
        //}
    }

    public function actionGetDoc() {

        if (isset($_POST['metadata_file']) && isset($_POST['directory'])) {

            $document = new Document(array('metadata_file' => $_POST['metadata_file'], 'directory' => $_POST['directory']));
            
            $result = array(
                "directory" => $document->directory,
                "metadata_file" => $document->metadata_file,
                "liste_crdo" => $document->liste_crdo,
                "annotations" => $document->annotations,
            );


            echo CJSON::encode($result);
        }
    }

    public function actionDelDoc() {

        if (isset($_POST['metadata_file']) && isset($_POST['directory'])) {

            $document = new Document(array('metadata_file' => $_POST['metadata_file'], 'directory' => $_POST['directory']));
            $res = $document->delete(true);
            echo $res;
        }
    }

    public function actionCreateDoc() {

        if (isset($_POST['directory'])) {

            $document = new Document(array('directory' => $_POST['directory'], 'metadata_file' => "metadata_" . $_POST['id']));


            if (!$document->existXML()) {

                $document->createXML();
                $new_crdo = new Crdo();

                $id_crdo = explode(".", $document->metadata_file);

                $new_crdo->directory = $document->directory;
                $new_crdo->datestamp = date('Y-m-d', time());
                $new_crdo->id = str_replace("metadata_", "", $id_crdo[0]);

//                $new_crdo->subject[0]['code_lang'] = $_POST['subject']['codelang'];
//                $new_crdo->subject[0]['subject'] = $_POST['subject']['subject'];
//                
                //CORRECTION EVOL : plusieurs subject possibles (revue LACITO 27/05/2015)
                foreach ($_POST['subject'] as $key => $subject) {
                    $new_crdo->subject[] = array(
                        "code_lang" => $subject['codelangue'],
                        "subject" => $subject['subject'],
                    );
                }
                
                //*****************SPATIAL************************
                $new_crdo->spatial[] = array(
                    "lang"=>"",//nécessaire pour éviter bug lors de la création de doc->ajout du premier CRDO
                    "type" => "dcterms:ISO3166",
                    "spatial" => strtoupper($_POST['spatial']['codepays']), // CORRECTION REVUE LACITO 08/01/2015 : code pays majuscules
                );
                $new_crdo->spatial[] = array(
                    "lang"=>"",
                    "type" => "dcterms:Point",
                    "spatial" => "east=" . $_POST['spatial']['long'] . ";north=" . $_POST['spatial']['lat'] . ";"
                );

                $new_crdo->spatial[] = array(
                    "type"=>"",
                    "lang" => "en",
                    "spatial" => $_POST['spatial']['spatial'],
                );
                //************************************************

                foreach ($_POST['contributors'] as $key => $contributor) {
                    foreach ($contributor as $c) {
                        $new_crdo->contributor[] = array(
                            "code" => $key,
                            "contributor" => $c,
                        );
                    }
                }

                foreach ($_POST['title'] as $title) {
                    $new_crdo->title[] = array(
                        "lang" => $title['lang'],
                        "title" => $title['title'],
                    );
                }

                /* CORRECTION REVUE LACITO 08/01/2015 */
                foreach ($_POST['lang'] as $language) {
                    $new_crdo->language[] = $language;
                }
                /**/

                //$new_crdo->publisher = $_POST['publisher'];
                
                foreach ($_POST['publishers'] as $publisher) {
                    $new_crdo->publisher[] = $publisher;
                }
                
                $new_crdo->format = $_POST['format'];
                $new_crdo->type = $_POST['type'];

                $new_crdo->created = date('Y-m-d', time());
                $new_crdo->conformsTo = $_POST['conformsTo'];
                $new_crdo->identifier = $_POST['id'];

                $new_crdo->isFormatOf[] = $_POST['isFormatOf'];

                $new_crdo->isPartOf = $_POST['isPartOf'];
                $new_crdo->collection = $_POST['collection'];
                //$new_crdo->available = $_POST['available'];
                $new_crdo->available = "";
                $new_crdo->source = "";
                $new_crdo->accessRights = $_POST['accessRights'];
                $new_crdo->license = $_POST['license'];
                $new_crdo->rights = $_POST['rights'];

                $document->addCrdo($new_crdo);

                $annotations = new Annotations(array('document_filepath' => $document->filepath));
                $annotations->createXML();

                $document->annotations = $annotations;

                //http_response_code(200);
                echo CJSON::encode($document);
            }
        }
        
    }

    public function actionTestWordsGenerationAuto() {
             
        $document = new Document(array('metadata_file' => 'metadata_crdo-TWH_T19.xml', 'directory' => 'deo'));
        
        //récupération du fichier d'annotations
        $annotations = new Annotations(array(
            'document_filepath' => $document->filepath,
            'lang' => $document->liste_crdo[0]->subject[0]['code_lang'],
            'title' => $document->liste_crdo[0]->title));

        $return ="Résultat : <br>";
        
        if ($file = $annotations->existXML()) {
           $return .="Annotations trouvé;";
           
           $xml = simplexml_load_file($file);
           
           foreach ($xml->S as $sentence) {
               
               $return .="Phrase<br>";
               
               $id = $sentence->attributes()->id->__toString();
               
               if($id == "TWH_T19_S###"){
                   
                   $return .="Phrase trouvée";
                   
                   $words = explode(' ',$sentence->FORM->__toString());

                   foreach($words as $word){
                       
                        $return .="Ajout de mot (" . $word . ") ; ";
                        
                        $annotations->last_word_id++;
                        $selection = $sentence->addChild('W');
                        $id_selection = 'TWH_T19_W' . str_pad($annotations->last_word_id, 3, '0', STR_PAD_LEFT);
                        $selection->addAttribute('id', $id_selection);

                        $audio = $selection->addChild('AUDIO');
                        $audio->addAttribute('start', '0');
                        $audio->addAttribute('end', '0');

                        $form = $selection->addChild('FORM', $word);
                        $form->addAttribute('kindOf', 'transliter');
                        
                        $transl = $selection->addChild('TRANSL', '');
                        $transl->addAttribute('xmlns:xml:lang', 'fra');
                        
                        //TODO : modifier (new DTD Jacobson)
                        $area_tag = $selection->addChild('AREA', '0,0,0,0');
                        $area_tag->addAttribute('image', $sentence->AREA->attributes()->image->__toString());

                   }
                   
               }
           }
           
            $xml->asXML($file);

            $annotations->getFromXML();
            //$annotations->cleanXML(); //désordonne tout car pas de positionnement à cette étape !
            
        }
        
        echo $return;
        
        
    }
    
    public function actionTestImportXMLAnnotations() {
             
       // $document = new Document(array('metadata_file' => 'metadata_crdo-TWH_T19.xml', 'directory' => 'deo'));
        
        if ($file = "/var/www/html/lacito/test/pangloss/tools/eastling/documents/hang/crdo-TYJ_IDIOMS.xml") {

            $xml = simplexml_load_file($file);

            $namespaces = $xml->getDocNamespaces(true);

            foreach ($namespaces as $prefix => $ns) {
                $xml->registerXPathNamespace($prefix, $ns);
            }

            $i_s = 1;
            $i_w = 1;
            
            $doc = new DOMDocument();
            $dom = new DOMNode();

            $doc->loadXML($xml->asXML());
            
            
            foreach ($xml->S as $sentence) {
                
                $sentence->attributes()->id = 'TYJ_hang_1443765122537_S'.str_pad($i_s++, 3, '0', STR_PAD_LEFT);
                    
                
                if(!$sentence->AREA){
                    //TODO : modifier (new DTD Jacobson)
                    $area = $sentence->addChild('AREA','0,0,0,0');
                    $area->addAttribute('image','');
                }
                
                foreach ($sentence->W as $word) {
                    //$selection_id = $word->attributes()->id->__toString();
                    $word->addAttribute('id','TYJ_hang_1443765122537_W' . str_pad($i_w++, 3, '0', STR_PAD_LEFT));
                    //$word->attributes()->id = 'TYJ_hang_1443765122537_W' . str_pad($i_w++, 3, '0', STR_PAD_LEFT);
                    $word->FORM->addAttribute('kindOf','ortho');
                    
                    if(!$word->AREA){
                        //TODO : modifier (new DTD Jacobson)
                        $area = $word->addChild('AREA','0,0,0,0');
                        $area->addAttribute('image','');
                        
                    }
                    if(!$word->AUDIO){
                        $audio = $word->addChild('AUDIO');
                        $audio->addAttribute('start',0);
                        $audio->addAttribute('end',0);
                        
                    }
                    
//                    if($selection_id == ''){
//                        $dom = dom_import_simplexml($word);
//                        $dom->parentNode->removeChild($dom);
//                    }
                    
                }
            }
            
            $doc = new DOMDocument();
            $doc->loadXML($xml->asXML());
            $doc->save("/var/www/html/lacito/test/pangloss/tools/eastling/documents/hang/crdo-TYJ_hang_1443765122537.xml");

            //$document->annotations->cleanXML();
            //return $action_delete;
        }

            
    }
    
    public function actionPhpinfo() {
             
        
        phpinfo();

    }
    
    // 03/03/2015
    // Modification d'une annotation (transcription/traduction) à une sélection existante
    public function actionUpdateAnnotation() {

        if (isset($_POST['directory']) && isset($_POST['document'])) {
            //récupération du document de metadonnées
            $document = new Document(array('directory' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            //récupération du fichier d'annotations
            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->liste_crdo[0]->subject[0]['code_lang'],
                'title' => $document->liste_crdo[0]->title));

            //récupération des données d'entrée pour la mise à jour
            $text = trim($_POST['text']);
            $lang = trim($_POST['lang']);
            $textbeforeupdate = trim($_POST['text_before_update']);
            $langbeforeupdate = trim($_POST['lang_before_update']);
            $id_selection = $_POST['idannotation'];
            $type_annotation = $_POST['typeannotation'];


            //détermination du type d'annotation à mettre à jour
            $id_items = explode('_', $_POST['idannotation']);
            $subid_selection = $id_items[sizeof($id_items) - 1]; //ID de la sélection à mettre à jour
            $motphrase = substr($subid_selection, 0, 1); //type de sélection S ou W

            $selection = new Selection();
            $selection->id = $id_selection;

            $selection->transcriptions = array(array('transcription' => $text, 'lang' => $lang));
            $selection->traductions = array(array('traduction' => $text, 'lang' => $lang));

            //$document->annotations->getFromXML();
            echo $document->annotations->updateAnnotation($selection, $motphrase, $type_annotation, $textbeforeupdate, $langbeforeupdate);
            //echo CJSON::encode($id_selection);
        }
    }
    
    //EVOL besoin Hang 04/10/2015
    // Modification d'une position (audio ou image) à une sélection existante
    public function actionUpdatePosition() {

        if (isset($_POST['directory']) && isset($_POST['document'])) {
            //récupération du document de metadonnées
                        
            $document = new Document(array('directory' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            //récupération du fichier d'annotations
            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->liste_crdo[0]->subject[0]['code_lang'],
                'title' => $document->liste_crdo[0]->title));

            //récupération des données d'entrée pour la mise à jour
            
            $id_selection = $_POST['idannotation'];
            $type = $_POST['type'];
            
            if($type == "audio"){
                $position = CJSON::encode($_POST['position']);
            }else{
                $position = $_POST['position'];
            }
            
            //echo $position;
            
            //détermination du type d'annotation à mettre à jour
            $id_items = explode('_', $_POST['idannotation']);
            $subid_selection = $id_items[sizeof($id_items) - 1]; //ID de la sélection à mettre à jour
            $motphrase = substr($subid_selection, 0, 1); //type de sélection S ou W

            $selection = new Selection();
            $selection->id = $id_selection;

            //$document->annotations->getXML();
            //echo CJSON::encode(array($selection, $motphrase, $type, $position));
            echo $document->annotations->updatePosition($selection, $motphrase, $type, $position);
            //echo CJSON::encode($id_selection);
        }
    }

    // 04/03/2015
    // Ajout d'une annotation (transcription/traduction) à une sélection existante
    public function actionAddAnnotation() {
        
        if (Yii::app()->user->isGuest) {
            $this->redirect(Yii::app()->createUrl('site/login'));
        }
        
        if (isset($_POST['directory']) && isset($_POST['document'])) {
            //récupération du document de metadonnées
            $document = new Document(array('directory' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            //récupération du fichier d'annotations
            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->liste_crdo[0]->subject[0]['code_lang'],
                'title' => $document->liste_crdo[0]->title));

            //récupération des données d'entrée pour la mise à jour
            $text = trim($_POST['text']);
            $lang = trim($_POST['lang']);
            $id_selection = $_POST['idannotation'];
            $type_annotation = $_POST['typeannotation'];


            //détermination du type d'annotation à mettre à jour
            $id_items = explode('_', $_POST['idannotation']);
            $subid_selection = $id_items[sizeof($id_items) - 1]; //ID de la sélection à mettre à jour
            $motphrase = substr($subid_selection, 0, 1); //type de sélection S ou W
            
            $selection = new Selection();
            $selection->id = $id_selection;

            $selection->transcriptions = array(array('transcription' => $text, 'lang' => $lang));
            $selection->traductions = array(array('traduction' => $text, 'lang' => $lang));

            //$document->annotations->getFromXML();
            echo $document->annotations->addAnnotation($selection, $motphrase, $type_annotation);
            //echo CJSON::encode($id_selection);
        }
    }

    // 05/03/2015
    // Suppression d'une annotation (transcription/traduction)
    public function actionDelAnnotation() {

        if (isset($_POST['directory']) && isset($_POST['document'])) {
            //récupération du document de metadonnées
            $document = new Document(array('directory' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            //récupération du fichier d'annotations
            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->liste_crdo[0]->subject[0]['code_lang'],
                'title' => $document->liste_crdo[0]->title));

            //récupération des données d'entrée pour la mise à jour
            $text = trim($_POST['text']);
            $lang = trim($_POST['lang']);
            $id_selection = $_POST['idannotation'];
            $type_annotation = $_POST['typeannotation'];

            //détermination du type d'annotation à mettre à jour
            $id_items = explode('_', $_POST['idannotation']);
            $subid_selection = $id_items[sizeof($id_items) - 1]; //ID de la sélection à mettre à jour
            $motphrase = substr($subid_selection, 0, 1); //type de sélection S ou W

            $selection = new Selection();
            $selection->id = $id_selection;

            $selection->transcriptions = array(array('transcription' => $text, 'lang' => $lang));
            $selection->traductions = array(array('traduction' => $text, 'lang' => $lang));

            //$document->annotations->getFromXML();
            $document->annotations->delAnnotation($selection, $motphrase, $type_annotation);
            //echo CJSON::encode($id_selection);
        }
    }


    
    public function actionCreateSelection() {

        if (isset($_POST['directory']) && isset($_POST['document'])) {

            $document = new Document(array('directory' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->liste_crdo[0]->subject[0]['code_lang'],
                'title' => $document->liste_crdo[0]->title));

            //si le fichier d'annotations n'existe pas, on le crée
            if (!$annotations->existXML()) {
                $annotations->createXML();
                $document->annotations = $annotations;
            }

            if ($_POST['motphrase'] == 'phrase') {
                $motphrase = 'S';
            } else {
                $motphrase = 'W';
            }

            $selection = new Selection();
            $selection->startPosition = $_POST['startPosition'];
            $selection->endPosition = $_POST['endPosition'];
            $selection->transcriptions = $_POST['transcriptions'];
            $selection->traductions = $_POST['traductions'];
            $selection->areas = $_POST['selectedAreas'];
            $res = $document->annotations->addSelection($selection, $_POST['motphrase']);

            echo CJSON::encode($res);

        }
    }

    public function actionDelSelection() {

        if (isset($_POST['metadata_file']) && isset($_POST['directory']) && isset($_POST['selection']) && isset($_POST['motphrase'])) {

            $document = new Document(array('metadata_file' => $_POST['metadata_file'], 'directory' => $_POST['directory']));
            $res = $document->annotations->delSelection($_POST['selection'], $_POST['motphrase']);
            echo $res;
        }
    }

    public function longest_common_substring($words) {
        //$words = array_map('strtolower', array_map('trim', $words));
        $words = array_map('trim', $words);
        $sort_by_strlen = create_function('$a, $b', 'if (strlen($a) == strlen($b)) { return strcmp($a, $b); } return (strlen($a) < strlen($b)) ? -1 : 1;');
        usort($words, $sort_by_strlen);

        $longest_common_substring = array();
        $shortest_string = str_split(array_shift($words));
        while (sizeof($shortest_string)) {
            array_unshift($longest_common_substring, '');
            foreach ($shortest_string as $ci => $char) {
                foreach ($words as $wi => $word) {
                    if (!strstr($word, $longest_common_substring[0] . $char)) {
                        // No match
                        break 2;
                    } // if
                } // foreach

                $longest_common_substring[0].= $char;
            } // foreach

            array_shift($shortest_string);
        }

        usort($longest_common_substring, $sort_by_strlen);
        return array_pop($longest_common_substring);
    }

    public function actionAddCrdo() {
        
        $document = new Document(array('metadata_file' => $_POST['uploaded-document'], 'directory' => $_POST['uploaded-user']));

        //$type_crdo = strtoupper($_POST['uploaded-type']);
        $name_crdo = $_POST['uploaded-name'];

        $crdo_ids = array();

        foreach ($document->liste_crdo as $crdo) {
            $crdo_ids[] = $crdo->id;
        }

        $rootname_crdo = $this->longest_common_substring($crdo_ids);
       
        $srv_test = "";
        
          if (strpos($_SERVER['DOCUMENT_ROOT'], 'MAMP') > 0) {
            $srv_test = "/moon-light";
          }
        
        //$UploadDirectory = $_SERVER['DOCUMENT_ROOT'] . $srv_test . '/documents';
        //CORRECTION BUG 09/07/2015 : UPLOAD KO --> $_SERVER['DOCUMENT_ROOT'] renvoie "/var/www/html/lacito"
        $UploadDirectory = dirname($_SERVER['SCRIPT_FILENAME']).'/documents';
        
        if (isset($document->directory))
            $UploadDirectory.='/' . $document->directory;

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
// Access the $_FILES global variable for this specific file being uploaded
// and create local PHP variables from the $_FILES array of information
            $fileName = $_FILES["uploaded-file"]["name"]; // The file name
            $fileTmpLoc = $_FILES["uploaded-file"]["tmp_name"]; // File in the PHP tmp folder
            
            $path_parts = pathinfo($fileName);
            $ext = strtolower($path_parts['extension']);
            
            
            //SECURITY
            if(in_array($ext, array("jpg","jpeg","bmp","mp3","png"))){
              
                // Place it into your "uploads" folder mow using the move_uploaded_file() function

               
                if (!is_writeable($UploadDirectory)) {
                    die("Erreur d'écriture dans le répertoire <".$UploadDirectory.">");
                 }

               //EVOL 21/07/2015 : DETECTION AUTO DU FORMAT POUR EVITER UNE SAISIE INUTILE (FORMAT FILE)  - types MIME
                if(in_array($ext, array("jpg","jpeg","bmp","png","tiff"))){
                    $uploadedtype = 'image';
                    if ($ext == 'jpg' || $ext == 'jpeg') {
                        $format = "image/jpeg";
                    } else if ($ext == 'tiff' || $ext == 'bmp') {
                        $format = "image/bmp";
                    } else if ($ext == 'png') {
                        $format = "image/png";
                    }
                }else if(in_array($ext, array("mp3"))){
                    $uploadedtype = 'sound';
                    $format = "audio/mpeg";
                }
                
                $prefixe = $rootname_crdo . "_" . strtoupper($uploadedtype);
                $id_crdo = $prefixe . "_" . $name_crdo;
                $nom_file = $id_crdo . "." . $ext;
                $fileToUpload = "$UploadDirectory/$nom_file";
                
                
                $new_crdo = new Crdo();

                $new_crdo->directory = $document->directory;
                $new_crdo->id = $id_crdo;
                $new_crdo->datestamp = date('Y-m-d', time());
                
                $new_crdo->title = $document->liste_crdo[0]->title;
                $new_crdo->language = $document->liste_crdo[0]->language; // CORRECTION REVUE LACITO 08/01/2015 : ajout balises dc:language
                $new_crdo->subject = $document->liste_crdo[0]->subject;
                $new_crdo->spatial = $document->liste_crdo[0]->spatial;
                $new_crdo->contributors = $document->liste_crdo[0]->contributors;
                $new_crdo->publisher = $document->liste_crdo[0]->publisher;

                $new_crdo->format = $document->liste_crdo[0]->format;
                
                $new_crdo->format = $format;
                /**/

                $new_crdo->type = ucfirst($uploadedtype);

                $new_crdo->created = $document->liste_crdo[0]->created;
                $new_crdo->conformsTo = $document->liste_crdo[0]->conformsTo;
                $new_crdo->identifier = $nom_file;
                $new_crdo->isFormatOf[] = $nom_file;

                $new_crdo->isRequiredBy = $rootname_crdo;

                $new_crdo->isPartOf = "crdo-COLLECTION_LACITO";
                $new_crdo->collection = "Lacito";
                $new_crdo->available = $document->liste_crdo[0]->available;
                $new_crdo->accessRights = "Freely available for non-commercial use";
                $new_crdo->license = "http://creativecommons.org/licenses/by-nc/2.5/";
                $new_crdo->rights = "Copyright (c) Ferlus, Michel";
                                
                //if (!file_exists($fileToUpload))
                $moveResult = move_uploaded_file($fileTmpLoc, $fileToUpload);
                // Check to make sure the move result is true before continuing
                if ($moveResult == true) {
                    //echo"<div id='filename'>$fileName</div>";
                    //echo "test controller";
                    $document->addCrdo($new_crdo);
                    exit(Yii::t('general',"Fichier téléchargé avec succès"));
                }else{
                    exit(Yii::t('general',"Erreur lors du téléchargement du fichier"));
                }
            }else{
                exit("Format non supporté");
            }
            
            
        }
    }
    
        public function actionImportDoc() {

            $user = $_POST['import-user'];


            //EN COURS 04/02/2016
            $UploadDirectory = dirname($_SERVER['SCRIPT_FILENAME']).'/documents/'.$user;
/*
            if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            // Access the $_FILES global variable for this specific file being uploaded
            // and create local PHP variables from the $_FILES array of information
                $fileName = $_FILES["uploaded-file"]["name"]; // The file name
                $fileTmpLoc = $_FILES["uploaded-file"]["tmp_name"]; // File in the PHP tmp folder

                $path_parts = pathinfo($fileName);
                $ext = strtolower($path_parts['extension']);

                //SECURITY
                if(in_array($ext, array("xml"))){

                    // Place it into your "uploads" folder mow using the move_uploaded_file() function
                    if (!is_writeable($UploadDirectory)) {
                        die("Erreur d'écriture dans le répertoire <".$UploadDirectory.">");
                     }

                    $nom_file = $id_crdo . "." . $ext;
                    $fileToUpload = "$UploadDirectory/$nom_file";


                    //if (!file_exists($fileToUpload))
                    $moveResult = move_uploaded_file($fileTmpLoc, $fileToUpload);
                    // Check to make sure the move result is true before continuing
                    if ($moveResult == true) {
                        $document->addCrdo($new_crdo);
                        exit(Yii::t('general',"Fichier téléchargé avec succès"));
                    }else{
                        exit(Yii::t('general',"Erreur lors du téléchargement du fichier"));
                    }
                }else{
                    exit("Format non supporté");
                }


            }
*/

        }


    public function actionDelCrdo() {

        //on récupère le metadata file pour y supprimer le Crdo
        $document = new Document(array('metadata_file' => trim($_POST['metadata_file']), 'directory' => trim($_POST['directory'])));

        //on récupère l'ID du Crdo à supprimer
        $id_crdo = trim($_POST['crdo']);

        $document->delCrdo($id_crdo);
        //echo $document->delCrdo($id_crdo);
        //echo CJSON::encode($document);
    }

    public function actionGetISOLanguages() {
         
        $uri = explode('/index.php/', $_SERVER['REQUEST_URI']);
        $currdir = $_SERVER['DOCUMENT_ROOT'] . $uri[0];           
        $currdir = str_replace('//', '/', $currdir);  
               
        $filename = $currdir. '/ext-data/iso-639-3/iso-639-3_Name_Index_20140320.tab';
               
        $opts = array('http' => array('header' => 'Accept-Charset: UTF-8, *;q=0'));
        $context = stream_context_create($opts);

        $contents = file_get_contents($filename, false, $context);


        $records = explode("\n", $contents);

        for ($i = 0; $i < sizeof($records); $i++) {
            $attrs = array();
            $data[$i] = explode("\t", $records[$i]);
            $j = 0;
            foreach ($data[$i] as $element) {

                if ($i == 0) {
                    //si on se trouve sur la ligne d'entête
                    $cols[] = $element;
                } else {
                    $attrs[] = $element;
                }
                $j++;
            }
            if ($i != 0) {
                $langue = array();

                foreach ($cols as $key => $val) {
                    $langue[$val] = $attrs[$key];
                }

                $results[] = $langue;
            }
        }

        return CJSON::encode($results);
    }
    
    public function actionGetISOCountries() {
         
        $uri = explode('/index.php/', $_SERVER['REQUEST_URI']);
        $currdir = $_SERVER['DOCUMENT_ROOT'] . $uri[0];           
        $currdir = str_replace('//', '/', $currdir);  
               
        $filename = $currdir. '/ext-data/iso-3166-1-alpha-2/iso-3166-1-alpha-2.json';
               
        $opts = array('http' => array('header' => 'Accept-Charset: UTF-8, *;q=0'));
        $context = stream_context_create($opts);

        $contents = file_get_contents($filename, false, $context);
        return $contents;
       // return CJSON::encode($filename);
        
    }

    public function actionGetLanguageFromISO() {
        $languages = CJSON::decode($this->actionGetISOLanguages());
        //$codelang = $_GET['codelang'];
        $search = trim($_POST['search']);
        $in = trim($_POST['in']);
        
        foreach ($languages as $language) {
            if (stristr($language[$in],$search)) {
                $result[] = array(
                    'codeISO'=>$language['Id'],
                    'langue'=>$language['Print_Name'],
                        );
            }
        }
        
        usort($result, function($a, $b) { //Sort the array using a user defined function
            return $a['codeISO'] > $b['codeISO'] ? -1 : 1; //Compare the scores
        });
        
        echo CJSON::encode($result);
    }
    
    public function actionGetCountryFromISO() {
        $countries = CJSON::decode($this->actionGetISOCountries());
        $search = trim($_POST['search']);
        $in = trim($_POST['in']);
        
        foreach ($countries as $country) {
            if (stristr($country[$in],$search)) {
                $result[] = array(
                    'Code'=>$country['Code'],
                    'Name'=>$country['Name'],
                        );
            }
        }
        
        usort($result, function($a, $b) { //Sort the array using a user defined function
            return $a['Code'] > $b['Code'] ? -1 : 1; //Compare the scores
        });
        
        echo CJSON::encode($result);
    }

    public function actionZipDoc() {

        if (isset($_POST['metadata_file']) && isset($_POST['directory'])) {
            $document = new Document(array('metadata_file' => $_POST['metadata_file'], 'directory' => $_POST['directory']));
            echo $document->zipDoc();
        }
    }

    public function actionPutWordID(){
        if (isset($_POST['metadata_file']) && isset($_POST['directory'])) {
            $document = new Document(array('metadata_file' => $_POST['metadata_file'], 'directory' => $_POST['directory']));


            
            echo $document->putWordID();
        }
    }

    public function store($file,$json){
        //file_put_contents($file,gzdeflate(json_encode($datas)));
        //file_put_contents($file,gzdeflate($json));
        file_put_contents($file,$json);

    }

    public function unstore($file){
        //return gzinflate(file_get_contents($file));
        return file_get_contents($file);

    }

    public function actionStoreJSON(){
        if (isset($_POST['json'])) {
            $json = $_POST['json'];

            $this->store('documents/'.$json['user'].'/'.$json['id'].'.json',json_encode($json));
            //echo $json['id'];
            
        }
    }

    public function actionGetJSON(){
        if (isset($_POST['iddoc']) && isset($_POST['user'])) {
            echo $this->unstore('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'.json');
        }
    }
    
}

?>
