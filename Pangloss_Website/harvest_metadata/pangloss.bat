java -classpath log4j-1.2.15.jar;harvester2.jar;xalan.jar ORG.oclc.oai.harvester2.app.RawWrite https://cocoon.huma-num.fr/crdo_servlet/oai-pmh -metadataPrefix olac -setSpec Lacito -out metadata_cocoon.xml

java -classpath log4j-1.2.15.jar;harvester2.jar;xalan.jar ORG.oclc.oai.harvester2.app.RawWrite https://www.nakala.fr/oai/11280/b5927b13 -metadataPrefix dcterms -setSpec hdl_11280_571e7534 -out metadata_nakala.xml
Fusion_metadata.pl metadata_cocoon.xml metadata_nakala.xml metadata_lacito.xml