<?xml version="1.0" encoding="iso-8859-1"?> 
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
		xmlns:xlink="http://www.w3.org/1999/xlink"
		exclude-result-prefixes="xlink"
		version="1.0">

<xsl:param name="XML" select="''"/><xsl:param name="XSL" select="''"/><xsl:param name="lg" select="''"/>
<xsl:variable name="host">http://lacito.archivage.vjf.cnrs.fr</xsl:variable>
<xsl:variable name="website"><xsl:value-of select="$host"/>/archives</xsl:variable>
<xsl:variable name="stylesheets"><xsl:value-of select="$website"/>/styles</xsl:variable>
<xsl:variable name="servlet"><xsl:value-of select="$host"/>:8080/servlets-examples/servlet/myxsl</xsl:variable>


<xsl:output method="html" indent="yes" encoding="iso-8859-1"/><xsl:strip-space elements="*"/> 

<xsl:template match="/">	<HTML>		<HEAD>		<STYLE>			.phonetic { 					font-weight: bold;				font-size:10pt; 				font-family: Arial unicode MS;			}			.littleItal { 					font-weight: normal;				font-size:10pt; 				font-style: italic;				font-family: Times new Roman;			}			.normal { 					font-weight: normal;				font-size:12pt; 				font-style: normal;				font-family: Times new Roman;			}		</STYLE>		</HEAD>		<BODY>			<h2>Limbu-English Dictionary of the Mewa Khola dialect</h2>
			<h3>Boyd Michailovsky</h3>
			<DL>				<xsl:for-each select=".//entry">					<xsl:apply-templates select="."/>				</xsl:for-each>			</DL>		</BODY>	</HTML></xsl:template>
<!-- formatage des reponses --><xsl:template match="entry">	<DT>		<A>
			<xsl:attribute name="name"><xsl:value-of select="translate(@id,'ELMNOYZVW','fgjxv08')"/></xsl:attribute>
		</A>

		<xsl:apply-templates select="form/pron[@type='headword']"/>	</DT>	<DD>		<xsl:apply-templates select="form"/>		<xsl:apply-templates select="gramGrp"/>		<xsl:apply-templates select="sense"/>		<xsl:apply-templates select="xr"/>		<!-- <xsl:apply-templates select="usg"/> -->		<xsl:apply-templates select="hom"/>	</DD></xsl:template><xsl:template match="hom">	<BLOCKQUOTE>		<xsl:apply-templates/>	</BLOCKQUOTE></xsl:template>
<xsl:template match="form">	<div>		<xsl:for-each select="pron[@type='var']">			<xsl:if test="position()=1"><span class="littleItal"> also: </span></xsl:if>			<xsl:apply-templates/>			<xsl:if test="position()!=last()">, </xsl:if>		</xsl:for-each>		<xsl:for-each select="pron[@type='allom']">			<xsl:if test="position()=1"><span class="littleItal"> allomorph: </span></xsl:if>			<xsl:apply-templates/>			<xsl:if test="position()!=last()">, </xsl:if>		</xsl:for-each>		<xsl:for-each select="pron[@type='neg']">			<xsl:if test="position()=1"><span class="littleItal"> negative: </span></xsl:if>			<xsl:apply-templates/>			<xsl:if test="position()!=last()">, </xsl:if>		</xsl:for-each>		<xsl:for-each select="pron[not(@type='headword')]">			<xsl:choose>				<xsl:when test="@type='root'"> <span class="littleItal"> <br/>root: </span><span class="phonetic">&#x221A;</span><xsl:apply-templates/></xsl:when>
				<xsl:when test="@type='prstem'"><span class="littleItal"> <br/>present stem: </span><xsl:apply-templates/></xsl:when>
				<xsl:when test="@type='pastem'"><span class="littleItal"> <br/>past stem: </span><xsl:apply-templates/></xsl:when>
				<xsl:when test="@type='fem'"><span class="littleItal"> <br/>fem: </span><xsl:apply-templates/></xsl:when>				<xsl:when test="@type='poss'"><span class="littleItal"> <br/>poss: </span><xsl:apply-templates/></xsl:when>			</xsl:choose>			<xsl:if test="position()=last()">.</xsl:if>		</xsl:for-each>		<xsl:apply-templates select="note[@type='comm']"/>	</div></xsl:template><xsl:template match="pron/text()">	<span class="phonetic"><xsl:value-of select="."/></span></xsl:template>
<xsl:template match="gramGrp">	<div>		<xsl:apply-templates select="pos"/>		<xsl:apply-templates select="note[(@type='comm') or (@type='gram')]"/>	</div></xsl:template><xsl:template match="pos">	<span class="littleItal"><xsl:apply-templates/></span></xsl:template>
<xsl:template match="sense">	<div>		<xsl:apply-templates select="def"/>		<xsl:for-each select="eg[not(@type='hidden')]">			<div>				<xsl:text> &#183; </xsl:text>				<xsl:text> </xsl:text>				<xsl:apply-templates/>			</div>		</xsl:for-each>		<xsl:apply-templates select="note[@type='comm']"/>
		<!-- <xsl:apply-templates select="key|sem|xptr|note"/> -->	</div></xsl:template><xsl:template match="def">	<div>		<xsl:text> </xsl:text>		<xsl:choose>			<xsl:when test="@type='binom'"><span class="littleItal"><xsl:apply-templates/></span></xsl:when>			<xsl:when test="@xml:lang='ne'"> nepali:<xsl:apply-templates/></xsl:when>			<xsl:when test="@type='par'"></xsl:when>			<xsl:otherwise><xsl:apply-templates/></xsl:otherwise>		</xsl:choose>		<xsl:if test="position()=last()">. </xsl:if>	</div></xsl:template>
