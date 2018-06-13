# --------Parse.py OAI-PMH avec etree--------#
import os
import xml.etree.ElementTree as ETree
from Parse import parserRecord
import shutil
from API_DataCite_Metadata import enregistrer_metadonnees
from API_DataCite_DOI import enregistrer_url
from constantes import NAMESPACES

tree = ETree.parse("metadata_cocoon.xml")
root = tree.getroot()

#creation et suppression d'un dossier et de son contenu
#shutil.rmtree("test")
#shutil.rmtree("testURL")
#os.remove("critical.log")
#print(len(allRecords))

#os.mkdir("test")
#os.mkdir("testURL")
#os.remove("fichierUrl.txt")



for index, record in enumerate(root.findall(".//nsDefault:record", NAMESPACES)):


    #on utilise la fonction parserRecord pour parser chaque record
    objetRecord = parserRecord(record)

    #on utilise la fonction generatorUrl pour créer les fichiers avec les url et les DOI
    lienUrlPangloss = objetRecord.generatorUrl()

    #on utilise la methode build de la classe Record pour créer le fichier xml
    filename = objetRecord.build()

    #methodes pour interroger l'API de DAtacite
    if filename:
        enregistrer_metadonnees(filename)

    if lienUrlPangloss:
        enregistrer_url(lienUrlPangloss, objetRecord.identifiant)

    if index == 10:
        break

#allRecords = [parsing(record) for record in root.findall(".//nsDefault:record", nameSpaces)]


