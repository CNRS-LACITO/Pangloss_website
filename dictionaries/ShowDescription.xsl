<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:param name="alphabet" select="''"/>
  <xsl:param name="dict" select="''"/>
  <xsl:param name="lang1" select="''"/>
  <xsl:param name="lang2" select="''"/>
  <xsl:param name="langn" select="''"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>
          <!-- Tab title -->
        </title>
        <link href="../styles.css" rel="stylesheet" type="text/css"/>
      </head>
      <body>
      
      <xsl:choose>
       <xsl:when test="($dict='khaling' and $alphabet='dev')" >
            <p>खालिङ अन्लाइन् (online) शब्दकोष </p>
            <p>यस त्रि-भाषिक (खालिङ-नेपाली-अँग्रेजी) शब्दकोषमा तीन प्रवेश शब्द रहेका छन् । <xsl:value-of select="count(//Lexicon/LexicalEntry/Lemma)"/></p>
            <p>यो शब्दकोष उल्‍लेख गर्नको लागि: <xsl:value-of select="//GlobalInformation/feat[@att='bibliographicCitation']//@val"/></p>
            <p>आवाज रहितको PDF भर्सन शब्दकोष डाउन्लोड गर्नुहोस् ।  <xsl:element name="a">
                <xsl:attribute name="href">./<xsl:value-of select="$dict"
                  />/dictionary.pdf</xsl:attribute>
                <xsl:element name="img">
                  <xsl:attribute name="height">20px</xsl:attribute>
                  <xsl:attribute name="width">20px</xsl:attribute>
                  <xsl:attribute name="src">../images/icones/pdf.gif</xsl:attribute>
                </xsl:element>
              </xsl:element>
          </p>
            <p>आवाज सहितको PDF भर्सन शब्दकोष डाउन्लोड गर्न; र आवाज सुन्नको लागि Adobe Acrobat Reader द्बारा खोल्नुहोस् ।
                <xsl:element name="a">
                <xsl:attribute name="href">./<xsl:value-of select="$dict"
                  />/dictionary_mp3.pdf</xsl:attribute>
                <xsl:element name="img">
                  <xsl:attribute name="height">25px</xsl:attribute>
                  <xsl:attribute name="width">25px</xsl:attribute>
                  <xsl:attribute name="src">../images/icones/Txt_Inter_pdf1.jpg</xsl:attribute>
                </xsl:element>
              </xsl:element>
          </p>
			
		</xsl:when>
        <xsl:when test="($dict='khaling' and $alphabet='ipa')" >
          
          <p>
          <font class="titre">
            <xsl:value-of select="//Lexicon/feat[@att='label']//@val"/>
          </font>
        </p>
        <!-- Author -->
       <!-- <p>
          <xsl:value-of select="//GlobalInformation/feat[@att='author']//@val"/>
        </p>-->
        <!-- Date -->
        <p>
          <xsl:value-of select="//GlobalInformation/feat[@att='lastUpdate']//@val"/>
        </p>
        <!-- Description -->
        <p>
          <xsl:value-of select="//GlobalInformation/feat[@att='description']//@val"/>This dictionary
          is part of the <xsl:value-of select="//GlobalInformation/feat[@att='projectName']//@val"/>
          project. </p>
        <!-- Display number of entries -->
        <p>This <xsl:value-of select="//Lexicon/feat[@att='lexiconType']//@val"/> contains
            <xsl:value-of select="count(//Lexicon/LexicalEntry/Lemma)"/>
          <xsl:if test="count(//Lexicon/LexicalEntry/Lemma) = 1">
            <xsl:text> entry.</xsl:text>
          </xsl:if>
          <xsl:if test="count(//Lexicon/LexicalEntry/Lemma) > 1">
            <xsl:text> entries.</xsl:text>
          </xsl:if>
        </p>
        <!-- Citation -->
        <p>To cite this dictionary:</p>
        <xsl:value-of select="//GlobalInformation/feat[@att='bibliographicCitation']//@val"/>
        <!-- Download PDF -->
        <p>To download PDF version of the dictionary without sound files:</p>
       
          <xsl:element name="a">
            <xsl:attribute name="href">./<xsl:value-of select="$dict"
              />/dictionary.pdf</xsl:attribute>
            <xsl:element name="img">
              <xsl:attribute name="height">20px</xsl:attribute>
              <xsl:attribute name="width">20px</xsl:attribute>
              <xsl:attribute name="src">../images/icones/pdf.gif</xsl:attribute>
            </xsl:element>
          </xsl:element>
		
         <p>To download PDF version of the dictionary with sound files (open it with Adobe Acrobat
          Reader to listen audio files):</p>
       
          <xsl:element name="a">
            <xsl:attribute name="href">./<xsl:value-of select="$dict"
              />/dictionary_mp3.pdf</xsl:attribute>
            <xsl:element name="img">
              <xsl:attribute name="height">25px</xsl:attribute>
              <xsl:attribute name="width">25px</xsl:attribute>
              <xsl:attribute name="src">../images/icones/Txt_Inter_pdf1.jpg</xsl:attribute>
            </xsl:element>
          </xsl:element>
		</xsl:when>
      
      <xsl:otherwise>
        <!-- Page title is the lexicon label -->
        <p>
          <font class="titre">
            <xsl:value-of select="//Lexicon/feat[@att='label']//@val"/>
          </font>
        </p>
        <!-- Author -->
        <p>
          <xsl:value-of select="//GlobalInformation/feat[@att='author']//@val"/>
        </p>
        <!-- Date -->
        <p>
          <xsl:value-of select="//GlobalInformation/feat[@att='lastUpdate']//@val"/>
        </p>
        <!-- Description -->
        <p>
          <xsl:value-of select="//GlobalInformation/feat[@att='description']//@val"/>This dictionary
          is part of the <xsl:value-of select="//GlobalInformation/feat[@att='projectName']//@val"/>
          project. </p>
        <!-- Display number of entries -->
        <p>This <xsl:value-of select="//Lexicon/feat[@att='lexiconType']//@val"/> contains
            <xsl:value-of select="count(//Lexicon/LexicalEntry/Lemma)"/>
          <xsl:if test="count(//Lexicon/LexicalEntry/Lemma) = 1">
            <xsl:text> entry.</xsl:text>
          </xsl:if>
          <xsl:if test="count(//Lexicon/LexicalEntry/Lemma) > 1">
            <xsl:text> entries.</xsl:text>
          </xsl:if>
        </p>
        <!-- Citation -->
        <p>To cite this dictionary:</p>
        <xsl:value-of select="//GlobalInformation/feat[@att='bibliographicCitation']//@val"/>
        <!-- Download PDF -->
        <p>To download PDF version of the dictionary without sound files:</p>
        <xsl:if test="$dict='japhug' or $dict='khaling'">
          <xsl:element name="a">
            <xsl:attribute name="href">./<xsl:value-of select="$dict"
              />/dictionary.pdf</xsl:attribute>
            <xsl:element name="img">
              <xsl:attribute name="height">20px</xsl:attribute>
              <xsl:attribute name="width">20px</xsl:attribute>
              <xsl:attribute name="src">../images/icones/pdf.gif</xsl:attribute>
            </xsl:element>
          </xsl:element>
        </xsl:if>
        <xsl:if test="$dict='na'">
          <xsl:if test="$lang1='eng'">
            <xsl:element name="a">
              <xsl:attribute name="href">./<xsl:value-of select="$dict"/>/dictionary_<xsl:value-of
                  select="$lang1"/>.pdf</xsl:attribute>
              <xsl:element name="img">
                <xsl:attribute name="height">20px</xsl:attribute>
                <xsl:attribute name="width">20px</xsl:attribute>
                <xsl:attribute name="src">../images/icones/pdf.gif</xsl:attribute>
              </xsl:element>
            </xsl:element>
          </xsl:if>
          <xsl:if test="$lang2='fra'">
            <xsl:element name="a">
              <xsl:attribute name="href">./<xsl:value-of select="$dict"/>/dictionary_<xsl:value-of
                  select="$lang2"/>.pdf</xsl:attribute>
              <xsl:element name="img">
                <xsl:attribute name="height">20px</xsl:attribute>
                <xsl:attribute name="width">20px</xsl:attribute>
                <xsl:attribute name="src">../images/icones/pdf.gif</xsl:attribute>
              </xsl:element>
            </xsl:element>
          </xsl:if>
        </xsl:if>
        <p>To download PDF version of the dictionary with sound files (open it with Adobe Acrobat
          Reader to listen audio files):</p>
        <xsl:if test="$dict='japhug' or $dict='khaling'">
          <xsl:element name="a">
            <xsl:attribute name="href">./<xsl:value-of select="$dict"
              />/dictionary_mp3.pdf</xsl:attribute>
            <xsl:element name="img">
              <xsl:attribute name="height">25px</xsl:attribute>
              <xsl:attribute name="width">25px</xsl:attribute>
              <xsl:attribute name="src">../images/icones/Txt_Inter_pdf1.jpg</xsl:attribute>
            </xsl:element>
          </xsl:element>
        </xsl:if>
        <xsl:if test="$dict='na'">
          <xsl:if test="$lang1='eng'">
            <xsl:element name="a">
              <xsl:attribute name="href">./<xsl:value-of select="$dict"/>/dictionary_<xsl:value-of
                  select="$lang1"/>_mp3.pdf</xsl:attribute>
              <xsl:element name="img">
                <xsl:attribute name="height">25px</xsl:attribute>
                <xsl:attribute name="width">25px</xsl:attribute>
                <xsl:attribute name="src">../images/icones/Txt_Inter_pdf1.jpg</xsl:attribute>
              </xsl:element>
            </xsl:element>
          </xsl:if>
          <xsl:if test="$lang2='fra'">
            <xsl:element name="a">
              <xsl:attribute name="href">./<xsl:value-of select="$dict"/>/dictionary_<xsl:value-of
                  select="$lang2"/>_mp3.pdf</xsl:attribute>
              <xsl:element name="img">
                <xsl:attribute name="height">25px</xsl:attribute>
                <xsl:attribute name="width">25px</xsl:attribute>
                <xsl:attribute name="src">../images/icones/Txt_Inter_pdf1.jpg</xsl:attribute>
              </xsl:element>
            </xsl:element>
          </xsl:if>
        </xsl:if>
       </xsl:otherwise> 
      </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
