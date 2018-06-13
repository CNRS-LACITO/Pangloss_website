<?php
/* @var $this SiteController */

$this->pageTitle = Yii::app()->name;
$baseUrl = Yii::app()->baseUrl;
?>

<div id="intro" class="jumbotron" style="background-attachment: fixed !important;color:white;background:url(<?php echo $baseUrl; ?>/images/carousel/slide1.jpg) 0 0 repeat;background-size: cover;-webkit-background-size: cover;">
    <div class="container-fluid header-banner">

        <div class="title">
            <span class="moonlight-icon-logo"></span>
            <span style="font-weight: 800;">moon</span>
            <span style="font-weight: 200;">light</span>
        </div>


        <p>
            <?php echo Yii::t('general', 'Un outil linguistique pour le taï don'); ?>
            <br>
            <?php
            echo Yii::t('general', 'Support pédagogique');
            echo ' / ';
            echo Yii::t('general', 'Contenu multimédia');
            echo ' / ';
            echo Yii::t('general', 'Démarche participative');
            ?>
        </p>
        <div class="row">

            <div class="col-md-3">
                <a target="_blank" href="https://twitter.com/ProjetMoonlight">

                </a>
            </div>

            <div class="col-md-3">
                <a target="_blank" href="https://www.facebook.com/taydonx">

                </a>
            </div>

            <div class="col-md-3">
                <a target="_blank" href="http://m8nli9ht.wordpress.com/about/">

                </a>
            </div>

            <div class="col-md-3">
                <!--<a target="_blank" href="#">-->

                <!--</a>-->
            </div>


        </div>
    </div>
</div> <!-- end intro -->

<div class="container subnav">
    <ul class="nav nav-pills" data-spy="affix" data-offset-top="314" role="complementary">
        <li role="presentation"><a href="#projet"><?php echo Yii::t('general', 'Le projet'); ?></a></li>
        <li role="presentation"><a href="#acteurs"><?php echo Yii::t('general', 'Les acteurs'); ?></a></li>
        <li role="presentation"><a href="#locuteurs"><?php echo Yii::t('general', 'Les locuteurs'); ?></a></li>
        <li role="presentation"><a href="#contributeurs"><?php echo Yii::t('general', 'Les contributeurs'); ?></a></li>
        <li role="presentation"><a href="#contact"><?php echo Yii::t('general', 'Contact'); ?></a></li>
    
    </ul>
