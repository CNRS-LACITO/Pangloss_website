
<?php
$baseUrl = Yii::app()->baseUrl;

$this->layout = "eastling";

$js = Yii::app()->getClientScript();


$this->pageTitle = Yii::app()->name;
?>


<!-- Bloc de formulaire pour upload de fichier -->
    <div id="upload-wrapper">

        <form id="upload" action="test" method="post" name="upload" enctype="multipart/form-data" target="upload-target">
            <input id="YII_CSRF_TOKEN" type="hidden" name="YII_CSRF_TOKEN" value="<?php echo Yii::app()->request->csrfToken; ?>"/>


            <div class="ui two column middle aligned relaxed grid basic segment">
                <div class="column">
                    <div class="ui form">

                        <label>
                            Type de fichier: 
                        </label>

                        <div class="grouped inline fields">
                            <div class="field">
                                <div class="ui radio checkbox">
                                    <input id="sound" type="radio" name="file-type" checked="">
                                    <label for="sound">Audio</label>
                                </div>
                            </div>
                            <div class="field">
                                <div class="ui radio checkbox">
                                    <input id="image" type="radio" name="file-type">
                                    <label for="image">Image</label>
                                </div>
                            </div>
                            <!--
                            <div class="field">
                                <div class="ui radio checkbox">
                                    <input id="pdf" type="radio" name="file-type">
                                    <label for="pdf">PDF</label>
                                </div>
                            </div>
                            -->
                        </div>

                        <label>
                            Nom du fichier:
                        </label>
                        <div class="field">
                            <input id="uploaded-name" type="text" name="uploaded-name"/>
                        </div>

                        <label>
                            Sélectionner le fichier:
                        </label>
                        <div class="field">
                            <!--
                            <input id="uploaded-file" type="file" name="uploaded-file" size="30" />
                            -->


                            <label for="uploaded-file" class="ui icon button">
                                <i class="file icon"></i>
                                Choisir un fichier</label>

                            <div class="ui segment">
                                <div id="loading" class="ui active dimmer"><div class="ui small text loader">Loading</div></div>

                                <input type="file" id="uploaded-file"  name="uploaded-file">
                                <div id="selected-file" class="ui message"></div>
                            </div>
                        </div>

                        <button id="sent" type="submit" name="sent" class="small blue ui labeled icon button"><i class="upload icon"></i>Upload</button>

                    </div>
                </div>
            </div>
        </form>

        <iframe id="upload-target" name="upload-target"></iframe>
    </div>
    