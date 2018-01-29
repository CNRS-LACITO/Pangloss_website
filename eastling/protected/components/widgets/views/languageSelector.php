<!--<div id="language-select"> -->
<?php 

        echo '<ul class="dropdown-menu" role="menu">';
        
        $languages_translated=array("fr","en","vn"); 
        
        foreach($languages as $key=>$lang) {
            /*echo CHtml::hiddenField(
                $key, 
                $this->getOwner()->createMultilanguageReturnUrl($key));
            */
            echo '<li>';
            
            if(in_array($key, $languages_translated)){  
                echo CHtml::link('<img src="'.Yii::app()->baseUrl.'/images/flags/'.$key.'.png" />', $this->getOwner()->createMultilanguageReturnUrl($key));    
            }else{
                echo CHtml::link('<img src="'.Yii::app()->baseUrl.'/images/flags/'.$key.'.png" />', '#',array('class' => 'inactive'));
            }
            
            echo '</li>'; 
            
           // echo '<li>'.CHtml::link($lang, $this->getOwner()->createMultilanguageReturnUrl($key));
  
        }
        echo '</ul>';

?>
