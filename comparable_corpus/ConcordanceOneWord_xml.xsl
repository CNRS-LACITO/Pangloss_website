<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:param name="mot" select="''"/>
    
	<xsl:param name="filesim" select="'*'"/>
<xsl:param name="nbsim" select="'*'"/>
<xsl:param name="file1" select="'*'"/>
<xsl:param name="file2" select="'*'"/>
<xsl:param name="file3" select="'*'"/>
<xsl:param name="file4" select="'*'"/>
<xsl:param name="file5" select="'*'"/>
<xsl:param name="file6" select="'*'"/>

	
	<!-- ******************************************************** -->
	<xsl:template match="/">
		
		
	
				
				
				<liste>
					
										
									
											<!--<tr>
												<th align="center">Texte</th>
												<th align="center">Phrase</th>
												<th align="center">contexte gauche</th>
												<th align="center" bgcolor="aliceblue"><a href="ViewOneSimilarity.php?similarity={blabla}&amp;color={blibli}">Mot</a></th>
												<th align="center">contexte droit</th>
												<th align="center">Gloses</th>
											</tr>-->
											<xsl:for-each select="//similarities/files/file">
                                            <xsl:variable name="id" select="@id" />
												<xsl:variable name="fi" select="@xml" />
                                                
                                            <xsl:if test="$id=$file1 or $id=$file2 or $id=$file3 or $id=$file4 or $id=$file5 or $id=$file6 ">
											<xsl:for-each select="document($fi)//TEXT/S">
											
								<xsl:variable name="num_s" select="position()" />
								<xsl:variable name="id_s" select="@id" />
												
										
											<!-- Recupere les mots avec leur glose -->
												<xsl:choose>
													
													<xsl:when test="W/FORM and W/TRANSL">
														
														<xsl:for-each select="W">
															<xsl:if test="M/FORM=$mot">
															<mot>
																<texte>
																	<xsl:value-of select="$fi"/>
																</texte>
																<num_phrase>
																	<xsl:value-of select="$id_s"/>
																</num_phrase>
																
																<mot_gauche>
																	
																	
																	<xsl:for-each select=".">
																		<xsl:value-of select="preceding::W[8]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::W[7]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::W[6]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::W[5]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::W[4]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::W[3]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::W[2]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::W[1]/FORM"/>
																		<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																	</xsl:for-each>
																	
																	
																	
																</mot_gauche>
																<mot_cours>
																	
																	<xsl:for-each select="FORM">
																		<xsl:value-of select="."/>
																		<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																	</xsl:for-each>
																	
																</mot_cours>
																<mot_droite>
																	<xsl:for-each select=".">
																		<xsl:value-of select="following::W[1]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::W[2]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::W[3]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::W[4]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::W[5]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::W[6]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::W[7]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::W[8]/FORM"/>
																	</xsl:for-each>
																</mot_droite>
																<trad_mot>
																	
																	
																	<xsl:value-of select="TRANSL"/>
																	
																	
																	
																</trad_mot>
															</mot>
															</xsl:if>
															
															
															
															
															
															
															
															<xsl:if test="M/TRANSL=$mot">
																<mot>
																	<texte>
																		<xsl:value-of select="$fi"/>
																	</texte>
																	<num_phrase>
																		<xsl:value-of select="$id_s"/>
																	</num_phrase>
																	
																	<mot_gauche>
																		
																		
																		<xsl:for-each select=".">
																			<xsl:value-of select="preceding::W[8]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::W[7]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::W[6]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::W[5]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::W[4]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::W[3]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::W[2]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::W[1]/FORM"/>
																			<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																		</xsl:for-each>
																		
																		
																		
																	</mot_gauche>
																	<mot_cours>
																		
																		<xsl:for-each select="FORM">
																			<xsl:value-of select="."/>
																			<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																		</xsl:for-each>
																		
																	</mot_cours>
																	<mot_droite>
																		<xsl:for-each select=".">
																			<xsl:value-of select="following::W[1]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::W[2]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::W[3]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::W[4]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::W[5]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::W[6]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::W[7]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::W[8]/FORM"/>
																		</xsl:for-each>
																	</mot_droite>
																	<trad_mot>
																		
																		
																		<xsl:value-of select="TRANSL"/>
																		
																		
																		
																	</trad_mot>
																</mot>
															</xsl:if>
															
															
															
															
														</xsl:for-each>
														
														
													</xsl:when>
													
													<xsl:when test="W/M/FORM and W/M/TRANSL">
														
														<xsl:for-each select="W/M">
															<xsl:if test="FORM=$mot">
															<mot>
																<texte>
																	<xsl:value-of select="$fi"/>
																</texte>
																<num_phrase>
																	<xsl:value-of select="$id_s"/>
																</num_phrase>
																
																<mot_gauche>
																	
																	
																	<xsl:for-each select=".">
																		<xsl:value-of select="preceding::M[8]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::M[7]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::M[6]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::M[5]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::M[4]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::M[3]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::M[2]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="preceding::M[1]/FORM"/>
																		<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																	</xsl:for-each>
																	
																	
																	
																</mot_gauche>
																<mot_cours>
																	
																	<xsl:for-each select="FORM">
																		<xsl:value-of select="."/>
																		<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																	</xsl:for-each>
																	
																</mot_cours>
																<mot_droite>
																	<xsl:for-each select=".">
																		<xsl:value-of select="following::M[1]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::M[2]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::M[3]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::M[4]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::M[5]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::M[6]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::M[7]/FORM"/>
																		<xsl:text> </xsl:text>
																		<xsl:value-of select="following::M[8]/FORM"/>
																	</xsl:for-each>
																</mot_droite>
																<trad_mot>
																	
																	
																	<xsl:value-of select="TRANSL"/>
																	
																	
																	
																</trad_mot>
															</mot>
															</xsl:if>
															
															
															
															
															
															<xsl:if test="TRANSL=$mot">
																<mot>
																	<texte>
																		<xsl:value-of select="$fi"/>
																	</texte>
																	<num_phrase>
																		<xsl:value-of select="$id_s"/>
																	</num_phrase>
																	
																	<mot_gauche>
																		
																		
																		<xsl:for-each select=".">
																			<xsl:value-of select="preceding::M[8]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::M[7]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::M[6]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::M[5]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::M[4]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::M[3]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::M[2]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="preceding::M[1]/FORM"/>
																			<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																		</xsl:for-each>
																		
																		
																		
																	</mot_gauche>
																	<mot_cours>
																		
																		<xsl:for-each select="FORM">
																			<xsl:value-of select="."/>
																			<!--<xsl:if test="position()!=last()">-</xsl:if>-->
																		</xsl:for-each>
																		
																	</mot_cours>
																	<mot_droite>
																		<xsl:for-each select=".">
																			<xsl:value-of select="following::M[1]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::M[2]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::M[3]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::M[4]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::M[5]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::M[6]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::M[7]/FORM"/>
																			<xsl:text> </xsl:text>
																			<xsl:value-of select="following::M[8]/FORM"/>
																		</xsl:for-each>
																	</mot_droite>
																	<trad_mot>
																		
																		
																		<xsl:value-of select="TRANSL"/>
																		
																		
																		
																	</trad_mot>
																</mot>
															</xsl:if>
															
															
															
															
															
															
														</xsl:for-each>
                                                        
													</xsl:when>

													
													
													
												</xsl:choose>
							</xsl:for-each>
                            </xsl:if>
						</xsl:for-each>
											
					
				</liste>
			
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
		
 
		<!--<span style="margin-left:10px"> Lecture en continu: </span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>-->
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
		
		
		<!--<span style="margin-left:10px"> Lecture en continu: </span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>-->
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
		
		
		<!--<span style="margin-left:10px"> Lecture en continu: </span><input id="karaoke" name="karaoke" checked="checked" type="checkbox"/>-->
		<script type="text/javascript" src="../outils/showhide.js">.</script>
		
		<script type="text/javascript" src="../outils/qtPlayerManager.js">.</script>
		
	</xsl:template>
        
  
   
    
</xsl:stylesheet>
