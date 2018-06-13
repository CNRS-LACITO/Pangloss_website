<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

    <xsl:param name="file" select="''"/>
    <xsl:param name="filesim" select="''"/>
    <xsl:param name="sentence" select="''"/>
    
	
	<xsl:param name="mot" select="''"/>

	
	
	
	<!-- ******************************************************** -->
	<xsl:template match="/">
    
    
		<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
			<head>
				<meta http-equiv="Content-Language" content="fr"/>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
				<script src="../outils/showhide.js" type="text/javascript">.</script>
				<link href="../../styles.css" rel="stylesheet" type="text/css"/>
  
	
				
				
			</head>
			<body>
				
				<div style="margin-left: 5px;">
					
				
					<div>
						
					</div>
					
					
					
					</div>
				<!--<xsl:value-of select="$url_similarities"/>-->
				
				
                <xsl:if test="contains($filesim, 'orphans')='true'">
            <h4 align="center">Proto-story Orphans</h4>     
        </xsl:if>
        <xsl:if test="contains($filesim, 'ogress')='true'">
           <h4 align="center">Proto-story Ogress</h4>
        </xsl:if>
        <xsl:if test="contains($filesim, 'urmother')='true'">
           <h4 align="center">Proto-story Ur-Mother</h4>
        </xsl:if>
				
                 
                 <xsl:variable name="lang" select="document($filesim)//similarities/files/file[@xml=$file]/@lang"/>
                 <xsl:variable name="speaker" select="document($filesim)//similarities/files/file[@xml=$file]/@speaker"/>
				
				<table width="100%" border="0" cellpadding="5" cellspacing="0" bordercolor="#993300" class="it">
					<tbody>
						<tr>
							<td valign="top">
								
								<table border="1">
									<!--<tr><th align="center"><xsl:value-of select="$f1_lang"/></th></tr>-->
									<tr><th align="left" bgcolor="#CCCCCC" style="font-size:18px"> <xsl:value-of select="$lang"/> (<xsl:value-of select="$speaker"/>)</th></tr>
								<!--<xsl:call-template name="player-audio_wav_file1">
									<xsl:with-param name="f1_sound" select="$f1_sound"/>
									<xsl:with-param name="f1_xml" select="$f1_xml"/>
								</xsl:call-template>-->
								<!--PARTIE TRAITEMENT ET AFFICHAGE FILE1-->
								
								<td>
									
								<xsl:for-each select="document($file)//TEXT/S">
									<xsl:if test="@id=$sentence">
								
							
											<!-- affiche le nom du locuteur si il y en a -->
											<xsl:if test="((@who) and (not(@who='')) and (not(@who=ancestor::TEXT/S[number(position())-1]/@who)))">
												<span class="speaker">
													<xsl:value-of select="@who"/><xsl:text>: </xsl:text>
												</span>
											</xsl:if>
											
											
											<!-- cas ou S contient la balise FORM -->
											<xsl:if test="FORM">
												<div class="word_sentence">
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
												</div>
												
												
											</xsl:if>
											
											
											<!-- Cas ou W ou M contiennent la balise FORM et ou S ne contient pas la balise FORM -->
											<xsl:if test="not(FORM) and (W/FORM or W/M/FORM)">
												
												
												
												<!-- Recuperation des mots ou morphemes puis concatenation pour former une phrase --> 
												<xsl:for-each select="W">
													
													
													
													<div class="word_sentence" >
														<xsl:choose>
															
															
															<xsl:when test="FORM">
																<xsl:value-of select="FORM"/>
															</xsl:when>
															<xsl:otherwise>
																<xsl:choose>
																	<xsl:when test="M/@class='i'">
																		<i>         
																			<xsl:for-each select="M/FORM">
																				<xsl:value-of select="."/>
																				<xsl:if test="position()!=last()">-</xsl:if>
																			</xsl:for-each>
																			
																		</i> 
																	</xsl:when>
																	<xsl:otherwise>  <xsl:value-of select="M/FORM"/>  </xsl:otherwise>
																</xsl:choose>
															</xsl:otherwise>
															
															
															
														</xsl:choose>
													</div>
													
													
													
												</xsl:for-each>
												
												
												
											</xsl:if>
											
											<br />
											
										
											
											<!-- Recupere les mots avec leur glose -->
											<xsl:if test="(W/FORM and W/TRANSL) or (W/M/FORM and W/M/TRANSL) ">
												
												<xsl:for-each select="W">
													
													
													<table class="word">
														<tbody>
															<tr>
																<td class="word_form">
																	
																	
																	<xsl:choose>
																		
																		<xsl:when test="not(FORM)">
																			<xsl:choose>
																				<xsl:when test="M/@class='i'">
																					<i>
																						<xsl:for-each select="M">
																							<xsl:if test="FORM=$mot">
																								<span style="background:pink"><xsl:value-of select="FORM"/>
																									</span>
																							</xsl:if>
																							<xsl:if test="FORM!=$mot"><xsl:value-of select="FORM"/>
																								</xsl:if>
																							
                                                                                            <xsl:if test="position()!=last()">-</xsl:if>
																						</xsl:for-each>
																						
																					</i>
																				</xsl:when>
																				<xsl:otherwise>  
																					
																					<xsl:for-each select="M">
																						<xsl:if test="FORM = $mot">
																							<span style="background:pink"><xsl:value-of select="FORM"/>
																								</span>
																						</xsl:if>
																						<xsl:if test="FORM!=$mot"><xsl:value-of select="FORM"/>
																							</xsl:if>
																						
                                                                                        <xsl:if test="position()!=last()">-</xsl:if>
																					</xsl:for-each>
																					
																				</xsl:otherwise>
																			</xsl:choose>
																		</xsl:when>
																		
																		<xsl:otherwise >
																			<xsl:if test="FORM = $mot">
																				<span style="background:pink"><xsl:value-of select="FORM"/></span>
																			</xsl:if>
																			<xsl:if test="FORM!=$mot"><xsl:value-of select="FORM"/></xsl:if>
																		</xsl:otherwise>
																	</xsl:choose>
																</td>
															</tr>
															<tr>
																
																<td class="word_transl">
																	
																	
																	<xsl:choose>
																		<xsl:when test="M/TRANSL[@xml:lang or @lang] or TRANSL[@xml:lang or @lang]">
																			
																			
																			<xsl:if test="M/TRANSL[@xml:lang='en' or @lang='en']">
																				<xsl:for-each select="M/TRANSL[@xml:lang='en' or @lang='en']">
																					<xsl:if test=". = $mot">
																							<span style="background:pink"><xsl:value-of select="."/>
																								</span>
																						</xsl:if>
																						<xsl:if test=".!=$mot"><xsl:value-of select="."/>
																							</xsl:if>
																					
                                                                                    <xsl:if test="position()!=last()">-</xsl:if>
																				</xsl:for-each>
																				
																			</xsl:if>
																			<xsl:if test="M/TRANSL[@xml:lang='fr']">
																				<xsl:for-each select="M/TRANSL[@xml:lang='fr' or @lang='fr']">
																					<xsl:if test=". = $mot">
																							<span style="background:pink"><xsl:value-of select="."/>
																								</span>
																						</xsl:if>
																						<xsl:if test=".!=$mot"><xsl:value-of select="."/>
																							</xsl:if>
																					
                                                                                    <xsl:if test="position()!=last()">-</xsl:if>
																				</xsl:for-each>
																				
																			</xsl:if>
																			
																			<xsl:if test="not(M/TRANSL[@xml:lang='en' or @lang='en']) and not(M/TRANSL[@xml:lang='fr' or @lang='fr'])">
																				<xsl:for-each select="M/TRANSL">
																					<xsl:if test=". = $mot">
																							<span style="background:pink"><xsl:value-of select="."/>
																								</span>
																						</xsl:if>
																						<xsl:if test=".!=$mot"><xsl:value-of select="."/>
																							</xsl:if>
																					
                                                                                    <xsl:if test="position()!=last()">-</xsl:if>
																					
																				</xsl:for-each>
																				
																				
																			</xsl:if>
																			
																			
																			<xsl:if test="TRANSL[@xml:lang='en' or @lang='en']">
																				<xsl:if test=". = $mot">
																							<span style="background:pink"><xsl:value-of select="."/>
																								</span>
																						</xsl:if>
																						<xsl:if test=".!=$mot"><xsl:value-of select="."/>
																							</xsl:if>
																					
                                                                                    <xsl:if test="position()!=last()">-</xsl:if>
																				
																			</xsl:if>
																			<xsl:if test="TRANSL[@xml:lang='fr' or @lang='fr']">
																				<xsl:if test=". = $mot">
																							<span style="background:pink"><xsl:value-of select="."/>
																								</span>
																						</xsl:if>
																						<xsl:if test=".!=$mot"><xsl:value-of select="."/>
																							</xsl:if>
																					
                                                                                    <xsl:if test="position()!=last()">-</xsl:if>
																				
																			</xsl:if>
																			<xsl:if test="not(TRANSL[@xml:lang='en' or @lang='en']) and not(TRANSL[@xml:lang='fr' or @lang='fr'])">
																				<xsl:for-each select="TRANSL">
																					<xsl:if test=". = $mot">
																							<span style="background:pink"><xsl:value-of select="."/>
																								</span>
																						</xsl:if>
																						<xsl:if test=".!=$mot"><xsl:value-of select="."/>
																							</xsl:if>
                                                                                            
																					<xsl:if test="position()!=last()">-</xsl:if>
																					
																				</xsl:for-each>
																				
																			</xsl:if>
																		</xsl:when>
																		<xsl:otherwise>
																			<xsl:if test="M/TRANSL">
																				<xsl:for-each select="M/TRANSL[1]">
																					<xsl:if test=". = $mot">
																							<span style="background:pink"><xsl:value-of select="."/>
																								</span>
																						</xsl:if>
																						<xsl:if test=".!=$mot"><xsl:value-of select="."/>
																							<xsl:if test="position()!=last()">-</xsl:if></xsl:if>
																					
                                                                                    <xsl:if test="position()!=last()">-</xsl:if>
																					
																				</xsl:for-each>
																				
																			</xsl:if>
																			<xsl:if test="TRANSL">
																				<xsl:if test="TRANSL[1] = $mot">
																							<span style="background:pink"><xsl:value-of select="TRANSL[1]"/>
																								</span>
																						</xsl:if>
																						<xsl:if test="TRANSL[1]!=$mot"><xsl:value-of select="TRANSL[1]"/>
																							</xsl:if>
																					
                                                                                    <xsl:if test="position()!=last()">-</xsl:if>
																				
																			</xsl:if>
																		</xsl:otherwise>
																	</xsl:choose>
																</td>
															</tr>
														</tbody>
													</table>
													
												</xsl:for-each>
												
												
											</xsl:if>
											
											
											<br/>
											<xsl:if test="TRANSL">
												
												<!-- Recupere la traduction si il en existe une -->
												
												
												
												<xsl:for-each select="TRANSL[@xml:lang='en' or @lang='en']">
													<div class="translation_en">
														<xsl:value-of select="."/><br />
													</div>
												</xsl:for-each> 
												
												<xsl:for-each select="TRANSL[@xml:lang='fr' or @lang='fr']">
													<div class="translation_fr">
														<xsl:value-of select="."/><br />
													</div>
												</xsl:for-each> 
												
												
												<xsl:for-each select="TRANSL[(@xml:lang!='fr' or @lang!='fr') and (@xml:lang!='en' or @lang!='fr')]">
													<div class="translation_other">
														<xsl:value-of select="."/><br />
													</div>
													
												</xsl:for-each>
												
											</xsl:if>
						
									
								
								
									</xsl:if>
								</xsl:for-each>
								</td>
								</table>
							</td>
							
						</tr>
						
					</tbody>
				</table>
				
			</body>
			</html>
	</xsl:template>	
	

	<xsl:template name="player-audio_wav_file1">
		<xsl:param name="f1_sound" select="$f1_sound"/>
		<xsl:param name="f1_xml" select="$f1_xml"/>
		<script language="Javascript">
			<xsl:text>var IDS    = new Array(</xsl:text>
			<xsl:for-each select="document($f1_xml)//TEXT/S">
	   			"<xsl:value-of select="position()"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var STARTS = new Array(</xsl:text>
			<xsl:for-each select="document($f1_xml)//TEXT/S/AUDIO">
	   			"<xsl:value-of select="@start"/>"
	   			<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var ENDS   = new Array(</xsl:text>
			<xsl:for-each select="document($f1_xml)//TEXT/S/AUDIO">
	  	 		"<xsl:value-of select="@end"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
		</script>
		
		<object id="player" width="350" height="16" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab">
			<param name="AUTOPLAY" value="false"/>
			<param name="CONTROLLER" value="true"/>
			<embed width="350pt" height="16px" pluginspace="http://www.apple.com/quicktime/download/" controller="true" src="{$f1_sound}" name="player" autostart="false" enablejavascript="true">
			</embed>
		</object>
		
 
		<span style="margin-left:10px"> Lecture en continu: </span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>
		<script type="text/javascript" src="../outils/showhide.js">.</script>
		
		<script type="text/javascript" src="../outils/qtPlayerManager.js">.</script>
        
	</xsl:template>
	
	
	
	<xsl:template name="player-audio_wav_file2">
		<xsl:param name="f2_sound" select="$f2_sound"/>
		<xsl:param name="f2_xml" select="$f2_xml"/>
		<script language="Javascript">
			<xsl:text>var IDS    = new Array(</xsl:text>
			<xsl:for-each select="document($f2_xml)//TEXT/S">
	   			"<xsl:value-of select="position()"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var STARTS = new Array(</xsl:text>
			<xsl:for-each select="document($f2_xml)//TEXT/S/AUDIO">
	   			"<xsl:value-of select="@start"/>"
	   			<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var ENDS   = new Array(</xsl:text>
			<xsl:for-each select="document($f2_xml)//TEXT/S/AUDIO">
	  	 		"<xsl:value-of select="@end"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
		</script>
		
		<object id="player" width="350" height="16" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab">
			<param name="AUTOPLAY" value="false"/>
			<param name="CONTROLLER" value="true"/>
			<embed width="350pt" height="16px" pluginspace="http://www.apple.com/quicktime/download/" controller="true" src="{$f2_sound}" name="player" autostart="false" enablejavascript="true">
			</embed>
		</object>
		
		
		<span style="margin-left:10px"> Lecture en continu: </span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>
		<script type="text/javascript" src="../outils/showhide.js">.</script>
		
		<script type="text/javascript" src="../outils/qtPlayerManager.js">.</script>
		
	</xsl:template>
	
	
	
	<xsl:template name="player-audio_wav_file3">
		<xsl:param name="f3_sound" select="$f3_sound"/>
		<xsl:param name="f3_xml" select="$f3_xml"/>
		<script language="Javascript">
			<xsl:text>var IDS    = new Array(</xsl:text>
			<xsl:for-each select="document($f3_xml)//TEXT/S">
	   			"<xsl:value-of select="position()"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var STARTS = new Array(</xsl:text>
			<xsl:for-each select="document($f3_xml)//TEXT/S/AUDIO">
	   			"<xsl:value-of select="@start"/>"
	   			<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
			
			<xsl:text>var ENDS   = new Array(</xsl:text>
			<xsl:for-each select="document($f3_xml)//TEXT/S/AUDIO">
	  	 		"<xsl:value-of select="@end"/>"
	  	 		<xsl:if test="position()!=last()"><xsl:text>,</xsl:text></xsl:if>
			</xsl:for-each>
			<xsl:text>);</xsl:text>
		</script>
		
		<object id="player" width="350" height="16" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab">
			<param name="AUTOPLAY" value="false"/>
			<param name="CONTROLLER" value="true"/>
			<embed width="350pt" height="16px" pluginspace="http://www.apple.com/quicktime/download/" controller="true" src="{$f3_sound}" name="player3" autostart="false" enablejavascript="true">
			</embed>
		</object>
		
		
		<span style="margin-left:10px"> Lecture en continu: </span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>
		<script type="text/javascript" src="../outils/showhide.js">.</script>
		
		<script type="text/javascript" src="../outils/qtPlayerManager.js">.</script>
		
	</xsl:template>
        
  
   
    
</xsl:stylesheet>
