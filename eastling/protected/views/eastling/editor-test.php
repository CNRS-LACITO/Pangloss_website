<?php
$baseUrl = Yii::app()->baseUrl;

$this->layout = "eastling";

$js = Yii::app()->getClientScript();

$js->registerScriptFile($baseUrl . "/custom-js/commonfunctions.js", CClientScript::POS_END);
$js->registerScriptFile($baseUrl . "/eastling-js/jquery.maphilight.js", CClientScript::POS_END);
$js->registerScriptFile($baseUrl . "/eastling-js/eastlingplayer.js", CClientScript::POS_END);
$js->registerScriptFile($baseUrl . "/eastling-js/eastlingShape.js", CClientScript::POS_END);
$js->registerScriptFile($baseUrl . "/eastling-js/html5PlayerManager_md.js");
//$js->registerScriptFile($baseUrl . "/eastling-js/divtotable.js", CClientScript::POS_END);
$js->registerScriptFile($baseUrl . "/eastling-js/word_highlight.js", CClientScript::POS_END);
$js->registerScriptFile($baseUrl . "/custom-js/editor.js", CClientScript::POS_END);

//$js->registerScriptFile("https://cdnjs.cloudflare.com/ajax/libs/wavesurfer.js/1.0.52/wavesurfer.min.js");


$js->registerCssFile($baseUrl . "/css/LacitoStyle.css");

$this->pageTitle = Yii::app()->name;

?>

<!-- SIDEBAR CONTENU ANNOTATIONS -->

<div id="open-annotations" class="ui blue left attached icon button" style="position:fixed;top:70px;right:0px;font-size: 0.8em;z-index: 99;">
    <i class="ui icon browser"></i>
    Annotations 
</div>
<div id="annotations" class="ui right labeled sidebar very wide blue vertical menu" style="z-index:999;">
    <div class="header item"><translate>Phrases</translate></div>
    <div id="annotations-sentences" style="font-size:0.8rem;">  

    </div>

</div>


<!-- BARRE FIXE POUR LA COMPOSITION-->
<div id="audio-compo" class="ui form" style="overflow-y: scroll;position: fixed;z-index: 998;bottom:0px; margin-top: 20px;border: none;width: 100%;background-color: rgba(255, 255, 255, 1);">

    <div id="waveform"></div>
    <div id="waveform-timeline"></div>

    <input id="slider" type="range" min="1" max="200" value="1" style="width: 100%" />

    <input id="startPosition" type="hidden" name="startPosition" value="" size='3'/>
    <input id="endPosition" type="hidden" name="endPosition" value="" size='3' />

<!--
    <div id="player-controls" class="controls ui form inverted">

        <button class="ui icon small labeled button blue" data-action="rewind">
            <i class="icon fast backward"></i><translate>Revenir au début</translate>
        </button>

        <button class="ui icon small labeled button blue" data-action="play">
            <i class="icon play"></i><translate>Lire depuis le curseur</translate>
        </button>

        <button class="ui icon small labeled button blue" data-action="playSelOnce">
            <i class="icon step forward"></i><translate>Lire la sélection</translate>
        </button>

        <button class="ui icon small labeled button blue" data-action="toggleScroll">
            <i class="icon zoom in"></i><translate>Zoomer</translate>
        </button>

        <div class="inline fields" style="display: inline-block;margin-bottom: 0px;vertical-align: bottom;">
            <div class="inline field" style="margin-bottom: 0px;">
                <label><translate>Début</translate></label>
                <input id="startPosition" type="Text" name="startPosition" value="" size='3'/>
            </div>
            <div class="inline field" style="margin-bottom: 0px;">
                <label><translate>Fin</translate></label>
                <input id="endPosition" type="Text" name="endPosition" value="" size='3' />
            </div> 
            <div class="field" style="margin-bottom: 0px;">
                <input id="x1" type="hidden" name="x1" value=""/>
                <input id="y1" type="hidden" name="y1" value=""/>
                <input id="x2" type="hidden" name="x2" value=""/>
                <input id="y2" type="hidden" name="y2" value=""/>
                <input id="w" type="hidden" name="w" value=""/>
                <input id="h" type="hidden" name="h" value=""/>
            </div>
        </div>
    </div>
