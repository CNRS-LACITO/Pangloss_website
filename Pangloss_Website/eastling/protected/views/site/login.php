<?php
$baseUrl = Yii::app()->baseUrl;

$this->layout = "eastling-mini";

$js = Yii::app()->getClientScript();


$this->pageTitle = Yii::app()->name . ' - Login';
$this->breadcrumbs = array(
    'Login',
);
?>
<div class="three column doubling ui grid aligned center login-page">

    <h2 class="ui header" style="font-family: 'Open Sans';letter-spacing: -1px;font-weight: 500;margin-top: 40px;">
        <translate class="logotype">eastling</translate>
        <i class="icon-plume" style="font-size: 4rem;"></i>
        <div class="sub header">Easy Annotation &amp; Synchronization Tools for Linguists</div>
    </h2>
    
    <div class="column middle aligned relaxed grid basic segment">

        <div class="column aligned center">

            <!--<h1><translate>Connexion</translate></h1>-->

            <p><translate>Veuillez vous connecter pour accéder à l'application</translate> :</p>

            <div class="ui form segment">

                <?php
                $form = $this->beginWidget('CActiveForm', array(
                    'id' => 'login-form',
                    'enableClientValidation' => true,
                    'clientOptions' => array(
                        'validateOnSubmit' => true,
                    ),
                ));
                ?>

                <div class="field">


                    <?php echo $form->labelEx($model, Yii::t('general','Utilisateur')); ?>
                    <div class="ui left labeled icon input">
                        <?php echo $form->textField($model, 'username', array("placeholder" => Yii::t('general','Utilisateur'))); ?>
                        <i class="user icon"></i>
                        <div class="ui corner label">
                            <i class="icon asterisk"></i>
                        </div>
                        <?php echo $form->error($model, 'username', array('class' => 'ui red message')); ?>
                    </div>
                </div>

                <div class="field">
                    <?php echo $form->labelEx($model, 'password'); ?>
                    <div class="ui left labeled icon input">
                        <?php echo $form->passwordField($model, 'password'); ?>
                        <i class="lock icon"></i>
                        <div class="ui corner label">
                            <i class="icon asterisk"></i>
                        </div>
                        <?php echo $form->error($model, 'password', array('class' => 'ui red message')); ?>
                    </div>
                </div>

                <div class="field">
                    <?php //echo CHtml::submitButton('Login'); ?>
                    <button class="ui blue submit button" type="submit">
                        <i class="icon sign in"></i><translate>Connexion</translate>
                    </button>
                </div>

                <?php $this->endWidget(); ?>
            </div><!-- form -->
            <div class="green ui labeled icon button disabled">
                <i class="signup icon"></i>
                <translate>Demandez un accès</translate>
            </div>
        </div>

    </div>
</div>