<!-- BARRE FIXE POUR LA COMPOSITION-->
<div id="audio-compo" class="ui form" style="overflow-y: scroll;position: fixed;z-index: 998;bottom:0px; margin-top: 20px;border: none;width: 100%;background-color: #eee;">

    <div id="waveform"></div>

    <div id="waveform-timeline"></div>

        <div id="player-controls" class="controls ui form inverted" style="display: inline-block;">


        <button class="ui icon small button" data-action="play">
            <i class="icon play"></i>
        </button>

<!--
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
-->
    </div>
    <input id="slider" type="range" min="1" max="200" value="1" style="width: 92%" />

    <input id="startPosition" type="hidden" name="startPosition" value="" size='3'/>
    <input id="endPosition" type="hidden" name="endPosition" value="" size='3' />


    

    <div id="newselection" class="ui grid form aligned middle" style="background-color: transparent;margin:0;">

    <!--
        <div class="column aligned left">
            <div class="field">
                <div class="ui radio checkbox field">
                    <input id="mot" type="radio" name="motphrase">
                    <label for="mot"><translate>Mot</translate></label>
                </div>
            </div>
            <div class="field">
                <div class="ui radio checkbox field">
                    <input id="phrase" type="radio" name="motphrase" checked="">
                    <label for="phrase"><translate>Phrase</translate></label>
                </div>
            </div> 
        </div>
    -->
    <input id="phrase" type="radio" name="motphrase" checked="" style="display: none;">

        <div class="seven wide column">

            <div class="inline fields transcriptions">
                <div class="field">
                    <!--<label>Transcription</label>-->
                    <input placeholder="Transcription" id="transcription_1" class="transcription" type="text" name="transcription_1" size="40"/>

                </div>
                <div class="field">
                    <!--<input style="width:5em;" id="transcription_1_langue" class="transcription-langue" placeholder="Langue" type="text" name="transcription_1_langue" maxlength="10" size="5" value="phono"/>
                    -->
                    <!-- CORRECTION REVUE LACITO 08/01/2015 : liste déroulante à 4 choix : ortho, transliter, phone, phono -->
                    <div id="select_transcription" class="ui selection dropdown">
                        <!--<input type="hidden" id="transcription_1_langue" class="transcription-langue" name="transcription_1_langue">
                        -->
                        <div class="text">Transcription</div>
                        <i class="dropdown icon"></i>
                        <div class="menu transcription-langue">
                            <div class="item" data-value="ortho"><translate>Orthographique</translate></div>
                            <div class="item" data-value="transliter"><translate>Translittérée</translate></div>
                            <div class="item" data-value="phone"><translate>Phonétique</translate></div>
                            <div class="default item active" data-value="phono"><translate>Phonologique</translate></div>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <div class="ui button icon mini btn-add-input-line" type="button"><i class="ui icon plus blue"></i></div>
                    <div class="ui button icon mini remove" type="button"><i class="ui icon minus red"></i></div>
                </div>
            </div>
        </div>

        <div class="six wide column">
            <div class="inline fields traductions">
                <div class="field">
                    <!--<label><translate>Traduction</translate></label>-->
                    <input placeholder="Traduction" id="traduction_1" class="traduction" type="text" name="traduction_1" size="40"/>

                </div>
                <div class="field">
                    <input style="width:5em;" id="traduction_1_langue" class="traduction-langue" placeholder="Langue" type="text" name="traduction_1_langue" maxlength="3" size="2" value="fra"/>
                </div>
                <div class="field">
                    <div class="ui button icon mini btn-add-input-line" type="button"><i class="ui icon plus blue"></i></div>
                    <div class="ui button icon mini remove" type="button"><i class="ui icon minus red"></i></div>
                </div>

            </div>
        </div>

        <div class="column aligned left">
            <button id="creer-selection" class="ui mini labeled green button icon" type="button"><i class="ui icon plus"></i><translate>Ajouter la sélection</translate></button>
        </div>
    </div>

</div>