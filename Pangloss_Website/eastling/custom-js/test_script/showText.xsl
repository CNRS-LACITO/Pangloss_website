<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  	xmlns:php="http://php.net/xsl" 
    xmlns:xi="http://www.w3.org/2001/XInclude"
	xmlns:xalan="http://xml.apache.org/xalan"
	exclude-result-prefixes="xi xalan"
	version="1.0">
	
    <xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>

	<!--<xsl:output method="html"
doctype-system="about:legacy-compat" indent="yes"/>-->
		<xsl:param name="titre" select="''"/>
		<xsl:param name="url_sound_wav" select="''"/>
        <xsl:param name="url_sound_mp3" select="''"/>
        <xsl:param name="navigator" select="''"/>
        <xsl:param name="chercheurs" select="''"/>
        <xsl:param name="locuteurs" select="''"/>
		<xsl:param name="lg" select="''"/>
        <xsl:param name="lg_rect" select="''"/>
        <xsl:param name="lg_code" select="''"/>
        <xsl:param name="id" select="''"/>
        <xsl:param name="sponsor"  select="''"/>
        <xsl:param name="date_sound" select="''"/>
        <xsl:param name="date_text" select="''"/>
		<xsl:param name="url_text" select="''"/>
		<xsl:param name="aff_lang" select="'*'"/>
        <xsl:param name="mediaUrl"  select="''"/>
	<!-- ******************************************************** -->

	<xsl:template match="/">
        <div align="right">
    		<a target="_blank" href="citation.php?titre={$titre}&amp;lg={$lg}&amp;chercheurs={$chercheurs}&amp;url_text={$url_text}&amp;url_sound={$url_sound_wav}&amp;id={$id}&amp;date_sound={$date_sound}&amp;date_text={$date_text}&amp;sponsor={$sponsor}" onClick="window.open(this.href,'popupLink','width=600,height=100,scrollbars=yes,resizable=yes',1).focus();return false"><b><img src="../../images/icones/citation.jpg" width="77" height="26" /></b></a>
    	</div>
		
        <div style="margin-left: 5px;">
			<h2 align="center"><strong style="font-size:16px">  <xsl:value-of select="$titre"/>    <a href="show_metadatas.php?id={$id}&amp;lg={$lg}"
                target="_blank"
                onClick="window.open(this.href,'popup_lang1','width=500,height=300,scrollbars=yes,resizable=yes',1).focus();return false"><img class="sansBordure" src="../../images/icones/info_marron.jpg"/> </a>
                 </strong>
            
            <br/>
            
            
         
            
           			 <xsl:choose>
						<xsl:when test="$aff_lang='fr'">
                        	Langue : 
                        </xsl:when>
                        <xsl:otherwise> 
                    		Language : 
                        </xsl:otherwise>
                    </xsl:choose>
				
                
                <a href="../../ALC/Languages/{$lg_rect}_popup.htm" target="_blank" onClick="window.open(this.href,'popupLink','width=400,height=400,scrollbars=yes,resizable=yes',1).focus();return false"><xsl:value-of select="$lg"/></a>
                
               <br/> 
	<br/>
   <table width="100%">
    <tr>
    <td align="left">
    <xsl:if test="$chercheurs"> 
    				<xsl:choose>
						<xsl:when test="$aff_lang='fr'">
                        	Chercheur(s) : 
                        </xsl:when>
                        <xsl:otherwise> 
                    		Researcher(s) : 
                        </xsl:otherwise>
                    </xsl:choose>
    
    				<span style="color:#333"><xsl:value-of select="$chercheurs"/></span>
    </xsl:if>
    </td>
    <td align="right">
    <xsl:if test="$locuteurs">
   				 <xsl:choose>
   				 <xsl:when test="$aff_lang='fr'">
                        	Locuteur(s) :
                        </xsl:when>
                        <xsl:otherwise> 
                    		Speaker(s) :
                        </xsl:otherwise>
                    </xsl:choose> 
                    
                    <span style="color:#333"><xsl:value-of select="$locuteurs"/></span>
    </xsl:if>
    </td>
    </tr>   
    </table>
   
			</h2>
            
                   
         <br />

        
       <div>
           <xsl:call-template name="player-audio_html5">
				<xsl:with-param name="mediaUrl_wav" select="$url_sound_wav"/>
                 <xsl:with-param name="mediaUrl_mp3" select="$url_sound_mp3"/>
			</xsl:call-template>
								
		</div>
            
                   
        
       
       <!--Affichage des case à cocher pour afficher ou cacher les infos de transcription, traduction pour un texte de type : TEXT-->
         <div>
            
        
