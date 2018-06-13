<style type="text/css">
/*
.bs-docs-sidenav > li > a {
    border: 1px solid #E5E5E5;

    padding: 8px 14px;
}

.bs-docs-sidenav > li > a {
    border: 1px solid #E5E5E5;

    padding: 8px 14px;
}

.bs-docs-sidenav > li:first-child > a {
    border-radius: 6px 6px 0 0;
}

.bs-docs-sidenav > li:last-child > a {
    border-radius: 0 0 6px 6px;
}

.bs-docs-sidenav > .active > a {
    border: 0 none;
    box-shadow: 1px 0 0 rgba(0, 0, 0, 0.1) inset, -1px 0 0 rgba(0, 0, 0, 0.1) inset;
    padding: 9px 15px;
    position: relative;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.15);
    z-index: 2;
}

.bs-docs-sidenav .icon-chevron-right {
    float: right;
    margin-right: -6px;
    margin-top: 2px;
    opacity: 0.25;
}

.bs-docs-sidenav > li > a:hover {
    background-color: #F5F5F5;
}

.bs-docs-sidenav a:hover .icon-chevron-right {
    opacity: 0.5;
}

.bs-docs-sidenav .active .icon-chevron-right, .bs-docs-sidenav .active a:hover .icon-chevron-right {
    opacity: 1;
}

.bbs-docs-sidenav.affix {
    top: 40px;
}

.bs-docs-sidenav.affix-bottom {
    bottom: 270px;
    position: absolute;
    top: auto;
}
*/
</style>
<?php
    /* @var $this SiteController */

    $this->pageTitle = Yii::app()->name;
    $baseUrl = Yii::app()->baseUrl;
    $js = Yii::app()->getClientScript();
    $js->registerScriptFile($baseUrl . '/custom-js/moonlight.js');
    $js->registerScriptFile($baseUrl . '/custom-js/jquery-ui-1.10.3.custom.min.js');
    
    //PROBLEME SUR L'OFFSET IL FAUT LE DYNAMISER=HAUTEUR DU JUMBOTRON+MENU
    $this->beginWidget('bootstrap.widgets.TbScrollspy',
                array(
                    'target'=>'.bs-docs-sidebar',
                    'offset'=>'251')
                    
                );
    $this->endWidget();
    
    ?>
<!--
<header class="jumbotron subhead" id="overview" xmlns="http://www.w3.org/1999/html">
   <div class="container">
       <h1><?php //echo CHtml::image($baseUrl . '/images/logo/logo.png'); ?>  
           moon<test style="font-weight: normal;letter-spacing:2px;">light</test></h1>
      <p class="lead">
          <?php 
          //echo Yii::t('general', 'Un outil linguistique pour le taï don');
          ?>
      </p>
   </div>
</header>
-->

