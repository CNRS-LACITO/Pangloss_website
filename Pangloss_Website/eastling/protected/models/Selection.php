<?php

/*
 * Cette classe permet de manipuler les items 'S' (ou phrase) et 'W' (ou mot) dans les annotations
 */

/**
 * Description of Document
 *
 * @author imac
 */
class Selection {

    //public $annotations; //correspond au fichier d'annotations XML
    public $id;
    
    public $startPosition; //position de départ dans l'enregistrement
    public $endPosition; //position de fin dans l'enregistrement
    
    
    public $transcriptions = array(); //
    public $traductions = array(); //
    
    public $areas = array();
    public $children = array();
    
    public function rules() {
        return array(
            array('annotations, id, startPosition,endPosition,filepath,transcriptions,traductions', 'safe'),
        );
    }
/*
    function __construct($args) {

        if ($args) {
            foreach ($args as $key => $val) {
                if (property_exists($this, "$key")) {
                    $this->{"$key"} = $val;
                }
            }
        }
        
    }
*/
    public function __set($name, $value) {
        $this->data[$name] = $value;
    }

    public function delete($delcrdo = false) {
        $res=0;
        if ($delcrdo) {// ON DETRUIT TOUTES LES RESSOURCES ASSOCIEES AU DOCUMENT
            foreach ($this->liste_crdo as $crdo) {
                if(!$crdo->delFile()) $res++;
            }
        }

        if (file_exists($this->filepath)) {
            if(!unlink($this->filepath)) $res++;
        }
        
        return $res;
    }


}

?>
