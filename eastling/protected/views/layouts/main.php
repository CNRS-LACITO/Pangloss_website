<?php
/* @var $this Controller */
$baseUrl = Yii::app()->baseUrl;

$js = Yii::app()->getClientScript();
?>

<!DOCTYPE html>
<!-- saved from url=(0029)/ -->
<html style="margin-top: 0 !important" lang="<?php
if (Yii::app()->language == "fr")
    echo 'fr_FR';
else
    echo 'en_US';
?>" class="csstransforms csstransforms3d csstransitions"><!--<![endif]-->

    <head>

        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <!-- Mobile Specific Metas
          ================================================== -->
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <!--
        
        <link href='http://fonts.googleapis.com/css?family=Roboto:400,900,300,700,500' rel='stylesheet' type='text/css'>
        -->
        <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800' rel='stylesheet' type='text/css'>
 <!--       
        <link href='http://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>

        <link rel="stylesheet" id="font-css" href="<?php //echo $baseUrl; ?>/css/fonts.css" type="text/css" media="all">
        -->
        <link rel="EditURI" type="application/rsd+xml" title="RSD" href="/xmlrpc.php?rsd"> 
        <?php

        $js->registerScriptFile($baseUrl . '/custom-js/jquery-1.11.0.js', CClientScript::POS_HEAD);

        //$js->registerScriptFile($baseUrl . '/css/semantic/packaged/javascript/semantic.min.js', CClientScript::POS_HEAD);
         //$js->registerCssFile($baseUrl . '/css/semantic/packaged/css/semantic.min.css');

        $js->registerScriptFile('http://maps.googleapis.com/maps/api/js?libraries=places&amp;sensor=false&key='.$googleApiKey);

        $js->registerScriptFile($baseUrl . '/dist/eastling.min.js');
        $js->registerCssFile($baseUrl . '/dist/eastling.min.css');
        /*

        $js->registerScriptFile($baseUrl . '/custom-js/jquery-1.11.0.js');
        $js->registerScriptFile($baseUrl . '/custom-js/underscore-min.js');
        
        $js->registerCssFile($baseUrl . '/custom-js/jquery-ui-1.10.3.custom/css/ui-lightness/jquery-ui-1.10.3.custom.min.css');
        $js->registerScriptFile($baseUrl . '/custom-js/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom.min.js');
        
        $js->registerScriptFile($baseUrl . '/custom-js/FormToWizard/formToWizard.js');

       
        //PLUGINS AUDIO
        $js->registerScriptFile($baseUrl . '/custom-js/audiostream/wavesurfer.js');
        
        $js->registerScriptFile($baseUrl . '/custom-js/audiostream/webaudio.js');
        $js->registerScriptFile($baseUrl . '/custom-js/audiostream/webaudio.buffer.js');
        $js->registerScriptFile($baseUrl . '/custom-js/audiostream/webaudio.media.js');
        
        $js->registerScriptFile($baseUrl . '/custom-js/audiostream/audioelement.js');
        
        
        $js->registerScriptFile($baseUrl . '/custom-js/audiostream/drawer.js');
        $js->registerScriptFile($baseUrl . '/custom-js/audiostream/drawer.canvas.js');
        
        //$js->registerScriptFile($baseUrl . '/custom-js/audiostream/main.js');

        $js->registerScriptFile($baseUrl . '/custom-js/jquery.imgareaselect/js/jquery.imgareaselect.multiple.js');
        $js->registerCssFile($baseUrl . '/custom-js/jquery.imgareaselect/css/imgareaselect-default.css');
        
        ///////////////

        $js->registerCssFile($baseUrl . '/custom-js/jquery.imgareaselect/css/imgareaselect-default.css');
        $js->registerCssFile($baseUrl . '/custom-js/FormToWizard/formToWizard.css');

        $js->registerCssFile($baseUrl . '/css/semantic/packaged/css/semantic.css');
        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/collections/grid.css');
        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/elements/step.css');


        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/search.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/search.js');

        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/dropdown.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/dropdown.js');

        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/checkbox.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/checkbox.js');

        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/dimmer.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/dimmer.js');

        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/modal.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/modal.js');
        
        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/accordion.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/accordion.js');
        
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/jquery.address.js');
        
        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/tab.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/tab.js');
        
        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/sidebar.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/sidebar.js');

        $js->registerCssFile($baseUrl . '/css/semantic/uncompressed/modules/popup.css');
        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/popup.js');
        
        $js->registerScriptFile($baseUrl . '/custom-js/jquery-tablesort.js');

        $js->registerScriptFile($baseUrl . '/css/semantic/uncompressed/modules/behavior/form.js');
*/


        //Yii::app()->bootstrap->register(); 
        ?>
        <title><?php echo CHtml::encode($this->pageTitle); ?></title>
        <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl . '/images/logo/logo_navbar.png'; ?>">


        <style>
            body{
                font-family: "Open Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
                background-color: #eee;
            }

            .container{
                width: 1100px;
                margin: 0px auto;
            }            

        </style>


<!--
        <link rel="stylesheet" id="options-google-fonts" href="//fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700,900,200italic,300italic,400italic,600italic,700italic,900italic%7COswald:300,400,700&amp;v=1396109008" type="text/css" media="all">
        <link href='http://fonts.googleapis.com/css?family=Dosis:200,300,400,500,600,700,800' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Raleway:400,300,700,900,800,200,100' rel='stylesheet' type='text/css'>

        -->
    </head>



    <body>
<div id="mainmenu" class="ui sidebar vertical menu">
    <div class="item header">
     <img class="ui avatar image" src="<?php echo $baseUrl; ?>/images/logo/logo-east.png" style="display: inline-block;"> EAST Ling
  </div>
    
    
    <a class="active teal item" href="<?php echo $this->createUrl('eastling/editor'); ?>">
    <i class="text outline file icon"></i> Annotation & Synchronisation
  </a>
  <a class="item teal" href="mailto:matthewdeo@gmail.com">
    <i class="mail icon"></i> Contact
  </a>

    <a class="ui item"  href="<?php echo $this->createUrl('site/logout'); ?>">
        <i class="sign out icon"></i> Déconnexion (<?php echo Yii::app()->user->name; ?>)
    </a>
    
    <a class="ui item toggle-menu">
      <i class="left arrow icon"></i> Cacher le menu
    </a>

</div>
<div class="ui icon black right attached button toggle-menu" style="position:fixed;z-index:9999;top:70px;">

<i class="ui icon list layout"></i>
</div>
<?php echo $content; ?>	

        <div class="clear"></div>

        <footer class="ui page container blue">


        </footer><!-- footer -->

    </body>
    <script>
        $(document).ready(function(){
            $('#mainmenu')
            .sidebar({
            exclusive:false})
                .sidebar('attach events', '.toggle-menu', 'toggle')
        .sidebar('hide')
                ;
        });
        
        
    </script>
</html>
