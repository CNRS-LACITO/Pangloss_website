# --------Parse.py OAI-PMH avec etree--------#
import os
import xml.etree.ElementTree as ETree
from Parse import parserRecord
import shutil
from API_DataCite_Metadata import enregistrer_metadonnees
from API_DataCite_DOI import enregistrer_url
from constantes import NAMESPACES
from parserAnnotation import parseAnnotation
from Phrase import Phrase

tree = ETree.parse("metadata_cocoon.xml")
root = tree.getroot()

#creation et suppression d'un dossier et de son contenu
#shutil.rmtree("test")
#shutil.rmtree("testURL")
shutil.rmtree("testPhrase")
#os.remove("critical.log")
#print(len(allRecords))

#os.mkdir("test")
#os.mkdir("testURL")
#os.remove("fichierUrl.txt")
os.mkdir("testPhrase")



for index, record in enumerate(root.findall(".//nsDefault:record", NAMESPACES)):


    #on utilise la fonction parserRecord pour parser chaque record
    objetRecord = parserRecord(record)

    #on utilise la fonction generatorFichierUrlDoi pour créer les fichiers avec les url et les DOI
    #lienUrlPangloss = objetRecord.generatorFichierUrlDoi()

    # on utilise la methode build de la classe Record pour créer le fichier xml
    # filename = objetRecord.build()

    #extraire le lien url pour chaque fichier xml
    if objetRecord.lienAnnotation:

        #on appelle la fonction parseAnnotation pour récuper une liste avec les id des phrases
        listeId = parseAnnotation(objetRecord.lienAnnotation)

        #pour chaque id, on gène un numéro doi, un fichier xml et un fichier text
        for id in listeId:
            #numéro DOI de la phrase
            doiPhrase = objetRecord.identifiant +"."+ id

            objetPhrase = Phrase(id,doiPhrase,objetRecord)
            objetPhrase.build()


            #objetPhrase = Phrase(id, doiPhrase, objetRecord.identifiant, objetRecord.identifiantPrincipal, objetRecord.publisherInstitution, objetRecord.format, objetRecord.annee, objetRecord.taille, objetRecord.titre, objetRecord.valeurXmlLang, objetRecord.titresSecondaire, objetRecord.droits, objetRecord.contributeurs, objetRecord.codeLangue, objetRecord.labelLangue, objetRecord.sujets, objetRecord.labelType, objetRecord.typeRessourceGeneral, objetRecord.isRequiredBy, objetRecord.requires, objetRecord.identifiant_Ark_Handle, objetRecord.abstract, objetRecord.tableDeMatiere, objetRecord.descriptionsOlac, objetRecord.labelLieux, objetRecord.longitudeLatitude, objetRecord.pointCardinaux, objetRecord.url, objetRecord.lienAnnotation)

    else:
        print("ECHEC. Le record {} ne contient pas de fichier xml". format(objetRecord.identifiantPrincipal))



    """
    #methodes pour interroger l'API de Datacite
    if filename:
        enregistrer_metadonnees(filename)

    if lienUrlPangloss:
        enregistrer_url(lienUrlPangloss, objetRecord.identifiant)
    """
    if index == 20:
        break

#allRecords = [parsing(record) for record in root.findall(".//nsDefault:record", nameSpaces)]


