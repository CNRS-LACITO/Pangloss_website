<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:php="http://php.net/xsl"
    xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:xalan="http://xml.apache.org/xalan"
    xmlns:str="http://exslt.org/strings" exclude-result-prefixes="xi xalan" version="1.0">

    <xsl:output method="html" doctype-system="about:legacy-compat" indent="yes"/>


    <xsl:param name="filesim" select="'*'"/>
    <xsl:param name="nbsim" select="'*'"/>
    <xsl:param name="file1" select="'*'"/>
    <xsl:param name="file2" select="'*'"/>
    <xsl:param name="file3" select="'*'"/>
    <xsl:param name="file4" select="'*'"/>
    <xsl:param name="file5" select="'*'"/>
    <xsl:param name="file6" select="'*'"/>


    <!--<xsl:param name="file" select="similarities/files/file[1]"/>
<xsl:param name="f2_xml" select="similarities/files/file[2]"/>
<xsl:param name="f3_xml" select="similarities/files/file[3]"/>
<xsl:param name="lang" select="similarities/files/file[1]/@lang"/>
<xsl:param name="f2_lang" select="similarities/files/file[2]/@lang"/>
<xsl:param name="f3_lang" select="similarities/files/file[3]/@lang"/>
<xsl:param name="f1_sound" select="similarities/files/file[1]/@sound"/>
<xsl:param name="f2_sound" select="similarities/files/file[2]/@sound"/>
<xsl:param name="f3_sound" select="similarities/files/file[3]/@sound"/>-->
    <!-- ******************************************************** -->


    <xsl:template match="/">


		<xsl:variable name="pangloss1">http://lacito.vjf.cnrs.fr/INTRANET/test_pangloss/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/></xsl:variable>
        
        <xsl:variable name="pangloss2">http://lacito.vjf.cnrs.fr/INTRANET/test_pangloss/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/></xsl:variable>
        
        <xsl:variable name="pangloss3">http://lacito.vjf.cnrs.fr/INTRANET/test_pangloss/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/></xsl:variable>
        
        <xsl:variable name="pangloss4">http://lacito.vjf.cnrs.fr/INTRANET/test_pangloss/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/></xsl:variable>
        
        <xsl:variable name="pangloss5">http://lacito.vjf.cnrs.fr/INTRANET/test_pangloss/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@id"/></xsl:variable>
        
        <xsl:variable name="pangloss6">http://lacito.vjf.cnrs.fr/INTRANET/test_pangloss/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file6]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file6]/@id"/></xsl:variable>
                                       

		<table class="table" height="100%" width="100%" border="1">
        <tr>
        	<th>Similarity</th>
			<xsl:if test="$file1!=''">
            	<th> <a href="{$pangloss1}" target="_blank"><u><xsl:value-of select="$file1"/></u></a></th>
            </xsl:if>
            <xsl:if test="$file2!=''">
            <th> <a href="{$pangloss2}" target="_blank"><u><xsl:value-of select="$file2"/></u></a></th>
            </xsl:if>
            <xsl:if test="$file3!=''">
            <th> <a href="{$pangloss3}" target="_blank"><u><xsl:value-of select="$file3"/></u></a></th>
            </xsl:if>
            <xsl:if test="$file4!=''">
            <th> <a href="{$pangloss4}" target="_blank"><u><xsl:value-of select="$file4"/></u></a></th>
            </xsl:if>
            <xsl:if test="$file5!=''">
            <th> <a href="{$pangloss5}" target="_blank"><u><xsl:value-of select="$file5"/></u></a></th>
            </xsl:if>
            <xsl:if test="$file6!=''">
            <th> <a href="{$pangloss6}" target="_blank"><u><xsl:value-of select="$file6"/></u></a></th>
            </xsl:if>
        </tr>
        
       <xsl:for-each select="document($filesim)/similarities/similarity">
       <xsl:variable name="numsim" select="@id"/>
       	<tr>
       		<td><b> <xsl:value-of select="@id"/> </b></td>
       		
            <xsl:if test="$file1!=''">
           <td>
            <a href="ViewOneSimilarity.php?file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;filesim={$filesim}&amp;similarity={$numsim}&amp;color="
                                        target="_blank"
                                        onClick="window.open(this.href,'popup','width=900,height=600,scrollbars=yes,resizable=yes',1);return false">
            	<xsl:for-each select="file[@id=$file1]/sentence">
                	<span class="lien_sim"><xsl:value-of select="@id"/></span><xsl:text>    </xsl:text> 
                </xsl:for-each>
                </a>
            </td>
            </xsl:if>
            <xsl:if test="$file2!=''">
            <td>
            <a href="ViewOneSimilarity.php?file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;filesim={$filesim}&amp;similarity={$numsim}&amp;color="
                                        target="_blank"
                                        onClick="window.open(this.href,'popup','width=900,height=600,scrollbars=yes,resizable=yes',1);return false">
            	<xsl:for-each select="file[@id=$file2]/sentence">
                	<span class="lien_sim"><xsl:value-of select="@id"/></span><xsl:text>    </xsl:text> 
                </xsl:for-each>
                </a>
            </td>
            </xsl:if>
            <xsl:if test="$file3!=''">
            
            <td>
            <a href="ViewOneSimilarity.php?file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;filesim={$filesim}&amp;similarity={$numsim}&amp;color="
                                        target="_blank"
                                        onClick="window.open(this.href,'popup','width=900,height=600,scrollbars=yes,resizable=yes',1);return false">
            	<xsl:for-each select="file[@id=$file3]/sentence">
                	<span class="lien_sim"><xsl:value-of select="@id"/></span><xsl:text>    </xsl:text> 
                </xsl:for-each>
                </a>
            </td>
            </xsl:if>
            <xsl:if test="$file4!=''">
            <td>
            <a href="ViewOneSimilarity.php?file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;filesim={$filesim}&amp;similarity={$numsim}&amp;color="
                                        target="_blank"
                                        onClick="window.open(this.href,'popup','width=900,height=600,scrollbars=yes,resizable=yes',1);return false">
            	<xsl:for-each select="file[@id=$file4]/sentence">
                	<span class="lien_sim"><xsl:value-of select="@id"/></span><xsl:text>    </xsl:text>  
                </xsl:for-each>
                </a>
            </td>
            </xsl:if>
            <xsl:if test="$file5!=''">
            <td>
            <a href="ViewOneSimilarity.php?file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;filesim={$filesim}&amp;similarity={$numsim}&amp;color="
                                        target="_blank"
                                        onClick="window.open(this.href,'popup','width=900,height=600,scrollbars=yes,resizable=yes',1);return false">
            	<xsl:for-each select="file[@id=$file5]/sentence">
                	<span class="lien_sim"><xsl:value-of select="@id"/></span><xsl:text>    </xsl:text> 
                </xsl:for-each>
                </a>
            </td>
            </xsl:if>
            <xsl:if test="$file6!=''">
            <td>
            	<a href="ViewOneSimilarity.php?file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;filesim={$filesim}&amp;similarity={$numsim}&amp;color="
                                        target="_blank"
                                        onClick="window.open(this.href,'popup','width=900,height=600,scrollbars=yes,resizable=yes',1);return false">
            	<xsl:for-each select="file[@id=$file6]/sentence">
                	<span class="lien_sim"><xsl:value-of select="@id"/></span><xsl:text>    </xsl:text> 
                </xsl:for-each>
                </a>
            </td>
            </xsl:if>
            
       </tr>
       </xsl:for-each>

		</table>
   
    </xsl:template>








</xsl:stylesheet>