-->
    <div id="newselection" class="ui grid form inverted aligned middle" style="background-color: #000;margin:0;">

        <div class="column aligned left">
            <div class="field">
                <div class="ui radio checkbox field">
                    <input id="mot" type="radio" name="motphrase" checked="">
                    <label for="mot"><translate>Mot</translate></label>
                </div>
            </div>
            <div class="field">
                <div class="ui radio checkbox field">
                    <input id="phrase" type="radio" name="motphrase">
                    <label for="phrase"><translate>Phrase</translate></label>
                </div>
            </div> 
        </div>

        <div class="seven wide column">

            <div class="inline fields">
                <div class="inline fields">
                    <div class="field">
                        <label>Transcription</label>
                        <input id="transcription_1" class="transcription" type="text" name="transcription_1" size="50"/>

                    </div>
                    <div class="field">
                        <!--<input style="width:5em;" id="transcription_1_langue" class="transcription-langue" placeholder="Langue" type="text" name="transcription_1_langue" maxlength="10" size="5" value="phono"/>
                        -->
                        <!-- CORRECTION REVUE LACITO 08/01/2015 : liste déroulante à 4 choix : ortho, transliter, phone, phono -->
                        <div id="select_transcription" class="ui selection dropdown">
                            <!--<input type="hidden" id="transcription_1_langue" class="transcription-langue" name="transcription_1_langue">
                            -->
                            <div class="default text">Transcription</div>
                            <i class="dropdown icon"></i>
                            <div class="menu transcription-langue">
                                <div class="item" data-value="ortho"><translate>Orthographique</translate></div>
                                <div class="item" data-value="transliter"><translate>Translittérée</translate></div>
                                <div class="item" data-value="phone"><translate>Phonétique</translate></div>
                                <div class="item active" data-value="phono"><translate>Phonologique</translate></div>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui button icon mini btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                        <div class="ui button icon mini btn-remove" type="button"><i class="ui icon minus red"></i></div>
                    </div>

                </div>

            </div>
        </div>

        <div class="six wide column">
            <div class="inline fields">
                <div class="field">
                    <label><translate>Traduction</translate></label>
                    <input id="traduction_1" class="traduction" type="text" name="traduction_1" size="50"/>

                </div>
                <div class="field">
                    <input style="width:5em;" id="traduction_1_langue" class="traduction-langue" placeholder="Langue" type="text" name="traduction_1_langue" maxlength="3" size="2" value="fra"/>
                </div>
                <div class="field">
                    <div class="ui button icon mini btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                    <div class="ui button icon mini btn-remove" type="button"><i class="ui icon minus red"></i></div>
                </div>

            </div>
        </div>

        <div class="column aligned left">
            <button id="creer-selection" class="ui small labeled green button icon" type="button"><i class="ui icon plus"></i><translate>Ajouter la sélection</translate></button>
        </div>
    </div>

</div>

<!-- PAGE CENTRALE -->
<div class="ui page">
  <div id="loading" class="ui dimmer">
    <div class="ui text loader"><translate>Chargement en cours</translate></div>
  </div>