<xsl:if test="TEXT">
         	<table width="100%">             
			<tr>

				<td>
					<table>
                    	<xsl:if test="TEXT/S/FORM">
						<tr>
							<th>
								<xsl:choose>
								<xsl:when test="$aff_lang='fr'">
									Transcription par phrase
								</xsl:when>
								<xsl:otherwise> 
									Transcription by sentence
								</xsl:otherwise>
								</xsl:choose>
								</th>
						</tr>
						<tr>
							<xsl:if test="TEXT/S/FORM[@kindOf='phono']">
							<td>
								<input checked="checked" name="transcription_phono" onclick="javascript:showhide(this, 17, 'inline-block')"  type="checkbox"/>	
								<xsl:choose>
										<xsl:when test="$aff_lang='fr'">
											Phonologique
										</xsl:when>
										<xsl:otherwise> 
											Phonologic
										</xsl:otherwise>
									</xsl:choose>
										
							</td>
							</xsl:if>
						</tr>
						<tr>
							<xsl:if test="TEXT/S/FORM[@kindOf='ortho']">
							<td>
								<input checked="checked" name="transcription_ortho" onclick="javascript:showhide(this, 18, 'inline-block')"  type="checkbox"/>
								<xsl:choose>
									<xsl:when test="$aff_lang='fr'">
										Orthographique 
									</xsl:when>
									<xsl:otherwise> 
										Orthographic 
									</xsl:otherwise>
								</xsl:choose>
								
							</td>
							</xsl:if>
						</tr>
						<tr>
							<xsl:if test="TEXT/S/FORM[@kindOf='phone']">
							<td>
								<input checked="checked" name="transcription_phone" onclick="javascript:showhide(this, 19, 'inline-block')"  type="checkbox"/>
								<xsl:choose>
								<xsl:when test="$aff_lang='fr'">
									Phonétique 
								</xsl:when>
								<xsl:otherwise> 
									Phonetic 
								</xsl:otherwise>
							</xsl:choose>
								
							</td>
							</xsl:if>
						</tr>
						<tr>
							<xsl:if test="TEXT/S/FORM[@kindOf='transliter']">
							<td>
								<input checked="checked" name="transcription_translit" onclick="javascript:showhide(this, 20, 'inline-block')"  type="checkbox"/>
								<xsl:choose>
									<xsl:when test="$aff_lang='fr'">
										Translittéré 
									</xsl:when>
									<xsl:otherwise> 
										Transliterated 
									</xsl:otherwise>
								</xsl:choose>
								
							</td>
							</xsl:if>
						</tr>
						<tr>
							<xsl:if test="TEXT/S/FORM[not(@kindOf)]">
							<td>
							
								<input checked="checked" name="transcription" onclick="javascript:showhide(this, 16, 'inline-block')"  type="checkbox"/>
							</td>
							</xsl:if>
						</tr>
						<tr><td><br/> </td></tr>
                        </xsl:if>						
                        <xsl:if test="TEXT/S/TRANSL">
						<tr>
							<th> 
								<xsl:choose>
									<xsl:when test="$aff_lang='fr'">
										Traduction par phrase  
									</xsl:when>
									<xsl:otherwise> 
										Translation by sentence
									</xsl:otherwise>
								</xsl:choose>
							</th>
						</tr>
						<tr>
							<td>
								<xsl:if test="TEXT/S/TRANSL[@xml:lang='fr']">
									
									<input checked="checked" name="translation_fr" onclick="javascript:showhide(this, 7, 'block')"  type="checkbox"/>
									FR 
									
								</xsl:if>
								
								<xsl:if test="TEXT/S/TRANSL[@xml:lang='en']">
									
									<input checked="checked" name="translation_en" onclick="javascript:showhide(this, 6, 'block')"  type="checkbox"/>
									EN 
									
								</xsl:if>
                                <xsl:if test="TEXT/S/TRANSL[@xml:lang='it']">
									
									<input checked="checked" name="translation_it" onclick="javascript:showhide(this, 8, 'block')"  type="checkbox"/>
									IT 
									
								</xsl:if>
                                <xsl:if test="TEXT/S/TRANSL[@xml:lang='de']">
									
									<input checked="checked" name="translation_de" onclick="javascript:showhide(this, 9, 'block')"  type="checkbox"/>
									DE
									
								</xsl:if>
                                <xsl:if test="TEXT/S/TRANSL[@xml:lang='cn']">
									
									<input checked="checked" name="translation_cn" onclick="javascript:showhide(this, 10, 'block')"  type="checkbox"/>
									CN
									
								</xsl:if>
								
								<xsl:if test="TEXT/S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn']">
									<xsl:variable name="langue_autre" select="TEXT/S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn']/@xml:lang"/>
									<input checked="checked" name="translation_other" onclick="javascript:showhide(this, 11, 'block')" type="checkbox"/>
									<xsl:choose>
										<xsl:when test="$aff_lang='fr'">
											<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
										</xsl:when>
										<xsl:otherwise> 
											<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
										</xsl:otherwise>
									</xsl:choose>  
									
								</xsl:if>
							</td>
						</tr>
						</xsl:if>
					</table>	
				</td>
									
				<xsl:if test="TEXT/FORM | TEXT/S/FORM">
         		<td>
         		
         			<table>	
         				<tr>
         					<th>
         						<xsl:choose>
         							<xsl:when test="$aff_lang='fr'">
         								Transcription du texte complet
         							</xsl:when>
         							<xsl:otherwise> 
         								Whole text transcription 
         							</xsl:otherwise>
         						</xsl:choose>
         					</th>
         				</tr>
         				<tr>
         					<xsl:if test="TEXT/FORM | TEXT/S/FORM">
         						<td>  
         							<input name="trans_text" onclick="javascript:showhide(this, 22, 'inline')"  type="checkbox"/>
         						</td>
         					</xsl:if>
         				</tr>
         				<tr><td><br/> </td></tr>						
         				<tr>
         					<th> 
         						<xsl:choose>
         							<xsl:when test="$aff_lang='fr'">
         								Traduction du texte complet  
         							</xsl:when>
         							<xsl:otherwise> 
         								Whole text translation
         							</xsl:otherwise>
         						</xsl:choose>
         					</th>
         				</tr>
         				<tr>
         					<td>
         					<xsl:if test="TEXT/TRANSL[@xml:lang='fr']| TEXT/S/TRANSL[@xml:lang='fr']">
         					
         						<input name="trad_text_fr" onclick="javascript:showhide(this, 23, 'block')"  type="checkbox"/>
         						FR 
         				
         					</xsl:if>
         				
         					<xsl:if test="TEXT/TRANSL[@xml:lang='en'] | TEXT/S/TRANSL[@xml:lang='en']">
         					
         						<input name="trad_text_en" onclick="javascript:showhide(this, 24, 'block')"  type="checkbox"/>
         						EN  
         					
         					</xsl:if>
                            
                            <xsl:if test="TEXT/TRANSL[@xml:lang='it'] | TEXT/S/TRANSL[@xml:lang='it']">
         					
         						<input name="trad_text_it" onclick="javascript:showhide(this, 25, 'block')"  type="checkbox"/>
         						IT 
         					
         					</xsl:if>
                            
                            <xsl:if test="TEXT/TRANSL[@xml:lang='de'] | TEXT/S/TRANSL[@xml:lang='de']">
         					
         						<input name="trad_text_de" onclick="javascript:showhide(this, 26, 'block')"  type="checkbox"/>
         						DE  
         					
         					</xsl:if>
                            <xsl:if test="TEXT/TRANSL[@xml:lang='cn'] | TEXT/S/TRANSL[@xml:lang='cn']">
         					
         						<input name="trad_text_cn" onclick="javascript:showhide(this, 27, 'block')"  type="checkbox"/>
         						CN  
         					
         					</xsl:if>
         				
         					<xsl:if test="TEXT/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn'] | TEXT/S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn']">
         					<xsl:variable name="langue_autre" select="TEXT/S/TRANSL/@xml:lang"/>
         						<input name="trad_text_other" onclick="javascript:showhide(this, 28, 'block')"  type="checkbox"/>
         						<xsl:choose>
         							<xsl:when test="$aff_lang='fr'">
         								<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
         							</xsl:when>
         							<xsl:otherwise> 
         								  <xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
         							</xsl:otherwise>
         						</xsl:choose>  
         					
         					</xsl:if>
         					</td>
         				</tr>
         			</table>	
         		
         		</td>
				</xsl:if>	
				<xsl:if test="TEXT/S/W[TRANSL or M/TRANSL] | TEXT/S/NOTE">			
         		<td>
         			<table>
         				<xsl:if test="TEXT/S/W[TRANSL or M/TRANSL]">
		         		<tr>
		         			<th>
		         				<xsl:choose>
		         				<xsl:when test="$aff_lang='fr'">
		         					Mot à mot 
		         				</xsl:when>
		         				<xsl:otherwise> 
		         					Glosses
		         				</xsl:otherwise>
		         			</xsl:choose>
		         			</th>
		         			
		         			<td>
		         				<input checked="checked" name="interlinear" onclick="javascript:showhide(this, 12, 'inline-block')" type="checkbox"/>
		         				
		         			</td>
		         			
		         		</tr>
         					</xsl:if>
         				<tr><td><br/> </td></tr>
         				<tr><td><br/> </td></tr>
         				<xsl:if test="TEXT/S/NOTE">
         				<tr>
		         		<th>
		         			<xsl:choose>
		         				<xsl:when test="$aff_lang='fr'">
		         					Notes 
		         				</xsl:when>
		         				<xsl:otherwise> 
		         					Notes
		         				</xsl:otherwise>
		         			</xsl:choose>
		         		</th>
		         			
		         		<td>
		         			<input name="note_info" onclick="javascript:showhide(this, 21, 'block')"  type="checkbox"/>
		         			
		         		</td>
		         			
         				</tr>
         					</xsl:if>
         			</table>
         		</td>
				</xsl:if>
         	</tr>
         	
         </table>
         	
