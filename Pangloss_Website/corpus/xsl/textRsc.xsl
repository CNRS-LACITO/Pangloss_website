<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet 
	xmlns:oai="http://www.openarchives.org/OAI/2.0/"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:olac="http://www.language-archives.org/OLAC/1.1/"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	exclude-result-prefixes="oai dcterms dc olac xsi"
	version="1.0">
		
	<xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>

	<xsl:param name="id" select="'*'"/>
    <xsl:param name="id_ref" select="'*'"/>



	<xsl:template match="/">
    
		<result>
			<xsl:variable name="sound_id">
				<xsl:text>oai:crdo.vjf.cnrs.fr:</xsl:text><xsl:value-of select="$id"/>
			</xsl:variable>
            <xsl:variable name="text_id">
				<xsl:text>oai:crdo.vjf.cnrs.fr:</xsl:text><xsl:value-of select="$id_ref"/>
			</xsl:variable>
            <!--<xsl:variable name="text_id">
				<xsl:text>oai:crdo.vjf.cnrs.fr:</xsl:text><xsl:value-of select="$id_ref"/>
			</xsl:variable>-->
			
          
			<xsl:for-each select="//oai:ListRecords/oai:record[oai:header/oai:identifier = $sound_id]/oai:metadata/olac:olac">
				
                <xsl:choose>
                	<xsl:when test="dc:title[@xml:lang='fr']">
                    	<title_fr><xsl:value-of select="dc:title[1]"/></title_fr>
                    </xsl:when>
                    <xsl:otherwise>
                    	 <xsl:choose>
                			<xsl:when test="dcterms:alternative[@xml:lang='fr']">
                        		<title_fr><xsl:value-of select="dcterms:alternative[1]"/></title_fr>
                        	</xsl:when>
                            <xsl:otherwise>
                            <title_fr><xsl:value-of select="dc:title[1]"/></title_fr>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:otherwise>
               </xsl:choose>
                <xsl:choose>
                    <xsl:when test="dc:title[@xml:lang='en']">
                    	<title_en><xsl:value-of select="dc:title[1]"/></title_en>
                    </xsl:when>
                    <xsl:otherwise>
                    	 <xsl:choose>
                        	<xsl:when test="dcterms:alternative[@xml:lang='en']">
                        		<title_en><xsl:value-of select="dcterms:alternative[1]"/></title_en>
                       		</xsl:when>
                            <xsl:otherwise>
                            <title_en><xsl:value-of select="dc:title[1]"/></title_en>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:otherwise>
               </xsl:choose>
                
                <title><xsl:value-of select="dc:title[1]"/></title>
				<lg><xsl:value-of select="dc:subject[@xsi:type='olac:language'][1]"/></lg>
                <lg_code><xsl:value-of select="dc:subject/@olac:code[1]"/></lg_code>
				<available><xsl:value-of select="dcterms:available"/></available>
                <license><xsl:value-of select="dcterms:license"/></license>
                
             <alternative><xsl:for-each select="dcterms:alternative"><xsl:value-of select="."/> <xsl:if test="position()!=last()"><xsl:text>/ </xsl:text></xsl:if> </xsl:for-each></alternative>
             <url_sound><xsl:value-of select="dc:identifier[starts-with(normalize-space(.), 'http://cocoon.huma-num.fr/data')][1]"/></url_sound>
             
				<url_sound_bis><xsl:value-of select="dcterms:isFormatOf[starts-with(normalize-space(.), 'http://cocoon.huma-num.fr/data')][1]"/> </url_sound_bis>
                <url_sound_ter><xsl:value-of select="dcterms:isFormatOf[starts-with(normalize-space(.), 'http://cocoon.huma-num.fr/data')][2]"/> </url_sound_ter>
             
             <spatial_fr><xsl:if test="dcterms:spatial[@xml:lang='fr']"><xsl:value-of select="dcterms:spatial[@xml:lang='fr']"/></xsl:if></spatial_fr>
             <spatial_en><xsl:if test="dcterms:spatial[@xml:lang='en']"><xsl:value-of select="dcterms:spatial[@xml:lang='en']"/></xsl:if></spatial_en>
             <spatial_autre><xsl:if test="dcterms:spatial[not(@xml:lang='fr') and not(@xml:lang='en')]"><xsl:value-of select="dcterms:spatial[not(@xml:lang='fr') and not(@xml:lang='en')]"/></xsl:if></spatial_autre>
            			
			<extent><xsl:if test="dcterms:extent"><xsl:value-of select="dcterms:extent"/></xsl:if></extent>
            <created><xsl:if test="dcterms:created"><xsl:value-of select="dcterms:created"/></xsl:if></created>
			
             <!--<xsl:choose>
             <xsl:when test="contains('_IMG',dcterms:isRequiredBy[1])">
             <xsl:variable name="text_id"><xsl:value-of select="//oai:ListRecords/oai:record[oai:header/oai:identifier = $text_id]/oai:metadata/olac:olac/dc:identifier[1]"/></xsl:variable>
             </xsl:when>
             </xsl:choose>
             <xsl:otherwise>
             <xsl:variable name="text_id"><xsl:value-of select="dcterms:isRequiredBy[1]"/></xsl:variable>
             </xsl:otherwise>-->
             
             <!--<xsl:value-of select="$text_id"/>-->
            <!-- <xsl:variable name="text_id"><xsl:value-of select="dcterms:isRequiredBy[1]"/></xsl:variable>-->
             <url_text><xsl:value-of select="//oai:ListRecords/oai:record[oai:header/oai:identifier = $text_id]/oai:metadata/olac:olac/dc:identifier[1]"/></url_text>
             
             
             <!--<xsl:variable name="text_id"><xsl:value-of select="dcterms:isRequiredBy[1]"/></xsl:variable>-->
            <!--<url_pdf><xsl:value-of select="//oai:ListRecords/oai:record[oai:header/oai:identifier = $pdf_id]/oai:metadata/olac:olac/dc:identifier[1]"/></url_pdf>-->
             
             <chercheurs>
             		<xsl:for-each select="dc:contributor[@olac:code='researcher']">
        				<xsl:value-of select="."/>
        				<xsl:if test="position()!=last()"><xsl:text>; </xsl:text></xsl:if>
        			</xsl:for-each>
             </chercheurs>
             <locuteurs>
             <xsl:for-each select="dc:contributor[@olac:code='speaker']|dc:contributor[@olac:code='performer']">
        				<xsl:value-of select="."/>
        				<xsl:if test="position()!=last()"><xsl:text>; </xsl:text></xsl:if>
        			</xsl:for-each>
             </locuteurs>
             <autres_contributeurs_audio>
             <xsl:for-each select="dc:contributor[not(@olac:code='speaker')and not(olac:code='performer')and not(@olac:code='researcher')and not(@olac:code='depositor')]">
        				<xsl:value-of select="."/> (<xsl:value-of select="@olac:code"/>)
        				<xsl:if test="position()!=last()"><xsl:text>; </xsl:text></xsl:if>
        			</xsl:for-each>
             </autres_contributeurs_audio>
             
              <autres_contributeurs_texte>
             <xsl:for-each select="//oai:ListRecords/oai:record[oai:header/oai:identifier = $text_id]/oai:metadata/olac:olac/dc:contributor[not(@olac:code='speaker')and not(olac:code='performer')and not(@olac:code='researcher')and not(@olac:code='depositor')]">
        				<xsl:value-of select="."/> (<xsl:value-of select="@olac:code"/>)
        				<xsl:if test="position()!=last()"><xsl:text>; </xsl:text></xsl:if>
        			</xsl:for-each>
             </autres_contributeurs_texte>
             <sponsor>
             		<xsl:for-each select="dc:contributor[@olac:code='sponsor']">
        				<xsl:value-of select="."/>
        				<xsl:if test="position()!=last()"><xsl:text>; </xsl:text></xsl:if>
        			</xsl:for-each>
             </sponsor>
             
           
				<xsl:for-each select="dcterms:spatial[@xsi:type='dcterms:Point'][1]">
			
				<xsl:variable name="content"><xsl:value-of select="translate(.,' ','')"/></xsl:variable>
				<xsl:variable name="east1"><xsl:value-of select="substring-after($content,'east=')"/></xsl:variable>
                <xsl:variable name="north1"><xsl:value-of select="substring-after($content,'north=')"/></xsl:variable>
				
					<xsl:if test="contains($east1, ';')">
							<east><xsl:value-of select="substring-before($east1,';')"/></east>
					</xsl:if>
					<xsl:if test="not(contains($east1, ';'))">
							<east><xsl:value-of select="$east1"/></east>
					</xsl:if>

				    <xsl:if test="contains($north1, ';')">
							<north><xsl:value-of select="substring-before($north1,';')"/></north>
					</xsl:if>
					<xsl:if test="not(contains($north1, ';'))">
							<north><xsl:value-of select="$north1"/></north>
					</xsl:if>
			   
				</xsl:for-each>
            
            </xsl:for-each>
		</result>
	</xsl:template>

</xsl:stylesheet>