    <!-- Bloc de formulaire pour importation document existant -->
    <div id="import-form" style="display: none;">

        <form id="import" action="importDoc" method="post" name="import" enctype="multipart/form-data" target="import-target">
            <input id="YII_CSRF_TOKEN" type="hidden" name="YII_CSRF_TOKEN" value="<?php echo Yii::app()->request->csrfToken; ?>"/>
            <input id="import-user" type="hidden" name="import-user"/>
            <input id="import-iddoc" type="hidden" name="import-iddoc"/>


            <div class="ui column middle aligned center relaxed grid basic segment">
                <div class="fourteen wide column">
                    <div class="ui warning message">
                            <div class="header"><translate>Attention</translate></div>
                            <translate>Les annotations ci-dessous seront écrasées par celles du fichier téléchargé</translate>
                        </div>
                    <div class="ui form">
                        <!-- fichier de METADATA 
                        <div class="field">
                            <label for="meta-file" class="ui icon button">
                                <i class="file icon"></i>
                                <translate>Sélectionner le fichier de métadonnées</translate></label>

                            <div class="ui segment">
                                <input type="file" id="meta-file"  name="meta-file" style="display:none">
                                <div id="selected-meta-file" class="ui message"></div>
                            </div>
                        </div>
-->
                        <!-- fichier d'ANNOTATIONS -->

                        <div class="field">
                            <label for="annotation-file" class="ui icon button">
                                <i class="file icon"></i>
                                <translate>Sélectionner le fichier d'annotation</translate></label>

                            <div class="ui segment">
                                <input type="file" id="annotation-file"  name="annotation-file" style="display:none">
                                <div id="selected-annotation-file" class="ui message"></div>
                            </div>
                        </div>

                        <button id="import-sent" type="submit" name="import-sent" class="small green ui labeled icon button"><i class="upload icon"></i>Upload</button>

                    </div>
                </div>
            </div>
        </form>

        <iframe id="import-target" name="import-target" style="display: none; height: 10px; width: 10px;/"></iframe>
    </div>