<div class="main container"> 
    <!-- HEADER -->
    <div class="ui two column grid middle aligned"> 
        <div class="five wide column">
            <h2 class="ui header"  style="font-family: 'Open Sans';letter-spacing: -1px;font-weight: 500;">

                <img class="ui avatar image logo" src="<?php echo $baseUrl; ?>/images/logo/compass.svg" style="display: inline-block;">
                <translate class="logotype">test</translate>
            </h2> 
        </div>

        <div class="eleven wide column">
            <div class="ui message info"><translate>Document sélectionné</translate><div id="selected-doc" style="display: inline-block;"></div>
        </div>

    </div>

    <!--     
                         FORMULAIRE DE SAISIE     
    -->
        
    <form id="form-compo" class="ui form">

        <div id="map" style="/*height:200px;*/"></div>
    <!--
    <script>
      var map;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });
      }
    </script>
    
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCVbVNCq-evJyqUd3654QYNeC2AZaGNYvM&callback=initMap"></script>
    -->
        <!-- CHOIX DU DOCUMENT OU NOUVEAU DOCUMENT -->
        <fieldset id="fieldset-document">

            <legend><translate>Sélection du document</translate></legend>

            <div class="ui two column middle aligned relaxed grid basic segment">

                <div class="column">
                    <div class="ui header"><translate>Document existant</translate></div>
                    <div class="ui form">
                        <div class="field">
                            <label><translate>Sur quelle langue porte le document</translate> ?

                            </label>

                            <input type="hidden" id="user" name="user" value="<?php echo Yii::app()->user->id; ?>">

                            <div id="select_subject" class="ui selection dropdown">
                                <input type="hidden" id="langue-doc" name="langue-doc">
                                <div class="default text"><translate>Langue</translate></div>
                                <i class="dropdown icon"></i>
                                <div id="select-langue" class="menu">

                                </div>
                            </div>


                        </div>
                        <div class="field">
                            <label><translate>Sur quel document souhaitez-vous travailler</translate> ?</label> 

                            <table id="select-document" class="ui sortable table segment">
                                <thead>
                                    <tr><th><translate>Titre</translate></th>
                                        <th><translate>Date</translate></th>
                                        <th><translate>Action</translate></th>
                                    </tr></thead>
                                <tbody>

                                </tbody>
                                <tfoot>
                                    <!--
                                    <tr><th>3 People</th>
                                        <th>2 Approved</th>
                                        <th></th>
                                    </tr>
                                    -->
                                </tfoot>
                            </table> 
                        </div> 
                    </div>
                </div>
                <div class="ui vertical divider">
                    <translate>Ou</translate>
                </div>
                <div class="column">
                    <button id="btn-add-doc" class="medium teal ui labeled icon button" type="button">
                        <i class="file outline icon"></i>
                        <translate>Créer un nouveau document</translate>
                    </button>
                    <button id="btn-import-doc" class="medium teal ui labeled icon button" type="button">
                        <i class="upload disk icon"></i>
                        <translate>Importer un document</translate>
                    </button>
                </div>
            </div>
        </fieldset>


        <!-- RESSOURCES MULTIMEDIA DU DOCUMENT -->
        <fieldset id="fieldset-ressources">
            <legend><translate>Ressources du document</translate></legend>
            <div class="ui two column middle aligned relaxed grid basic segment">

                <div class="column">
                    <div class="ui form">
                        <div class="field">
                            <label><translate>Liste des ressources associées au document</translate>

                            </label>

                            <table id="select-ressources" class="ui sortable table segment">
                                <thead>
                                    <tr><th><translate>Fichier</translate></th>
                                        <th><translate>Type</translate></th>
                                        <th></th>
                                    </tr></thead>
                                <tbody>

                                </tbody>
                                <tfoot>
                                    <!--
                                    <tr><th>3 People</th>
                                        <th>2 Approved</th>
                                        <th></th>
                                    </tr>
                                    -->
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="columns sixteen">
                <button id="btn-add-crdo" class="medium teal ui labeled icon button" type="button">
                    <i class="attachment icon"></i>
                    <translate>Ajouter une ressource</translate>
                </button>
            </div>


        </fieldset>


        <!-- COMPOSITION -->
        <fieldset id="fieldset-compo">
            <legend>Annotations <translate>et</translate> <translate>Synchronisation</translate></legend>
            
            <div class="field">
               <div class="ui checkbox field" id="toggleSelections" name="toggleSelections">
                    <input type="checkbox">
                    <label><translate>Afficher/Cacher les sélections</translate></label>
                </div> 
            </div>
            
            <div id="images-compo">
                
                <div id="images-tab" class="ui pointing secondary menu">

                </div> 
            </div>
        </fieldset>
        
        <!-- PREVIEW -->
        <fieldset id="fieldset-preview">
            <legend><translate>Aperçu dans le lecteur</translate></legend>
            
            <div class="ui page grid">
               <div class="eastling"></div>
            </div>
            
            <div id="images-compo">
                
                <div id="images-tab" class="ui pointing secondary menu">

                </div> 
            </div>
        </fieldset>
    </form>

    <!-- Bloc de formulaire pour upload de fichier -->
    <div id="upload-wrapper" style="display: none;">

        <form id="upload" action="addCrdo" method="post" name="upload" enctype="multipart/form-data" target="upload-target">
            <input id="YII_CSRF_TOKEN" type="hidden" name="YII_CSRF_TOKEN" value="<?php echo Yii::app()->request->csrfToken; ?>"/>
            <input id="uploaded-document" type="hidden" name="uploaded-document" />
            <input id="uploaded-user" type="hidden" name="uploaded-user" />
            <input id="uploaded-type" type="hidden" name="uploaded-type" />


            <div class="ui two column middle aligned relaxed grid basic segment">
                <div class="column">
                    <div class="ui form">
                        <label>
                            <translate>Nom du fichier</translate> :
                        </label>
                        <div class="field">
                            <input id="uploaded-name" type="text" name="uploaded-name"/>
                        </div>

                        <div class="field">

                            <label for="uploaded-file" class="ui icon button">
                                <i class="file icon"></i>
                                <translate>Sélectionner le fichier</translate></label>

                                <input type="file" id="uploaded-file"  name="uploaded-file" style="display:none">
                                <div id="selected-file" class="ui message" style="display:none;"></div>

                        </div>

                        <button id="sent" type="submit" name="sent" class="small blue ui labeled icon button"><i class="upload icon"></i>Upload</button>

                    </div>
                </div>
            </div>
        </form>

        <iframe id="upload-target" name="upload-target" style="display: none; height: 10px; width: 10px;"></iframe>
    </div>
    <div id="loading2" style="background:url(<?php echo $baseUrl; ?>/images/icones/ajax-loader.gif) no-repeat left; height:50px; width:370px; display:none;">

        <p style="margin-left:40px; padding-top:15px;"><translate>Téléchargement en cours</translate></p>

    </div>

    <!-- Bloc de formulaire pour création nouveau document -->
    <div id="newdoc" class="ui form" style="display: none;">

        <input id="YII_CSRF_TOKEN" type="hidden" name="YII_CSRF_TOKEN" value="<?php echo Yii::app()->request->csrfToken; ?>"/>

        <div class="inline fields">
            <div class="field">
                <label><translate>Titre</translate></label>
                <input id="title_1" class="doc-title" type="text" name="title_1"/>

            </div>
            <div class="field">
                <input id="title_1_langue" class="doc-title-langue autocomplete isolangue" actarget="title_1_langue" acin="Id" placeholder="Langue du titre" type="text" name="title_1_langue" maxlength="3" size="2" value="fra"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">
            <div class="field">
                <label><translate>Objet d'étude</translate><br>(ISO 639-3)</label>
                <input id="codelangue_1" class="codelangue autocomplete isolangue" actarget="subject_1" acin="Id" type="text" name="codelangue_1" maxlength="3" size="3"/> 
            </div>
            <div class="field">
                <input id="subject_1" class="subject autocomplete isolangue" actarget="codelangue_1" acin="Print_Name" type="text" name="subject_1"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>


        <!-- REVUE LACITO 08/01/15 : Langues parlées dans l'enregistrement -->
        <div class="inline fields">
            <div class="field">
                <label><translate>Langue</translate><br>(ISO 639-3)</label>
                <input id="codelanguerec_1" class="codelanguerec autocomplete isolangue" actarget="languerec_1" acin="Id" type="text" name="codelanguerec_1" maxlength="3" size="2"/>
            </div>
            <div class="field">
                <input id="languerec_1" class="languerec autocomplete isolangue" actarget="codelanguerec_1" acin="Print_Name" type="text" name="languerec_1"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>
        <!-- -->
