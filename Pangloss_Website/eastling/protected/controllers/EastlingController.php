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
                            $document = new Document(array('user' => $entry, 'metadata_file' => $entry2));
                            
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

    
    //deprecated in v2
    public function getXMLDoc($file,$user){
        $document = new Document(array('metadata_file' => $file, 'user' => $user));

            $metadata = array(
                'file' =>$document->metadata_file,
                'crdos' => $document->metadata->crdos,
                'title' => $document->metadata->title,
                'alternatives' => $document->metadata->alternatives,
                'languages' => $document->metadata->languages,
                'subject' => $document->metadata->subject,
                'spatial' => $document->metadata->spatial,
                'contributors' => $document->metadata->contributors,
                'publisher' => $document->metadata->publisher,
                'accessRights' => $document->metadata->accessRights,
                'isPartOf' => $document->metadata->isPartOf,
                'collection' => $document->metadata->collection,
                'available' => $document->metadata->available,
                'license' => $document->metadata->license,
                'rights' => $document->metadata->rights,
                'requires' => $document->metadata->requires
            );

            $result = array(
                "user" => $document->user,
                "metadata" => $metadata,
                "annotations" => $document->annotations,
            );

            return $result;
    }

    public function actionGetXMLDoc() {

        if (isset($_POST['metadata_file']) && isset($_POST['user'])) {

            $result = $this->getXMLDoc($_POST['metadata_file'],$_POST['user']);

            echo json_encode($result);
        }
    }

    function rmdir_recursive($dir){
     //Liste le contenu du répertoire dans un tableau
     $dir_content = scandir($dir);
     //Est-ce bien un répertoire?
     if($dir_content !== FALSE){
      //Pour chaque entrée du répertoire
      foreach ($dir_content as $entry)
      {
       //Raccourcis symboliques sous Unix, on passe
       if(!in_array($entry, array('.','..'))){
        //On retrouve le chemin par rapport au début
        $entry = $dir . '/' . $entry;
        //Cette entrée n'est pas un dossier: on l'efface
        if(!is_dir($entry)){
         unlink($entry);
        }
        //Cette entrée est un dossier, on recommence sur ce dossier
        else{
         rmdir_recursive($entry);
        }
       }
      }
     }
     //On a bien effacé toutes les entrées du dossier, on peut à présent l'effacer
     rmdir($dir);
    }


    public function actionDeleteDocument() {

        if (isset($_POST['iddoc']) && isset($_POST['user'])) {

            $path = 'documents/'.$_POST['user'].'/'.$_POST['iddoc'];
            $this->rmdir_recursive($path);
            return;
            
        }

    }
    //Deprecated in JSON version
    public function actionCreateDoc() {

        if (isset($_POST['directory'])) {

            $document = new Document(array('user' => $_POST['directory'], 'metadata_file' => "metadata_" . $_POST['id']));


            if (!$document->existXML()) {

                $document->createXML();
                $new_crdo = new Crdo();

                $id_crdo = explode(".", $document->metadata_file);

                $new_crdo->directory = $document->directory;
                $new_crdo->datestamp = date('Y-m-d', time());
                $new_crdo->id = str_replace("metadata_", "", $id_crdo[0]);
          
                //CORRECTION EVOL : plusieurs subject possibles (revue LACITO 27/05/2015)
                foreach ($_POST['subject'] as $key => $subject) {
                    $new_crdo->subject[] = array(
                        "codelang" => $subject['codelangue'],
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

                ////http_response_code(200) KO in PHP < 5.4.0;
                echo CJSON::encode($document);
            }
        }
        
    }

    public function actionCreateDocument(){

        if (isset($_POST['user'])) {

            $uri = explode('/index.php/',$_SERVER['REQUEST_URI']);
            $directory = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents/';
            
            $directory = str_replace('//','/',$directory);
            $directory.= $_POST['user'].'/'.$_POST['id'];
            
            if(!is_dir($directory)){
            
                mkdir($directory, 0777);
                $alternatives = array();

                foreach ($_POST['title'] as $i => $value) {
                    if($i == 0) 
                        $title =  array(
                        'lang' => $value['lang'],
                        'title' => $value['title']
                        );
                    else
                        $alternatives[] =  array(
                            'lang' => $value['lang'],
                            'alternative' => $value['title']
                            );
                
                }

                foreach ($_POST['contributors'] as $key => $value) {
                    foreach ($value as $k => $v) {
                        $contributors[] = array(
                        'code'=>$key,
                        'contributor'=>$v
                        );
                    }
                    
                }

                foreach ($_POST['subject'] as $key => $value) {                    
                        $subjects[] = array(
                        'codelang'=>$value['codelangue'],
                        'subject'=>$value['subject']
                        ); 
                }

                foreach ($_POST['languages'] as $key => $value) {                    
                        $languages[] = $value; 
                }

                foreach ($_POST['publishers'] as $key => $value) {                    
                        $publishers[] = $value; 
                }

                $spatial = array(
                    'countrycode' => $_POST['spatial']['countrycode'],
                    'geo' => array(
                        'east'=>$_POST['spatial']['geo']['east'],
                        'north'=>$_POST['spatial']['geo']['north']
                        ),
                    'lang' =>$_POST['spatial']['lang'],
                    'place' =>$_POST['spatial']['place']
                    );

                $isPartOf = $_POST['isPartOf'];
                $collection = $_POST['collection'];
                $accessRights = $_POST['accessRights'];
                $license = $_POST['license'];
                $rights = $_POST['rights'];

                $metadata = array(
                    'title'=>$title,
                    'alternatives'=>$alternatives,
                    'subject'=>$subjects,
                    'languages'=>$languages,
                    'spatial'=>$spatial,
                    'contributors'=>$contributors,
                    'accessrights'=>$accessRights,
                    'license'=>$license,
                    'collection'=>$collection,
                    'ispartof'=>$isPartOf,
                    'rights'=>$rights,
                    'available'=>'',
                    'publishers'=>$publishers,
                );

                //echo json_encode($metadata);
                $json = array(
                    'id' => $_POST['id'],
                    'user' => $_POST['user'],
                    'metadata' => $metadata,
                    'annotations'=>array(
                        'sentences'=>array()
                        ),
                    'resources'=> array(
                        'images'=>array(),
                        'audio'=>''
                        )
                    );
                $this->store($directory.'/'.$_POST['id'].'.json',json_encode($json));
                //http_response_code(200) KO in PHP < 5.4.0;
                echo CJSON::encode(array('message'=>'Document créé'));

            }else{
                //http_response_code(500) KO in PHP < 5.4.0;
                echo CJSON::encode(array('message'=>'Erreur lors de la création du document'));
            }
        }
    }


    //eastling version for JSON
    //13/11/2016
    public function exportXML($parameters){
        if (isset($parameters['iddoc']) && isset($parameters['user'])) {

                //$parameters['user'] = $_POST['user'];
                //$parameters['iddoc'] = $_POST['iddoc'];
                $parameters['jsonfile'] = $parameters['iddoc'];
            	
            	//$parameters['user'] = 'test';
                //$parameters['iddoc'] = 'crdo-TWH_T19';
                //$parameters['jsonfile'] = 'crdo-TWH_T19';  

                $filepath = 'documents/'.$parameters['user'].'/'.$parameters['iddoc'].'/'.$parameters['jsonfile'].'.json';

            	$filecontent = $this->getJSON($parameters);
            	$metadata = $filecontent->metadata;
            	$date =  date ("Y-m-d", filemtime($filepath));
            	
            	//$file.='/' . $this->metadata_file;
                //$newfile = fopen($file, "w");
                
                $xml = '<?xml version="1.0" encoding="UTF-8" ?><crdo:catalog xmlns:dc="http://purl.org/dc/elements/1.1/" '
                        . 'xmlns="http://crdo.risc.cnrs.fr/schemas/" '
                        . 'xmlns:oai="http://www.openarchives.org/OAI/2.0/" '
                        . 'xmlns:olac="http://www.language-archives.org/OLAC/1.1/" '
                        . 'xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" '
                        . 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                        . 'xmlns:dcterms="http://purl.org/dc/terms/">';



                $common_crdo= "<dc:title  xml:lang=\"".$metadata->title->lang."\">".$metadata->title->title."</dc:title>";

                foreach ($metadata->alternatives as $alternative) {
                	$common_crdo.= "<dcterms:alternative xml:lang=\"".$alternative->lang."\">".$alternative->alternative."</dcterms:alternative>";
                }

                foreach ($metadata->languages as $language) {
                	$common_crdo.="<dc:language xsi:type=\"olac:language\" olac:code=\"$language\"></dc:language>";
                }
                foreach ($metadata->subject as $subject) {
                    $common_crdo.="<dc:subject  xsi:type=\"olac:language\" olac:code=\"".$subject->codelang."\">".$subject->subject."</dc:subject>";
                }

                $common_crdo.="<dcterms:spatial  xsi:type=\"dcterms:ISO3166\">".$metadata->spatial->countrycode."</dcterms:spatial>
                <dcterms:spatial  xsi:type=\"dcterms:Point\">east=".$metadata->spatial->geo->east.";north=".$metadata->spatial->geo->north.";</dcterms:spatial>
                <dcterms:spatial  xml:lang=\"".$metadata->spatial->lang."\">".$metadata->spatial->place."</dcterms:spatial>";

                foreach ($metadata->contributors as $contributor) {
                    $common_crdo.="<dc:contributor xsi:type=\"olac:role\" olac:code=\"".$contributor->code."\">".$contributor->contributor."</dc:contributor>";
                }
                if(sizeof($metadata->publishers)>0){
                    foreach ($metadata->publishers as $publish) {
                        $common_crdo.="<dc:publisher>".$publish."</dc:publisher>";
                    }
                }else{
                    $common_crdo.="<dc:publisher></dc:publisher>";
                }
                
			    $common_crdo.="<dcterms:accessRights >".$metadata->accessrights."</dcterms:accessRights>
			    <dcterms:isPartOf  xsi:type=\"dcterms:URI\">".$metadata->ispartof."</dcterms:isPartOf>
			    <collection>".$metadata->collection."</collection>
			    <dcterms:available xsi:type=\"dcterms:W3CDTF\">".$metadata->available."</dcterms:available>
			    <dcterms:license xsi:type=\"dcterms:URI\">".$metadata->license."</dcterms:license>
			    <dc:rights>".$metadata->rights."</dc:rights>
                ";

                $xml.="<crdo:item xmlns:crdo=\"http://crdo.risc.cnrs.fr/schemas/\" crdo:datestamp=\"$date\" crdo:id=\"$filecontent->id\">";
                    $xml.=$common_crdo;

                    

                    $xml.="<dc:format  xsi:type=\"dcterms:IMT\">text/xml</dc:format>
                    <dc:source></dc:source>
                    <dc:type xsi:type=\"dcterms:DCMIType\">Text</dc:type>
                    <dcterms:created xsi:type=\"dcterms:W3CDTF\">$date</dcterms:created>
                    <dcterms:extent></dcterms:extent>
                    <dc:identifier xsi:type=\"dcterms:URI\">$filecontent->id.xml</dc:identifier>
                    <dcterms:isFormatOf  xsi:type=\"dcterms:URI\">$filecontent->id.xhtml</dcterms:isFormatOf>";

                    foreach ($filecontent->resources->images as $image){  
                        $xml.="<dcterms:requires xsi:type=\"dcterms:URI\">$image->id</dcterms:requires>";
                    }
                    $xml.="<dcterms:requires xsi:type=\"dcterms:URI\">".$filecontent->id."_audio</dcterms:requires>";
                    $xml.='</crdo:item>';

                //CRDO ITEM IMAGE
                foreach ($filecontent->resources->images as $image){
                	$xml.="<crdo:item xmlns:crdo=\"http://crdo.risc.cnrs.fr/schemas/\" crdo:datestamp=\"$date\" crdo:id=\"$image->id\">";
                	$xml.=$common_crdo;
                    $xml.="<dc:format xsi:type=\"dcterms:IMT\">image/jpeg</dc:format>
                    <dc:source></dc:source>
                    <dc:type xsi:type=\"dcterms:DCMIType\">Image</dc:type>
                    <dcterms:created xsi:type=\"dcterms:W3CDTF\">$date</dcterms:created>
                    <dcterms:extent></dcterms:extent>
                    <dcterms:isRequiredBy xsi:type=\"dcterms:URI\">$filecontent->id</dcterms:isRequiredBy>
                    <dc:identifier xsi:type=\"dcterms:URI\">$image->file</dc:identifier>
                    <dcterms:isFormatOf  xsi:type=\"dcterms:URI\">$image->file</dcterms:isFormatOf>";
                    
                	$xml.='</crdo:item>';
                }
                //CRDO ITEM AUDIO
                $xml.="<crdo:item xmlns:crdo=\"http://crdo.risc.cnrs.fr/schemas/\" crdo:datestamp=\"$date\" crdo:id=\"".$filecontent->id."_audio\">";
                    $xml.=$common_crdo;
                    $xml.="<dc:format xsi:type=\"dcterms:IMT\">audio/mpeg</dc:format>
                    <dc:source></dc:source>
                    <dc:type xsi:type=\"dcterms:DCMIType\">Sound</dc:type>
                    <dcterms:created xsi:type=\"dcterms:W3CDTF\">$date</dcterms:created>
                    <dcterms:extent></dcterms:extent>
                    <dcterms:isRequiredBy xsi:type=\"dcterms:URI\">$filecontent->id</dcterms:isRequiredBy>
                    <dc:identifier xsi:type=\"dcterms:URI\">".$filecontent->resources->audio."</dc:identifier>
                    <dcterms:isFormatOf  xsi:type=\"dcterms:URI\">".$filecontent->resources->audio."</dcterms:isFormatOf>";
                    
                    $xml.='</crdo:item>';
                    $xml.='</crdo:catalog>';              

                $this->store('documents/'.$parameters['user'].'/'.$parameters['iddoc'].'/metadata_'.$parameters['iddoc'].'.xml',$xml);

                
                $xml_annotations = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE TEXT SYSTEM \"../../Archive_v2.dtd\">
<TEXT xmlns=\"http://crdo.risc.fr/schemas/annotation\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://crdo.risc.fr/schemas/annotation http://cocoon.huma-num.fr/schemas/archive.xsd\" id=\"$filecontent->id\" xml:lang=\"\"><HEADER/>";

                foreach ($filecontent->annotations->sentences as $sentence) {
                    $xml_annotations .=$this->convertSelectionToXML($sentence,'S');
                }

                $xml_annotations .= "</TEXT>";

                $this->store('documents/'.$parameters['user'].'/'.$parameters['iddoc'].'/'.$parameters['iddoc'].'.xml',$xml_annotations);
                
        }
    }

    public function convertSelectionToXML($selection,$tag){

        $xml ="<$tag id=\"$selection->id\">";

        //image
        $tag_area = "";
        foreach ($selection->areas as $area) {
            $tag_area .= "<AREA image=\"$area->image\" shape=\"rect\" coords=\"$area->x1,$area->y1,$area->x2,$area->y2\"></AREA>";

        }

        //audio
        $tag_audio = "<AUDIO start=\"$selection->startPosition\" end=\"$selection->endPosition\"/>";

        //traductions
        $tag_traduction = "";
        foreach ($selection->traductions as $traduction) {
            $tag_traduction .="<TRANSL xml:lang=\"$traduction->lang\">$traduction->traduction</TRANSL>";
        }

        //transcriptions
        $tag_transcription = "";
        foreach ($selection->transcriptions as $transcription) {
            $tag_transcription .="<FORM kindOf=\"$transcription->lang\">$transcription->transcription</FORM>";
        }
        
        $mots = "";
        if(isset($selection->children)){
            
            foreach ($selection->children as $mot) {
                $mots.=$this->convertSelectionToXML($mot,'W');
            }
        }


        
        $xml .= $tag_area.$tag_audio.$tag_traduction.$tag_transcription.$mots;

        $xml .= "</$tag>";

        return $xml;
    }
    
    public function actionPhpinfo() {  
        phpinfo();
    }
    
    // 03/03/2015
    // Modification d'une annotation (transcription/traduction) à une sélection existante
    // 10/01/2017
    // Mise à jour de la procédure pour mettre à jour le JSON
    public function actionUpdateAnnotation() {

        //if (isset($_POST['directory']) && isset($_POST['document'])) {

            if (isset($_POST['iddoc']) && isset($_POST['user'])) {
                $parameters['user'] = $_POST['user'];
                $parameters['iddoc'] = $_POST['iddoc'];
                $parameters['jsonfile'] = $_POST['iddoc'];
            
            $json = $_POST['json'];    

            $filecontent = $this->getJSON($parameters);

            //22/04/2017
            //Sauvegarde version avant MàJ
            $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'_'.date('Ymd_His').'.jsonsave',json_encode($filecontent));


            //détermination du type d'annotation à mettre à jour
            $id_items = explode('_', $json['id']);
            $subid_selection = $id_items[sizeof($id_items) - 1]; //ID de la sélection à mettre à jour
            $motphrase = substr($subid_selection, 0, 1); //type de sélection S ou W

            $found = false;

            $areas = array();
            if(isset($json['areas'])) $areas = $json['areas'];

            if($motphrase == 'S'){
                foreach ($filecontent->annotations->sentences as $sentence) {
                    if($sentence->id == $json['id']){
                        $sentence->startPosition = $json['startPosition'];
                        $sentence->endPosition = $json['endPosition'];
                        $sentence->areas = $areas;
                        $sentence->traductions = $json['traductions'];
                        $sentence->transcriptions = $json['transcriptions'];
                        break;
                    }
                }
            }else if($motphrase == 'W'){
                foreach ($filecontent->annotations->sentences as $sentence) {
                    if($found == true) break;

                    foreach ($sentence->children as $word) {
                        if($word->id == $json['id']){
                            $found = true;
                            $word->startPosition = $json['startPosition'];
                            $word->endPosition = $json['endPosition'];
                            $word->areas = $areas;
                            $word->traductions = $json['traductions'];
                            $word->transcriptions = $json['transcriptions'];
                            break;
                        }
                    }
                }
            }

            $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'.json',json_encode($filecontent));
            //echo json_encode($filecontent);



        }
    }
    
    //EVOL besoin Hang 04/10/2015 DEPRECATED since JSON version
    // Modification d'une position (audio ou image) à une sélection existante
    public function actionUpdatePosition() {

        if (isset($_POST['directory']) && isset($_POST['document'])) {
            //récupération du document de metadonnées
                        
            $document = new Document(array('user' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            //récupération du fichier d'annotations
            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->metadata->subject[0]['codelang'],
                'title' => $document->metadata->title));

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

    // 04/03/2015 DEPRECATED since JSON version
    // Ajout d'une annotation (transcription/traduction) à une sélection existante
    public function actionAddAnnotation() {
        
        if (Yii::app()->user->isGuest) {
            $this->redirect(Yii::app()->createUrl('site/login'));
        }
        
        if (isset($_POST['directory']) && isset($_POST['document'])) {
            //récupération du document de metadonnées
            $document = new Document(array('user' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            //récupération du fichier d'annotations
            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->metadata->subject[0]['codelang'],
                'title' => $document->metadata->title));

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
    //deprecated in JSON version
    public function actionDelAnnotation() {

        if (isset($_POST['directory']) && isset($_POST['document'])) {
            //récupération du document de metadonnées
            $document = new Document(array('user' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            //récupération du fichier d'annotations
            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->metadata->subject[0]['codelang'],
                'title' => $document->metadata->title));

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
    //TODO 10/02/2017
    public function actionCreateAnnotation(){
        if (isset($_POST['user']) && isset($_POST['iddoc'])) {
            $parameters['user'] = $_POST['user'];
            $parameters['iddoc'] = $_POST['iddoc'];
            $parameters['jsonfile'] = $_POST['iddoc'];
           
            $filecontent = $this->getJSON($parameters);
            //22/04/2017
            //Sauvegarde version avant MàJ
            $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'_'.date('Ymd_His').'.jsonsave',json_encode($filecontent));

            
            if(isset($filecontent->annotations->sentences)){

                if(isset($_POST['idparent'])){
                    foreach ($filecontent->annotations->sentences as $sentence) {
                        if($sentence->id == $_POST['idparent']){
                            $sentence->children[] = $_POST['annotation'];
                        }
                    }
                    $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'.json',json_encode($filecontent));
                    //http_response_code(200) KO in PHP < 5.4.0; //KO in PHP < 5.4.0
                    echo CJSON::encode(array("message"=>"Annotation created"));
                }else{
                    $filecontent->annotations->sentences[] = $_POST['annotation'];
                    $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'.json',json_encode($filecontent));
                    //http_response_code(200) KO in PHP < 5.4.0; //KO in PHP < 5.4.0
                    echo CJSON::encode(array("message"=>"Annotation created"));
                }

                
            }else{
                //http_response_code(500) KO in PHP < 5.4.0;
                echo "Error during annotation creation";
            }
            
        }
    }

    //TODO 10/02/2017
    public function actionDeleteSelection(){
        if (isset($_POST['user']) && isset($_POST['iddoc'])) {
            $parameters['user'] = $_POST['user'];
            $parameters['iddoc'] = $_POST['iddoc'];
            $parameters['jsonfile'] = $_POST['iddoc'];
            
            //get the JSON doc into object
            $filecontent = $this->getJSON($parameters);
            //22/04/2017
            //Sauvegarde version avant MàJ
            $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'_'.date('Ymd_His').'.jsonsave',json_encode($filecontent));

            
            if($_POST['motphrase'] == 'sentence'){
                $sentencesToKeep = array();

                foreach($filecontent->annotations->sentences as $sentence){
                    if($sentence->id != $_POST['idselection']){
                        $sentencesToKeep[] = $sentence;
                    }
                }

                $filecontent->annotations->sentences = $sentencesToKeep;

            }elseif ($_POST['motphrase'] == 'word') {
                foreach($filecontent->annotations->sentences as $sentence){

                    $wordsToKeep = array();

                    foreach($sentence->children as $word){
                        if($word->id != $_POST['idselection']){
                            $wordsToKeep[] = $word;
                        }
                    }

                    $sentence->children = $wordsToKeep;
                }


            }

           
            
            $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'.json',json_encode($filecontent));
            //http_response_code(200) KO in PHP < 5.4.0; 
            echo CJSON::encode(array("message"=>"Selection deleted"));

            
        }
    }

    //deprecated in JSON version - use createAnnotation instead    
    public function actionCreateSelection() {

        if (isset($_POST['directory']) && isset($_POST['document'])) {

            $document = new Document(array('user' => $_POST['directory'], 'metadata_file' => $_POST['document']));

            $annotations = new Annotations(array(
                'document_filepath' => $document->filepath,
                'lang' => $document->metadata->subject[0]['codelang'],
                'title' => $document->metadata->title));

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

            $document = new Document(array('metadata_file' => $_POST['metadata_file'], 'user' => $_POST['directory']));
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

    //09/02/2017
    public function actionDelResource(){
        $parameters['user'] = $_POST['user'];
        $parameters['iddoc'] = $_POST['iddoc'];
        $parameters['jsonfile'] = $_POST['iddoc'];
        $typeresource = $_POST['typeresource']; 
        $idresource = $_POST['idresource']; 

        $resourceurl = 'documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/';

        $filecontent = $this->getJSON($parameters);

        if(isset($filecontent->resources)){
            $resources = $filecontent->resources; 
        }

        if($typeresource == 'image'){
            $imagesToBeKept = array();
            foreach ($resources->images as $image) {
                if($image->id != $idresource){
                    $imagesToBeKept[] = $image; 
                }else{
                    $resourceurl .= $image->file;
                }
            }
            $resources->images = $imagesToBeKept;

        }elseif ($typeresource == 'audio') {
            if($resources->audio == $idresource){
                $resources->audio="";
                $resourceurl .= $idresource;
            }
                    
        }

        $filecontent->resources = $resources;

        $parameters['json'] = $filecontent;
        //update JSON content                    
        $this->setJSON($parameters);

        
        if (file_exists($resourceurl)) {
            unlink($resourceurl);
        }
                    
        exit(Yii::t('general',"Ressource supprimée."));

    }

    //public function actionAddCrdo() {
    public function actionAddResource() {
        
        /* nouvelle version JSON : 
        il faut:
            - valider la ressource à uploader : image ou audio
            - convertir si WAV ? Pas pour le moment
            - uploader le fichier
            - modifier le metadata.resources
        */

        $document_id = $_POST['uploaded-document'];

        if (isset($_POST['uploaded-document']) && isset($_POST['uploaded-user'])) {

            $parameters['user'] = $_POST['uploaded-user'];
            $parameters['iddoc'] = $document_id;
            $parameters['jsonfile'] = $document_id;
           
        $filecontent = $this->getJSON($parameters);

        if(isset($filecontent->resources)){
            $resources = $filecontent->resources; 
        }

        //KO when deleting image 2 on 3, the next added image will get id 3 again -> overwriting
        //$nb_images = (isset($filecontent->resources))?sizeof($resources->images):0;


        $fileid = $_POST['uploaded-name'];

        $UploadDirectory = dirname($_SERVER['SCRIPT_FILENAME']).'/documents/'.$_POST['uploaded-user'].'/'.$document_id;


        if ($_SERVER['REQUEST_METHOD'] == 'POST') {

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
                
                $prefixe = $document_id . "_" . strtolower($uploadedtype);
                $id_crdo = $prefixe . "_" . time();
                $nom_file = $id_crdo . "." . $ext;
                $fileToUpload = "$UploadDirectory/$nom_file";
                                                               
                $moveResult = move_uploaded_file($fileTmpLoc, $fileToUpload);
                // Check to make sure the move result is true before continuing
                if ($moveResult == true) {
                    if($uploadedtype == 'sound'){
                    //TODO nettoyage du fichier audio précédent !!
                        $resources->audio = $nom_file;
                    }else if ($uploadedtype == 'image') {
                        $resources->images[] = array(
                            'file' => $nom_file,
                            'id' => $fileid
                            );
                    }

                    //$resources = json_encode($resources);

                    $filecontent->resources = $resources;

                    $parameters['json'] = $filecontent;
                    
                    $this->setJSON($parameters);
                    

                    exit(Yii::t('general',"Fichier téléchargé avec succès"));
                }else{
                    exit(Yii::t('general',"Erreur lors du téléchargement du fichier"));
                }
            }else{
                exit("Format non supporté");
            }
              
        } 
    }
}
    
        public function actionImportDoc() {

            //TODO
            /*
                -import des fichiers : il faut au moins les metadonnées et alerter si il manque les annotations
                -parsing et conversion XML -> JSON des fichiers
                -création du dossier document
                -enregistrement du JSON
            */
            if (isset($_POST['import-user']) && isset($_POST['import-iddoc'])) {

                $parameters['user'] = $_POST['import-user'];
                $parameters['iddoc'] = $_POST['import-iddoc'];
                $parameters['jsonfile'] = $_POST['import-iddoc'];
                   
                $filecontent = $this->getJSON($parameters);


                //EN COURS 13/02/2017
                $UserFolder = dirname($_SERVER['SCRIPT_FILENAME']).'/documents/'.$parameters['user'].'/'.$parameters['iddoc'];

                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                // Access the $_FILES global variable for this specific file being uploaded
                // and create local PHP variables from the $_FILES array of information
                    $annotationsFileName = $_FILES["annotation-file"]["name"]; // The file name
                    $annotationsFileTmpLoc = $_FILES["annotation-file"]["tmp_name"]; // File in the PHP tmp folder

                    $annotationsFilePathParts = pathinfo($annotationsFileName);
                    $annotationsFileExt = strtolower($annotationsFilePathParts['extension']);

                    //SECURITY
                    if(in_array($annotationsFileExt, array("xml"))){

                        // Place it into your "uploads" folder mow using the move_uploaded_file() function
                        if (!is_writeable($UserFolder)) {
                            die("Erreur d'écriture dans le répertoire <".$UserFolder.">");
                         }

                        $annotationsFileToUpload = "$UserFolder/$annotationsFileName";
                        $moveAnnotationsResult = move_uploaded_file($annotationsFileTmpLoc, $annotationsFileToUpload);
                        // Check to make sure the move result is true before continuing
                        if ($moveAnnotationsResult == true) {
                            $annotations = new Annotations(array('document_filepath'=>$annotationsFileToUpload));
                            $filecontent->annotations->sentences = $annotations->sentences;

                        }

                        $parameters['json'] = $filecontent;
                        $this->setJSON($parameters);

                    }else{
                        exit("Format non supporté");
                    }


                }

            }
        }


    public function actionDelCrdo() {

        //on récupère le metadata file pour y supprimer le Crdo
        $document = new Document(array('metadata_file' => trim($_POST['metadata_file']), 'user' => trim($_POST['directory'])));

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

    

    public function actionPutWordID(){
        if (isset($_POST['metadata_file']) && isset($_POST['directory'])) {
            $document = new Document(array('metadata_file' => $_POST['metadata_file'], 'user' => $_POST['directory']));


            
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

        //if (isset($_POST['metadata'])) {
            //$metadata = $_POST['metadata'];
            
            //$this->store('documents/'.$json['user'].'/'.$json['id'].'.json',json_encode($json));
            $this->store('documents/'.$_POST['user'].'/'.$_POST['id'].'/'.$_POST['jsonfile'].'.json',json_encode($_POST['content']));
            echo $json;
            
        //}
    }

    public function getJSON($parameters){
        return json_decode($this->unstore('documents/'.$parameters['user'].'/'.$parameters['iddoc'].'/'.$parameters['jsonfile'].'.json'));
    }

    public function setJSON($parameters){
        $this->store('documents/'.$parameters['user'].'/'.$parameters['iddoc'].'/'.$parameters['jsonfile'].'.json',json_encode($parameters['json']));
    }

    public function actionGetJSON(){
        if (isset($_POST['iddoc']) && isset($_POST['user']) && isset($_POST['jsonfile'])) {
            $parameters = $_POST;
            echo CJSON::encode($this->getJSON($parameters));
        }
    }

    public function actionGetListJSON() {
        
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

        $handler = opendir($directory);
        while ($entry = readdir($handler)) {

            if (($entry != "." && $entry != "..") && is_dir($directory . '/' . $entry) && ($user == "all" || ($user != "all" && $user == $entry) )) {

                $handler2 = opendir($directory . '/' . $entry);

                while ($entry2 = readdir($handler2)) {
                    // if file isn't this directory or its parent, add it to the results
                    if ($entry2 != "." && $entry2 != ".." && is_dir($directory.'/'.$entry.'/'.$entry2)) {
                        if(file_exists('documents/'.$user.'/'.$entry2.'/'.$entry2.'.json')){

                            $results[] = $this->getJSON(array('user'=>$user,'iddoc'=>$entry2, 'jsonfile'=>$entry2));
                            //KO 
                            $this->truncateJsonFiles($user,$entry2);
                        }

                    }
                }

            }
        }


        //echo $id;
        echo json_encode($results);
        //echo $results;
        //}
    }

    public function actionSortAnnotations(){
        $result = array();
        $r = array();

        if($_POST['iddoc'] && $_POST['user']){
            $parameters = array('user'=>$_POST['user'],'iddoc'=>$_POST['iddoc'],'jsonfile'=>$_POST['iddoc']);
            $jsonfile = $this->getJSON($parameters);

            //22/04/2017
            //Sauvegarde version avant MàJ
            $this->store('documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'_'.date('Ymd_His').'.jsonsave',json_encode($jsonfile));


            $sortedIds = $_POST['sortedIds'];
            

            //si on doit trier les phrases
            if($_POST['idparent'] == '0'){
                foreach ($sortedIds as $sortedId) {
                    foreach ($jsonfile->annotations->sentences as $sentence) {
                        if($sentence->id == $sortedId){
                            $result[] = $sentence;
                            break;
                        }
                    }
                }

                $jsonfile->annotations->sentences = $result;

            }else{
                foreach ($jsonfile->annotations->sentences as $key=>$sentence) {
                    if($sentence->id == $_POST['idparent']){
                        foreach ($sortedIds as $sortedId) {
                            foreach ($sentence->children as $word) {
                                if($word->id == $sortedId){
                                    $result[] = $word;
                                    break;
                                }
                            }
                        }
                        $sentence->children = $result;
                        //$jsonfile->annotations->sentences[$key] = $result;
                    }
                }
                
            }
            
        }    
        $newfile = 'documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/'.$_POST['iddoc'].'.json';
        echo $this->store($newfile,json_encode($jsonfile));
    }

    //09/02/2017 : exportXML to be done for preview in player
    //TODO : pas utile
    public function actionGenerateXML(){
        $parameters = array('user'=>$_POST['user'],'iddoc'=>$_POST['iddoc'],'jsonfile'=>$_POST['iddoc']);
        $this->exportXML($parameters);
        //http_response_code(200) KO in PHP < 5.4.0;
        echo "XML généré";
    }

    //10/01/2017 : adapt to EASTLING JSON version
    public function actionZipDoc() {

        if($_POST['iddoc'] && $_POST['user']){
            $parameters = array('user'=>$_POST['user'],'iddoc'=>$_POST['iddoc'],'jsonfile'=>$_POST['iddoc']);
            $jsonfile = $this->getJSON($parameters);

            $zip = new ZipArchive();
            $path = 'documents/'.$_POST['user'].'/'.$_POST['iddoc'].'/';
            $url = $path.$_POST['iddoc'].'.zip';

            if (file_exists($url)) {
                $zip->open($url, ZipArchive::OVERWRITE);
            } else {
                $zip->open($url, ZipArchive::CREATE);
            }

            //export XML
            $this->exportXML($parameters);
            
            //ajout du fichier de metadata
            $zip->addFile($path.'metadata_'.$jsonfile->id.'.xml', 'metadata_'.$jsonfile->id.'.xml');
            //ajout du fichier d'annotations
            $zip->addFile($path.$jsonfile->id.'.xml', $jsonfile->id.'.xml');
            //ajout des fichiers images
            foreach ($jsonfile->resources->images as $image) {
                $zip->addFile($path.$image->file, $image->file);
            }
            //ajout du fichier audio
            $zip->addFile($path.$jsonfile->resources->audio, $jsonfile->resources->audio);

            $filezip = $zip->filename;

            $zip->close();

            $filezip = explode('/', $filezip);
            $filezip_path_len = sizeof($filezip);
            echo $filezip[$filezip_path_len - 1];

        }
    }

    //22/04/2017 : truncate files JSONSAVE to keep 20 versions
    public function truncateJsonFiles($user,$iddoc){
        $results = array();

        foreach (glob("documents/".$user."/".$iddoc."/*.jsonsave") as $filename) {
            $results[] = array("name"=>$filename,"date"=>fileatime($filename));
        }
        //$this->store('documents/deo/crdo-RCF_deo_1492606187237/test.txt',$cpt);
        if(sizeof($results)>0){
            // Obtient une liste de colonnes
            foreach ($results as $key => $row) {
                $date[$key] = $row['date'];
            }

            // Trie les données par date décroissante
            array_multisort($date, SORT_DESC, $results);
            // Sélectionne les fichiers de fin de pile à supprimer pour ne garder que 30 versions
            $results = array_slice($results, 30);

            foreach ($results as $fileToDelete) {
                unlink($fileToDelete["name"]);
            }
        }


    }

}

?>
