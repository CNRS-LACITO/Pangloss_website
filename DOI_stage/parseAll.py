# --------Parse.py OAI-PMH avec etree--------#
import os
import xml.etree.ElementTree as ETree
from Parse import parserRecord
import shutil
from API_DataCite_Metadata import enregistrer_metadonneesRessource, enregistrer_metadonneesPhrase
from API_DataCite_DOI import enregistrer_urlRessource, enregistrer_urlPhrase
from constantes import NAMESPACES, logFileName
from parserAnnotation import parseAnnotation
from Phrase import Phrase
import logging

logging.basicConfig(filename=logFileName,level=logging.INFO)

tree = ETree.parse("metadata_cocoon.xml")
root = tree.getroot()

#creation et suppression d'un dossier et de son contenu
shutil.rmtree("test")
shutil.rmtree("testURL")
shutil.rmtree("testPhrase")
shutil.rmtree("testURL_Phrase")
os.remove("critical.log")

os.mkdir("test")
os.mkdir("testURL")
os.mkdir("testPhrase")
os.mkdir("testURL_Phrase")
open('critical.log','w')



for index, record in enumerate(root.findall(".//oai:record", NAMESPACES)):

    #---------------------------- PARSING RESSOURCE  ------------------ #

    #on utilise la fonction parserRecord pour parser chaque record
    objetRecord = parserRecord(record)

    #on utilise la fonction generatorFichierUrlDoi pour créer les fichiers avec les url et les DOI
    fichier_textRessource = objetRecord.generatorFichierUrlDoi()

    # on utilise la methode build de la classe Record pour créer le fichier xml
    fichier_xmlRessource = objetRecord.build()


    #methodes pour interroger l'API de Datacite et enregistrer le fichier de metadonnées et le fichier text avec l'url et le doi pour les ressources
    if fichier_xmlRessource:
        enregistrer_metadonneesRessource(fichier_xmlRessource)

    if fichier_textRessource:
        enregistrer_urlRessource(fichier_textRessource, objetRecord.identifiant)

    #---------------------------- PARSING ANNOTATION ---------------------#

    # extraire le lien url pour chaque fichier xml
    if objetRecord.lienAnnotation:
        # on appelle la fonction parseAnnotation pour récupérer une liste avec les id des phrases
        listeId = parseAnnotation(objetRecord.lienAnnotation)
        if listeId:
            # pour chaque id, on génère un numéro doi, un fichier xml et un fichier text
            for indexid, id in enumerate(listeId):
                # numéro DOI de la phrase
                doiPhrase = objetRecord.identifiant + "." + id

                # le fichier xml pour chaque phrase
                objetPhrase = Phrase(id, doiPhrase, objetRecord)
                fichier_xmlPhrase = objetPhrase.build()

                # le fichier text avec le DOI et l'URL de la phrase
                fichier_textPhrase = objetPhrase.generatorFichierUrlDoiPhrase()


                # methodes pour interroger l'API de Datacite et enregistrer le fichier de metadonnées et le fichier text avec l'url et le doi pour les phrases
                if fichier_xmlPhrase:
                    enregistrer_metadonneesPhrase(fichier_xmlPhrase)
    
                if fichier_textPhrase:
                    enregistrer_urlPhrase(fichier_textPhrase, doiPhrase)

                if indexid == 3:
                    break
    
    else:
        message = "La ressource {} ne contient pas de fichier d'annotations".format(objetRecord.identifiantPrincipal)
        logging.info(message)

    if index == 13:
        break

