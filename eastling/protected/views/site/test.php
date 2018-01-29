<?php
    /* @var $this SiteController */

    $this->pageTitle = Yii::app()->name;
    $baseUrl = Yii::app()->baseUrl;
    $js = Yii::app()->getClientScript();
    $js->registerScriptFile($baseUrl . '/custom-js/moonlight.js');
    $js->registerScriptFile($baseUrl . '/custom-js/jquery-ui-1.10.3.custom.min.js');
    ?>
<header class="jumbotron subhead" id="overview" xmlns="http://www.w3.org/1999/html">
   <div class="container">
       <h1><?php echo CHtml::image($baseUrl . '/images/logo/logo.png'); ?>  moon<test style="font-weight: normal;">light</test></h1>
      <p class="lead">
          <?php 
          echo Yii::t('general', 'Un outil linguistique pour le taï don');
          ?>
      </p>
   </div>
</header>

<div class="container" id="page">
    <div class="span1" style="min-height: 0px;">
        <?php
        $this->beginWidget('bootstrap.widgets.TbAffix', 
                array('htmlOptions' => 
                    array('style' => 'bottom:300px;left:12px;')
                    )
                );

        echo TbHtml::tabbableTabs(array(
            array('label' => CHtml::image($baseUrl . '/images/icones/Keyamoon/Icons/PNG/32px/arrow-up3.png', Yii::t('general', 'Précédent')), 'id' => 'prev'),
            array('label' => CHtml::image($baseUrl . '/images/icones/Keyamoon/Icons/PNG/32px/arrow-down3.png', Yii::t('general', 'Suivant')), 'id' => 'next'),
                ), array('placement' => TbHtml::TABS_PLACEMENT_LEFT));

        $this->endWidget();
        ?>
    </div>

    <div class="span12">
        <script type="text/javascript">
            var idlist = Array();
            var timelist_starts = Array();
            var timelist_ends = Array();

                idlist.push("RECIPEs1");
                timelist_starts.push(824);
                timelist_ends.push(9009);

                idlist.push("RECIPEs2");
                timelist_starts.push(9051);
                timelist_ends.push(11096);

                idlist.push("RECIPEs3");
                timelist_starts.push(11096);
                timelist_ends.push(14544);

                idlist.push("RECIPEs4");
                timelist_starts.push(15963);
                timelist_ends.push(18785);

                idlist.push("RECIPEs5");
                timelist_starts.push(19551);
                timelist_ends.push(23337);

                idlist.push("RECIPEs6");
                timelist_starts.push(25135);
                timelist_ends.push(26774);

                idlist.push("RECIPEs7");
                timelist_starts.push(28158);
                timelist_ends.push(40372);

                idlist.push("RECIPEs8");
                timelist_starts.push(40412);
                timelist_ends.push(46557);

                idlist.push("RECIPEs9");
                timelist_starts.push(46557);
                timelist_ends.push(49015);

                idlist.push("RECIPEs10");
                timelist_starts.push(49015);
                timelist_ends.push(51595);

                idlist.push("RECIPEs11");
                timelist_starts.push(51513);
                timelist_ends.push(54472);

                idlist.push("RECIPEs12");
                timelist_starts.push(54229);
                timelist_ends.push(56581);
	</script>
        <audio controls="controls" id="player" name="player">
            <source src="<?php echo $baseUrl;?>/audio/chant nhat a table.wav" type="audio/x-wav">
			Your browser does not support the audio tag 
	</audio>
    <span style="margin-left:10px">Lecture en continu :</span>
    <input id="karaoke" name="karaoke" checked="checked" type="checkbox">
        <script type="text/javascript" src="<?php echo $baseUrl;?>/custom-js/audiostream/showhide.js">.</script>
    <script type="text/javascript" src="<?php echo $baseUrl;?>/custom-js/audiostream/evtPlayerManager.js">.</script>
    <script type="text/javascript" src="<?php echo $baseUrl;?>/custom-js/audiostream/html5PlayerManager.js">.</script>
        
    
    <table width="100%" border="0" cellpadding="5" cellspacing="0" bordercolor="#993300" class="it">
        <tbody>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S1</td>
            <td class="segmentContent" id="RECIPEs1" style="background-color: rgb(217, 217, 243);">
                <a href="javascript:boutonStop()">
                    <img src="./Ressource_files/stop.gif" alt="stop">
                </a> 
                
                <a href="javascript:playFrom('RECIPEs1')">
                    <img src="./Ressource_files/play.gif" alt="écouter">
                </a>
                
                <div class="word_sentence">
                    <div class="transcription_phono">
                        juʔwa kʰip-iki-lɔ kɔŋkʰa min-bi kʰo-lai kʰap-mu ʦʰo<br>
                    </div>
                </div>
                
                <br>
                    
                    <table class="word">
                        <tbody>
                            <tr>
                                <td class="word_form">
                                    juʔwa
                                </td>
                            </tr>
                            
                            <tr>
                                <td class="word_transl" valign="top">
                                    millet.paste
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <table class="word">
                        <tbody>
                            <tr>
                                <td class="word_form">
                                    kʰip-iki-lɔ
                                </td>
                            </tr>
                            
                            <tr>
                                <td class="word_transl" valign="top">
                                    cook-1PI/3SG.NPST-TEMP
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <table class="word"><tbody><tr><td class="word_form">kɔŋkʰa</td></tr><tr><td class="word_transl" valign="top">water</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">min-bi</td></tr><tr><td class="word_transl" valign="top">fire-LOC</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">kʰo-lai</td></tr><tr><td class="word_transl" valign="top">pot-(DAT)</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">kʰap-mu</td></tr><tr><td class="word_transl" valign="top">place.on.fire-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ʦʰo</td></tr><tr><td class="word_transl" valign="top">OBL</td></tr></tbody></table><br><br><div class="translation_en">When we cook  millet paste, we put water in a pot on the fire.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S2</td>
            <td class="segmentContent" id="RECIPEs2"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs2')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">mbika kɔŋkʰa dip-mu ʦʰo<br></div></div><br><table class="word"><tbody><tr><td class="word_form">mbika</td></tr><tr><td class="word_transl" valign="top">then</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">kɔŋkʰa</td></tr><tr><td class="word_transl" valign="top">water</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">dip-mu</td></tr><tr><td class="word_transl" valign="top">put.in-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ʦʰo</td></tr><tr><td class="word_transl" valign="top">OBL</td></tr></tbody></table><br><br><div class="translation_en">Then we put water in.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S3</td>
            <td class="segmentContent" id="RECIPEs3"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs3')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">mbika kɔŋkʰa buʔd-a-m-me doʔ-ka luʣɔm pʰul<br></div></div><br><table class="word"><tbody><tr><td class="word_form">mbika</td></tr><tr><td class="word_transl" valign="top">then</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">kɔŋkʰa</td></tr><tr><td class="word_transl" valign="top">water</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">buʔd-a-m-me</td></tr><tr><td class="word_transl" valign="top">boil-3SG.PST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">doʔ-ka</td></tr><tr><td class="word_transl" valign="top">up.above-ABL</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">luʣɔm</td></tr><tr><td class="word_transl" valign="top">millet</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">pʰul</td></tr><tr><td class="word_transl" valign="top">flour</td></tr></tbody></table><br><br><div class="translation_en">Then after the water has boiled, the millet flour, from above.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S4</td>
            <td class="segmentContent" id="RECIPEs4"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs4')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">doʔ-ka luʣɔm pʰul dip-mu-nɔ buʔd-a<br></div></div><br><table class="word"><tbody><tr><td class="word_form">doʔ-ka</td></tr><tr><td class="word_transl" valign="top">up.above-ABL</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">luʣɔm</td></tr><tr><td class="word_transl" valign="top">millet</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">pʰul</td></tr><tr><td class="word_transl" valign="top">flour</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">dip-mu-nɔ</td></tr><tr><td class="word_transl" valign="top">put.in-INF-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">buʔd-a</td></tr><tr><td class="word_transl" valign="top">boil-3SG.PST</td></tr></tbody></table><br><br><div class="translation_en">The millet flour is put in from above, and then it boils.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S5</td>
            <td class="segmentContent" id="RECIPEs5"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs5')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">buʔd-a-m-me luʣɔm pʰul dipʰi-ki-m-me dabilo-wa loʔ-mu ʦʰo<br></div></div><br><table class="word"><tbody><tr><td class="word_form">buʔd-a-m-me</td></tr><tr><td class="word_transl" valign="top">boil-3SG.PST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">luʣɔm</td></tr><tr><td class="word_transl" valign="top">millet</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">pʰul</td></tr><tr><td class="word_transl" valign="top">flour</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">dipʰi-ki-m-me</td></tr><tr><td class="word_transl" valign="top">put.in-1PI/3SG.NPST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">dabilo-wa</td></tr><tr><td class="word_transl" valign="top">spatula-INSTR</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">loʔ-mu</td></tr><tr><td class="word_transl" valign="top">stir-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ʦʰo</td></tr><tr><td class="word_transl" valign="top">OBL</td></tr></tbody></table><br><br><div class="translation_en">After it boils, after we put in the millet flour, we must stir it with a spatula.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S6</td>
            <td class="segmentContent" id="RECIPEs6"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs6')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">lukʦ-iki-m-lai loʔ-mu lukʦ-iki<br></div></div><br><table class="word"><tbody><tr><td class="word_form">lukʦ-iki-m-lai</td></tr><tr><td class="word_transl" valign="top">stir-1PI/3SG.NPST-NOM-(DAT)</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">loʔ-mu</td></tr><tr><td class="word_transl" valign="top">stir-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">lukʦ-iki</td></tr><tr><td class="word_transl" valign="top">stir-1PI/3SG.NPST</td></tr></tbody></table><br><br><div class="translation_en">To stir it, we stir it and stir it.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S7</td>
            <td class="segmentContent" id="RECIPEs7"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs7')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">lo loʔ-mu bi-mu ʦʰo lo-m-be-ki-m-me pʰul bhəneko flour pʰul minʦ-e-m-me tʰul-mu ʦʰo<br></div></div><br><table class="word"><tbody><tr><td class="word_form">lo</td></tr><tr><td class="word_transl" valign="top">[hesitation]</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">loʔ-mu</td></tr><tr><td class="word_transl" valign="top">stir-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">bi-mu</td></tr><tr><td class="word_transl" valign="top">give-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ʦʰo</td></tr><tr><td class="word_transl" valign="top">OBL</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">lo-m-be-ki-m-me</td></tr><tr><td class="word_transl" valign="top">stir-NOM-give-1PI/3SG.NPST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">pʰul</td></tr><tr><td class="word_transl" valign="top">flour</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">bhəneko</td></tr><tr><td class="word_transl" valign="top">(i.e.)</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">flour</td></tr><tr><td class="word_transl" valign="top">(flour)</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">pʰul</td></tr><tr><td class="word_transl" valign="top">flour</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">minʦ-e-m-me</td></tr><tr><td class="word_transl" valign="top">cook-3SG.NPST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">tʰul-mu</td></tr><tr><td class="word_transl" valign="top">mix-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ʦʰo</td></tr><tr><td class="word_transl" valign="top">OBL</td></tr></tbody></table><br><br><div class="translation_en">We must stir it, and then, after stirring the flour, (phul means flour), it cooks, and then we mix it.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S8</td>
            <td class="segmentContent" id="RECIPEs8"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs8')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">tʰul-mu-me tʰul-iki-m-me sen-mu ʦʰo ne minʦ-a minʦ-a<br></div></div><br><table class="word"><tbody><tr><td class="word_form">tʰul-mu-me</td></tr><tr><td class="word_transl" valign="top">mix-INF-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">tʰul-iki-m-me</td></tr><tr><td class="word_transl" valign="top">mix-1PI/3SG.NPST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">sen-mu</td></tr><tr><td class="word_transl" valign="top">look-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ʦʰo</td></tr><tr><td class="word_transl" valign="top">OBL</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ne</td></tr><tr><td class="word_transl" valign="top">TOP</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">minʦ-a</td></tr><tr><td class="word_transl" valign="top">cook-3SG.PST</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">minʦ-a</td></tr><tr><td class="word_transl" valign="top">cook-3SG.PST</td></tr></tbody></table><br><br><div class="translation_en">After mixing it, we must look, and it cooks.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S9</td>
            <td class="segmentContent" id="RECIPEs9"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs9')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">minʦ-a-m-me aʣi kʰal-mu<br></div></div><br><table class="word"><tbody><tr><td class="word_form">minʦ-a-m-me</td></tr><tr><td class="word_transl" valign="top">cook-3SG.PST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">aʣi</td></tr><tr><td class="word_transl" valign="top">later</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">kʰal-mu</td></tr><tr><td class="word_transl" valign="top">mix-INF</td></tr></tbody></table><br><br><div class="translation_en">After it cooks, we mix it.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S10</td>
            <td class="segmentContent" id="RECIPEs10"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs10')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">tʰul-mu kʰal-mu oko-ŋo<br></div></div><br><table class="word"><tbody><tr><td class="word_form">tʰul-mu</td></tr><tr><td class="word_transl" valign="top">mix-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">kʰal-mu</td></tr><tr><td class="word_transl" valign="top">mix-INF</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">oko-ŋo</td></tr><tr><td class="word_transl" valign="top">1.CL-INT</td></tr></tbody></table><br><br><div class="translation_en">The words thulmu and khalmu mean the same thing.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S11</td>
            <td class="segmentContent" id="RECIPEs11"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs11')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">kʰal-iki-m-me s minʦ-e<br></div></div><br><table class="word"><tbody><tr><td class="word_form">kʰal-iki-m-me</td></tr><tr><td class="word_transl" valign="top">mix-1PI/3SG.NPST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">s</td></tr><tr><td class="word_transl" valign="top">[hes]</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">minʦ-e</td></tr><tr><td class="word_transl" valign="top">cook-3SG.NPST</td></tr></tbody></table><br><br><div class="translation_en">After we mix it, it cooks.<br><br></div><div class="note_info"></div></td>
          </tr>
          <tr class="transcriptTable">
            <td class="segmentInfo" width="25">S12</td>
            <td class="segmentContent" id="RECIPEs12"><a href="javascript:boutonStop()"><img src="./Ressource_files/stop.gif" alt="stop"></a> <a href="javascript:playFrom('RECIPEs12')"><img src="./Ressource_files/play.gif" alt="écouter"></a><div class="word_sentence"><div class="transcription_phono">minʦ-e-m-me jaʔ-mu-nɔ ʣi-mu<br></div></div><br><table class="word"><tbody><tr><td class="word_form">minʦ-e-m-me</td></tr><tr><td class="word_transl" valign="top">cook-3SG.NPST-NOM-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">jaʔ-mu-nɔ</td></tr><tr><td class="word_transl" valign="top">scoop-INF-SEQ</td></tr></tbody></table><table class="word"><tbody><tr><td class="word_form">ʣi-mu</td></tr><tr><td class="word_transl" valign="top">eat-INF</td></tr></tbody></table><br><br><div class="translation_en">After it is cooked, we scoop it and eat it.<br><br></div><div class="note_info"></div></td>
          </tr>
        </tbody>
      </table>
    </div>
</div>