</xsl:if>     	
         	
         	
         	
         	
      <xsl:if test="WORDLIST">
         	<table width="100%">             
         		<tr>
         			
         			<td>
         				<table>
         					<tr>
         						<th align="left">
         							<xsl:choose>
         								<xsl:when test="$aff_lang='fr'">
         									Transcription
         								</xsl:when>
         								<xsl:otherwise> 
         									Transcription
         								</xsl:otherwise>
         							</xsl:choose>
         						</th>
         					</tr>
         					<tr>
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='phono']">
         							<td>
         								<input checked="checked" name="transcription_phono" onclick="javascript:showhide(this, 17, 'inline')"  type="checkbox"/>	
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Phonologique
         									</xsl:when>
         									<xsl:otherwise> 
         										Phonologic
         									</xsl:otherwise>
         								</xsl:choose>
         								
         							</td>
         						</xsl:if>
         					</tr>
         					<tr>
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='ortho']">
         							<td>
         								<input checked="checked" name="transcription_ortho" onclick="javascript:showhide(this, 18, 'inline')"  type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Orthographique 
         									</xsl:when>
         									<xsl:otherwise> 
         										Orthographic 
         									</xsl:otherwise>
         								</xsl:choose>
         								
         							</td>
         						</xsl:if>
         					</tr>
         					<tr>
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='phone']">
         							<td>
         								<input checked="checked" name="transcription_phone" onclick="javascript:showhide(this, 19, 'inline')"  type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Phonétique 
         									</xsl:when>
         									<xsl:otherwise> 
         										Phonetic 
         									</xsl:otherwise>
         								</xsl:choose>
         								
         							</td>
         						</xsl:if>
         					</tr>
         					<tr>
         						<xsl:if test="WORDLIST/W/FORM[@kindOf='transliter']">
         							<td>
         								<input checked="checked" name="transcription_translit" onclick="javascript:showhide(this, 20, 'inline')"  type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Translittéré 
         									</xsl:when>
         									<xsl:otherwise> 
         										Transliterated 
         									</xsl:otherwise>
         								</xsl:choose>
         								
         							</td>
         						</xsl:if>
         					</tr>
         					<tr>
         						<xsl:if test="WORDLIST/W/FORM[not(@kindOf)]">
         							<td>
         								
         								<input checked="checked" name="transcription" onclick="javascript:showhide(this, 16, 'inline')"  type="checkbox"/>
         							</td>
         						</xsl:if>
         					</tr>
         					<tr><td><br/> </td></tr>						
         					<tr>
         						<th align="left"> 
         							<xsl:choose>
         								<xsl:when test="$aff_lang='fr'">
         									Traduction  
         								</xsl:when>
         								<xsl:otherwise> 
         									Translation
         								</xsl:otherwise>
         							</xsl:choose>
         						</th>
         					</tr>
         					<tr>
         						<td>
         							<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='fr']">
         								
         								<input checked="checked" name="translation_fr" onclick="javascript:showhide(this, 7, 'block')"  type="checkbox"/>
         								FR 
         								
         							</xsl:if>
         							
         							<xsl:if test="WORDLIST/W/TRANSL[@xml:lang='en']">
         								
         								<input checked="checked" name="translation_en" onclick="javascript:showhide(this, 6, 'block')"  type="checkbox"/>
         								EN 
         								
         							</xsl:if>
         							
         							<xsl:if test="WORDLIST/W/TRANSL[@xml:lang!='fr' and @xml:lang!='en']">
         								<xsl:variable name="langue_autre" select="WORDLIST/W/TRANSL[@xml:lang!='fr' and @xml:lang!='en']/@xml:lang"/>
         								<input checked="checked" name="translation_other" onclick="javascript:showhide(this, 11, 'block')" type="checkbox"/>
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>     
         									</xsl:when>
         									<xsl:otherwise> 
         										<xsl:value-of select="translate($langue_autre,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>    
         									</xsl:otherwise>
         								</xsl:choose>  
         								
         							</xsl:if>
         						</td>
         					</tr>
         					
         				</table>	
         			</td>	
         		<xsl:if test= "WORDLIST/W/NOTE">	
         				<td>
         					<table>
         						<tr>
         							<th align="left">
         								<xsl:choose>
         									<xsl:when test="$aff_lang='fr'">
         										Notes 
         									</xsl:when>
         									<xsl:otherwise> 
         										Notes
         									</xsl:otherwise>
         								</xsl:choose>
         							</th>
         							
         								<td>
         									<input name="note_info" onclick="javascript:showhide(this, 21, 'block')"  type="checkbox"/>
         									
         								</td>
         						
         						</tr>
         					</table>
         				</td>
         			</xsl:if>
         		</tr>
         		
         	</table>
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
		<table width="100%" border="1"  bordercolor="#993300" cellspacing="0" cellpadding="0">
			<tr>
				<td>
					<table width="100%" border="0" cellpadding="5" cellspacing="0" bordercolor="#993300" class="it">
						<tbody> 
                       <xsl:choose>
                        
                       <xsl:when test="FORM">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trans_text"><xsl:value-of select="FORM"/></div></td></tr>
                        </xsl:when>
                       <xsl:when test="S/FORM">
                           <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trans_text"><xsl:for-each select="S"><xsl:value-of select="FORM"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                        </xsl:choose>
                        
                        <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='fr']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_fr"><xsl:value-of select="TRANSL[@xml:lang='fr']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='fr']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_fr"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='fr']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                        <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='en']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_en"><xsl:value-of select="TRANSL[@xml:lang='en']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='en']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_en"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='en']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                       <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='it']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_it"><xsl:value-of select="TRANSL[@xml:lang='it']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='it']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_it"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='it']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                       <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='de']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_de"><xsl:value-of select="TRANSL[@xml:lang='de']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='de']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_de"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='de']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                       <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang='cn']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_cn"><xsl:value-of select="TRANSL[@xml:lang='cn']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang='cn']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_cn"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang='cn']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                       
                        <xsl:choose>
                        <xsl:when test="TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_other"><xsl:value-of select="TRANSL[@xml:lang='cn']"/></div></td></tr>
                        </xsl:when>
                        <xsl:when test="S/TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn']">
                        <tr class="transcriptTable"><td class="segmentInfo"></td><td class="segmentContent"><div class="trad_text_other"><xsl:for-each select="S"><xsl:value-of select="TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn']"/><br/></xsl:for-each></div></td></tr>
                        </xsl:when>
                       
                       </xsl:choose>
                        
                        <!-- Cree la numerotation des phrases : Si (phrase numero i)-->
							<xsl:for-each select="S">
								<tr class="transcriptTable">
									<td class="segmentInfo" width="25">S<xsl:value-of select="position()"/>
									</td>
									<td class="segmentContent" id="{@id}">
										
											<a href="javascript:boutonStop()">
												<img src="stop.gif" alt="stop"/>
											</a>
                                            <xsl:text> </xsl:text>
											<a href="javascript:playFrom('{@id}')">
												<img src="play.gif" alt="écouter"/>
											</a>
                                          
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
																		<xsl:value-of select="."/>
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
                                     <br />
                                      
											
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
                                                   
                                                 
                                        </xsl:if>
                                        
                                        
                                       <br /><br />
                                     
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
                                    
                                          
                                          <xsl:for-each select="TRANSL[@xml:lang!='fr' and @xml:lang!='en' and @xml:lang!='it' and @xml:lang!='de' and @xml:lang!='cn']">
                                      
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
   
		<table width="100%" border="1"  bordercolor="#993300" cellspacing="0" cellpadding="0">
			<tr>
				<td>
					<table width="100%" border="1" cellpadding="5" cellspacing="0" bordercolor="#993300" class="it">
						<tbody>
                      
							<xsl:for-each select="W">
								<tr class="transcriptTable">
									<td class="segmentInfo" width="25">W<xsl:value-of select="position()"/></td>
									<td id="{@id}">
                                  
                                                        <a href="javascript:boutonStop()">
														<img src="stop.gif" alt="stop"/>
														</a>
                                                        <xsl:text> </xsl:text>
														<a href="javascript:playFrom_W('{@id}')">
														<img src="play.gif" alt="écouter"/>
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
                                            <xsl:when test="(@xml:lang='fr') or (@xml:lang='en')">
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
		<script type="text/javascript" src="showhide.js">.</script>
        <script type="text/javascript" src="evtPlayerManager.js">.</script>
		<script type="text/javascript" src="html5PlayerManager.js">.</script>
		
