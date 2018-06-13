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
class Crdo {

    public $directory;
    public $datestamp;
    public $id;
    public $title;
    public $alternatives = array();
    public $subject = array();
    public $languages = array();
    public $spatial = array();
    public $contributors = array();
    public $publisher = array();
    public $format;
    public $type;
    public $created;
    public $conformsTo;
    public $identifier;
    public $isFormatOf = array();
    public $requires = array();
    public $isRequiredBy;
    public $isPartOf = "crdo-COLLECTION_LACITO";
    public $collection = "Lacito";
    public $available;
    public $source;
    public $accessRights = "Freely available for non-commercial use";
    public $license = "http://creativecommons.org/licenses/by-nc/2.5/";
    public $rights = "Copyright (c) Ferlus, Michel";

    public function rules() {
        return array(
            array('directory, title,language,subject,spatial,contributors,publisher,format,type,conformsTo,identifier,isFormatOf,requires,isPartOf,collection,available,accessRights,license,rights', 'safe'),
        );
    }

    public function __set($name, $value) {
        $this->data[$name] = $value;
    }

    public function existFile() {

        $srv_test = "";
        
          if (strpos($_SERVER['DOCUMENT_ROOT'], 'MAMP') > 0) {
            $srv_test = "/moon-light";
          }        

        //BUG mise en prod test LACITO
        $phpversion = substr(phpversion(),0,3);
        
        if($phpversion == "5.4"){
            $file = $_SERVER['DOCUMENT_ROOT'] . $srv_test . '/documents';
            
        }else if($phpversion == "5.3"){
            $uri = explode('/index.php/',$_SERVER['REQUEST_URI']);
            
            $file = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents';
            
        }
        $file = str_replace('//','/',$file);
        //
        
        if (isset($this->directory))
            $file.='/' . $this->directory;

        if (isset($this->identifier))
            $file.='/' . $this->identifier;

        if (file_exists($file)) {
            return $file;
        } else {
            return false;
        }
    }
    
    public function delFile() {
        $res=true;

        $uri = explode('/index.php/',$_SERVER['REQUEST_URI']);   
        $filedir = $_SERVER['DOCUMENT_ROOT'] . $uri[0] . '/documents';
        $filedir = str_replace('//','/',$filedir);

        if (isset($this->directory)){
            $filedir.='/';
            $filedir.=$this->directory;
        }
        //utiliser isformatof
        foreach($this->isFormatOf as $fileformat){
            $file = $filedir.'/'.$fileformat;
            
            if(file_exists($file)){
                $res=unlink($file);               
            }
        }
        //CORRECTION BUG suppression fichier annotation : dans isformatof, extension=xhtml et non xml
            $file = $filedir.'/'.$this->identifier;
            
            if(file_exists($file)){
                $res=unlink($file);               
            }        

        return $res;
        //echo CJSON::encode($this);
    }

    public function uploadFile() {

        if (!$this->existFile()) {
            
        }
    }

    public function getFileXML() {

        if ($file = $this->existFile()) {

            $info = new SplFileInfo($file);

            if ($info->getExtension() == "xml") {
                /*
                  $ressources = array();

                  $catalog = simplexml_load_file($file);

                  $namespaces = $catalog->getDocNamespaces(true);
                 */
            }
        }
    }

}

?>
