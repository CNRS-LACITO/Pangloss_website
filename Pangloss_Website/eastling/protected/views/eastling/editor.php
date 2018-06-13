<?php
$baseUrl = Yii::app()->baseUrl;

$this->layout = "eastling-mini";
$this->pageTitle = Yii::app()->name;

?>
<!-- SIDEBAR CONTENU METADATA -->
<div id="open-metadata" class="ui blue left attached icon button" style="position:fixed;top:50px;right:0px;font-size: 0.8em;z-index: 99;">
    <i class="ui icon key"></i>
    Metadata 
</div>
<div id="metadata" class="ui right labeled sidebar very wide blue vertical menu" style="z-index:999;">
    <div class="header item"><translate>Metadata (feature not complete)</translate></div>
    <div id="metadata-data" class="ui form"></div>
</div>
<!-- SIDEBAR CONTENU ANNOTATIONS -->
<div id="open-annotations" class="ui blue left attached icon button" style="position:fixed;top:90px;right:0px;font-size: 0.8em;z-index: 99;">
    <i class="ui icon browser"></i>
    Annotations 
</div>
<div id="annotations" class="ui right labeled sidebar very wide blue vertical menu" style="z-index:999;">
    <button id="btn-import-doc" class="medium teal ui labeled icon button" type="button">
        <i class="upload disk icon"></i>
        <translate>Importer des annotations</translate>
    </button>
    <div class="header item"><translate>Phrases</translate></div>
    <div id="annotations-sentences" class="sortable" style="font-size:0.8rem;"></div>
</div>

<? //include('annotations.php'); ?>
<?php include('input-bar.php'); ?>

<!-- PAGE CENTRALE -->
<div class="ui page">
  <div id="loading" class="ui dimmer">
    <progress style="display:block;width:100%;" id="loading-progress" value="0" max="100"></progress>
    <div class="ui text loader"><translate>Chargement en cours</translate></div>
  </div>

<div class="main container"> 
    <div class="ui two column grid middle aligned"> 
        <?php include('header.php'); ?>
        <?php //include('modal.php'); ?>
        <?php include('form-compo.php'); ?>
        <?php include('form-upload.php'); ?>
        <?php include('form-new-doc.php'); ?>
        <?php include('form-import-doc.php'); ?>
        <?php include('modal.php'); ?>
    </div>
</div>

</div>
<?php

if($this->layout == "eastling"){

    $js = Yii::app()->getClientScript();
    $js->registerScriptFile($baseUrl . "/custom-js/commonfunctions.js", CClientScript::POS_END);
    $js->registerScriptFile($baseUrl . "/eastling-js/jquery.maphilight.js", CClientScript::POS_END);
    $js->registerScriptFile($baseUrl . "/eastling-js/eastlingplayer.js", CClientScript::POS_END);
    $js->registerScriptFile($baseUrl . "/eastling-js/eastlingShape.js", CClientScript::POS_END);
    $js->registerScriptFile($baseUrl . "/eastling-js/html5PlayerManager_md.js");
    $js->registerScriptFile($baseUrl . "/eastling-js/word_highlight.js", CClientScript::POS_END);
    $js->registerScriptFile($baseUrl . "/custom-js/editor.js", CClientScript::POS_END);
    $js->registerCssFile($baseUrl . "/css/LacitoStyle.css");

}

?>