<div class="inline fields">
        <div class="field">

            <label for="codepays"><translate>Pays</translate><br>(ISO 3166-1 alpha-2)</label>
            <input id="codepays" class="autocomplete isopays" actarget="pays" acin="Code" type="text" name="codepays" maxlength="2" size="2"/>

        </div>
        <div class="field">
            <input id="pays" class="autocomplete isopays" actarget="codepays" acin="Name" type="text" name="pays"/>
        </div>
</div>
        <div class="field">
            <label for="spatial_1"><translate>Lieu</translate></label>
            <input id="spatial_1" type="text" name="spatial_1"/>
            <div class="ui action input">
                <input id="spatial_lat" type="text" name="spatial_lat"/>
                <div class="ui tiny button">Latitude</div>
            </div>

            <div class="ui action input">
                <input id="spatial_long" type="text" name="spatial_long"/>
                <div class="ui tiny button">Longitude</div>
            </div>
        </div>
        
        

        <div class="inline fields">
            <div class="field">
                <label><translate>Dépositaire</translate></label>
                <input class="depositor" id="depositor_1" type="text" name="depositor_1" value="Ferlus, Michel"/>
            </div>

            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">
            <div class="field">
                <label><translate>Chercheur</translate></label>
                <input class="researcher" id="researcher_1" type="text" name="researcher_1" value="Ferlus, Michel"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">
            <div class="field">
                <label><translate>Locuteur</translate></label>
                <input class="speaker" id="speaker_1" type="text" name="speaker_1" value=""/>

            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">
            <div class="field">
                <label><translate>Enregistreur</translate></label>
                <input class="recorder" id="recorder_1" type="text" name="recorder_1" value="Ferlus, Michel"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">
            <div class="field">
                <label>Interviewer</label>
                <input class="interviewer" id="interviewer_1" type="text" name="interviewer_1" value="Ferlus, Michel"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">
            <div class="field">
                <label>Sponsor</label>
                <input class="sponsor" id="sponsor_1" type="text" name="sponsor_1" value="Centre national de la recherche scientifique"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">
            <div class="field">
                <label>Publication</label>
                <input class="publisher" id="publisher_1" type="text" name="publisher_1" value="Laboratoire de langues et civilisations à tradition orale"/>
            </div>
            <div class="field">
                <div class="ui button icon tiny btn-add-input-line" type="button"><i class="ui icon plus green"></i></div>
                <div class="ui button icon tiny btn-remove" type="button"><i class="ui icon minus red"></i></div>
            </div>

        </div>

        <div class="inline fields">

            <div class="field">
                <label><translate>Identifiant du document</translate></label>
                <p id="identifier-doc"></p>.xml
