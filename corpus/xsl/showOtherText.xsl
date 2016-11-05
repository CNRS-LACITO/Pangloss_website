<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  	xmlns:php="http://php.net/xsl" 
  	xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/"
  	xmlns:annot="http://crdo.risc.fr/schemas/annotation"
    xmlns:xi="http://www.w3.org/2001/XInclude"
	xmlns:xalan="http://xml.apache.org/xalan"
    xmlns:str="http://exslt.org/strings"
	exclude-result-prefixes="xi xalan"
	version="1.0">
	

	<xsl:output method="html"
doctype-system="about:legacy-compat" indent="yes"/>
		<xsl:param name="titre" select="''"/>
        <xsl:param name="url_sound" select="''"/>
        <xsl:param name="url_sound_bis" select="''"/>
        <xsl:param name="url_sound_ter" select="''"/>
        <xsl:param name="navigator" select="''"/>
        <xsl:param name="chercheurs" select="''"/>
        <xsl:param name="locuteurs" select="''"/>
		<xsl:param name="lg" select="''"/>
        <xsl:param name="lg_rect" select="''"/>
        <xsl:param name="lg_code" select="''"/>
        <xsl:param name="id" select="''"/>
        <xsl:param name="id_ref" select="''"/>
        <xsl:param name="sponsor"  select="''"/>
        <xsl:param name="date_text" select="''"/>
		<xsl:param name="url_text" select="''"/>
        <xsl:param name="url_pdf" select="''"/>
		<xsl:param name="aff_lang" select="'*'"/>
        <xsl:param name="mediaUrl"  select="''"/>
        <xsl:param name="title"  select="''"/>
        <xsl:param name="title_fr"  select="''"/>
        <xsl:param name="title_en"  select="''"/>
        <xsl:param name="alternative"  select="''"/>
        <xsl:param name="aff_lang" select="''"/>
        <xsl:param name="spatial_fr" select="''"/>
        <xsl:param name="spatial_en" select="''"/>
        <xsl:param name="spatial_autre" select="''"/>
        <xsl:param name="created" select="''"/>
        <xsl:param name="extent" select="''"/>
        <xsl:param name="east" select="''"/>
        <xsl:param name="north" select="''"/>
	<!-- ******************************************************** -->

	<xsl:template match="/">
    