<xsl:template match="family">	<span class="normal">		<xsl:text> </xsl:text>		&lt;<xsl:value-of select="@name"/>&gt;	</span></xsl:template><xsl:template match="eg/q">	<span class="phonetic"><xsl:apply-templates/></span></xsl:template><xsl:template match="eg/trans">	<span class="normal"><xsl:text> &#x2014; </xsl:text><xsl:apply-templates/></span></xsl:template>
<xsl:template match="eg/link">
	<xsl:variable name="xmlfile" select="substring-before(@xlink:href,'#')"/>
	<xsl:variable name="xptr"    select="substring-after(@xlink:href,'#')"/>
	<xsl:variable name="xpath"   select="substring($xptr,10, string-length($xptr)-10)"/>
	<xsl:text> </xsl:text>(<a href="{$servlet}?XML={$xmlfile}&amp;XSL={$stylesheets}/find.xsl&amp;xpath={$xpath}&amp;level=M"><xsl:value-of select="."/></a>)
</xsl:template><xsl:template match="eg/xptr"/>

<xsl:template match="xr">	<div>		<xsl:apply-templates select="ptr[@type='v']"/>		<xsl:apply-templates select="ptr[@type='cfd']"/>		<xsl:apply-templates select="ptr[@type='cf']"/>		<xsl:apply-templates select="ptr[@type='cfin']"/>		<xsl:apply-templates select="ptr[@type='allomof']"/>		<xsl:apply-templates select="ptr[@type='negof']"/>
		<xsl:apply-templates select="ptr[@type='cfe']"/>

		<xsl:apply-templates select="wordFamily[(@type='cff') or (@type='cfv')]"/>
		<xsl:apply-templates select="note[@type='comm']"/>
	</div>
</xsl:template><xsl:template match="wordFamily">
	<xsl:choose>
		<xsl:when test="@type='cff'"><span class="littleItal"> postfinal-related: </span><xsl:value-of select="@family"/></xsl:when>
		<xsl:when test="@type='cfv'"><span class="littleItal"> initial-related: </span><xsl:value-of select="@family"/></xsl:when>
	</xsl:choose>
</xsl:template>
<xsl:template match="xr/ptr">	<xsl:if test="position()=1">		<xsl:choose>			<xsl:when test="@type='v'"><span class="littleItal"> see: </span></xsl:when>			<xsl:when test="@type='cfd'"><span class="littleItal"> dialect: </span></xsl:when>			<xsl:when test="@type='cf'"><span class="littleItal"> cf.: </span></xsl:when>			<xsl:when test="@type='cfin'"><span class="littleItal"> occurs in: </span></xsl:when>			<xsl:when test="@type='cfe'"><span class="littleItal"> etymology: </span></xsl:when>			<xsl:when test="@type='allomof'"><span class="littleItal"> allomorph of: </span></xsl:when>			<xsl:when test="@type='negof'"><span class="littleItal"> negative of: </span></xsl:when>		</xsl:choose>	</xsl:if>	<a class="phonetic">
		<xsl:attribute name="href">#<xsl:value-of select="translate(@target,'ELMNOYZVW','fgjxv08')"/></xsl:attribute>
		<xsl:apply-templates/>	</a>	<xsl:if test="position()!=last()">,</xsl:if>	<xsl:text> </xsl:text></xsl:template><xsl:template match="ptr">	<xsl:choose>		<xsl:when test="@type='v'"><span class="littleItal"> see: </span></xsl:when>		<xsl:when test="@type='cfd'"><span class="littleItal"> dialect: </span></xsl:when>		<xsl:when test="@type='cf'"><span class="littleItal"> cf.: </span></xsl:when>		<xsl:when test="@type='cfin'"><span class="littleItal"> occurs in: </span></xsl:when>		<xsl:when test="@type='cfe'"><span class="littleItal"> etymology: </span></xsl:when>		<xsl:when test="@type='allomof'"><span class="littleItal"> allomorph of: </span></xsl:when>		<xsl:when test="@type='negof'"><span class="littleItal"> negative of: </span></xsl:when>	</xsl:choose>	<a class="phonetic">
		<xsl:attribute name="href">#<xsl:value-of select="translate(@target,'ELMNOYZVW','fgjxv08')"/></xsl:attribute>		<xsl:apply-templates/>	</a></xsl:template>
<xsl:template match="foreign">	<i><xsl:text> </xsl:text><xsl:apply-templates/></i></xsl:template><xsl:template match="note">	<xsl:if test="@type='comm'"> (<xsl:apply-templates/>) </xsl:if>	<xsl:if test="(@type='gram') and (./text()='PPR')"><span style="font-size: 10pt;"> relative noun</span></xsl:if>	<xsl:if test="(@type='gram') and (./text()='PPE')"><span style="font-size: 10pt;"> pronominal prefix indexes experiencer</span></xsl:if></xsl:template><xsl:template match="*[(@xml:lang='ne') or (@xml:lang='x-sil-LIF')]/text()">	<span style="font-size: 10pt; font-family: Arial unicode MS"><xsl:value-of select="."/></span></xsl:template>
</xsl:stylesheet>