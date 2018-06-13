<!-- Bloc de formulaire pour upload de fichier -->
    <div id="upload-wrapper" style="display: none;">

        <form id="upload" action="addResource" method="post" name="upload" enctype="multipart/form-data" target="upload-target">
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

                        <button id="sent" type="submit" name="sent" class="small green ui labeled icon button"><i class="upload icon"></i>Upload</button>

                    </div>
                </div>
            </div>
        </form>

        <iframe id="upload-target" name="upload-target" style="display: none; height: 10px; width: 10px;"></iframe>
    </div>
    <div id="loading2" style="background:url(<?php echo $baseUrl; ?>/images/icones/ajax-loader.gif) no-repeat left; height:50px; width:370px; display:none;">

        <p style="margin-left:40px; padding-top:15px;"><translate>Téléchargement en cours</translate></p>

    </div>