<br/>
    	 <div align="right">
    		<!--<a target="_blank" href="citation.php?titre={$titre}&amp;lg={$lg}&amp;chercheurs={$chercheurs}&amp;url_text={$url_text}&amp;url_sound={$url_sound_wav}&amp;id={$id}&amp;date_sound={$date_sound}&amp;date_text={$date_text}&amp;sponsor={$sponsor}" onClick="window.open(this.href,'popupLink','width=600,height=100,scrollbars=yes,resizable=yes',1).focus();return false"><b><img src="../../images/icones/citation.jpg" width="77" height="26" /></b></a>-->

           
           <a target="_blank" href="citation_resource.php?titre={$title}&amp;lg={$lg}&amp;chercheurs={$chercheurs}&amp;url_text={$url_text}&amp;url_sound={$url_sound}&amp;id={$id}&amp;idref={$id_ref}&amp;date_sound={$date_sound}&amp;date_text={$date_text}&amp;sponsor={$sponsor}" onClick="window.open(this.href,'popupLink','width=600,height=100,scrollbars=yes,resizable=yes',1).focus();return false"><b><img src="../../images/icones/citation.jpg" width="77" height="26" /></b></a>
    	</div>
       
       
       
        <div style="margin-left: 5px;">
	
       <xsl:choose>
						<xsl:when test="$aff_lang='fr'">
                        
                            <h2 align="center"><b><xsl:value-of select="$title_fr"/></b>
                			</h2>
            
           						
            
                            <div class="panel-heading metadata text-center">
                            <h4 class="panel-title">
                            <a data-toggle="collapse" href="#ressource"><b>A propos de cet enregistrement<b class="caret"></b></b></a>
                            </h4>
                            </div>
                            <div id="ressource" class="panel-collapse collapse">
                            <div class="panel panel-default">
                            
                            <div class="row">
                            <div class="col-xs-6 aff_metadata">
                            <p><b>Langue :</b> <span style="font-size:14px"><xsl:value-of select="$lg"/></span></p>
                            <xsl:if test="not($title_fr=$alternative) and $alternative!=''">
                            	<p><b>Autres titres :</b> <xsl:value-of select="$alternative"/></p>
                            </xsl:if>
                            <xsl:if test="$chercheurs!=''">
                            	<p><b>Chercheur(s) :</b> <xsl:value-of select="$chercheurs"/></p>
                            </xsl:if>
                            <xsl:if test="$locuteurs!=''">
	                            <p><b>Locuteur(s) :</b> <xsl:value-of select="$locuteurs"/></p>
                            </xsl:if>
                            <xsl:if test="$sponsor!=''">
	                            <p><b>sponsor(s) :</b> <xsl:value-of select="$sponsor"/></p>
                            </xsl:if>
	                        
                            
                            <!--<p><b>Lieu :</b> 1. <xsl:value-of select="$spatial_fr"/> 2. <xsl:value-of select="$spatial_en"/> 3. <xsl:value-of select="$spatial_autre"/></p>-->
                            
                             <xsl:if test="$created!=''">
	                            <p><b>Date d'enregistrement :</b> <xsl:value-of select="$created"/></p>
                            </xsl:if>
                            
 
                            
                             <p><b>Lieu d'enregistrement :</b> 
                            		<xsl:choose>
                                    	<xsl:when test="$spatial_fr!=''">
                                        	<xsl:value-of select="$spatial_fr"/>
                                        </xsl:when>
                                        <xsl:when test="$spatial_en!=''">
                                        	<xsl:value-of select="$spatial_en"/>
                                        </xsl:when>
                                        <xsl:otherwise></xsl:otherwise>
                                    </xsl:choose>
                                    
                                    <xsl:if test="$spatial_autre!=''">
                                    <br/>
                                    	<b>[</b><xsl:value-of select="$spatial_autre"/><b>]</b>
                                    </xsl:if>
                                   
                           </p>
                            <div class="panel-heading download text-center">
                            <h4 class="panel-title text-left">
                            <a data-toggle="collapse" href="#telechargement"><b>Téléchargements <b class="caret"></b></b></a>
                            </h4>
                            </div>
                            
                            
                        <div id="telechargement" class="panel-collapse collapse">
                            <div class="panel panel-default">
                             
                           <table class="responsive">
                           <tr>
                           <td>
                            Version <b>originale</b> (<xsl:value-of select="substring($extent, 3)"/>)  
                           </td>
                           <td>
                            <xsl:if test="contains($url_sound_bis,'wav')"><a href="{$url_sound_bis}"><img src="../../images/icones/wav.gif"/></a></xsl:if>
                            <xsl:if test="contains($url_sound_ter,'wav')"><a href="{$url_sound_ter}"><img src="../../images/icones/wav.gif"/></a></xsl:if>
                           </td>
                            </tr>
                            <tr><td><br/></td></tr>
                            <tr>
                            <td>
	                            Version <b>Wav/22Khz</b>
                            </td>
                            <td>
                                 <a href="{$url_sound}"><img src="../../images/icones/wav.png"/></a>
                                 
                            </td>
                            </tr>
                            <tr>
                            <tr><td><br/></td></tr>
                            <td>
                            	Version <b>Mp3/44khz</b>  
                            </td>
                            <td>
                            <xsl:if test="contains($url_sound_bis,'mp3')"><a href="{$url_sound_bis}"><img src="../../images/icones/mp3.png"/></a></xsl:if>
                            <xsl:if test="contains($url_sound_ter,'mp3')"><a href="{$url_sound_ter}"><img src="../../images/icones/mp3.png"/></a></xsl:if>
                            
                            </td>
                            </tr>
                         		<xsl:if test="$url_text!=''">
                                <tr><td><br/></td></tr>
                                <tr>
                                <td>
	                            	<b>Texte</b> au format xml
                                </td>
                                <td>
                                 <a href="{$url_text}"><img src="../../images/icones/xml.png"/></a>
                                </td>
                                </tr>
                            </xsl:if>
                          
                           </table>
                       </div>
                       </div>
                  </div>
                            <div class="col-lg-6 hidden-md hidden-sm hidden-xs">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=300x300&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>	
                            <div class="col-md-6 hidden-lg hidden-sm hidden-xs">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=250x250&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>	
                            <div class="col-sm-6 hidden-lg hidden-md hidden-xs">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=200x200&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>	
                            <div class="col-xs-6 hidden-lg hidden-md hidden-sm">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=150x150&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>
                </div>
                            
                            <p></p>
                            </div>
                            </div>
                        </xsl:when>
                        <xsl:otherwise> 
                        <h2 align="center"><b><xsl:value-of select="$title_en"/></b>
                			</h2>
            
           						
            
                            <div class="panel-heading metadata text-center">
                            <h4 class="panel-title">
                            <a data-toggle="collapse" href="#ressource"><b>About this recording <b class="caret"></b></b></a>
                            </h4>
                            </div>
                            <div id="ressource" class="panel-collapse collapse">
                            <div class="panel panel-default">
                            
                            <div class="row">
                            <div class="col-xs-6 aff_metadata">
                            <p><b>Langue :</b> <span style="font-size:14px"><xsl:value-of select="$lg"/></span></p>
                            <xsl:if test="not($title_fr=$alternative) and $alternative!=''">
                            	<p><b>Autres titres :</b> <xsl:value-of select="$alternative"/></p>
                            </xsl:if>
                            <xsl:if test="$chercheurs!=''">
                            	<p><b>Chercheur(s) :</b> <xsl:value-of select="$chercheurs"/></p>
                            </xsl:if>
                            <xsl:if test="$locuteurs!=''">
	                            <p><b>Locuteur(s) :</b> <xsl:value-of select="$locuteurs"/></p>
                            </xsl:if>
                            <xsl:if test="$sponsor!=''">
	                            <p><b>sponsor(s) :</b> <xsl:value-of select="$sponsor"/></p>
                            </xsl:if>
	                        
                            
                            <!--<p><b>Lieu :</b> 1. <xsl:value-of select="$spatial_fr"/> 2. <xsl:value-of select="$spatial_en"/> 3. <xsl:value-of select="$spatial_autre"/></p>-->
                            
                             <xsl:if test="$created!=''">
	                            <p><b>Date d'enregistrement :</b> <xsl:value-of select="$created"/></p>
                            </xsl:if>
                            
 
                            
                             <p><b>Lieu d'enregistrement :</b> 
                            		<xsl:choose>
                                    	<xsl:when test="$spatial_fr!=''">
                                        	<xsl:value-of select="$spatial_fr"/>
                                        </xsl:when>
                                        <xsl:when test="$spatial_en!=''">
                                        	<xsl:value-of select="$spatial_en"/>
                                        </xsl:when>
                                        <xsl:otherwise></xsl:otherwise>
                                    </xsl:choose>
                                    
                                    <xsl:if test="$spatial_autre!=''">
                                    <br/>
                                    	<b>[</b><xsl:value-of select="$spatial_autre"/><b>]</b>
                                    </xsl:if>
                                   
                           </p>
                            <div class="panel-heading download text-center">
                            <h4 class="panel-title text-left">
                            <a data-toggle="collapse" href="#telechargement"><b>Téléchargements <b class="caret"></b></b></a>
                            </h4>
                            </div>
                            
                            
                        <div id="telechargement" class="panel-collapse collapse">
                            <div class="panel panel-default">
                             
                           <table class="responsive">
                           <tr>
                           <td>
                            Version <b>originale</b> (<xsl:value-of select="substring($extent, 3)"/>)  
                           </td>
                           <td>
                            <xsl:if test="contains($url_sound_bis,'wav')"><a href="{$url_sound_bis}"><img src="../../images/icones/wav.gif"/></a></xsl:if>
                            <xsl:if test="contains($url_sound_ter,'wav')"><a href="{$url_sound_ter}"><img src="../../images/icones/wav.gif"/></a></xsl:if>
                           </td>
                            </tr>
                            <tr><td><br/></td></tr>
                            <tr>
                            <td>
	                            Version <b>Wav/22Khz</b>
                            </td>
                            <td>
                                 <a href="{$url_sound}"><img src="../../images/icones/wav.png"/></a>
                                 
                            </td>
                            </tr>
                            <tr>
                            <tr><td><br/></td></tr>
                            <td>
                            	Version <b>Mp3/44khz</b>  
                            </td>
                            <td>
                            <xsl:if test="contains($url_sound_bis,'mp3')"><a href="{$url_sound_bis}"><img src="../../images/icones/mp3.png"/></a></xsl:if>
                            <xsl:if test="contains($url_sound_ter,'mp3')"><a href="{$url_sound_ter}"><img src="../../images/icones/mp3.png"/></a></xsl:if>
                            
                            </td>
                            </tr>
                         		<xsl:if test="$url_text!=''">
                                <tr><td><br/></td></tr>
                                <tr>
                                <td>
	                            	<b>Text</b> (xml format) 
                                </td>
                                <td>
                                 <a href="{$url_text}"><img src="../../images/icones/xml.png"/></a>
                                </td>
                                </tr>
                            </xsl:if>
                          
                           </table>
                       </div>
                       </div>
                  </div>
                            <div class="col-lg-6 hidden-md hidden-sm hidden-xs">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=300x300&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>	
                            <div class="col-md-6 hidden-lg hidden-sm hidden-xs">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=250x250&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>	
                            <div class="col-sm-6 hidden-lg hidden-md hidden-xs">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=200x200&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>	
                            <div class="col-xs-6 hidden-lg hidden-md hidden-sm">
                      <a target="_blank" href="http://maps.google.com/maps?q={$north},{$east}" title="">
                                <img alt="" src="http://maps.googleapis.com/maps/api/staticmap?center={$north},{$east}&amp;zoom=5&amp;size=150x150&amp;sensor=false&amp;maptype=hybrid&amp;language=fr&amp;markers={$north},{$east}"/>
                            </a>
                            </div>
                </div>
                            
                            <p></p>
                            </div>
                            </div>
                        </xsl:otherwise>
                    </xsl:choose>
            
                   
         <br />

       <xsl:choose>
            <xsl:when test="contains($url_sound,'.mp4')">
            	<div>
               		<xsl:call-template name="player-video_html5">
                    	<xsl:with-param name="mediaUrl_mp4" select="$url_sound"/>
                     	<xsl:with-param name="mediaUrl_ogg" select="$url_sound_bis"/>
               		 </xsl:call-template>               
           		 </div> 
            </xsl:when>
            <xsl:otherwise>   
          		 <div>
               		<xsl:call-template name="player-audio_html5">
                    	<xsl:with-param name="mediaUrl_wav" select="$url_sound"/>
                     	<xsl:with-param name="mediaUrl_mp3" select="$url_sound_bis"/>
                	</xsl:call-template>                 
           		 </div>
            </xsl:otherwise>
        
        </xsl:choose>     
            
              <br/>
     
