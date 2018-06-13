<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/"
    xmlns:annot="http://crdo.risc.fr/schemas/annotation"
  	xmlns:php="http://php.net/xsl" 
    xmlns:xi="http://www.w3.org/2001/XInclude"
	xmlns:xalan="http://xml.apache.org/xalan"
	exclude-result-prefixes="xi xalan"
	version="1.0">
	
	<xsl:output method="xml" indent="yes"/>

	<xsl:param name="num_s" select="'*'"/>


	<xsl:template match="/">
		<result>
			<s_start><xsl:value-of select="//TEXT/S[@id=$num_s]/AUDIO/@start"/></s_start>
            <s_end><xsl:value-of select="//TEXT/S[@id=$num_s]/AUDIO/@end"/></s_end>
            
            <s_form><xsl:value-of select="//TEXT/S[@id=$num_s]/FORM"/></s_form>
            <s_transl><xsl:value-of select="//TEXT/S[@id=$num_s]/TRANSL"/></s_transl>
            
    		<!--<s_start><xsl:value-of select="//annot:TEXT/annot:S[contains(@id,$num_s)]/annot:AUDIO/@start"/></s_start>
            <s_end><xsl:value-of select="//annot:TEXT/annot:S[contains(@id,$num_s)]/annot:AUDIO/@end"/></s_end>-->
		</result>
	</xsl:template>

</xsl:stylesheet>