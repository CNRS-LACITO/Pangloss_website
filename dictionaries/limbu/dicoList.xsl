<?xml version="1.0" encoding="iso-8859-1"?> 

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
		xmlns:java="http://xml.apache.org/xslt/java"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		exclude-result-prefixes="xlink java"
		version="1.0">

<xsl:output method="html" indent="yes" encoding="iso-8859-1"/>
<xsl:strip-space elements="*"/> 


<xsl:template match="/">
	<HTML>
		<HEAD>
		<STYLE>
			.phonetic { 	
				font-weight: bold;
				font-size:10pt; 
				font-family: Arial unicode MS;
			}
			.litleItal { 	
				font-weight: normal;
				font-size:10pt; 
				font-style: italic;
				font-family: Times new Roman;
			}
			.normal { 	
				font-weight: normal;
				font-size:12pt; 
				font-style: normal;
				font-family: Times new Roman;
			}
		</STYLE>
		</HEAD>
		<BODY>
			<a href="invertkey.htm">English index</a>
			<UL>
				<xsl:for-each select=".//entry">
					<xsl:sort select="number(java:mysort.mysortvalue(string(form/pron[@type='headword']), string('1')))" data-type="number"/>
					<xsl:sort select="number(java:mysort.mysortvalue(string(form/pron[@type='headword']), string('2')))" data-type="number"/>
					<xsl:apply-templates select="."/>
				</xsl:for-each>
			</UL>
		</BODY>
	</HTML>
</xsl:template>

<xsl:template match="entry">
	<LI>
		<a target="dico">
			<xsl:attribute name="href">dico.htm#<xsl:value-of select="translate(@id,'ELMNOYZVW','fgjxv08')"/></xsl:attribute>
			<nobr><xsl:apply-templates select="form/pron[@type='headword']"/></nobr>
		</a>
	</LI>
</xsl:template>
<xsl:template match="pron/text()">
	<span class="phonetic"><xsl:value-of select="."/></span>
</xsl:template>

<xsl:template match="foreign">
	<i><xsl:text> </xsl:text><xsl:apply-templates/></i>
</xsl:template>

</xsl:stylesheet>