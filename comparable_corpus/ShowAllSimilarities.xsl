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

       <br/>
       <br/>
       <br/>
       <br/>



        <div class="table-responsive row">
        
        
        		<div class="col-md-4" align="right">
                 <div class="panel-group">      
            <div class="panel panel-default">        
                <div class="panel-heading" style="background-color:#F8E2D3">
                    <h4 class="panel-title" align="center">
                        <a href="selection.php"><b>Comparer d'autres textes<br/> </b></a>
                    </h4>
                </div> 
            </div>
        </div>
                
                </div>
                
                <div class="col-md-4" align="right">
                 <div class="panel-group">      
            <div class="panel panel-default">        
                <div class="panel-heading" style="background-color:#e5eecc">
                    <h4 class="panel-title" align="center">
                        <a href="#"><b>Concordances (sur gloses ou morphèmes) </b></a> <a href="#" onClick="window.open('info_concordance.html','popupLink','toolbar=no,status=no,width=700px ,height=50px,resizable=yes',1).focus();return false">
                            <img src="../../images/icones/info1.png" height="20px" width="20px"/>
                        </a>
                        
                        

 						<form id="form" name="form" action="CreateConcordanceOneWord.php"
                            method="post">
                            <input name="mot" type="text" text="mot"/>
                            <input name="file1" type="hidden" value="{$file1}"/>
                            <input name="file2" type="hidden" value="{$file2}"/>
                            <input name="file3" type="hidden" value="{$file3}"/>
                            <input name="file4" type="hidden" value="{$file4}"/>
                            <input name="file5" type="hidden" value="{$file5}"/>
                            <input name="file6" type="hidden" value="{$file6}"/>
                            <input name="nbsim" type="hidden" value="{$nbsim}"/>
                            <input name="filesim" type="hidden" value="{$filesim}"/>


                            <input type="submit" value="Search"/>
                        </form>

                    </h4>
                        
                        <!-- Search term can be gloss (lexical or grammatical) or word in source language -->


                       
        
                </div> 
            </div>
        </div>
        
        </div>
        
                <div class="col-md-4" align="right">
                
         <div class="panel-group">      
            <div class="panel panel-default">        
                <div class="panel-heading" style="background-color:#E6E2FA">
                    <h4 class="panel-title" align="center">
                        <a href="CreateTabOfSimilarities.php?filesim={$filesim}&amp;file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;nbsim={$nbsim}','popupLink','toolbar=no,status=no,width=900px,scrollbars=yes ,height=1000px,resizable=yes',1).focus();return false"><b>Table des similarités pour les textes sélectionnés </b></a> <a href="#" onClick="window.open('info_similarity.html','popupLink','toolbar=no,status=no,width=700px ,height=100px,resizable=yes',1).focus();return false">
                            <img src="../../images/icones/info1.png" height="20px" width="20px"/>
                        </a>
                    </h4>
                </div> 
            </div>
        </div>
          
                       
                     
                    </div>
        </div>


		
		<xsl:if test="contains($filesim, 'orphans')='true'">
        	<p>
            <br/>
            <h3 align="center"><u>Proto-histoire Orphans</u></h3>
            <br/>
        </p>
        </xsl:if>
        <xsl:if test="contains($filesim, 'ogress')='true'">
           <p>
            <br/>
            <h3 align="center">Proto-histoire Ogress</h3>
            <br/>
        </p>
        </xsl:if>
        <xsl:if test="contains($filesim, 'urmother')='true'">
        	<p>
            <br/>
            <h3 align="center">Proto-histoire Ur-Mother</h3>
            <br/>
        </p>
        </xsl:if>
     
        

        <!--<xsl:value-of select="$url_similarities"/>-->
    <div class="row">
                            <xsl:choose>
                                <xsl:when test="$nbsim=2">
                                   <div class="col-xs-6">
                                        <xsl:variable name="pangloss1">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/></xsl:variable>
                                        <span style="background-color:#DFD2B5"><a href="{$pangloss1}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                                                <u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/></u>
                                                <br/>
                						
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"/></u>
                                            </h4>
                						</div>
                                         </a></span>
                                            <div style="width:auto; height:700px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file1"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                        </div>
                                       <div class="col-xs-6">
                                        <xsl:variable name="pangloss2">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/></xsl:variable>
                                        <a href="{$pangloss2}" target="_blank">
                                        <div class="page-header">
                                        	<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"/></u>
                                             </h4>
                						</div>
                                         </a>
                                            <div style="width:auto; height:700px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file2"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                </xsl:when>


                                <xsl:when test="$nbsim=3">
                                    <div class="col-xs-4">
                                        <xsl:variable name="pangloss1">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/></xsl:variable>
                                        <a href="{$pangloss1}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"/></u>
                							</h4>
                                         </div>
                                         </a>
                                            <div style="width:auto; height:700px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file1"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                      </div>
                                      <div class="col-xs-4">
                                        <xsl:variable name="pangloss2">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/></xsl:variable>
                                        <a href="{$pangloss2}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:700px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file2"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                       <div class="col-xs-4">
                                        <xsl:variable name="pangloss3">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/></xsl:variable>
                                        <a href="{$pangloss3}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:700px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file3"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                </xsl:when>




                                <xsl:when test="$nbsim=4">
                                    <div class="row">
                                    <div class="col-xs-6">
                                        <xsl:variable name="pangloss1">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/></xsl:variable>
                                        <a href="{$pangloss1}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file1"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                       <div class="col-xs-6">
                                        <xsl:variable name="pangloss2">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/></xsl:variable>
                                        <a href="{$pangloss2}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file2"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                       </div>
                                       <div class="row">
                                       <div class="col-xs-6">
                                        <xsl:variable name="pangloss3">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/></xsl:variable>
                                        <a href="{$pangloss3}" target="_blank">
                                       <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file3"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                       <div class="col-xs-6">
                                        <xsl:variable name="pangloss4">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/></xsl:variable>
                                        <a href="{$pangloss4}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file4"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                       </div>
                                </xsl:when>


                                <xsl:when test="$nbsim=5">
                                    <div class="row">
                                       <div class="col-xs-4">
                                        <xsl:variable name="pangloss1">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/></xsl:variable>
                                        <a href="{$pangloss1}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file1"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       		</div>
                                            <div class="col-xs-4">
                                        <xsl:variable name="pangloss2">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/></xsl:variable>
                                        <a href="{$pangloss2}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file2"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                        </div>
                                        <div class="col-xs-4">
                                        <xsl:variable name="pangloss3">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/></xsl:variable>
                                        <a href="{$pangloss3}" target="_blank">
                                       <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file3"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                          </div>
                                         </div>
                                       <div class="row">
                                       <div class="col-xs-4">
                                        <xsl:variable name="pangloss4">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/></xsl:variable>
                                        <a href="{$pangloss4}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file4"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                       <div class="col-xs-4">
                                        <xsl:variable name="pangloss5">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@id"/></xsl:variable>
                                        <a href="{$pangloss5}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file5"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file5]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file5]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file5]/@speaker"
                                                  />
                                                </xsl:call-template>
                                             </div>
                                       </div>
                                   </div>
                                </xsl:when>

                                <xsl:when test="$nbsim=6">
                                   <div class="row">
                                       <div class="col-xs-4">
                                        <xsl:variable name="pangloss1">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@id"/></xsl:variable>
                                        <a href="{$pangloss1}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file1"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file1]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                        </div>
                                        <div class="col-xs-4">
                                        <xsl:variable name="pangloss2">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@id"/></xsl:variable>
                                        <a href="{$pangloss2}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file2"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file2]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                       </div>
                                       <div class="col-xs-4">
                                        <xsl:variable name="pangloss3">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@id"/></xsl:variable>
                                        <a href="{$pangloss3}" target="_blank">
                                        <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file3"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file3]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                      </div>
                                      </div>
                                      <div class="row">
                                      <div class="col-xs-4">
                                        <xsl:variable name="pangloss4">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@id"/></xsl:variable>
                                        <a href="{$pangloss4}" target="_blank">
                                       <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@lang"/></u>
                                                <br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file4]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file4"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file4]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                        </div>
                                        <div class="col-xs-4">
                                        <xsl:variable name="pangloss5">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@id"/></xsl:variable>
                                        <a href="{$pangloss5}" target="_blank">
                                       <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file5]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file5"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file5]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file5]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file5]/@speaker"
                                                  />
                                                </xsl:call-template>
                                            </div>
                                        </div>
                                        <div class="col-xs-4">
                                        <xsl:variable name="pangloss6">http://lacito.vjf.cnrs.fr/pangloss/corpus/show_text.php?id=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file6]/@id"/>_SOUND&amp;idref=<xsl:value-of select="document($filesim)//similarities/files/file[@id=$file6]/@id"/></xsl:variable>
                                        <a href="{$pangloss6}" target="_blank">
                                       <div class="page-header">
                    						<h4>
                    							<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file6]/@lang"/></u>
                							<br/>
                   					 			<u><xsl:value-of select="document($filesim)//similarities/files/file[@id=$file6]/@speaker"/></u>
                							</h4>
                                        </div>
                                         </a>
                                            <div style="width:auto; height:350px; overflow:auto;">
                                                <xsl:call-template name="sim">
                                                  <xsl:with-param name="file" select="$file6"/>
                                                  <xsl:with-param name="xml"
                                                  select="document($filesim)//similarities/files/file[@id=$file6]/@xml"/>
                                                  <xsl:with-param name="lang"
                                                  select="document($filesim)//similarities/files/file[@id=$file6]/@lang"/>
                                                  <xsl:with-param name="speaker"
                                                  select="document($filesim)//similarities/files/file[@id=$file6]/@speaker"
                                                  />
                                                </xsl:call-template>
                                                </div>
                                       	 </div>
                                       </div>
                                </xsl:when>
                            </xsl:choose>
						</div>
             
    </xsl:template>

    <xsl:template name="sim">

        <xsl:param name="file" select="''"/>
        <xsl:param name="xml" select="''"/>
        <xsl:param name="lang" select="''"/>
        <xsl:param name="speaker" select="''"/>
        <xsl:param name="speaker" select="''"/>

        <table border="0">
            
            
          
            <!--<xsl:call-template name="player-audio_wav_file1">