<!--                <input id="identifier-user" type="text" name="identifier-user"/>.xml-->
            </div>

        </div>
<!--<select id="doc-title-language-1" class="doc-title-language"></select>--><!-- code pays ISO3166. Exemple: VN -->

        <input id="format" type="hidden" name="format" value="text/xml"/>
        <input id="type" type="hidden" name="type" value="Text"/>
        <input id="ispartof" type="hidden" name="ispartof" value="crdo-COLLECTION_LACITO"/>
        <input id="collection" type="hidden" name="collection" value="Lacito"/>
        <input id="available" type="hidden" name="available" value=""/>
        <input id="accessrights" type="hidden" name="accessrights" value="Freely available for non-commercial use"/>
        <!--<input id="license" type="hidden" name="license" value="http://creativecommons.org/licenses/by-nc/2.5/"/>-->
        <input id="license" type="hidden" name="license" value="CC-BY-SA"/>
        <input id="rights" type="hidden" name="rights" value="Copyright (c) Ferlus, Michel"/>
        <div class="field">
            <button id="creer-doc" class="small green ui labeled icon button" type="button">
                <i class="file outline icon"></i><translate>Créer</translate>
            </button>
        </div>

    </div>    

    <!-- Bloc de formulaire pour importation document existant -->
    <div id="import-form" style="display: none;">

        <form id="import" action="importDoc" method="post" name="import" enctype="multipart/form-data" target="import-target">
            <input id="YII_CSRF_TOKEN" type="hidden" name="YII_CSRF_TOKEN" value="<?php echo Yii::app()->request->csrfToken; ?>"/>
            <input id="import-user" type="hidden" name="import-user" />


            <div class="ui two column middle aligned relaxed grid basic segment">
                <div class="column">
                    <div class="ui form">

                        <div class="field">
                            <label for="imported-file" class="ui icon button">
                                <i class="file icon"></i>
                                <translate>Sélectionner le fichier</translate></label>

                            <div class="ui segment">
                                <input type="file" id="imported-file"  name="imported-file" style="display:none">
                                <div id="selected-imported-file" class="ui message"></div>
                            </div>
                        </div>

                        <button id="import-sent" type="submit" name="import-sent" class="small blue ui labeled icon button"><i class="upload icon"></i>Upload</button>

                    </div>
                </div>
            </div>
        </form>

        <iframe id="import-target" name="import-target" style="/*display: none; height: 10px; width: 10px;*/"></iframe>
    </div>
    
    <div class="ui basic modal">

        <i class="close icon"></i>
        <div class="header">
            <translate>Supprimer</translate>
        </div>
        <div class="content">
            <div class="left">
                <i class="icon warning"></i>
            </div>
            <div class="right">
                <translate>Supprimer</translate> ?
                <div id="file-to-delete"></div>
            </div>
        </div>
        <div class="actions">
            <div class="two fluid ui buttons">
                <div class="ui negative labeled icon button">
                    <i class="remove icon"></i>
                    <translate>Non</translate>
                </div>
                <div class="ui positive right labeled icon button">
                    <translate>Oui</translate>
                    <i class="checkmark icon"></i>
                </div>
            </div>
        </div>
    </div>


</div>

</div>