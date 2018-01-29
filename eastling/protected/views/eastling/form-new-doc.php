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
                <div class="ui tiny button">Latitude/North</div>
            </div>

            <div class="ui action input">
                <input id="spatial_long" type="text" name="spatial_long"/>
                <div class="ui tiny button">Longitude/East</div>
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