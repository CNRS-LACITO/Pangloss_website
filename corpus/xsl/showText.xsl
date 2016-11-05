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
    
	<!--<xsl:output method="xml" indent="yes"/>-->
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
    
    <div class="row">
    	<div class="col-xs-2 thumbnail thumb" style="background:#3E8FA4; none repeat scroll 0% 0%;">
            <div style="font-style: italic; text-align: center; color: white; border-radius: 4px;">
                       <a href="../corpus/list_rsc.php?lg={$lg}"><b style="color: white;">Autres enregistrements en <xsl:value-of select="$lg"/></b></a>
              </div>
        </div>
     
	  
                            
        <div class="col-xs-8"></div>
                     
       

           <div class="col-xs-2 thumbnail thumb" style="background:#3E8FA4; none repeat scroll 0% 0%;">
            <div style="font-style: italic; text-align: center; color: white; border-radius: 4px;">
                      <a target="_blank" href="citation_resource.php?titre={$title}&amp;lg={$lg}&amp;chercheurs={$chercheurs}&amp;url_text={$url_text}&amp;url_sound={$url_sound}&amp;id={$id}&amp;idref={$id_ref}&amp;date_sound={$date_sound}&amp;date_text={$date_text}&amp;sponsor={$sponsor}" onClick="window.open(this.href,'popupLink','width=600,height=100,scrollbars=yes,resizable=yes',1).focus();return false"><b style="color: white;">Citation</b></a>
              </div>
        </div>
           
    
      
      
      </div>
		
        <div style="margin-left: 5px;">
		
          
            
           			 <xsl:choose>
                     <!-- site en français -->
						<xsl:when test="$aff_lang='fr'">
                        
                            <h2 align="center"><b><xsl:value-of select="$title_fr"/></b>
                			</h2>
            
           						
            
                            <div class="panel-heading metadata text-center">
                            <h4 class="panel-title">
                            <a data-toggle="collapse" href="#ressource"><b>A propos de cet enregistrement <b class="caret"></b></b></a>
                            </h4>
                            </div>
                            <div id="ressource" class="panel-collapse collapse">
                            <div class="panel panel-default">
                            
                            <div class="row">
                            <div class="col-xs-6 aff_metadata">
                            <p><b>Langue : </b> <span style="font-size:14px"><xsl:value-of select="$lg"/></span></p>
                            <xsl:if test="not($title_fr=$alternative) and $alternative!=''">
                            	<p><b> Autres titres :</b> <xsl:value-of select="$alternative"/></p>
                            </xsl:if>
                            <xsl:if test="$chercheurs!=''">
                            	<p><b> Chercheur(s) : </b> <xsl:value-of select="$chercheurs"/></p>
                            </xsl:if>
                            <xsl:if test="$locuteurs!=''">
	                            <p><b> Locuteur(s) : </b> <xsl:value-of select="$locuteurs"/></p>
                            </xsl:if>
                            <xsl:if test="$sponsor!=''">
	                            <p><b> Sponsor(s) : </b> <xsl:value-of select="$sponsor"/></p>
                            </xsl:if>
	                        
                            
                            <!--<p><b>Lieu :</b> 1. <xsl:value-of select="$spatial_fr"/> 2. <xsl:value-of select="$spatial_en"/> 3. <xsl:value-of select="$spatial_autre"/></p>-->
                            
                             <xsl:if test="$created!=''">
	                            <p><b>Date d'enregistrement : </b> <xsl:value-of select="$created"/></p>
                            </xsl:if>
                            
 
                            
                             <p><b>Lieu d'enregistrement : </b> 
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
                        
                        <!-- Site en anglais -->
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
                            <p><b>Language: </b> <span style="font-size:14px"><xsl:value-of select="$lg"/></span></p>
                            <xsl:if test="not($title_fr=$alternative) and $alternative!=''">
                            	<p><b>Other titlee: </b> <xsl:value-of select="$alternative"/></p>
                            </xsl:if>
                            <xsl:if test="$chercheurs!=''">
                            	<p><b>Researcher(s): </b> <xsl:value-of select="$chercheurs"/></p>
                            </xsl:if>
                            <xsl:if test="$locuteurs!=''">
	                            <p><b>Speaker(s): </b> <xsl:value-of select="$locuteurs"/></p>
                            </xsl:if>
                            <xsl:if test="$sponsor!=''">
	                            <p><b>Sponsor(s): </b> <xsl:value-of select="$sponsor"/></p>
                            </xsl:if>
	                        
                            
                            <!--<p><b>Lieu :</b> 1. <xsl:value-of select="$spatial_fr"/> 2. <xsl:value-of select="$spatial_en"/> 3. <xsl:value-of select="$spatial_autre"/></p>-->
                            
                             <xsl:if test="$created!=''">
	                            <p><b>Date of recording: </b> <xsl:value-of select="$created"/></p>
                            </xsl:if>
                            
 
                            
                             <p><b>Recording place: </b> 
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
                            <a data-toggle="collapse" href="#telechargement"><b>Downloads <b class="caret"></b></b></a>
                            </h4>
                            </div>
                            
                            
                        <div id="telechargement" class="panel-collapse collapse">
                            <div class="panel panel-default">
                             
                           <table class="responsive">
                           <tr>
                           <td>
                            <b>Originale</b> version (<xsl:value-of select="substring($extent, 3)"/>)  
                           </td>
                           <td>
                            <xsl:if test="contains($url_sound_bis,'wav')"><a href="{$url_sound_bis}"><img src="../../images/icones/wav.gif"/></a></xsl:if>
                            <xsl:if test="contains($url_sound_ter,'wav')"><a href="{$url_sound_ter}"><img src="../../images/icones/wav.gif"/></a></xsl:if>
                           </td>
                            </tr>
                            <tr><td><br/></td></tr>
                            <tr>
                            <td>
                            	<b>Wav/22Khz</b> version
                            </td>
                            <td>
                                 <a href="{$url_sound}"><img src="../../images/icones/wav.png"/></a>
                                 
                            </td>
                            </tr>
                            <tr>
                            <tr><td><br/></td></tr>
                            <td>
                            	<b>Mp3/44khz</b> version  
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
				 
                

                
               <br/> 


  
     
               
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

       <!--Affichage des case à cocher pour afficher ou cacher les infos de transcription, traduction pour un texte de type : TEXT-->
         <div class="row">
              
       
		<xsl:if test="TEXT">
         	
                
                
				    <!-- Cases a cocher  transcription par phrase -->
					<div class="col-xs-4">
                    
                    	<xsl:if test="TEXT/S/FORM">
						
								<xsl:choose>
								<xsl:when test="$aff_lang='fr'">
									Transcription par phrase
								</xsl:when>
								<xsl:otherwise> 
									Transcription by sentence
								</xsl:otherwise>
								</xsl:choose>
								
							<br/>
							<xsl:if test="TEXT/S/FORM[@kindOf='phono']">
							
								<input checked="checked" name="transcription_phono" onclick="javascript:showhide(this, 21, 'inline')"  type="checkbox"/>	
								<xsl:choose>
										<xsl:when test="$aff_lang='fr'">
											Phonologique
										</xsl:when>
										<xsl:otherwise> 
											Phonologic
										</xsl:otherwise>
									</xsl:choose>
										
							<br/>
							</xsl:if>
						
							<xsl:if test="TEXT/S/FORM[@kindOf='ortho']">
							
								<input checked="checked" name="transcription_ortho" onclick="javascript:showhide(this, 22, 'inline')"  type="checkbox"/>
								<xsl:choose>
									<xsl:when test="$aff_lang='fr'">
										Orthographique 
									</xsl:when>
									<xsl:otherwise> 
										Orthographic 
									</xsl:otherwise>
								</xsl:choose>
								
							<br/>
							</xsl:if>
						
							<xsl:if test="TEXT/S/FORM[@kindOf='phone']">
						
								<input checked="checked" name="transcription_phone" onclick="javascript:showhide(this, 23, 'inline')"  type="checkbox"/>
								<xsl:choose>
								<xsl:when test="$aff_lang='fr'">
									Phonétique 
								</xsl:when>
								<xsl:otherwise> 
									Phonetic 
								</xsl:otherwise>
							</xsl:choose>
								
							<br/>
							</xsl:if>
						
							<xsl:if test="TEXT/S/FORM[@kindOf='transliter']">
							
								<input checked="checked" name="transcription_translit" onclick="javascript:showhide(this, 24, 'inline')"  type="checkbox"/>
								<xsl:choose>
									<xsl:when test="$aff_lang='fr'">
										Translittéré 
									</xsl:when>
									<xsl:otherwise> 
										Transliterated 
									</xsl:otherwise>
								</xsl:choose>
								<br/>
							
							</xsl:if>
						
							<xsl:if test="TEXT/S/FORM[not(@kindOf)]">
							
							
								<input checked="checked" name="transcription" onclick="javascript:showhide(this, 20, 'inline')"  type="checkbox"/>
						
							</xsl:if>
						
                        </xsl:if>
                        <br/>
                        
                        <br/>
                     <!-- </div>-->
                      
                      <!-- Cases à cocher traductions par phrase -->
                      <!-- <div class="col-xs-4">  -->
                       			
                        <xsl:if test="TEXT/S/TRANSL">
						
								<xsl:choose>
									<xsl:when test="$aff_lang='fr'">
										Traduction par phrase  
									</xsl:when>
									<xsl:otherwise> 
										Translation by sentence
									</xsl:otherwise>
								</xsl:choose>
								<br/>
								<xsl:if test="TEXT/S/TRANSL[@xml:lang='fr']">
									
									<input checked="checked" name="translation_fr" onclick="javascript:showhide(this, 7, 'block')"  type="checkbox"/>
									fr 
									
								</xsl:if>
								
								<xsl:if test="TEXT/S/TRANSL[@xml:lang='en']">
									
									<input checked="checked" name="translation_en" onclick="javascript:showhide(this, 6, 'block')"  type="checkbox"/>
									en 
									
								</xsl:if>
                                <xsl:if test="TEXT/S/TRANSL[@xml:lang='it']">
									
									<input checked="checked" name="translation_it" onclick="javascript:showhide(this, 8, 'block')"  type="checkbox"/>
									it 
									
								</xsl:if>
                                <xsl:if test="TEXT/S/TRANSL[@xml:lang='de']">
									
									<input checked="checked" name="translation_de" onclick="javascript:showhide(this, 9, 'block')"  type="checkbox"/>
									de
									
								</xsl:if>
                                <xsl:if test="TEXT/S/TRANSL[@xml:lang='cn']">
									
									<input checked="checked" name="translation_cn" onclick="javascript:showhide(this, 10, 'block')"  type="checkbox"/>
									cn
									
								</xsl:if>
								<xsl:if test="TEXT/S/TRANSL[@xml:lang='vn']">
									
									<input checked="checked" name="translation_vi" onclick="javascript:showhide(this, 11, 'block')"  type="checkbox"/>
									vi									
								</xsl:if>
                                <xsl:if test="TEXT/S/TRANSL[@xml:lang='zh']">
									
									<input checked="checked" name="translation_zh" onclick="javascript:showhide(this, 12, 'block')"  type="checkbox"/>
									zh									
								</xsl:if>

                               
								
								<xsl:if test="TEXT/S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn' and @xml:lang!='zh']">
									<xsl:variable name="langue_autre" select="TEXT/S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn' and @xml:lang!='zh']/@xml:lang"/>
									<input checked="checked" name="translation_other" onclick="javascript:showhide(this, 15, 'block')" type="checkbox"/>
									<xsl:choose>
										<xsl:when test="$aff_lang='fr'">
											<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
										</xsl:when>
										<xsl:otherwise> 
											<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
										</xsl:otherwise>
									</xsl:choose>  
									
								</xsl:if>
							
						</xsl:if>
						
                        </div>
					
			
                   <!-- Cases a cocher transcription du texte -->
                  <div class="col-xs-4">
                	<xsl:choose>
                <xsl:when test="TEXT/FORM and not(TEXT/S)">
                    
                    	
         				
         						<xsl:choose>
         							<xsl:when test="$aff_lang='fr'">
         								Transcription du texte entier
         							</xsl:when>
         							<xsl:otherwise> 
         								Whole text transcription 
         							</xsl:otherwise>
         						</xsl:choose>
         						<br/>
         							<input name="trans_text_only" onclick="javascript:showhide(this, 33, 'block')"  type="checkbox"/>
         						
                  
                                
                               
                </xsl:when>
				    				
				<xsl:when test="TEXT/FORM | TEXT/S/FORM ">
         		
         		
         			
         				
         						<xsl:choose>
         							<xsl:when test="$aff_lang='fr'">
         								Transcription du texte complet
         							</xsl:when>
         							<xsl:otherwise> 
         								Whole text transcription 
         							</xsl:otherwise>
         						</xsl:choose>
         					<br/>
         					<xsl:if test="TEXT/FORM | TEXT/S/FORM ">
         						  
         							<input name="trans_text" onclick="javascript:showhide(this, 26, 'block')"  type="checkbox"/>
         						
         					</xsl:if>
         										
					</xsl:when>
                </xsl:choose>
                <!-- </div> -->
					
                    <br/>
                    <br/>
                    
                    <!-- Cases à cocher traduction du texte -->
                   <!-- <div class="col-xs-4"> -->
                       <xsl:choose>
                           <xsl:when test="TEXT/TRANSL and not(TEXT/S)">
                              
                                       <xsl:choose>
                                           <xsl:when test="$aff_lang='fr'">
                                               Traduction du texte en entier  
                                           </xsl:when>
                                           <xsl:otherwise> 
                                               Whole text translation
                                           </xsl:otherwise>
                                       </xsl:choose>
                                 
                                     <br/>  
                                       <input checked="checked" name="trad_text_only" onclick="javascript:showhide(this, 34, 'block')"  type="checkbox"/>
                                  
                                       
                           </xsl:when>
                           
                           <xsl:when test="TEXT/TRANSL or TEXT/S/TRANSL">
                     
         						<xsl:choose>
         							<xsl:when test="$aff_lang='fr'">
         								Traduction du texte complet  
         							</xsl:when>
         							<xsl:otherwise> 
         								Whole text translation
         							</xsl:otherwise>
         						</xsl:choose>
         					<br/>
         					<xsl:if test="TEXT/TRANSL[@xml:lang='fr']| TEXT/S/TRANSL[@xml:lang='fr']">
         					
         						<input name="trad_text_fr" onclick="javascript:showhide(this, 27, 'block')"  type="checkbox"/>
         						fr 
         				
         					</xsl:if>
         				
         					<xsl:if test="TEXT/TRANSL[@xml:lang='en'] | TEXT/S/TRANSL[@xml:lang='en']">
         					
         						<input name="trad_text_en" onclick="javascript:showhide(this, 28, 'block')"  type="checkbox"/>
         						en  
         					
         					</xsl:if>
                            
                            <xsl:if test="TEXT/TRANSL[@xml:lang='it'] | TEXT/S/TRANSL[@xml:lang='it']">
         					
         						<input name="trad_text_it" onclick="javascript:showhide(this, 29, 'block')"  type="checkbox"/>
         						it 
         					
         					</xsl:if>
                            
                            <xsl:if test="TEXT/TRANSL[@xml:lang='de'] | TEXT/S/TRANSL[@xml:lang='de']">
         					
         						<input name="trad_text_de" onclick="javascript:showhide(this, 30, 'block')"  type="checkbox"/>
         						de  
         					
         					</xsl:if>
                            <xsl:if test="TEXT/TRANSL[@xml:lang='cn'] | TEXT/S/TRANSL[@xml:lang='cn']">
         					
         						<input name="trad_text_cn" onclick="javascript:showhide(this, 31, 'block')"  type="checkbox"/>
         						cn 
         					
         					</xsl:if>
                            <xsl:if test="TEXT/TRANSL[@xml:lang='vn'] | TEXT/S/TRANSL[@xml:lang='vn']">
         					
         						<input name="trad_text_vi" onclick="javascript:showhide(this, 35, 'block')"  type="checkbox"/>
         						vi  
         					
         					</xsl:if>
                             <xsl:if test="TEXT/TRANSL[@xml:lang='zh'] | TEXT/S/TRANSL[@xml:lang='zh']">
         					
         						<input name="trad_text_vi" onclick="javascript:showhide(this, 36, 'block')"  type="checkbox"/>
         						zh 
         					
         					</xsl:if>

         				
         					<xsl:if test="TEXT/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn' and @xml:lang!='zh'] | TEXT/S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn' and @xml:lang!='zh']">
         					<xsl:variable name="langue_autre" select="TEXT/S/TRANSL/@xml:lang"/>
         						<input name="trad_text_other" onclick="javascript:showhide(this, 32, 'block')"  type="checkbox"/>
         						<xsl:choose>
         							<xsl:when test="$aff_lang='fr'">
         								<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
         							</xsl:when>
         							<xsl:otherwise> 
         								  <xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
         							</xsl:otherwise>
         						</xsl:choose>  
         					
         					</xsl:if>
         					
         			
                           </xsl:when>
                       </xsl:choose>
                   
                   </div>
			    
               
				<xsl:if test="TEXT/S/W[TRANSL or M/TRANSL] | TEXT/S/NOTE">			
				    
                    	<div class="col-xs-4">
				        <!-- Cases a cocher mot a mot -->
				        
         				<xsl:if test="TEXT/S/W[TRANSL or M/TRANSL]">
		         		
		         				<xsl:choose>
		         				<xsl:when test="$aff_lang='fr'">
		         					Mot à mot  
		         				</xsl:when>
		         				<xsl:otherwise> 
		         					Glosses 
		         				</xsl:otherwise>
		         			</xsl:choose>
		         			<br/>
		         				<input checked="checked" name="interlinear" onclick="javascript:showhide(this, 16, 'inline')" type="checkbox"/>
		         				
		         			
         					</xsl:if>
         				<!-- </div>-->
                        
                        <br/>
                        <br/>
                        
                        <!-- <div class="col-xs-4"> -->
						<!-- Cases à cocher notes -->
         				<xsl:if test="TEXT/S/NOTE">
         				
		         			<xsl:choose>
		         				<xsl:when test="$aff_lang='fr'">
		         					Notes 
		         				</xsl:when>
		         				<xsl:otherwise> 
		         					Notes
		         				</xsl:otherwise>
		         			</xsl:choose>
		         		
		         			
		         		<br/>
		         			<input name="note_info" onclick="javascript:showhide(this, 25, 'block')"  type="checkbox"/>
		         			
		         		
		         			
         				
         					</xsl:if>
         			
				        </div>
				</xsl:if>
                   
         	
        
         	