<!--<div>

<object data="{$url_text}" type="application/pdf" width="1000" height="800" >
						   <embed src="{$url_pdf}" width="1000" height="800"></embed>

</object>

</div>-->

<div class='embed-responsive' style='padding-bottom:150%'>
    <object data="{$url_text}" type='application/pdf' width='100%' height='100%'></object>
</div>
        
      
         
		</div>



	</xsl:template>	
	



            
<xsl:template name="player-audio_html5">
<xsl:param name="mediaUrl_wav" select="''"/>
<xsl:param name="mediaUrl_mp3" select="''"/>
		<script type="text/javascript">
		var idlist = Array();
		var timelist_starts = Array();
		var timelist_ends = Array();
				<xsl:for-each select="//annot:TEXT/annot:S|annot:WORDLIST/annot:W">
				idlist.push("<xsl:value-of select="@id"/>");
				timelist_starts.push(<xsl:value-of select="floor(number(annot:AUDIO/@start)*1000)"/>);
				timelist_ends.push(<xsl:value-of select="floor(number(annot:AUDIO/@end)*1000)"/>);
				</xsl:for-each>
		</script>
		<audio controls="controls" id="player" name="player">
			<source src="{$mediaUrl_mp3}" type="audio/mpeg"/>
			<source src="{$mediaUrl_wav}" type="audio/x-wav"/>
			Your browser does not support the audio tag 
		</audio>
       
		<script type="text/javascript" src="showhide.js">.</script>
        <script type="text/javascript" src="evtPlayerManager.js">.</script>
		<script type="text/javascript" src="html5PlayerManager.js">.</script>
		
</xsl:template>

<xsl:template name="player-video_html5">
<xsl:param name="mediaUrl_ogg" select="''"/>
<xsl:param name="mediaUrl_mp4" select="''"/>

		<video controls="controls" id="player" name="player" width="640" height="360">
        	<source src="{$mediaUrl_ogg}" type="video/ogg"/>
        	<source src="{$mediaUrl_mp4}" type="video/mp4"/>
			
			Your browser does not support the audio tag 
		</video>
</xsl:template>

       
        
    
</xsl:stylesheet>