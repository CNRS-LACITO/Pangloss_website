<?php
class MPhpMessageSource extends CPhpMessageSource
{
    public function init()
    {
        parent::init();
    }
 
    public function loadMessages( $category="general", $language )
    {
        return parent::loadMessages( $category, $language );
    }
}

?>