</xsl:if>     	
         	
         	
         	
         	
      <xsl:if test="WORDLIST">
         
         
         <div class="col-xs-4">
   									<xsl:choose>
         								<xsl:when test="$aff_lang='fr'">
         									Transcription
         								</xsl:when>
         								<xsl:otherwise> 
         									Transcription
         								</xsl:otherwise>
         							</xsl:choose>     							
         					<br/>
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='phono']">
         							
         								<input checked="checked" name="transcription_phono" onclick="javascript:showhide(this, 21, 'inline')"  type="checkbox"/>	
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Phonologique
         									</xsl:when>
         									<xsl:otherwise> 
         										Phonologic
         									</xsl:otherwise>
         								</xsl:choose>
         								
         						
         						</xsl:if>
         					
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='ortho']">
         						
         								<input checked="checked" name="transcription_ortho" onclick="javascript:showhide(this, 22, 'inline')"  type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Orthographique 
         									</xsl:when>
         									<xsl:otherwise> 
         										Orthographic 
         									</xsl:otherwise>
         								</xsl:choose>
         								
         						
         						</xsl:if>
         				
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='phone']">
         						
         								<input checked="checked" name="transcription_phone" onclick="javascript:showhide(this, 23, 'inline')"  type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Phonétique 
         									</xsl:when>
         									<xsl:otherwise> 
         										Phonetic 
         									</xsl:otherwise>
         								</xsl:choose>
         								
         						
         						</xsl:if>
         				
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='transliter']">
         							
         								<input checked="checked" name="transcription_translit" onclick="javascript:showhide(this, 24, 'inline')"  type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Translittéré 
         									</xsl:when>
         									<xsl:otherwise> 
         										Transliterated 
         									</xsl:otherwise>
         								</xsl:choose>
         								
         							
         						</xsl:if>
         				
         						<xsl:if test="WORDLIST/W/FORM[not(@kindOf)]">
         						
         								
         								<input checked="checked" name="transcription" onclick="javascript:showhide(this, 20, 'inline')"  type="checkbox"/>
         						
         						</xsl:if>
         				</div>
                    
                    <div class="col-xs-4">
         							<xsl:choose>
         								<xsl:when test="$aff_lang='fr'">
         									Traduction  
         								</xsl:when>
         								<xsl:otherwise> 
         									Translation
         								</xsl:otherwise>
         							</xsl:choose>
         					<br/>
         							<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='fr']">
         								
         								<input checked="checked" name="translation_fr" onclick="javascript:showhide(this, 7, 'block')"  type="checkbox"/>
         								fr 
         								
         							</xsl:if>
         							
         							<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='en']">
         								
         								<input checked="checked" name="translation_en" onclick="javascript:showhide(this, 6, 'block')"  type="checkbox"/>
         								en 
         								
         							</xsl:if>
									<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='it']">
         								
         								<input checked="checked" name="translation_it" onclick="javascript:showhide(this, 8, 'block')"  type="checkbox"/>
         								it
         								
         							</xsl:if>
									<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='de']">
         								
         								<input checked="checked" name="translation_de" onclick="javascript:showhide(this, 9, 'block')"  type="checkbox"/>
         								de
         								
         							</xsl:if>
									<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='cn']">
         								
         								<input checked="checked" name="translation_cn" onclick="javascript:showhide(this, 10, 'block')"  type="checkbox"/>
         								cn 
         								
         							</xsl:if>
									<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='vn']">
         								
         								<input checked="checked" name="translation_vn" onclick="javascript:showhide(this, 11, 'block')"  type="checkbox"/>
         								vn
         								
         							</xsl:if>
                                    <xsl:if test="WORDLIST/W/TRANSL[@xml:lang='zh']">
         								
         								<input checked="checked" name="translation_zh" onclick="javascript:showhide(this, 12, 'block')"  type="checkbox"/>
         								zh
         								
         							</xsl:if>
                                   <xsl:if test="WORDLIST/W/TRANSL[@xml:lang='khm-written']">
         								
         								<input checked="checked" name="translation_khm-written" onclick="javascript:showhide(this, 37, 'block')"  type="checkbox"/>
         								khm-written
         								
         							</xsl:if>
                                    <xsl:if test="WORDLIST/W/TRANSL[@xml:lang='khm-standard-modern']">
         								
         								<input checked="checked" name="translation_khm-standard-modern" onclick="javascript:showhide(this, 38, 'block')"  type="checkbox"/>
         								khm-standard-modern
         								
         							</xsl:if>
                                    <xsl:if test="WORDLIST/W/TRANSL[@xml:lang='khm-tateyleu']">
         								
         								<input checked="checked" name="translation_khm-tateyleu" onclick="javascript:showhide(this, 39, 'block')"  type="checkbox"/>
         								khm-tateyleu
         								
         							</xsl:if>
                                    
									
         							
         							<xsl:if test="WORDLIST/W/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn' and @xml:lang!='zh' and @xml:lang!='khm-written' and @xml:lang!='khm-standard-modern' and @xml:lang!='khm-tateyleu']">
         								<xsl:variable name="langue_autre" select="WORDLIST/W/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn' and @xml:lang!='zh' and @xml:lang!='khm-written' and @xml:lang!='khm-standard-modern' and @xml:lang!='khm-tateyleu']/@xml:lang"/>
         								<input checked="checked" name="translation_other" onclick="javascript:showhide(this, 15, 'block')" type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										<xsl:text>autres</xsl:text>     
         									</xsl:when>
         									<xsl:otherwise> 
         										<xsl:text>others</xsl:text>        
         									</xsl:otherwise>
         								</xsl:choose>  
         								
         							</xsl:if>
         			</div>
                    <div class="col-xs-4">			
         		<xsl:if test= "WORDLIST/W/NOTE">	
         				
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Notes 
         									</xsl:when>
         									<xsl:otherwise> 
         										Notes
         									</xsl:otherwise>
         								</xsl:choose>
         						<br/>
         									<input name="note_info" onclick="javascript:showhide(this, 25, 'block')"  type="checkbox"/>
         									
         							
         			</xsl:if>
         		</div>
      </xsl:if>   	
         	
       
         </div>
         
		</div>

         
               <xsl:if test="TEXT/S/W/M/@class='CL'">
               <div><br/><b>
               <xsl:choose>
					<xsl:when test="$aff_lang='fr'">
                      <!--Mots en italique = Mots empruntés-->
                      Mots en italique = Mots des langues de contact
                    </xsl:when>
                    <xsl:otherwise> 
                    	<!--Words in italics = Loan words-->
                        Words in italics = Words from contact languages
                    </xsl:otherwise>
             </xsl:choose>
             </b><br/></div>
               </xsl:if>
 
		<xsl:apply-templates select=".//TEXT|.//WORDLIST"/>
	</xsl:template>	
	
	
	<xsl:template match="TEXT">
		<table class="table-responsive" width="100%" border="1" cellspacing="0" cellpadding="0">
			<tr>
				<td>
					<table width="100%"  height="300px" border="0" cellpadding="5" cellspacing="0" class="it">
						<tbody> 
                       <xsl:choose>
                        <xsl:when test="FORM and not(S)">
                         <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trans_text_only">
								<xsl:for-each select="str:tokenize(FORM,'&#x0A;')">
									<div><xsl:value-of select="."/></div>
								</xsl:for-each>
                            
                            </div></td></tr>
                        </xsl:when>
                       <xsl:when test="FORM">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trans_text"><xsl:value-of select="FORM"/></div></td></tr>
                        </xsl:when>
                         
                       <xsl:when test="S/FORM">
                           <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trans_text"><xsl:for-each select="S"><xsl:value-of select="FORM"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                          
                       
                        </xsl:choose>
                        
                        <xsl:choose>
                        <xsl:when test="TRANSL and not(S)">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_only"><xsl:for-each select="str:tokenize(TRANSL,'&#x0A;')">
									<div><xsl:value-of select="."/></div>
                                    
								</xsl:for-each></div></td></tr>
                        </xsl:when>
                        <xsl:when test="TRANSL[@xml:lang='fr']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_fr"><xsl:value-of select="TRANSL[@xml:lang='fr']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='fr']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_fr"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='fr']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                        <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='en']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_en"><xsl:value-of select="TRANSL[@xml:lang='en']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='en']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_en"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='en']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                       <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='it']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_it"><xsl:value-of select="TRANSL[@xml:lang='it']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='it']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_it"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='it']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                       <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='de']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_de"><xsl:value-of select="TRANSL[@xml:lang='de']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='de']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_de"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='de']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                       <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='cn']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_cn"><xsl:value-of select="TRANSL[@xml:lang='cn']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='cn']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_cn"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='cn']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                       <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='vn']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_vn"><xsl:value-of select="TRANSL[@xml:lang='vn']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='vn']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_vn"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='vn']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                        <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='zh']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_zh"><xsl:value-of select="TRANSL[@xml:lang='zh']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='zh']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_zh"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='zh']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                        <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_other"><xsl:value-of select="TRANSL[@xml:lang='cn']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn']">
                        <tr class="transcriptTable"><td class="segmentInfo" width="25"></td><td class="segmentContent"><div class="trad_text_other"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                        
                        <!-- Cree la numerotation des phrases : Si (phrase numero i)-->
							<xsl:for-each select="S">
								<tr class="transcriptTable">
									<td class="segmentInfo" width="25">S<xsl:value-of select="position()"/>
									</td>
									<td class="segmentContent annotations" id="{@id}">
										
                                        
											<a href="javascript:boutonStop()">
												<img src="../../images/icones/stop.gif" alt="stop"/>
											</a>
                                            <xsl:text> </xsl:text>
                                            
                                            <xsl:if test="AUDIO">
											<a href="javascript:playFrom('{@id}')">
												<img src="../../images/icones/play.gif" alt="écouter"/>
											</a>
                                          </xsl:if>
											<!-- affiche le nom du locuteur si il y en a -->
											<xsl:if test="((@who) and (not(@who='')) and (not(@who=ancestor::TEXT/S[number(position())-1]/@who)))">
												<span class="speaker">
													<xsl:value-of select="@who"/><xsl:text>: </xsl:text>
												</span>
											</xsl:if>
											
										
                                        <xsl:if test="FORM">
                                       
                                        	<div class="word_sentence">
                                            
                                        <!-- Recuperation de la phrase -->
                                        <xsl:for-each select="FORM">
                                        	<xsl:choose>
                                        		<xsl:when test="@kindOf">
                                        	<xsl:if test="@kindOf='phono'">
                                        		<div class="transcription_phono">
                                        		 <xsl:value-of select="."/><br/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                        	<xsl:if test="@kindOf='ortho'">
                                        		<div class="transcription_ortho">
                                        		<xsl:value-of select="."/><br />
                                        		</div>
                                        		
                                        	</xsl:if>
                                        	<xsl:if test="@kindOf='phone'">
                                        		<div class="transcription_phone">
                                        		<xsl:value-of select="."/><br />
                                        		</div>
                                        		
                                        	</xsl:if>
                                        	<xsl:if test="@kindOf='transliter'">
                                        		<div class="transcription_translit">
                                        		<xsl:value-of select="."/><br />
                                        		</div>
                                        		
                                        	</xsl:if>
                                        		</xsl:when>
                                        		<xsl:otherwise>
                                                <div class="transcription">
                                        			<xsl:value-of select="."/><br />
                                                    </div>
                                        		</xsl:otherwise>
                                        	</xsl:choose>
                                        	
                                        	
                                        </xsl:for-each>
											</div>
                                         
                                        
                                        </xsl:if>
                                        
                                        
                                        <!-- Cas ou W ou M contiennent la balise FORM et ou S ne contient pas la balise FORM -->
                                        <xsl:if test="not(FORM) and (W/FORM or W/M/FORM)">
                                      	
                                       	
                                                    
                                       <!-- Recuperation des mots ou morphemes puis concatenation pour former une phrase --> 
                                        <xsl:for-each select="W">
											
                                        
                                          
                                        	<div class="transcription" >
															<xsl:choose>
																
																
																	<xsl:when test="FORM">
																		<xsl:value-of select="FORM"/>
                                                                        <xsl:text> </xsl:text>
																	</xsl:when>
																	<xsl:otherwise>
																		<xsl:choose>
																			<xsl:when test="M/@class='CL'">
																				<i>         
																					<xsl:for-each select="M/FORM">
																						<xsl:value-of select="."/>
																						<xsl:if test="position()!=last()">-</xsl:if>
																					</xsl:for-each>
                                                                                    <xsl:text> </xsl:text>
																					
																				</i> 
																			</xsl:when>
																			<xsl:otherwise>  
                                                                           			 <xsl:for-each select="M/FORM">
																					 <xsl:value-of select="."/>
																					 <xsl:if test="position()!=last()">-</xsl:if>
																					 </xsl:for-each>  
                                                                                     <xsl:text> </xsl:text>
                                                                             </xsl:otherwise>
																		</xsl:choose>
																	</xsl:otherwise>
																	
															</xsl:choose>
														</div>
                                                        
                                                        
                                     
                                          </xsl:for-each>
                                     
                                      
											
                                        </xsl:if>
                                       
                                   
                                       
                                      <br /> 
                                 
										<!-- Recupere les mots avec leur glose -->
                                        <xsl:if test="(W/FORM and W/TRANSL) or (W/M/FORM and W/M/TRANSL) or (W/FORM) ">
                                        	
                                       	<xsl:for-each select="W">
                                       
                                     
                                       
                                           <table class="word">
												<tbody>
													<tr>
														<td class="word_form">
													
                                                    
										
                                        				<xsl:choose>
																<xsl:when test="M/FORM">
																	<xsl:choose>
																		<xsl:when test="M/@class='CL'">
																			<i>
																				<xsl:for-each select="M/FORM">
																					<xsl:value-of select="."/>
																					<xsl:if test="position()!=last()">-</xsl:if>
																				</xsl:for-each>
																				
																			</i>
																		</xsl:when>
																		<xsl:otherwise>  

																		<xsl:for-each select="M/FORM">
																					<xsl:value-of select="."/>
																					<xsl:if test="position()!=last()">-</xsl:if>
																				</xsl:for-each>

																		</xsl:otherwise>
																	</xsl:choose>
                                                                    </xsl:when>
																
																<xsl:otherwise>
                                                               
                                                                <xsl:value-of select="FORM"/>
																	
																</xsl:otherwise>
																
															</xsl:choose>
                                            
                                           
                                            
                                              		</td>
													</tr>
															
                                                                
                                                      <tr>
                                                   
														<td class="word_transl" valign="top">
														
															
															<xsl:choose>
																<xsl:when test="M/TRANSL">
															
                                                           				
															
																		<xsl:for-each select="M/TRANSL">
																			<xsl:value-of select="."/>
																			<xsl:if test="position()!=last()">-</xsl:if>
																		</xsl:for-each>
																
																	
																
																	<xsl:if test="TRANSL">
																		<br/><xsl:for-each select="TRANSL">
																			<xsl:value-of select="."/><br/>
																			<xsl:if test="position()!=last()">-</xsl:if>
																		</xsl:for-each>
																		
																	</xsl:if>
															</xsl:when>
                                                            <xsl:when test="TRANSL and not(M/TRANSL)">
															
																		<xsl:for-each select="TRANSL">
																			<xsl:value-of select="."/><br/>
																			<xsl:if test="position()!=last()">-</xsl:if>
																		</xsl:for-each>
																		
																	
															</xsl:when>
																<xsl:otherwise>
																	
																</xsl:otherwise>
															</xsl:choose>
														</td>
                                                        </tr>
																
													</tbody>

											</table>
                                            
													</xsl:for-each>
                                                   
                                                 <br />
                                                 <br />
                                        </xsl:if>
                                        
                                        
                                       
                                     
                                    <xsl:if test="TRANSL">
                                        
                                    <!-- Recupere la traduction si il en existe une -->
                                        
									
                                      
                                      <xsl:for-each select="TRANSL[@xml:lang='en']">
											
                                             
                                            
                                            
                                            <div class="translation_en">
                                           <!-- <span style="color:#000">[EN] </span>-->
												<xsl:value-of select="."/><br/><br/>
                                                </div>
											
                                            
                                          </xsl:for-each> 
                                          
                                          <xsl:for-each select="TRANSL[@xml:lang='fr']">
                                         
                                          
											<div class="translation_fr">
                                           <!-- <span style="color:#000">[FR] </span>-->
												<xsl:value-of select="."/><br/><br/>
											</div>
                                            
                                          </xsl:for-each> 
                                          
                                          <xsl:for-each select="TRANSL[@xml:lang='it']">
                                         
                                          
											<div class="translation_it">
                                           <!-- <span style="color:#000">[FR] </span>-->
												<xsl:value-of select="."/><br/><br/>
											</div>
                                            
                                          </xsl:for-each> 
                                          
                                          <xsl:for-each select="TRANSL[@xml:lang='de']">
                                         
                                          
											<div class="translation_de">
                                        
												<xsl:value-of select="."/><br/><br/>
											</div>
                                            
                                          </xsl:for-each> 
                                          
                                          <xsl:for-each select="TRANSL[@xml:lang='cn']">
                                         
                                          
											<div class="translation_cn">
                                     
												<xsl:value-of select="."/><br/><br/>
											</div>
                                            
                                          </xsl:for-each> 
                                          
                                           <xsl:for-each select="TRANSL[@xml:lang='vn']">
                                         
                                          
											<div class="translation_vn">
                                     
												<xsl:value-of select="."/><br/><br/>
											</div>
                                            
                                          </xsl:for-each> 
                                          
                                           <xsl:for-each select="TRANSL[@xml:lang='zh']">
                                         
                                          
											<div class="translation_zh">
                                     
												<xsl:value-of select="."/><br/><br/>
											</div>
                                            
                                          </xsl:for-each> 
                                    
                                          
                                          <xsl:for-each select="TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn' and @xml:lang!='vn' and @xml:lang!='zh']">
                                      
											<div class="translation_other">

												<xsl:value-of select="."/><br/><br/>
											</div>
                                        
                                          </xsl:for-each>
                                         
                                        </xsl:if>
                                        
                                     
                                        <div class="note_info">
                                    <xsl:for-each select="NOTE/@message">
										<xsl:sort select="@xml:lang"/>
										<br/>
											<em>NOTE : <xsl:value-of select="."/></em>
                                           
										
									</xsl:for-each>
                                    </div>
                                   
                                    
                                        
									</td>
                                    </tr>
								
                               
                              
                                   
							</xsl:for-each>
                           
                            
						</tbody>
					</table>
				</td>
			</tr>
		</table>
	</xsl:template>
	<xsl:template match="WORDLIST">
   
		<table width="100%" border="0" cellspacing="0" cellpadding="0">
			<tr>
				<td>
					<table width="100%" border="1" cellpadding="5" cellspacing="0" class="it">
						<tbody>
                      
							<xsl:for-each select="W">
								<tr class="transcriptTable">
									<td class="segmentInfo" width="25">W<xsl:value-of select="position()"/></td>
									<td id="{@id}">
                                    
                                    
                                  
                                                        <a href="javascript:boutonStop()">
														<img src="../../images/icones/stop.gif" alt="stop"/>
														</a>
                                                        <xsl:text> </xsl:text>
														<a href="javascript:playFrom_W('{@id}')">
														<img src="../../images/icones/play.gif" alt="écouter"/>
														</a>
                                                     
									</td>
                                   
                                  
                                   
                                 
                                    <xsl:if test="FORM">
                                        	<div class="word_sentence">
                                            <td class="word_form_list">
                                        <!-- Recuperation de la phrase -->
                                        <xsl:for-each select="FORM">
                                        
                                        	<xsl:choose>
                                        		<xsl:when test="@kindOf">
                                        	<xsl:if test="@kindOf='phono'">
                                        		<div class="transcription_phono">
                                        		 <xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                        	<xsl:if test="@kindOf='ortho'">
                                        		<div class="transcription_ortho">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                        	<xsl:if test="@kindOf='phone'">
                                        		<div class="transcription_phone">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                        	<xsl:if test="@kindOf='transliter'">
                                        		<div class="transcription_translit">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                        		</xsl:when>
                                        		<xsl:otherwise>
                                                <div class="transcription">
                                        			<xsl:value-of select="."/>
                                                    </div>
                                        		</xsl:otherwise>
                                        	</xsl:choose>
                                        	
                                        	<br />
                                            
                                        </xsl:for-each>
                                        </td>
											</div>
                                         
                                        
                                        </xsl:if>
                                  
                                 
                                       <xsl:if test="TRANSL">
                                        	
                                        <!-- Recuperation de la phrase -->
                                        <xsl:for-each select="TRANSL">
                                        <td class="word_transl_list">
                                        	<xsl:choose>
                                            <xsl:when test="(@xml:lang='fr') or (@xml:lang='en') or (@xml:lang='it') or (@xml:lang='de') or (@xml:lang='cn') or (@xml:lang='vn') or (@xml:lang='zh') or (@xml:lang='khm-written') or (@xml:lang='khm-standard-modern') or (@xml:lang='khm-tateyleu')">
											
                                        	<xsl:if test="@xml:lang='en'">
                                        		<div class="translation_en">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                        		
                                        	<xsl:if test="@xml:lang='fr'">
                                        		<div class="translation_fr">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
											<xsl:if test="@xml:lang='it'">
                                        		<div class="translation_it">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
											<xsl:if test="@xml:lang='de'">
                                        		<div class="translation_de">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
											<xsl:if test="@xml:lang='cn'">
                                        		<div class="translation_cn">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
											<xsl:if test="@xml:lang='vn'">
                                        		<div class="translation_vn">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                            <xsl:if test="@xml:lang='zh'">
                                        		<div class="translation_zh">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                            <xsl:if test="@xml:lang='khm-written'">
                                        		<div class="translation_khm-written">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                            <xsl:if test="@xml:lang='khm-standard-modern'">
                                        		<div class="translation_khm-standard-modern">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                            <xsl:if test="@xml:lang='khm-tateyleu'">
                                        		<div class="translation_khm-tateyleu">
                                        		<xsl:value-of select="."/>
                                        		</div>
                                        		
                                        	</xsl:if>
                                        		
                                     
                                        		
                                        	
                                        		</xsl:when>
                                        		<xsl:otherwise>
                                                <div class="translation_other">
                                        			<xsl:value-of select="."/>
                                                    </div>
                                        		</xsl:otherwise>
                                        	</xsl:choose>
                                        	
                                        	<br />
                                            </td>
                                        </xsl:for-each>
											
                                         
                                        
                                        </xsl:if>
                                   
                                <xsl:if test="NOTE/@message">
                                       <td class="note_info">
                                   <xsl:for-each select="NOTE/@message">
										<xsl:sort select="@xml:lang"/>
										<em><xsl:value-of select="."/><br/></em>
									</xsl:for-each>
                                    	</td>
                                   </xsl:if>
								</tr>
                                
							</xsl:for-each>
						</tbody>
					</table>
				</td>
			</tr>
		</table>
	</xsl:template>

            
