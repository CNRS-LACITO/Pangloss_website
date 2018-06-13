<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet 
	xmlns:oai="http://www.openarchives.org/OAI/2.0/"
	xmlns:dcterms="http://purl.org/dc/terms/" 
    xmlns:dcterms_oai="http://www.openarchives.org/OAI/2.0/oai_dcterms/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:olac="http://www.language-archives.org/OLAC/1.1/"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	exclude-result-prefixes="oai dcterms dc olac xsi"
	version="1.0">
	
	<xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>
	
	<xsl:param name="lg" select="'*'"/>
    <xsl:param name="ordre" select="'*'"/>
    <xsl:param name="aff_lang" select="'*'"/>
   

	
	<!-- ******************************************************** -->

	<xsl:variable name="sizeTitle">200</xsl:variable>
	<xsl:variable name="sizeResearcher">200</xsl:variable>
    <xsl:variable name="sizeLocutor">200</xsl:variable>
    

	<xsl:template match="/"> 
   <!-- <xsl:for-each select=".//oai:record/oai:metadata/olac:olac[contains(dc:subject,$lg)][starts-with(dc:format,'text/xml')][not(dcterms:accessRights='Access restricted (password protected)')]">
    
    </xsl:for-each>-->
   <!-- <xsl:for-each select=".//oai:record/oai:metadata/olac:olac[contains(dc:subject,$lg)][starts-with(dc:format,'application/pdf')][not(dcterms:accessRights='Access restricted (password protected)')]">
    
    </xsl:for-each>-->
		<!--<xsl:for-each select=".//oai:record/oai:metadata/olac:olac[dc:subject=$lg][starts-with(dc:type,'Sound')][not(dcterms:accessRights='Access restricted (password protected)')]">-->
     
 
      
         <xsl:for-each select=".//oai:record/oai:metadata/olac:olac[dc:subject=$lg][dc:type='Sound' or dc:type='MovingImage'][not(dcterms:accessRights='Access restricted (password protected)')]">
        		 
        		<!--<xsl:sort select="*[name()='dc:contributor[@olac:code='researcher']']" order="ascending"/>-->
             	
       <!--<xsl:sort select="*[local-name() = string($ordre)]"
              data-type="text" order="ascending" />-->
                
                <!--<xsl:sort select="dc:contributor[@olac:code='speaker']" order="ascending" data-type="text"/>-->
             
             	<!--<xsl:sort select="@*[name()=$ordre] | *[name()=$ordre]" order="ascending" data-type="text"/>-->
           <xsl:sort select="*[name()=string($ordre)]" order="ascending"/>
             <!--<xsl:sort select="@olac:code='speaker'" order="ascending"/>-->
                <xsl:variable name="countResearchers"><xsl:value-of select="count(dc:contributor[@olac:code='researcher'])"/></xsl:variable>
                <xsl:variable name="countLocutors"><xsl:value-of select="count(dc:contributor[@olac:code='speaker']|dc:contributor[@olac:code='performer']|dc:contributor[@olac:code='singer'])"/></xsl:variable>
        		<xsl:variable name="title"><xsl:value-of select="dc:title"/></xsl:variable>
        		<xsl:variable name="researcher"><xsl:value-of select="dc:contributor[@olac:code='researcher'][1]"/></xsl:variable>
                <xsl:variable name="extent"><xsl:value-of select="dcterms:extent"/></xsl:variable>
                <xsl:variable name="locutor"><xsl:value-of select="dc:contributor[@olac:code='speaker'][1]|dc:contributor[@olac:code='performer'][1]|dc:contributor[@olac:code='singer'][1]"/></xsl:variable>
                <xsl:variable name="sponsor"><xsl:value-of select="dc:contributor[@olac:code='sponsor'][1]"/></xsl:variable>
        		<xsl:variable name="researchers">
        			<xsl:for-each select="dc:contributor[@olac:code='researcher']">
        				<xsl:value-of select="."/>
        				<xsl:if test="position()!=last()"><xsl:text>; </xsl:text></xsl:if>
        			</xsl:for-each>
        		</xsl:variable>
               
                <xsl:variable name="locutors">
        			<xsl:for-each select="dc:contributor[@olac:code='speaker']|dc:contributor[@olac:code='performer']">
        				<xsl:value-of select="."/>
        				<xsl:if test="position()!=last()"><xsl:text>; </xsl:text></xsl:if>
        			</xsl:for-each>
        		</xsl:variable>
        		
                <xsl:variable name="id">
                	<xsl:value-of select="substring-after(ancestor::oai:record/oai:header/oai:identifier, 'oai:crdo.vjf.cnrs.fr:')"/>
                </xsl:variable>
                
                
        	
                <xsl:variable name="href">
                	<xsl:value-of select="dc:identifier"/>
				</xsl:variable>
                
                <xsl:variable name="available">
                	<xsl:value-of select="dcterms:available"/>
				</xsl:variable>
                
		
				<xsl:if test="(position() mod 2) = 1">
					<xsl:attribute name="class">odd</xsl:attribute>
				</xsl:if>
		
            <xsl:variable name="id_xml"><xsl:value-of select="substring-after(dcterms:isRequiredBy, 'oai:crdo.vjf.cnrs.fr:')"/></xsl:variable>

            
            
         
            
            
            <!-- Ajout d'une barre honrizontales pour séparer les ressources -->
	 		 <div><hr/></div>
             
             
			 <div class="row text-left">
	 

      
                 <div class="col-sm-2 col-xs-3"><xsl:text> </xsl:text>
                <!-- Affichage des icones en fonction des ressources disponibles -->
                <xsl:choose>
                    <xsl:when test="dc:type='MovingImage'">
                        <xsl:if test="$aff_lang='fr'">
                            <xsl:if test="$id_xml!=''">
                            <a
                                href="show_text.php?id={$id}&amp;idref={$id_xml}"
                                title ="Ecouter"
                                target="_blank"
                                >
                                <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25" />
                            </a>
                            </xsl:if>
                            <xsl:if test="$id_xml=''">
                            <a
                                href="show_text.php?id={$id}"
                                title ="Ecouter"
                                target="_blank"
                                >
                                <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25" />
                            </a>
                            </xsl:if>
                        </xsl:if>
                        <xsl:if test="$aff_lang='en'">
                            <xsl:if test="$id_xml!=''">
                            <a
                                href="show_text.php?id={$id}&amp;idref={$id_xml}"
                                title ="Listen"
                                target="_blank"
                                >
                                <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25" />
                            </a>
                            </xsl:if>
                            <xsl:if test="$id_xml=''">
                            <a
                                href="show_text.php?id={$id}"
                                title ="Listen"
                                target="_blank"
                                >
                                <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25" />
                            </a>
                            </xsl:if>
                        </xsl:if>
                    </xsl:when>
                        
                    <xsl:when test="dcterms:isRequiredBy">
                        <xsl:for-each select="dcterms:isRequiredBy">
                            <xsl:variable name="id1">
                                <xsl:value-of select="$id"/>
                            </xsl:variable>
                            <xsl:variable name="id2">
                                <xsl:value-of select="substring-after(., 'oai:crdo.vjf.cnrs.fr:')"/>
                            </xsl:variable>
                            <xsl:variable name="id_tot">
                                            <xsl:text>oai:crdo.vjf.cnrs.fr:</xsl:text><xsl:value-of select="$id2"/>
                                        </xsl:variable>
                                <xsl:choose>
                                    <xsl:when test="contains($id2, '_IMG')">
                                        <xsl:if test="$aff_lang='fr'">
                                        	<xsl:if test="//oai:ListRecords/oai:record[oai:header/oai:identifier = $id_tot]/oai:metadata/olac:olac[dc:format='application/pdf']">
                                            	<a href="show_other.php?id={$id1}&amp;idref={$id2}" target="_blank" title="Lire (pdf) et Ecouter">
                                               <img height="30" width="30" class="sansBordure" src="../../images/icones/pdf_son2.png"/>
                                            </a>
                                            </xsl:if>
                                            <xsl:if test="//oai:ListRecords/oai:record[oai:header/oai:identifier = $id_tot]/oai:metadata/olac:olac[dc:format='image/jpeg']">
                                            	<a href="eastling_player.php?idref={$id2}" target="_blank" title="Lire (pdf) et Ecouter">
                                               <img height="30" width="30" class="sansBordure" src="../../images/icones/pdf_son2.png"/>
                                            </a>
                                            </xsl:if>
                                        </xsl:if>
                                        <xsl:if test="$aff_lang='en'">
                                        	<xsl:if test="//oai:ListRecords/oai:record[oai:header/oai:identifier = $id_tot]/oai:metadata/olac:olac[dc:format='application/pdf']">
                                            	<a href="show_other_en.php?id={$id1}&amp;idref={$id2}" target="_blank" title="Lire (pdf) et Ecouter">
                                              	 <img height="30" width="30" class="sansBordure" src="../../images/icones/pdf_son2.png"/>
                                            	</a>
                                            </xsl:if>
                                             <xsl:if test="//oai:ListRecords/oai:record[oai:header/oai:identifier = $id_tot]/oai:metadata/olac:olac[dc:format='image/jpeg']">
                                             	<a href="eastling_player.php?idref={$id2}" target="_blank" title="Lire (pdf) et Ecouter">
                                              	 <img height="30" width="30" class="sansBordure" src="../../images/icones/pdf_son2.png"/>
                                            	</a>
                                            </xsl:if>
                                        </xsl:if>
                                    </xsl:when>
                                    <xsl:when test="//oai:ListRecords/oai:record[oai:header/oai:identifier = $id_tot]/oai:metadata/olac:olac[dc:format='text/xml']">
                                    	
                                            <xsl:if test="$aff_lang='fr'">
                                            <a	href="show_text.php?id={$id1}&amp;idref={$id2}" target="_blank" title="Lire (texte interlinéaire) et Ecouter">
                                                <img class="sansBordure" src="../../images/icones/Txt_Inter_parchemin1.jpg" height="30" width="30"/>
                                            </a>
                                            </xsl:if>
                                            <xsl:if test="$aff_lang='en'">
                                            <a	href="show_text_en.php?id={$id1}&amp;idref={$id2}" target="_blank" title="Read (text) and Listen">
                                                <img class="sansBordure" src="../../images/icones/Txt_Inter_parchemin1.jpg" height="30" width="30"/>
                                            </a>
                                            </xsl:if>
                                    </xsl:when>
                                    <xsl:otherwise>
                                    
                                        <xsl:if test="//oai:ListRecords/oai:record[oai:header[contains(oai:identifier,$id1)]]/oai:metadata/olac:olac[dc:type='Sound']">
                                            <xsl:if test="$aff_lang='fr'">
                                            <a
                                        href="show_text.php?id={$id}"
                                        title ="Ecouter"
                                        target="_blank"
                                        >
                                            <img class="sansBordure" src="../../../images/images_pangloss/haut_parleur_s.png" height="25" width="25"/>
                                        </a>
                                     </xsl:if>
                                     <xsl:if test="$aff_lang='en'">
                                         <a
                                        href="show_text_en.php?id={$id}"
                                        title ="Ecouter"
                                        target="_blank"
                                        >
                                            <img class="sansBordure" src="../../../images/images_pangloss/haut_parleur_s.png" height="25" width="25"/>
                                        </a>
                                        </xsl:if>
                    				</xsl:if>
                                        <!--<xsl:if test="//oai:ListRecords/oai:record[oai:header[contains(oai:identifier,$id1)]]/oai:metadata/olac:olac[dc:type='MovingImage']">
                                            <xsl:if test="$aff_lang='fr'">
                                                <a
                                                    href="show_text.php?id={$id}"
                                                    title ="Ecouter"
                                                    target="_blank"
                                                    >
                                                    <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25" />
                                                </a>
                                            </xsl:if>
                                            <xsl:if test="$aff_lang='en'">
                                                <a
                                                    href="show_en.php?id={$id}"
                                                    title ="Ecouter"
                                                    target="_blank"
                                                    >
                                                    <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25"/>
                                                </a>
                                            </xsl:if>
                                        </xsl:if>-->
                                            
                                     
                                    </xsl:otherwise>   
                                </xsl:choose>      
                        </xsl:for-each>
					</xsl:when>
                    <xsl:otherwise>
                    	<xsl:if test="dc:type='Sound'">
                            <xsl:if test="$aff_lang='fr'">
                            <a
                        href="show_text.php?id={$id}"
                        title ="Ecouter"
                        target="_blank"
                        >
                            <img class="sansBordure" src="../../images/images_pangloss/haut_parleur_s.png" height="25" width="25"/>
                        </a>
                     </xsl:if>
                     <xsl:if test="$aff_lang='en'">
                         <a
                        href="show_text_en.php?id={$id}"
                        title ="Ecouter"
                        target="_blank"
                        >
                            <img class="sansBordure" src="../../images/images_pangloss/haut_parleur_s.png" height="25" width="25"/>
                        </a>
                        </xsl:if>
                    </xsl:if>
                    <xsl:if test="dc:type='MovingImage'">
                    	<xsl:if test="$aff_lang='fr'">
                            <a
                        href="show_text.php?id={$id}"
                        title ="Ecouter"
                        target="_blank"
                        >
                            <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25" />
                        </a>
                     </xsl:if>
                     <xsl:if test="$aff_lang='en'">
                         <a
                        href="show_en.php?id={$id}"
                        title ="Ecouter"
                        target="_blank"
                        >
                            <img class="sansBordure" src="../../images/icones/video.png" height="25" width="25"/>
                        </a>
                        </xsl:if>
                    </xsl:if>
                    </xsl:otherwise>
                 </xsl:choose>
       
       
             <xsl:variable name="nakala_sound_id">
                      <xsl:text>http://purl.org/poi/crdo.vjf.cnrs.fr/</xsl:text><xsl:value-of select="$id"/>
             </xsl:variable>   
       <xsl:if test="//oai:ListRecords/oai:record/oai:metadata/dcterms_oai:dcterms[dcterms:requires = $nakala_sound_id]">
        
        
        <xsl:variable name="nakala_linked_id">
                     <xsl:value-of select="//oai:ListRecords/oai:record/oai:metadata/dcterms_oai:dcterms[dcterms:requires = $nakala_sound_id]/dcterms:identifier"/>
             </xsl:variable> 
             
           <xsl:if test="//oai:ListRecords/oai:record/oai:metadata/dcterms_oai:dcterms[dcterms:requires = $nakala_sound_id]/dcterms:type[1] = 'EGG'">  
                 <a target="_blank" href="{$nakala_linked_id}" title="Le fichier EGG" ><img height="25" width="25" class="sansBordure" src="../../images/icones/egg2.jpg"/> 			
                </a>
         </xsl:if>
        </xsl:if>
                    	
        </div>            
                    
				
                
                
                
                

				<!--	<a
					href="show_metadatas.php?id={$id}&amp;lg={$lg}"
					title="A propos de {$title}"
					target="_blank"
					onClick="window.open(this.href,'popupLink','width=640,height=400,scrollbars=yes,resizable=yes',1).focus();return false">
						<img class="sansBordure" src="../../images/icones/info_marron.jpg"/>
					</a> -->
				
                
                
               
                <div class="col-sm-2 col-xs-3"> <xsl:text> </xsl:text>
                <xsl:variable name="duree">
                <xsl:value-of select="substring($extent, 3)"/> 
                </xsl:variable>
                <i><xsl:value-of select="translate($duree,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')"/></i>
                </div>
                
                <div class="col-sm-4 col-xs-6"><xsl:text> </xsl:text>
					<xsl:choose>
						<xsl:when test="string-length($title) &gt; $sizeTitle">
							<span title="{$title}"><xsl:value-of select="substring($title, 0, $sizeTitle)"/>...</span>
						</xsl:when>
						<xsl:otherwise>
							<span title="{$title}"><xsl:value-of select="$title"/></span>
						</xsl:otherwise>
					</xsl:choose>
				</div>
				
			 <div class="col-sm-2 hidden-xs"><xsl:text> </xsl:text>
             		<xsl:choose>
						<xsl:when test="string-length($researcher) &gt; $sizeResearcher">
							<span title="{$researcher}"><xsl:value-of select="substring($researcher, 0, $sizeResearcher)"/>...</span>
						</xsl:when>
						<xsl:otherwise>
							<span title="{$researcher}"><b style="color:#600"><a href="../corpus/search.php?keywords={$researcher}"><xsl:value-of select="$researcher"/></a></b></span>
						</xsl:otherwise>
					</xsl:choose>
					<xsl:if test="$countResearchers &gt; 1"> et...</xsl:if>
			</div>
            
             <div class="col-sm-2 hidden-xs"><xsl:text> </xsl:text>
					<xsl:choose>
						<xsl:when test="string-length($locutor) &gt; $sizeLocutor">
							<span title="{$locutor}"><xsl:value-of select="substring($locutor, 0, $sizeLocutor)"/>...</span>
						</xsl:when>
						<xsl:otherwise>
							<span title="{$locutor}"><xsl:value-of select="$locutor"/></span>
						</xsl:otherwise>
					</xsl:choose>
					<xsl:if test="$countLocutors &gt; 1"> et...</xsl:if>
			</div>
            	 
               </div>
               
		

        </xsl:for-each>
        
        
        
         <!--<div align="right">
    		<a target="_blank" href="citation_corpus.php?lg={$lg}&amp;chercheurs={$researchers}&amp;sponsor={$sponsor}" onClick="window.open(this.href,'popupLink','width=600,height=100,scrollbars=yes,resizable=yes',1).focus();return false"><b><img src="../../images/icones/citation.jpg" width="77" height="26" /></b></a>
    	</div>-->
	
	</xsl:template>	
   
 <!--<xsl:template match="*">
	<xsl:variable name="content"><xsl:value-of select="normalize-space(.)"/></xsl:variable>
	
							<xsl:if test="contains($content, '.pdf')">
								<a target="_blank" href="{$content}" title="Le PDF"><img class="sansBordure" src="../../images/icones/Txt_Inter_pdf1.jpg"/></a> 
							</xsl:if>
					
                                 
                                 
</xsl:template>-->
	
</xsl:stylesheet>