</div>
<div class="container paragraphe" id="projet">

    <div class="page-header">
        <h1>
            <?php echo Yii::t('general', 'Le projet'); ?>
        </h1>
    </div> <!-- end sixteen columns -->

    <div class="clear"></div>

    <p></p>

    <div class="row">
        <div class="col-md-4">
            <img alt="Endangered Language" class="practice-bg" src="<?php echo $baseUrl; ?>/images/icones/endangered-language.png">
        </div>
        <div class="col-md-8">
            <h3>
                <?php echo Yii::t("projet", "Le taï don: une langue menacée ?"); ?>
            </h3>
            <?php echo Yii::t("projet", "<p>Le terme taï don (taï blanc en français, thái trắng en vietnamien, 傣端/dǎiduān en chinois, white tai en anglais) désigne une minorité ethnique que l'on trouve principalement au nord-ouest du Vietnam et au sud de la Chine dans la province du Yunnan. 
								Il désigne également la langue propre à cette ethnie, qui compte un peu moins de <a href='http://www.ethnologue.com/language/TWH/***EDITION***' target='_blank'>500.000 locuteurs à travers le monde</a>.
							   </p><p>Selon <a href='http://www.unesco.org/culture/languages-atlas/index.php?hl=fr&page=atlasmap' target='_blank'>l'Atlas des langues en danger</a> 
							établi par l'UNESCO, 
						le taï blanc n'est pas répertorié comme une langue en danger.</p>
						<p>
						Cependant, on constate que de moins en moins de personnes sont capables de la lire ou l'écrire, 
						qu'il existe trop peu d'initiatives pédagogiques pour la transmettre dans les pays où les Taïs blancs vivent, 
						et que la documentation existante à son sujet demeure limitée, ancienne ou peu accessible.
						</p>");
            ?>
        </div> 
    </div> 

    <br>

    <div class="row">
        <div class="col-md-8">
            <h3>
                <?php echo Yii::t("projet", "Un site web dédié au taï don"); ?>
            </h3>
            <p>
                <?php
                echo "<p>" . Yii::t("projet", "Moonlight est un site internet multilangue qui regroupe un ensemble de connaissances linguistiques sur le taï blanc, propose des outils pédagogiques multimédias et offre aux utilisateurs la possibilité d'enrichir son contenu. Il a été construit à partir de 
             publications ethnolinguistiques, d'enquêtes de terrain auprès de locuteurs taï don
             et de documents manuscrits afin de proposer les éléments suivant:");
                ?>
            </p>
            <div style="display: inline-block;">
                <span class="label label-default" style="display: table-cell;vertical-align: middle;text-align: center;">
                    <i class='entypo open-book' style='font-size:3em;'></i>
                    <?php echo Yii::t("projet", "histoire / phonétique / écriture"); ?>
                </span>
            </div>

            <div style="display: inline-block;">
                <span class="label label-default" style="display: table-cell;vertical-align: middle;text-align: center;">
                    <i class='entypo book' style='font-size:3em;'></i>
                    <?php echo Yii::t("projet", "lexique"); ?>
                </span>
            </div>

            <div style="display: inline-block;">
                <span class="label label-default" style="display: table-cell;vertical-align: middle;text-align: center;">
                    <i class='entypo chat' style='font-size:3em;'></i>
                    <?php echo Yii::t("projet", "leçons thématiques / proverbes / chants"); ?>
                </span>
            </div>

            <div style="display: inline-block;">
                <span class="label label-default" style="display: table-cell;vertical-align: middle;text-align: center;">
                    <i class='entypo feather' style='font-size:3em;'></i>
                    <?php echo Yii::t("projet", "analyses de manuscrits"); ?>
                </span>
            </div>

            <div style="display: inline-block;">
                <span class="label label-default" style="display: table-cell;vertical-align: middle;text-align: center;">
                    <i class='entypo video' style='font-size:3em;'></i>
                    <?php echo Yii::t("projet", "contenu multimédia"); ?>
                </span>
            </div>    

        </div>
        <div class="col-md-4">
            <img alt="A website for Tai Don language" class="img-responsive" src="<?php echo $baseUrl; ?>/images/icones/moonlight_website.png">
        </div>  

    </div>

    <br>

    <div class="row">
        <div class="col-md-4">
            <img alt="Scalable and participative" class="img-responsive" src="<?php echo $baseUrl; ?>/images/icones/network.png">
        </div>

        <div class="col-md-8">
            <h3>
                <?php echo Yii::t("projet", "Evolutif & participatif"); ?>
            </h3>
            <?php echo Yii::t("projet", "<p>Initié en 2013, le projet s'articule autour d'une collaboration pluridisciplinaire 
                     et propose une démarche participative pour construire et faire évoluer 
                     le contenu du site web.</p>
                <p>
                    Ainsi, une collecte de fonds via la plateforme <a target='_blank' href='http://www.kisskissbankbank.com/fr/projects/moonlight'>KissKissBankBank</a> a permis de financer
                    une étude linguistique menée en pays taï en Septembre 2013 ayant pour objectifs de réaliser des enregistrements de locuteurs
                    et de récolter des ressources manuscrites afin d'enrichir le site.</p>
                <p>

                Par ailleurs, le contenu doit continuer d'évoluer grâce aux propositions des utilisateurs
                et par le biais de discussions entre eux autour de thématiques ouvertes (néologismes...)
                </p>"); ?>
        </div> 

    </div>
</div> <!-- end bg -->


<div class="jumbotron" style="background-attachment: fixed !important;color:white;background:url(<?php echo $baseUrl; ?>/images/carousel/slide0.jpg) 0 0 repeat;background-size: cover;-webkit-background-size: cover;">


    <blockquote><?php echo Yii::t("general", "Il y a des pays comme ça, 
        où les gens ont appris à faire flotter très haut d'invisibles drapeaux"); ?>

        <footer style="color:white !important;">
            Tai-Luc, <i>Invisibles drapeaux</i>
        </footer>
    </blockquote>
</div>


<div class="container paragraphe" id="acteurs" >
    <div class="container-fluid">
        <div class="page-header">
            <h1>
                <?php echo Yii::t('general', 'Les acteurs'); ?>

            </h1>
        </div> <!-- end sixteen columns -->

        <div class="row">


            <div class="col-md-4">
                <img alt="Matthew DEO" class="img-rounded img-responsive" src="<?php echo Yii::app()->request->baseUrl . '/images/photos/id_lok.jpg'; ?>">
                <blockquote>
                    <?php echo Yii::t("acteurs", "L'idée de ce projet sommeillait en moi depuis plusieurs années déjà devant un besoin naturel d'apprendre et de mieux connaître cette langue qui a bercé une partie de mon enfance.
                    Les rares documents que j'ai pu trouver étaient assez sommaires. Après plusieurs voyages effectués au Vietnam 
                    en pays taï, j'ai réalisé au contact des gens que le taï don se perdait peu à peu. 
                    Un constat qui m'a motivé à agir."); ?>
                    <footer>Matthew DEO,
                        <?php echo Yii::t("acteurs", "Ingénieur d'études et développement informatique à l'origine du projet. Métis franco-taï don. Plusieurs séjours en pays taï à son actif.");
                        ?>
                    </footer>

                    <a target="_blank" href="mailto:matthewdeo@gmail.com">
                        <img alt="Email icon" src="<?php echo Yii::app()->getBaseUrl(); ?>/custom-js/SCRN/icn-email-backgray.png">
                    </a>

                    <a target="_blank" href="https://www.linkedin.com/in/matthewdeo">
                        <img alt="LinkedIn icon" src="<?php echo Yii::app()->getBaseUrl(); ?>/custom-js/SCRN/icn-linkedin.png">
                    </a>

                </blockquote>




            </div> 
            <div class="col-md-4">
                <img alt="Michel FERLUS" class="img-rounded img-responsive" src="<?php echo Yii::app()->request->baseUrl . '/images/photos/id_ferlus.jpg'; ?>">

                <blockquote>
                    <?php echo Yii::t("acteurs", "Par profession je m'intéressais aux langues et aux écritures des taïs en général
                    et plus particulièrement à celles du groupe taï don,
                     dont les caractéristiques retiennent l'attention des spécialistes.
                      Il y a plus d'une dizaine d'années, j'ai pris conscience de la pauvreté de nos fonds
                       documentaires en manuscrits taï don.
                        J'ai pu alors effectuer quelques missions de recherche au Vietnam
                         où j'ai rencontré des personnalités taïes qui maintiennent vivante la culture de ce groupe.
                         Ainsi, je suis devenu un peu taï don."); ?>
                    <footer>Michel FERLUS, <?php echo Yii::t("acteurs", "Linguiste français spécialisé en phonologie historique des langues 
                                austro-asiatiques et taï-kadaï de l'Asie du Sud-Est.
                    Directeur de recherche <a target='_blank' href='http://www.cnrs.fr/' 
                    title='Centre National de la Recherche Scientifique'>CNRS</a> à la retraite 
                    (encore sollicité de nos jours pour des conférences à travers le monde),
                    membre associé au <a target='_blank' href='http://crlao.ehess.fr/' 
                    title='Centre de Recherches Linguistiques sur l’Asie Orientale'>CRLAO</a>.");
                    ?>

                    </footer>
                </blockquote>
            </div> 
            <div class="col-md-4">
                <img alt="Tai-Luc NGUYEN TAN" class="img-rounded img-responsive" src="<?php echo Yii::app()->request->baseUrl . '/images/photos/id_tl.jpg'; ?>">

                <blockquote>
                    <?php echo Yii::t("general", "Il y a des pays comme ça, 
        où les gens ont appris à faire flotter très haut d'invisibles drapeaux"); ?>
                    <footer>
                        Tai-Luc NGUYEN TAN, <?php echo Yii::t("acteurs", "Enseignant à la section de siamois de l'<a target='_blank' href='http://www.inalco.fr'  title='Institut National des Langues et Civilisations Orientales, Paris (FRANCE)' >INALCO</a>,
                    chargé du cours de diachronie et synchronie taï-kadaï. 
                    <!--Thèse de doctorat consacrée au Lü, et a également effectué des travaux universitaires sur le vietnamien,
                    le khmer et le lao,--> Auteur de 'Parlons Lü : La langue taï des Douze mille rizières du Yunnan' (Harmattan, 2008). Egalement connu comme auteur et interprète de nombreuses chansons inspirées
                    par le Mékong.");
                    ?>
                    </footer>
                </blockquote>
            </div> 

        </div>
    </div>

</div> <!-- end bg -->

<div class="container paragraphe" id="locuteurs">

    <div class="page-header">
        <h1>
            <?php echo Yii::t('general', 'Les locuteurs'); ?>
        </h1>
    </div> <!-- end sixteen columns -->


    <div class="well">
        <?php
        echo Yii::t("locuteurs", "En Septembre 2013, un séjour a été effectué au Vietnam pour mener une étude sur la langue taï don auprès de locuteurs natifs, 
                réaliser des prises de voix et analyser des documents écrits. 
                Ce travail a pu être mené à bien grâce à la collaboration de:");
        ?>
    </div>



    <div class="row">

        <div class="col-md-6">
            <blockquote>
                <img class="img-rounded img-responsive" src="<?php echo Yii::app()->request->baseUrl . '/images/photos/id_diec.jpg'; ?>">

                <footer>TEO Van Diec, 
                    <?php
                    echo Yii::t("locuteurs", "Taï Don de Muong So (province de Laï Chau/Vietnam), Diec enseigne la langue et l'écriture depuis 40 ans bénévolement. Dans ses efforts pour transmettre son savoir, il rencontre des difficultés à sensibiliser les jeunes de la région.");
                    ?>
                </footer>
            </blockquote>
        </div>

        <div class="col-md-6">
            <blockquote>
                <img class="img-rounded img-responsive" src="<?php echo Yii::app()->request->baseUrl . '/images/photos/id_nhat.jpg'; ?>">

                <footer>TRUONG Ten Nhat, <?php
                    echo Yii::t("locuteurs", "Locuteur Taï Don originaire de Muong Lay (province de Laï Chau/Vietnam), Nhat a une très bonne connaissance de l'écriture et de la tradition orale taï don (proverbes, chants, ...).");
                    ?>
                </footer>
            </blockquote>
        </div>


    </div> 




</div> <!-- end bg -->

<div class="container paragraphe" id="contributeurs">

    <div class="page-header">
        <h1>

            <?php echo Yii::t('general', 'Les contributeurs'); ?>

        </h1>
    </div>

    <div class="six columns">
        <img alt="Contributions" class="practice-bg" src="<?php echo $baseUrl; ?>/images/icones/puzzle2.png">
    </div>
    <!-- end sixteen columns -->
    <div class="ten columns">
        <p>
            <?php echo Yii::t("contributeurs", "Moonlight bénéficie du soutien et de l'aide de nombreuses autres 
                personnes sensibles à la préservation du taï blanc ou à celle du patrimoine culturel mondial de manière 
                plus générale.
                Aide financière, apport de compétences diverses, conseil, encouragements...autant de contributions 
                dont les auteurs méritent d'être mentionnés ici:"); ?>
        </p>
    </div>
    <div class="sixteen columns">

        <p>Mélanie BOUDIER, Thuyen HERMAN, Alexis MICHAUD (MICA Hanoi), François JACQUESSON (LACITO), 
            Monique LEON, Quyet LO VAN, An DEO VAN, Tung DEO VAN, Quoc Tin DIEU CHINH, Trong DEO VAN, Laurent HAZARD (INRA Toulouse), 
            Vincent & Axel DEO VAN, Minh NGUYEN, Phuc Huu TRAN, Julien CLASQUIN, Chrystel PROUPUECH, Daniel PERISSE (Maison de l'Occitanie), 
            KissBankers et donateurs: Thuyen & Arthur HERMAN, Hao CARPENTIER, Bang DEO VAN, Thieu DEO NANG, Phu BAC THI, Johanna GUNN, Cedric DEO VAN, Loïc DEO VAN, Trinh & Isabelle DEO VAN, 
            Eric STEFANUTTI, Maxime STEFANUTTI, Edwige DUBOS, Claire & Marc BOUDIER, Tan DOAN, Sébastien SOUNDIRARASSOU,
            Nina GRISOTTO, Marie-Hélène MOIREZ-CHARRON, Benjamin BENIFEI, Céline CEQUIEL, Silvere MONTIER, May YANG, Caroline MONESTIEZ, Cédric MARTI, Solène MORIZEAU,
            Gisèle PERINAUD, Magaly LACROIX, Liliane NIELSEN, Jean-Claude BRACONNIER, Olivier BERSOUX, Julie JOHNSON,
            Renaud PORCHER, Cynthia HERMAN, Solange DUBOR</p>


    </div> <!-- end container -->
</div>

<div id="contact" class="container paragraphe">

    <div class="page-header">
        <h1>
            <?php echo Yii::t('general', 'Contact'); ?>
        </h1>
    </div> <!-- end sixteen columns -->


    <div class="col-md-6">
        <div class="contact-form">

            <?php
            $model = new ContactForm;
            if (isset($_POST['ContactForm'])) {
                $model->attributes = $_POST['ContactForm'];
                if ($model->validate()) {
                    $name = '=?UTF-8?B?' . base64_encode($model->name) . '?=';
                    $subject = '=?UTF-8?B?' . base64_encode($model->subject) . '?=';
                    $headers = "From: $name <{$model->email}>\r\n" .
                            "Reply-To: {$model->email}\r\n" .
                            "MIME-Version: 1.0\r\n" .
                            "Content-type: text/plain; charset=UTF-8";

                    mail(Yii::app()->params['adminEmail'], $subject, $model->body, $headers);
                    Yii::app()->user->setFlash('contact', Yii::t('contact', 'Merci de nous avoir contacté. Nous vous répondrons dès que possible.'));
                    $this->refresh();
                }
            }

            if (Yii::app()->user->hasFlash('contact')):
                ?>

                <div class="flash-success">
                    <?php echo Yii::app()->user->getFlash('contact'); ?>
                </div>

            <?php else: ?>


                <div class="form">

                    <?php
                    $form = $this->beginWidget('CActiveForm', array(
                        'id' => 'contact-form',
                        'enableClientValidation' => true,
                        'clientOptions' => array(
                            'validateOnSubmit' => true,
                        ),
                    ));
                    ?>


                    <?php echo $form->errorSummary($model); ?>

                    
                    <div class="form-group">
                        <label for="ContactForm_name">
                        <?php
                        echo Yii::t("contact", "Votre nom");
                        ?>
                        </label>    
                        <?php echo $form->textField($model, 'name'); ?>
                        <?php echo $form->error($model, 'name'); ?>
                    </div>

                    <div class="form-group">
                        <label for="ContactForm_email">
                        <?php
                        echo Yii::t("contact", "Votre email"); 
                        ?>
                        </label>
                        <?php echo $form->textField($model, 'email'); ?>
                        <?php echo $form->error($model, 'email'); ?>
                    </div>

                    <div class="form-group">
                        <label for="ContactForm_subject">
                        <?php
                        echo Yii::t("contact", "Objet");
                        ?>
                        </label>
                        <?php echo $form->textField($model, 'subject', array('size' => 60, 'maxlength' => 128)); ?>
                        <?php echo $form->error($model, 'subject'); ?>
                    </div>

                    <div class="form-group">
                        <label for="ContactForm_body">
                        <?php
                        echo Yii::t("contact", "Votre message"); 
                        ?>
                        </label>
                        <?php echo $form->textArea($model, 'body', array('rows' => 6, 'cols' => 50)); ?>
                        <?php echo $form->error($model, 'body'); ?>
                    </div>

                    <?php if (CCaptcha::checkRequirements()): ?>
                        <div class="row">
                            <?php echo $form->labelEx($model, 'verifyCode'); ?>
                            <div>
                                <?php $this->widget('CCaptcha'); ?>
                                <?php echo $form->textField($model, 'verifyCode'); ?>
                            </div>
                            <!-- Please enter the letters as they are shown in the image above.
                                <br/>Letters are not case-sensitive. -->
                            <div class="hint">
                                <?php echo Yii::t("contact", "Veuillez saisir les lettres telles qu'elles apparaissent dans l'image ci-dessus."); ?>
                            </div>
                            <?php echo $form->error($model, 'verifyCode'); ?>
                        </div>
                    <?php endif; ?>

                    <div class="row buttons">
                        <?php echo CHtml::submitButton(Yii::t("contact", "Envoyer")); ?>
                    </div>

                    <?php $this->endWidget(); ?>

                    <div id="form-messages"></div>
                </div> <!-- end form -->
            <?php endif; ?>


        </div> <!-- end contact-form -->
    </div> <!-- end eight columns -->

    <div class="col-md-6 well well-large"">

        <div class="contact-info">

            <h5><i class="glyphicon glyphicon-envelope"></i> Contact Info </h5>

            <address>
                <strong>MOONLIGHT</strong>
                <br>22 Rue de la Bourse, 31000 Toulouse, FRANCE
                <br>
                <a href="mailto:info@moon-light.fr">info@moon-light.fr</a>
            </address>
        </div> <!-- end contact-info -->

        <div>

            <a target="_blank" href="https://twitter.com/ProjetMoonlight">
                <img src="<?php echo $baseUrl; ?>/custom-js/SCRN/icn-twitter-intro.png" alt="Twitter icon">
            </a>

            <a target="_blank" href="https://www.facebook.com/taydonx">
                <img src="<?php echo $baseUrl; ?>/custom-js/SCRN/icn-facebook-intro.png" alt="Facebook icon">
            </a>

            <a target="_blank" href="http://m8nli9ht.wordpress.com/about/">
                <img src="<?php echo $baseUrl; ?>/custom-js/SCRN/icn-wordpress-intro.png" alt="Wordpress icon">
            </a>

            <!--<a target="_blank" href="#">-->
            <img src="<?php echo $baseUrl; ?>/custom-js/SCRN/icn-youtube-intro.png" alt="Youtube icon">
            <!--</a>-->

        </div>

    </div> <!-- end eight columns -->


</div> <!-- end container -->