<xsl:with-param name="f1_sound" select="$f1_sound"/>
<xsl:with-param name="file" select="$file"/>
</xsl:call-template>-->
            <!--PARTIE TRAITEMENT ET AFFICHAGE FILE-->

            <xsl:for-each select="document($xml)//TEXT/S">
                <xsl:variable name="num_s" select="position()"/>
                <xsl:variable name="id_s" select="@id"/>

                <xsl:variable name="num_sim"
                                select="document($filesim)//similarities/similarity/file[@id=$file]/sentence[@id=$id_s]/parent::node()/parent::node()/@id"/>

                            <xsl:variable name="similarity"
                                select="document($filesim)//similarities/similarity/file[@id=$file]/sentence[@id=$id_s]/parent::node()/parent::node()/@id"/>
                                

                            <xsl:variable name="color"
                                select="document($filesim)//similarities/similarity/file[@id=$file]/sentence[@id=$id_s]/parent::node()/parent::node()/color"/>
                               
                <tr>
                    <xsl:choose>
                        <!--<xsl:when test="document($filesim)//similarities/similarity/file[@id=$file]/sentence[@id=$id_s]">-->
                        <xsl:when
                           test="
(((document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id=$file1]))
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id=$file2])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id!=$file]) and ((document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id=$file3])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id=$file4])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id!=$file])) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id=$file5])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[1][@id=$file6])))
or
(((document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id=$file1]))
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id=$file2])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id!=$file]) and ((document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id=$file3])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id=$file4])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id!=$file])) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id=$file5])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[2][@id=$file6])))
or
(((document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id=$file1]))
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id=$file2])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id!=$file]) and ((document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id=$file3])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id=$file4])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id!=$file])) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id=$file5])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[3][@id=$file6])))
or
(((document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id=$file1]))
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id=$file2])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id!=$file]) and ((document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id=$file3])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id=$file4])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id!=$file])) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id=$file5])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[4][@id=$file6])))
or
(((document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id=$file1]))
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id=$file2])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id!=$file]) and ((document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id=$file3])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id=$file4])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id!=$file])) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id=$file5])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[5][@id=$file6])))
or
(((document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id=$file1]))
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id=$file2])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id!=$file]) and ((document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id=$file3])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id=$file4])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id!=$file])) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id=$file5])) 
or ((document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id!=$file]) and (document($filesim)//similarities/similarity[@id=$num_sim]/file[6][@id=$file6])))">

                            




                            <!--<xsl:if test="document($filesim)//similarities/similarity[@id=$num_sim]/file[@id=$file1]">-->

                            <!-- Test que pour une similarité donnée on a bien les textes selectionnes qui sont concernés -->

                          


                                <td class="segmentContent" width="600px" bgcolor="{$color}">
                                    <!--<a href="listen.php?similarity={$similarity}&amp;file={$f1_sound}"><img src="../outils/play.gif" alt="écouter"/></a>-->
                                    <!--<a href="#" onClick="window.open('http://crdo.risc.cnrs.fr/media-cut.php?start=11.7067&amp;end=19.6529&amp;file=DEPOT_HAYUB_22km.wav','Fiche','toolbar=no,status=no,width=200 ,height=120,scrollbars=yes,location=no,resize=yes,menubar=yes')">
<p><b>Similarity <xsl:value-of select="$num_sim"/></b><br/></p>
</a>-->
                                    <!--<xsl:value-of select="document($filesim)//similarities/similarity/file[@id=$file2]/sentence[@id=$id_s]/parent::node()/parent::node()/file/@id"/>-->
                                    <!--<a href="#" onClick="window.open('ViewOneSimilarity.php?similarity={$similarity}&amp;color={$color}','Fiche','toolbar=no,status=no,width=900 ,height=600,scrollbars=yes,location=no,resize=yes,menubar=yes')">
<p><b>Similarity <xsl:value-of select="$num_sim"/></b><br/></p>
</a>-->
                                    <!--<input type='hidden' name='who' value='".$who."'/>-->
                                    <a
                                        href="ViewOneSimilarity.php?file1={$file1}&amp;file2={$file2}&amp;file3={$file3}&amp;file4={$file4}&amp;file5={$file5}&amp;file6={$file6}&amp;filesim={$filesim}&amp;similarity={$similarity}&amp;color={$color}"
                                        target="_blank"
                                        onClick="window.open(this.href,'popup','width=900,height=600,scrollbars=yes,resizable=yes',1);return false">
                                        <p><b>Similarités <xsl:value-of select="$num_sim"
                                            /></b><br/></p>
                                    </a> S<xsl:value-of select="$num_s"/><br/>
                                    <!-- <a href="javascript:boutonStop()">
<img src="../outils/stop.gif" alt="stop"/>
</a>-->
                                    <!--<a href="javascript:playFrom('{position()}')">-->
                                    <!--<a href="media-cut.php?start=25.9921&amp;end=35.2007&amp;file=$f1_sound">
<img src="../outils/play.gif" alt="écouter"/>
</a>-->
                                    <!-- affiche le nom du locuteur si il y en a -->
                                    <xsl:if
                                        test="((@who) and (not(@who='')) and (not(@who=ancestor::TEXT/S[number(position())-1]/@who)))">
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
                                                <br/>
                                            </xsl:for-each>
                                        </div>
                                    </xsl:if>
                                    <!-- Cas ou W ou M contiennent la balise FORM et ou S ne contient pas la balise FORM -->
                                    <xsl:if test="not(FORM) and (W/FORM or W/M/FORM)">
                                        <!-- Recuperation des mots ou morphemes puis concatenation pour former une phrase -->
                                        <xsl:for-each select="W">
                                            <div class="word_sentence">
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
                                                  <xsl:otherwise>
                                                  <xsl:value-of select="M/FORM"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  </xsl:otherwise>
                                                </xsl:choose>
                                            </div>
                                        </xsl:for-each>
                                    </xsl:if>
                               
                                    <!-- Recupere les mots avec leur glose -->
                                   <!-- <xsl:if
                                        test="(W/FORM and W/TRANSL) or (W/M/FORM and W/M/TRANSL) ">
                                        <xsl:for-each select="W">
                                            <table class="word">
                                                <tbody>
                                                  <tr>
                                                  <td class="word_form">
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
                                                  <xsl:otherwise>
                                                  <xsl:for-each select="M/FORM">
                                                  <xsl:value-of select="."/>
                                                  <xsl:if test="position()!=last()">-</xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  </td>
                                                  </tr>
                                                  <tr>
                                                  <td class="word_transl">
                                                  <xsl:choose>
                                                  <xsl:when
                                                  test="M/TRANSL[@xml:lang or @lang] or TRANSL[@xml:lang or @lang]">
                                                  <xsl:if
                                                  test="M/TRANSL[@xml:lang='en' or @lang='en']">
                                                  <xsl:for-each
                                                  select="M/TRANSL[@xml:lang='en' or @lang='en']">
                                                  <xsl:value-of select="."/>
                                                  <xsl:if test="position()!=last()">-</xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:if>
                                                  <xsl:if test="M/TRANSL[@xml:lang='fr']">
                                                  <xsl:for-each
                                                  select="M/TRANSL[@xml:lang='fr' or @lang='fr']">
                                                  <xsl:value-of select="."/>
                                                  <xsl:if test="position()!=last()">-</xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:if>
                                                  <xsl:if
                                                  test="not(M/TRANSL[@xml:lang='en' or @lang='en']) and not(M/TRANSL[@xml:lang='fr' or @lang='fr'])">
                                                  <xsl:for-each select="M/TRANSL">
                                                  <xsl:value-of select="."/>
                                                  <xsl:if test="position()!=last()">-</xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:if>
                                                  <xsl:if
                                                  test="TRANSL[@xml:lang='en' or @lang='en']">
                                                  <xsl:value-of
                                                  select="TRANSL[@xml:lang='en' or @lang='en']"/>
                                                  </xsl:if>
                                                  <xsl:if
                                                  test="TRANSL[@xml:lang='fr' or @lang='fr']">
                                                  <xsl:value-of
                                                  select="TRANSL[@xml:lang='fr' or @lang='fr']"/>
                                                  </xsl:if>
                                                  <xsl:if
                                                  test="not(TRANSL[@xml:lang='en' or @lang='en']) and not(TRANSL[@xml:lang='fr' or @lang='fr'])">
                                                  <xsl:for-each select="TRANSL">
                                                  <xsl:value-of select="."/>
                                                  <xsl:if test="position()!=last()">-</xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:if>
                                                  </xsl:when>
                                                  <xsl:otherwise>
                                                  <xsl:if test="M/TRANSL">
                                                  <xsl:for-each select="M/TRANSL[1]">
                                                  <xsl:value-of select="."/>
                                                  <xsl:if test="position()!=last()">-</xsl:if>
                                                  </xsl:for-each>
                                                  </xsl:if>
                                                  <xsl:if test="TRANSL">
                                                  <xsl:value-of select="TRANSL[1]"/>
                                                  </xsl:if>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                  </td>
                                                  </tr>
                                                </tbody>
                                            </table>
                                        </xsl:for-each>
                                    </xsl:if>
                                    <br/>-->
                                 
                                    <xsl:if test="TRANSL">
                                        <!-- Recupere la traduction si il en existe une -->
                                        <xsl:for-each select="TRANSL[@xml:lang='en' or @lang='en']">
                                            <div class="translation_en">
                                                <xsl:value-of select="."/><br/>
                                            </div>
                                        </xsl:for-each>
                                        <xsl:for-each select="TRANSL[@xml:lang='fr' or @lang='fr']">
                                            <div class="translation_fr">
                                                <xsl:value-of select="."/><br/>
                                            </div>
                                        </xsl:for-each>
                                        <xsl:for-each
                                            select="TRANSL[(@xml:lang!='fr' or @lang!='fr') and (@xml:lang!='en' or @lang!='fr')]">
                                            <div class="translation_other">
                                                <xsl:value-of select="."/><br/>
                                            </div>
                                        </xsl:for-each>
                                    </xsl:if>
                                    <br/>
                                </td>


                  










                        </xsl:when>
                        <xsl:otherwise>

                            <td class="segmentContent" width="600px"> S<xsl:value-of
                                    select="$num_s"/><br/>
                                <!--<a href="javascript:boutonStop()">
<img src="../outils/stop.gif" alt="stop"/>
</a>
<a href="javascript:playFrom('{position()}')">
<img src="../outils/play.gif" alt="écouter"/>
</a>-->
                                <!-- affiche le nom du locuteur si il y en a -->
                                <xsl:if
                                    test="((@who) and (not(@who='')) and (not(@who=ancestor::TEXT/S[number(position())-1]/@who)))">
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
                                            <br/>
                                        </xsl:for-each>
                                    </div>
                                </xsl:if>
                                <!-- Cas ou W ou M contiennent la balise FORM et ou S ne contient pas la balise FORM -->
                                <xsl:if test="not(FORM) and (W/FORM or W/M/FORM)">
                                    <!-- Recuperation des mots ou morphemes puis concatenation pour former une phrase -->
                                    <xsl:for-each select="W">
                                        <div class="word_sentence">
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
                                                  <xsl:otherwise>
                                                  <xsl:value-of select="M/FORM"/>
                                                  </xsl:otherwise>
                                                  </xsl:choose>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </div>
                                    </xsl:for-each>
                                </xsl:if>
                                
                               
                               <br/>
                                <xsl:if test="TRANSL">
                                    <!-- Recupere la traduction si il en existe une -->
                                    <xsl:for-each select="TRANSL[@xml:lang='en' or @lang='en']">
                                        <div class="translation_en">
                                            <xsl:value-of select="."/><br/>
                                        </div>
                                    </xsl:for-each>
                                    <xsl:for-each select="TRANSL[@xml:lang='fr' or @lang='fr']">
                                        <div class="translation_fr">
                                            <xsl:value-of select="."/><br/>
                                        </div>
                                    </xsl:for-each>
                                    <xsl:for-each
                                        select="TRANSL[(@xml:lang!='fr' or @lang!='fr') and (@xml:lang!='en' or @lang!='fr')]">
                                        <div class="translation_other">
                                            <xsl:value-of select="."/><br/>
                                        </div>
                                    </xsl:for-each>
                                </xsl:if>
                                <br/>
                            </td>
                        </xsl:otherwise>
                    </xsl:choose>
                </tr>
            </xsl:for-each>
        </table>


    </xsl:template>


</xsl:stylesheet>
