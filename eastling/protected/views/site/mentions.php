<div class="container">   

<?php
/* @var $this SiteController */

$this->pageTitle=Yii::app()->name . ' - '.Yii::t('general','Mentions légales');

$baseUrl=Yii::app()->request->baseUrl;
$js = Yii::app()->getClientScript();
$js->registerScriptFile($baseUrl .'/js/jquery.min.js');
$js->registerScriptFile($baseUrl .'/js/mentions.js',CClientScript::POS_END);
?>
<div class="page-header">
<h2><?php echo Yii::t('general','Mentions légales'); ?></h2>
</div>

<div class="inner">
	<div class="richtext">

	<h3 class=" text-left"><?php echo Yii::t('mentions','Responsable de la rédaction & Conception du site internet'); ?></h3>
	<p>Matthew DEO
	<br>22, rue de la Bourse - 31000 Toulouse (FRANCE).
	<br>+33650277306
	<br>
	<a href="mailto:info@moon-light.fr">info@moon-light.fr</a>
	</p>
	
	<h3 class=" text-left"><?php echo Yii::t('mentions','Hébergement'); ?></h3>
	<p>OVH
	<br>Siège social : 2 rue Kellermann - 59100 Roubaix (FRANCE).
	<br>
	<a href="http://www.ovh.com/">http://www.ovh.com/</a>
	</p>

	<h3 class=" text-left"><?php echo Yii::t('mentions',"Conditions d’utilisation"); ?></h3>
	<p>L’accès à ce site internet peut donner lieu à l’utilisation de témoins de connexion (ou cookies). Ces témoins sont nécessaires à l’affichage du site et ont pour finalité exclusive de faciliter la connexion, sans toutefois tracer les comportements des utilisateurs.
L’utilisation et l’interprétation des informations contenues dans ce site se fait sous la seule responsabilité des utilisateurs. Il leur appartient d’en faire un usage conforme aux réglementations en vigueur.
</p>
<p>
<ul>
		
		<li>Paternité : Vous devez citer le nom de l'auteur original de la manière indiquée par l'auteur de l'oeuvre ou le titulaire des droits qui vous confère cette autorisation (mais pas d'une manière qui suggérerait qu'ils vous soutiennent ou approuvent votre utilisation de l'oeuvre)</li>
		
		<li>Pas d'Utilisation Commerciale : Vous n'avez pas le droit d'utiliser cette création à des fins commerciales.</li>
		
		<li>Pas de Modification : Vous n'avez pas le droit de modifier, de transformer ou d'adapter cette création.</li>
		
		</ul>
</p>
<p>Il leur appartient d'en faire un usage conforme aux réglementations en vigueur et aux recommandations de la Commission nationale de l'informatique et des libertés (Cnil) pour les données données à caractère personnel.<br />
		
		Conformément aux dispositions contenues dans la loi n° 78-17 du 6 Janvier 1978 modifiée relative à l’informatique, aux fichiers et aux libertés, vous disposez d’un droit d’accès, de rectification, de modification et de suppression concernant les données qui vous concernent. Vous pouvez faire exercer ce droit en écrivant à <a href="mailto:info@moon-light.fr">info@moon-light.fr</a>.<br />
</p>	

	
	<h3 class=" text-left"><?php echo Yii::t('mentions','Propriété intellectuelle'); ?></h3>
	<p>Sauf mention contraire, les pages et documents de ce site appartiennent au responsable de la rédaction susnommé et sont publiées sous licence Creative Commons BY‑NC‑SA.
</p>

<p>
La mise en place de liens hypertextes par des tiers vers des pages ou des documents diffusés sur ce site, pouvant de fait constituer une atteinte au droit d'auteur, un acte relevant du parasitisme ou de la diffamation, doivent faire l'objet d'une autorisation du responsable de la rédaction susnommé qui peut être sollicitée directement à <a href="mailto:info@moon-light.fr">info@moon-light.fr</a>.<br />
L'autorisation correspondante sera accordée si les liens ne contreviennent pas aux intérêts du site, et s'ils garantissent la possibilité pour l'utilisateur d'identifier l'origine Moon-light.fr du document notamment dans le cas de liens hypertextes profonds, de cadrage ou d'insertion par liens.
</p>
		
		<h3><?php echo Yii::t('mentions','Logiciels'); ?></h3>
		
		<div class="licence">
			<h4 class="pi">Yii Framework (<a>Licence BSD</a>)</h4>
			<p>
			<span class="icon-link"></span><a href="www.yiiframework.com" target="_blank"> http://www.yiiframework.com</a>
			</p>
			<div>
				The Yii framework is free software. It is released under the terms of the following BSD License.
				<p>Copyright © 2008-2013 by Yii Software LLC
				All rights reserved.<br>
				
				Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
				
				Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
				Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
				Neither the name of Yii Software LLC nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
				THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
				</p>	
			</div>
		</div>
		
		<div class="licence">
			<h4 class="pi">Skeleton CSS (<a href="http://opensource.org/licenses/mit-license.php" target="_blank">Licence MIT</a>)</h4>
			<p>
			<span class="icon-link"></span><a href="http://www.getskeleton.com/" target="_blank"> http://www.getskeleton.com/</a>
			</p>
			<div>
			 <p>
			 Developed by <a href="http://www.cniska.net" target="_blank">Christoffer Niska</a> and 
			 <a href="http://www.ramirezcobos.com/" target="_blank">Antonio Ramirez</a>
			 </p>	
			</div>
		</div>
		
		<div class="licence">
			<h4 class="pi">GeoXML3  (<a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank">Apache License 2.0</a>)</h4>
			<p>
			<span class="icon-link"></span><a href="https://code.google.com/p/geoxml3/" target="_blank"> https://code.google.com/p/geoxml3/</a>
			</p>
			<div>
	
			</div>
		</div>	

		<div class="licence">
			<h4 class="pi">arbor.js  (<a href="http://en.wikipedia.org/wiki/MIT_License" target="_blank">MIT License</a>)</h4>
			<p>
			<span class="icon-link"></span><a href="http://arborjs.org/" target="_blank"> http://arborjs.org/</a>
			</p>
			<div>
	
			</div>
		</div>			
		

		
		<!--<h3>Données</h3>-->
	
		<h3 class=" text-left"><?php echo Yii::t('mentions','Textes légaux'); ?></h3>
		<p>
		<ul>
		
		<li>Loi nº78-17 du 6 Janvier 1978, relative à l'informatique, aux fichiers et aux libertés, dite loi Informatique et Libertés</li>
		
		<li>Délibération de la Cnil nº 81-94 du 21 juillet 1981 portant adoption d'une recommandation relative aux mesures générales de sécurité des systèmes informatiques</li>
		
		<li>Loi nº 88-19 du 5 janvier 1988 relative à la fraude informatique, dite loi Godfrain</li>
		
		</ul>
		</p>
	</div>
</div>

</div>