<form id="form-compo" class="ui form">

        <div id="map" style="/*height:200px;*/"></div>

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

                <div class="columns sixteen preview">
                    <button id="btn-refresh-preview" class="medium teal ui labeled icon button" type="button">
                        <i class="unhide icon"></i>
                        <translate>Actualiser</translate>
                    </button>
                </div>

               <div class="eastling"></div>
            </div>
            
            <div id="images-compo">
                
                <div id="images-tab" class="ui pointing secondary menu">

                </div> 
            </div>
        </fieldset>
    </form>