<?php
/* @var $this Controller */
$baseUrl = Yii::app()->baseUrl;

$js = Yii::app()->getClientScript();
$googleApiKey = 'AIzaSyCB75Tq5HWm0gVAg-PzU-GUgyXfWELMd6g';
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

        <link href='http://fonts.googleapis.com/css?family=Open+Sans:100,200,400,300,600,700,800' rel='stylesheet' type='text/css'>

        <link rel="EditURI" type="application/rsd+xml" title="RSD" href="/xmlrpc.php?rsd"> 

        <?php
        $js->registerScriptFile($baseUrl . '/dist/jquery-1.11.0.js', CClientScript::POS_HEAD);

        $js->registerScriptFile('http://maps.googleapis.com/maps/api/js?libraries=places&amp;sensor=false&key='.$googleApiKey);


        $js->registerScriptFile($baseUrl . '/dist/eastling.min.js', CClientScript::POS_END);
        $js->registerCssFile($baseUrl . '/dist/eastling.min.css');

        
        //Yii::app()->bootstrap->register(); 
        ?>
        <title><?php echo CHtml::encode($this->pageTitle); ?></title>
        <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl . '/images/logo/logo_navbar.png'; ?>">


        <style>
            body{
                font-family: "Open Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
                font-weight: 100;
                background-color: #eee;
            }

            .container{
                width: 1100px;
                margin: 0px auto;
            }            

        </style>

    </head>


<script>

var list_messages =<?php 
echo CJSON::encode(Yii::app()->messages->loadMessages("general",Yii::app()->language));
?>;
  

    var token = "<?php echo Yii::app()->request->csrfToken; ?>";
    var baseUrl = "<?php echo $baseUrl; ?>";
    
    //____________________________________________________________________________________
//____________________________________________________________________________________
    // FONCTION POUR MESSAGES MULTILANGUES           
    function messages(msg) {
        if(typeof list_messages[msg]==="undefined"){
           return msg; 
        }else{
           return list_messages[msg]; 
        }
    }

    $(document).ready(function(){
        $('translate').each(function(){
            $(this).html(messages($(this).html()));
        });
    }); 
    
    
</script>
    
    <body>
        
        <?php include('menu.php'); ?>

<div class="ui icon black right attached button toggle-menu" style="position:fixed;z-index:9999;top:70px;">

<i class="ui icon list layout"></i>
</div>
        <i id="notification" style="pointer-events: none;"></i>

    <?php echo $content; ?>	

        <div class="clear"></div>

        <footer class="ui page container blue">


        </footer><!-- footer -->

    </body>

</html>