<div class="container" id="header">
    
    <div class="header-carousel">  
        
    </div>
    
    <div class="title-carousel">
        <h1>
        <?php echo CHtml::image($baseUrl . '/images/logo/logo.png'); ?>
        <test style="font-weight: bold;">moon</test><test style="font-weight: normal;letter-spacing:2px;">light</test>
        </h1>
        <p class="lead">
          <?php 
          echo Yii::t('general', 'Un outil linguistique pour le taï don');
          ?>
        </p>
    </div>

    <div>
        <?php
            $info1 = "";

            $info1.=TbHtml::labelTb(Yii::t('carousel', 'phonétique'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";
            $info1.=TbHtml::labelTb(Yii::t('carousel', 'grammaire'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";
            $info1.=TbHtml::labelTb(Yii::t('carousel', 'vocabulaire'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";
            $info1.=TbHtml::labelTb(Yii::t('carousel', 'écriture'), array('color' => TbHtml::LABEL_COLOR_INFO));

            $info2 = "";

            $info2.=TbHtml::labelTb(Yii::t('carousel', 'ressources bibliographiques numérisées'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";
            $info2.=TbHtml::labelTb(Yii::t('carousel', 'extraits audio & vidéo'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";
            $info2.=TbHtml::labelTb(Yii::t('carousel', 'polices de caractère taï blanc'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";

            $info3 = "";

            $info3.=TbHtml::labelTb(Yii::t('carousel', 'proposez de nouveaux contenus'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";
            $info3.=TbHtml::labelTb(Yii::t('carousel', 'partagez des ressources'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";
            $info3.=TbHtml::labelTb(Yii::t('carousel', 'suggérez des améliorations'), array('color' => TbHtml::LABEL_COLOR_INFO)) . " ";


            $this->beginWidget('bootstrap.widgets.TbCarousel', array(
                'items' => array(
                    array(
                        'image' => Yii::app()->baseUrl . '/images/carousel/slide1.jpg',
                        'label' => Yii::t('carousel', 'Support pédagogique'),
                        'caption' => $info1),
                    array(
                        'image' => Yii::app()->baseUrl . '/images/carousel/slide2.jpg',
                        'label' => Yii::t('carousel', 'Contenu multimédia'),
                        'caption' => $info2),
                    array(
                        'image' => Yii::app()->baseUrl . '/images/carousel/slide3.jpg',
                        'label' => Yii::t('carousel', 'Démarche participative'),
                        'caption' => $info3),
                ),
            ));
            ?>

            <?php $this->endWidget(); ?>
    </div>
    
</div>

<div id="page">

    <div class="span3 bs-docs-sidebar">
            
           <ul class="nav nav-list nav-collapse bs-docs-sidenav" data-spy="affix" data-offset-top="450" style="z-index:99;">
            <!--<li><a href="#accueil">Accueil<i class="icon-chevron-right"></i></a></li>-->
            <li><a href="#projet"><?php echo Yii::t('general', 'Le projet'); ?><i class="icon-chevron-right"></i></a></li>
            <li><a href="#acteurs"><?php echo Yii::t('general', 'Les acteurs'); ?><i class="icon-chevron-right"></i></a></li>
            <li><a href="#locuteurs"><?php echo Yii::t('general', 'Les locuteurs'); ?><i class="icon-chevron-right"></i></a></li>
            <li><a href="#contributeurs"><?php echo Yii::t('general', 'Les contributeurs'); ?><i class="icon-chevron-right"></i></a></li>
            
           </ul> 
            
        </div>
		
    <!--<div class="span1" style="min-height: 0px;" class="bs-docs-sidebar">-->       
    <div class="row">    
        <?php
        
        /*
         $this->beginWidget('bootstrap.widgets.TbAffix', 
                array('htmlOptions' => 
                    array('style' => 'bottom:200px;left:12px;',
                        'class' => 'span3 bs-docs-sidebar')
                    )
                )
                );
                */
        ?>
		<!--
        <div class="span3 bs-docs-sidebar">
            
           <ul class="nav nav-list nav-collapse bs-docs-sidenav" data-spy="affix">
            <li><a href="#projet"><?php echo Yii::t('general', 'Le projet'); ?><i class="icon-chevron-right"></i></a></li>
            <li><a href="#acteurs"><?php echo Yii::t('general', 'Les acteurs'); ?><i class="icon-chevron-right"></i></a></li>
            <li><a href="#locuteurs"><?php echo Yii::t('general', 'Les locuteurs'); ?><i class="icon-chevron-right"></i></a></li>
            <li><a href="#contributeurs"><?php echo Yii::t('general', 'Les contributeurs'); ?><i class="icon-chevron-right"></i></a></li>
            
           </ul> 
            
        </div>    
			-->
        <?php
        
        
        //$this->endWidget();
        ?>
        
        
    <!--</div>-->

    <div id="sections">
		
        <section id="projet">
		<div class="row">
		<div class="span3"></div>
		<div class="span9">
<?php echo TbHtml::pageHeader(Yii::t('general', 'Le projet'), Yii::t('projet','un outil linguistique en ligne dédié à la langue taï don')); ?>
        </div>  
		</div>
			<div class="row">
			
				<div class="span3"></div>
			
                <div class="span3">
                    <div class="icone">
						<div style="text-align:center;">
							<img src="<?php echo Yii::app()->request->baseUrl; ?>/images/icones/Keyamoon/Icons/PNG/32px/warning.png" />
						</div>
                        <h2><?php echo Yii::t("projet","Une langue menacée ?"); ?></h2>
                    </div>

			<?php
			echo Yii::t("projet", "<p>Le terme taï don (taï blanc en français, thái trắng en vietnamien, 傣端/dǎiduān en chinois, white tai en anglais) désigne une minorité ethnique que l'on trouve principalement au nord-ouest du Vietnam et au sud de la Chine dans la province du Yunnan. 
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

                <div class="span3">
                    <div class="icone">
                        <img src="<?php echo Yii::app()->request->baseUrl; ?>/images/icones/Keyamoon/Icons/PNG/32px/laptop.png" />
                    </div>
                    <h2><?php echo Yii::t("projet","Un site web dédié au taï don"); ?></h2>
<?php
echo "<p>".Yii::t("projet", "Moonlight est un site internet multilangue qui regroupe un ensemble de connaissances linguistiques sur le taï blanc, propose des outils pédagogiques multimédia et offre aux utilisateurs la possibilité d'enrichir son contenu. Il a été construit à partir de 
             publications ethnolinguistiques, d'enquêtes de terrain auprès de locuteurs taï don
             et de documents manuscrits afin de proposer le contenu suivant:")."</p>
                    <p> 
                            <span class='list-icone'>
                                    <img src=" . Yii::app()->request->baseUrl . "/images/icones/Keyamoon/Icons/PNG/16px/books.png />
                            </span>".Yii::t("projet","histoire, phonétique, écriture")."
                    </p>

                    <p> 
                            <span class='list-icone'>
                                    <img src=" . Yii::app()->request->baseUrl . "/images/icones/Keyamoon/Icons/PNG/16px/book.png />
                            </span>".Yii::t("projet","lexique")."
                                    
                    </p>

                    <p> 
                            <span class='list-icone'>
                                    <img src=" . Yii::app()->request->baseUrl . "/images/icones/Keyamoon/Icons/PNG/16px/bubbles2.png />
                            </span>".Yii::t("projet","leçons thématiques, proverbes, chants")."
                    </p>

                    <p>
                            <span class='list-icone'>
                                    <img src=" . Yii::app()->request->baseUrl . "/images/icones/Keyamoon/Icons/PNG/16px/quill.png />
                            </span>".Yii::t("projet","analyses de manuscrits")."
                    </p>

                    <p>
                            <span class='list-icone'>
                                    <img src=" . Yii::app()->request->baseUrl . "/images/icones/Keyamoon/Icons/PNG/16px/play.png />  
                       </span>".Yii::t("projet","contenu multimédia: enregistrements de locuteurs (Vietnam, France, Etats-Unis), police d'écriture traditionnelle et modernisée, 
                        différentes transcriptions disponibles")." 
                    </p> 
            ";
?>

                </div>

                <div class="span3">
                    <div class="icone">
                        <img src="<?php echo Yii::app()->request->baseUrl; ?>/images/icones/Keyamoon/Icons/PNG/32px/earth.png" />
                    </div>
                    <h2><?php echo Yii::t("projet","Evolutif & participatif"); ?></h2>
<?php echo TbHtml::lead(Yii::t("projet", "<p>Initié en 2013, le projet s'articule autour d'une collaboration pluridisciplinaire 
                     et propose une démarche participative pour construire et faire évoluer 
                     le contenu du site web.</p>
                <p>
                    Ainsi, une collecte de fonds via la plateforme <a target='_blank' href='http://www.kisskissbankbank.com/fr/projects/moonlight'>KissKissBankBank</a> a permis de financer
                    une étude linguistique menée en pays taï en Septembre 2013 ayant pour objectifs de réaliser des enregistrements de locuteurs
                    et de récolter des ressources manuscrites afin d'enrichir le site.</p>
                <p>

                Par ailleurs, le contenu doit continuer d'évoluer grâce aux propositions des utilisateurs
                et par le biais de discussions entre eux autour de thématiques ouvertes (néologismes...)
                </p>")); ?>

                </div>
            </div> 



        </section>
        <section id="acteurs" class="darken">
		<div class="row">
		<div class="span3"></div>
		<div class="span9">
<?php echo TbHtml::pageHeader(Yii::t('general', 'Les acteurs'), Yii::t('acteurs','bâtisseurs du projet')); ?>
		</div>
		</div>
            <div class="row">
			<div class="span3"></div>
                <div class="span3">
<?php echo TbHtml::imageRounded(Yii::app()->request->baseUrl . '/images/photos/id_lok.jpg'); ?>

                    <p class="citation">

<?php $this->beginWidget('bootstrap.widgets.TbCollapse'); ?>
                    <div class="accordion-group">
                        <div class="accordion-heading">
                            <a class="accordion-toggle" data-toggle="collapse"
                               data-parent="#accordion2" href="#collapseOne">
                                Collapsible Group Item #1
                            </a>
                        </div>
                        <div id="collapseOne" class="accordion-body collapse in">
                            <div class="accordion-inner">
                                Anim pariatur cliche...
                            </div>
                        </div>
                    </div>

<?php $this->endWidget(); ?>

                    <?php
                    echo TbHtml::quote(Yii::t("acteurs","L'idée de ce projet sommeillait en moi depuis plusieurs années déjà devant un besoin naturel d'apprendre et de mieux connaître cette langue qui a bercé une partie de mon enfance.
                    Les rares documents que j'ai pu trouver étaient assez sommaires. Après plusieurs voyages effectués au Vietnam 
                    en pays taï, j'ai réalisé au contact des gens que le taï don se perdait peu à peu. 
                    Un constat qui m'a motivé à agir."), array(
                        'source' => '<a href="http://www.linkedin.com/in/matthewdeo" target="_blank"><b>Matthew DEO</b></a> - ',
                        'cite' => Yii::t("acteurs", "Ingénieur d'études et développement en technologies internet, métis franco-taï blanc à l'initiative du projet, 
                    avec plusieurs séjours en pays taï à son actif"),
                        'pull' => TbHtml::PULL_RIGHT,
                    ));
                    ?>
                    </p> 

                </div>

                <div class="span3">
                    <!--<i class="icon-thumbs-up-alt"></i>-->
                    <?php echo TbHtml::imageRounded(Yii::app()->request->baseUrl . '/images/photos/id_ferlus.jpg'); ?>

                    <!--Michel Ferlus is a French linguist specialized in the historical phonology of languages 
                    of Southeast Asia. In addition to phonological systems, he also studies writing systems, 
                    in particular the evolution of Tai scripts.-->    
                    <p class="citation">
                        <?php
                        echo TbHtml::quote(Yii::t("acteurs","Par profession je m'intéressais aux langues et aux écritures des taïs en général
                    et plus particulièrement à celles du groupe taï don,
                     dont les caractéristiques retiennent l'attention des spécialistes.
                      Il y a plus d'une dizaine d'années, j'ai pris conscience de la pauvreté de nos fonds
                       documentaires en manuscrits taï don.
                        J'ai pu alors effectuer quelques missions de recherche au Vietnam
                         où j'ai rencontré des personnalités taïes qui maintiennent vivante la culture de ce groupe.
                         Ainsi, je suis devenu un peu taï don."), array(
                            'source' => '<a href="http://en.wikipedia.org/wiki/Michel_Ferlus" target="_blank"><b>Michel FERLUS</b></a> - ',
                            'cite' => Yii::t("acteurs", "Linguiste français spécialisé en phonologie historique des langues 
                                austro-asiatiques et taï-kadaï de l'Asie du Sud-Est.
                    Directeur de recherche <a target='_blank' href='http://www.cnrs.fr/' 
                    title='Centre National de la Recherche Scientifique'>CNRS</a> à la retraite 
                    (encore sollicité de nos jours pour des conférences à travers le monde),
                    membre associé au <a target='_blank' href='http://crlao.ehess.fr/' 
                    title='Centre de Recherches Linguistiques sur l’Asie Orientale'>CRLAO</a>."),
                            'pull' => TbHtml::PULL_RIGHT,
                        ));
                        ?>
                    </p> 

                </div>

                <div class="span3">
<?php echo TbHtml::imageRounded(Yii::app()->request->baseUrl . '/images/photos/id_tl.jpg'); ?>

                    <p class="citation">
                        <?php
                        echo TbHtml::quote("Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Donec volutpat, justo sed tincidunt iaculis, nisl enim rutrum dolor, 
                    in posuere purus risus vel quam.", array(
                            'source' => '<a href="http://www.harmattan.fr/index.asp?navig=auteurs&obj=artiste&no=15714" target="_blank"><b>Tai-Luc NGUYEN TAN</b></a> - ',
                            'cite' => Yii::t("acteurs", "Enseignant à la section de siamois de l'<a target='_blank' href='http://www.inalco.fr'  title='Institut National des Langues et Civilisations Orientales, Paris (FRANCE)' >INALCO</a>,
                    chargé du cours de diachronie et synchronie taï-kadaï. 
                    <!--Thèse de doctorat consacrée au Lü, et a également effectué des travaux universitaires sur le vietnamien,
                    le khmer et le lao,--> Auteur de 'Parlons Lü : La langue taï des Douze mille rizières du Yunnan' (Harmattan, 2008). Egalement connu comme auteur et interprète de nombreuses chansons inspirées
                    par le Mékong."),
                            'pull' => TbHtml::PULL_RIGHT,
                        ));
                        ?>
                    </p> 

                </div>

            </div>
        </section>
        <section id="locuteurs">
		<div class="row">
		<div class="span3"></div>
		<div class="span9">
                <?php echo TbHtml::pageHeader(Yii::t('general', 'Les locuteurs'), Yii::t('locuteurs','des volontaires pour prêter leur voix et partager leur savoir')); ?>
         </div>
		</div> 
			<div class="row">
			<div class="span3"></div>
			<div class="span9">
                <?php
                echo TbHtml::lead(Yii::t("locuteurs", "En Septembre 2013, un séjour a été effectué au Vietnam pour mener une étude sur la langue taï don auprès de locuteurs natifs, 
                réaliser des prises de voix et analyser des documents écrits. 
                Ce travail a pu être mené à bien grâce à la collaboration de:"));
                ?>
            </div>
			</div>
			
            <div class="row">
				<div class="span3"></div>
                <div class="span3">
                        <?php echo TbHtml::imageRounded(Yii::app()->request->baseUrl . '/images/photos/id_diec.jpg'); ?>

                    <p>
                        <?php
                        echo TbHtml::quote("", array(
                            'source' => '<a><b>TEO Van Diec</b></a> - ',
                            'cite' => Yii::t("locuteurs", "Taï don de Muong So (province de Laï Chau/Vietnam), Diec enseigne la langue et l'écriture depuis 40 ans bénévolement. Dans ses efforts pour transmettre son savoir, 
                            il rencontre des difficultés à sensibiliser les jeunes de la région."),
                            'pull' => TbHtml::PULL_RIGHT,
                        ));
                        ?>
                    </p> 

                </div>
                <div class="span3">
                        <?php echo TbHtml::imageRounded(Yii::app()->request->baseUrl . '/images/photos/id_nhat.jpg'); ?>

                    <p>
<?php
echo TbHtml::quote("", array(
    'source' => '<a><b>TRUONG Ten Nhat</b></a> - ',
    'cite' => Yii::t("locuteurs", "Locuteur taï don originaire de Muong Lay (province de Laï Chau/Vietnam), 
        Nhat a une très bonne connaissance de l'écriture et de la tradition orale taï don (proverbes, chants, ...)."),
    'pull' => TbHtml::PULL_RIGHT,
));
?>
                    </p> 

                </div> 
				<div class="span3"></div>

            </div>
        </section>

        <section id="contributeurs" class="darken">
		<div class="row">
			<div class="span3"></div>
			<div class="span9">
            <?php
            echo TbHtml::pageHeader(Yii::t('general', 'Les contributeurs'), 
                    Yii::t("contributeurs","des personnes sensibles à la préservation d'un patrimoine culturel"));
			?>
			</div>
		</div>
		<div class="row">
			<div class="span3"></div>
			<div class="span9">
			<?php
            echo TbHtml::lead(Yii::t("contributeurs", "Moonlight bénéficie du soutien et de l'aide de nombreuses autres 
                personnes sensibles à la préservation du taï blanc ou à celle du patrimoine culturel mondial de manière 
                plus générale.
                Aide financière, apport de compétences diverses, conseil, encouragements...autant de contributions 
                dont les auteurs méritent d'être mentionnés ici:"));
            echo "<p>Mélanie BOUDIER, Thuyen HERMAN, Alexis MICHAUD (MICA Hanoi), François JACQUESSON (LACITO), 
                Quyet LO VAN, An DEO VAN, Tung DEO VAN, Quoc Tin DIEU CHINH, Trong DEO VAN, Laurent HAZARD (INRA Toulouse), 
                Vincent & Axel DEO VAN, Minh NGUYEN, Phuc Huu TRAN, Julien CLASQUIN, Chrystel PROUPUECH, Daniel PERISSE (Maison de l'Occitanie), 
                KissBankers: Thuyen HERMAN, Hao CARPENTIER, Bang DEO VAN, Johanna GUNN, Cedric DEO VAN, Loïc DEO VAN, Trinh & Isabelle DEO VAN, 
                Eric STEFANUTTI, Maxime STEFANUTTI, Edwige DUBOS, Claire & Marc BOUDIER, Tan DOAN, Sébastien SOUNDIRARASSOU,
                Nina GRISOTTO, Benjamin BENIFEI, Céline CEQUIEL, Silvere MONTIER, May YANG, Caroline MONESTIEZ, Cédric MARTI, Solène MORIZEAU,
                Gisèle PERINAUD, Magaly LACROIX, Liliane NIELSEN, Jean-Claude BRACONNIER, Olivier BERSOUX, Julie JOHNSON,
                Renaud PORCHER, Cynthia HERMAN, Solange DUBOR</p>";
            ?>
			</div>
		</div>

        </section>

<?php //$this->endWidget();  ?>

    </div>
        
    </div>

</div><!-- page -->