</xsl:template>



	<!--<xsl:template name="player-audio_wav">
		<xsl:param name="mediaUrl_wav" select="''"/>

		<script language="Javascript">
			<xsl:text>var IDS    = new Array(</xsl:text>
			<xsl:for-each select="//TEXT/S|//WORDLIST/W">
	   			"<xsl:value-of select="@id"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var STARTS = new Array(</xsl:text>
			<xsl:for-each select="//TEXT/S/AUDIO|//WORDLIST/W/AUDIO">
	   			"<xsl:value-of select="@start"/>"
	   			<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var ENDS   = new Array(</xsl:text>
			<xsl:for-each select="//TEXT/S/AUDIO|//WORDLIST/W/AUDIO">
	  	 		"<xsl:value-of select="@end"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
		</script>
		
		<object id="player" width="350" height="16" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab">
			<param name="src" value="{$mediaUrl_wav}"/>
			<param name="AUTOPLAY" value="false"/>
			<param name="CONTROLLER" value="true"/>
			<embed width="350pt" height="16px" pluginspace="http://www.apple.com/quicktime/download/" controller="true" src="{$mediaUrl_wav}" name="player" autostart="false" enablejavascript="true">
       			</embed>
		</object>
        
     
     
        <xsl:choose>
		<xsl:when test="$aff_lang='fr'">
                        	<span style="margin-left:10px">Lecture en continu :</span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>
                        </xsl:when>
                        <xsl:otherwise> 
                    		<span style="margin-left:10px">Continuous playing:</span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>
                        </xsl:otherwise>
                        </xsl:choose>
		<script type="text/javascript" src="showhide.js">.</script>
		<script type="text/javascript" src="evtPlayerManager.js">.</script>
		<script type="text/javascript" src="qtPlayerManager.js">.</script>
        
        </xsl:template>-->
       
        
    
</xsl:stylesheet>