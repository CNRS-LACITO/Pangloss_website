<div id="mainmenu" class="ui sidebar vertical menu">
    <div class="item header" style="font-family: 'Open Sans';letter-spacing: -1px;font-weight: 500;">
     <i class="icon-plume" style="font-size: 2rem;"></i>
  </div>
    
    
    <a class="active teal item" href="<?php echo $this->createUrl('eastling/editor'); ?>">
        <i class="text outline file icon"></i> Annotation & <translate>Synchronisation</translate>
  </a>

  <a class="item teal" href="https://docs.google.com/document/d/1lcZZwr2epeas2lqecs4CnDmI0wJ6UhO6apq3wBWAtMo/edit?usp=sharing" target="_blank">
    <i class="info circle icon"></i><translate>Guide utilisateur</translate>
  </a>

    <a class="ui item">
        
        <div class="ui dropdown" id="lang_user">
            <div class="text"><translate>Langue</translate></div>
  <i class="dropdown icon"></i>
  <div class="menu">
      <div class="item" data-value="en"><translate>English</translate></div>
      <div class="item" data-value="fr"><translate>Français</translate></div>
  </div>
</div>

    </a>

    <a class="item teal" href="mailto:matthewdeo@gmail.com">
    <i class="mail icon"></i> Contact
  </a>
    
    
    <a class="ui item"  href="<?php echo $this->createUrl('site/logout'); ?>">
        <i class="sign out icon"></i> <translate>Déconnexion</translate>(<?php echo Yii::app()->user->name; ?>)
    </a>
    
    <a class="ui item toggle-menu">
      <i class="left arrow icon"></i> <translate>Cacher le menu</translate>
    </a>

</div>