<xsl:template name="player-audio_html5">
<xsl:param name="mediaUrl_wav" select="''"/>
<xsl:param name="mediaUrl_mp3" select="''"/>
		<script type="text/javascript">
		var idlist = Array();
		var timelist_starts = Array();
		var timelist_ends = Array();
				<xsl:for-each select="//TEXT/S|WORDLIST/W">
				idlist.push("<xsl:value-of select="@id"/>");
				timelist_starts.push(<xsl:value-of select="floor(number(AUDIO/@start)*1000)"/>);
				timelist_ends.push(<xsl:value-of select="floor(number(AUDIO/@end)*1000)"/>);
				</xsl:for-each>
		</script>
		<audio controls="controls" id="player" name="player">
			<source src="{$mediaUrl_mp3}" type="audio/mpeg"/>
			<source src="{$mediaUrl_wav}" type="audio/x-wav"/>
			Your browser does not support the audio tag 
		</audio>
       <xsl:choose>
		<xsl:when test="$aff_lang='fr'">
                        	<span style="margin-left:10px">Lecture en continu :</span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>
                        </xsl:when>
                        <xsl:otherwise> 
                    		<span style="margin-left:10px">Continuous playing:</span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>
                        </xsl:otherwise>
                        </xsl:choose>
		<script type="text/javascript" src="js/showhide.js">.</script>
		<script type="text/javascript" src="js/html5PlayerManager.js">.</script>
		
</xsl:template>


<xsl:template name="player-video_html5">
<xsl:param name="mediaUrl_ogg" select="''"/>
<xsl:param name="mediaUrl_mp4" select="''"/>

		<video controls="controls" id="player" name="player"  width="640" height="360">
       		<source src="{$mediaUrl_ogg}" type="video/ogg"/>
        	<source src="{$mediaUrl_mp4}" type="video/mp4"/>
			
			Your browser does not support the audio tag 
		</video>
</xsl:template>

    
</xsl:stylesheet>