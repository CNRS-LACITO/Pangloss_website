<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of LanguageSelector
 *
 * @author L.O.K
 */
class LanguageSelector extends CWidget
{
    public function run()
    {
        $currentLang = Yii::app()->language;
        $languages = Yii::app()->params->languages;
        $html='';
        $this->render('languageSelector', array('currentLang' => $currentLang, 'languages'=>$languages));

    }
}

?>
