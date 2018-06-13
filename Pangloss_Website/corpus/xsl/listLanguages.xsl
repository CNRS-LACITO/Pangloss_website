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
	
	<xsl:output method="html" doctype-system="about:legacy-compat" indent="yes"/>
	
	<xsl:param name="aff_lang" select="''"/>
<xsl:param name="tri" select="''"/>
	
	<!-- ******************************************************** -->

    

	<xsl:template match="/"> 
	
    <h4 align="center"><div class="panel-heading" style="background-color:#FFFAE6">
    
    <xsl:if test="$aff_lang='fr'">
    <i><a href="index.html">Liste par continent.</a></i> Développer tout
    </xsl:if>
    <xsl:if test="$aff_lang='en'">
    <i><a href="index_en.html">List by continent.</a></i> Show all
    </xsl:if>
    
    
    </div></h4>     
    
    
    
    <table class="table">
    
     <xsl:if test="$aff_lang='fr'">
    	<th style="background-color:#e5eecc"><b><a href="corpora_list.php?tri=language_fr">Corpus (Langues)</a></b></th>
        <th style="background-color:#e5eecc"><b><a href="corpora_list.php?tri=family_fr">Famille</a></b></th>
        <th style="background-color:#e5eecc"><b><a href="corpora_list.php?tri=country_fr">Pays</a></b></th>
        <th style="background-color:#e5eecc"><b><a href="corpora_list.php?tri=researcher">Chercheur</a></b></th>
      </xsl:if>
       <xsl:if test="$aff_lang='en'">
    	<th style="background-color:#e5eecc"><b><a href="corpora_list_en.php?tri=language">Corpora (Languages)</a></b></th>
        <th style="background-color:#e5eecc"><b><a href="corpora_list_en.php?tri=family">Family</a></b></th>
        <th style="background-color:#e5eecc"><b><a href="corpora_list_en.php?tri=country">Country</a></b></th>
        <th style="background-color:#e5eecc"><b><a href="corpora_list_en.php?tri=researcher">Researcher</a></b></th>
      </xsl:if>
      
        <!--<xsl:value-of select="$tri"/>-->
         <xsl:if test="$aff_lang='fr'">
        <xsl:for-each select="corpora/corpus">
        <xsl:sort select="*[name()=$tri]" order="ascending"/>
        <xsl:variable name="lg" select="language"/>
        	<tr>
           <td>
            	<b><a style="color:#630"
 href="list_rsc.php?lg={$lg}"><xsl:value-of select="language_fr"/></a></b>
        	</td>
            <td>
            	<xsl:value-of select="family_fr"/>
        	</td>
            <td>
            	<xsl:value-of select="country_fr"/>
        	</td>
            <td>
            <xsl:for-each select="researcher">
            
            	<!--<xsl:value-of select="researcher/name"/>-->
            	
                <xsl:variable name="page" select="page"/>
                	<b><a style="color:#630" href="{$page}"><xsl:value-of select="name"/></a></b>
                
        	<br/>
            </xsl:for-each>
            </td>
            </tr>
        </xsl:for-each>
        </xsl:if>
        
        
        
        
        
        
        
        
        
        
         <xsl:if test="$aff_lang='en'">
         <xsl:for-each select="corpora/corpus">
        <xsl:sort select="*[name()=$tri]" order="ascending"/>
        <xsl:variable name="lg" select="language"/>
        	<tr>
           <td>
            	<b><a style="color:#630"
 href="list_rsc_en.php?lg={$lg}"><xsl:value-of select="language"/></a></b>
        	</td>
            <td>
            	<xsl:value-of select="family"/>
        	</td>
            <td>
            	<xsl:value-of select="country"/>
        	</td>
            <td>
            <xsl:for-each select="researcher">
            
            	<!--<xsl:value-of select="researcher/name"/>-->
            	
                <xsl:variable name="page" select="page"/>
                	<b><a style="color:#630" href="{$page}"><xsl:value-of select="name"/></a></b>
                
        	<br/>
            </xsl:for-each>
            </td>
            </tr>
        </xsl:for-each>
        </xsl:if>
        
        
        
        
        
    </table>
    </xsl:template>	
  
	
</xsl:stylesheet>
