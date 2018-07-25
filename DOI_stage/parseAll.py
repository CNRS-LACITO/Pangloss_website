import os
import shutil
import xml.etree.ElementTree as ETree
from Parse import parserRecord
from API_DataCite_Metadata import enregistrer_metadonneesRessource, enregistrer_metadonneesPhrase
from API_DataCite_DOI import enregistrer_url_doiRessource, enregistrer_url_doiPhrase
from constantes import NAMESPACES, DOI_TEST, CRITICAL_LOG
from parserAnnotation import parseAnnotation
from Phrase import Phrase
import logging
import sys

parameter = sys.argv[1]

logging.basicConfig(filename=CRITICAL_LOG,level=logging.INFO)

# deux méthodes listAllDoiIdentifierFromFile et lastDoiNumber pour identifier le dernier numéro DOI créé
def listAllDoiIdentifierFromFile():
    """
    Méthode qui parse le fichier de métadonnées Cocoon, crée un objet pour chaque élément <record>
    Si l'identifiant DOI existe, le rajoute à une liste
    :return Liste d'identificants DOI
    :rtype liste
    """
    listAllDoiIdentifier=[]
    tree = ETree.parse("metadata_cocoon.xml")
    root = tree.getroot()

    for index, record in enumerate(root.findall(".//oai:record", NAMESPACES)):
        objetRecord = parserRecord(record, parameter)

        if objetRecord.identifiant != "":
            listAllDoiIdentifier.append(objetRecord.identifiant)

    return listAllDoiIdentifier

# on utilise la fonction listAllDoiIdentifierFromFile pour obtenir la liste de DOI
listAllDoiIdentifier = listAllDoiIdentifierFromFile()


def lastDoiNumber():
    """
    Méthode qui parcourt la liste contenant tous les identifiants DOI et retroune la valeur chiffrée du dernier doi,
    sans les zéros qui précèdent le dernier chiffre
    :return:le dernier doi
    :rtype: int
    """
    lastDoi = 0
    for doi in listAllDoiIdentifier:
        # puisqu'un doi aura ce type de structure "doi:10.5072/PANGLOSS-0000003",
        # il faut récupérer uniquement les 7 dernières chiffres
        number = int(doi[-7:])

        if lastDoi < number:
            lastDoi = number

    return lastDoi

# on utilise la fonction lastDoiNumber pour obtenir le dernier numero DOI
lastDoiNumber = lastDoiNumber()

# creation et suppression d'un dossier et de son contenu
"""
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
"""

# --------Parse.py OAI-PMH avec etree--------#
tree = ETree.parse("metadata_cocoon.xml")
root = tree.getroot()


# parsing du fichier xml
for index, record in enumerate(root.findall(".//oai:record", NAMESPACES)):

    # on utilise la fonction parserRecord pour parser chaque record et créer un objet record
    objetRecord = parserRecord(record, parameter)

    # si le doi n'existe pas et que le paramètre d'execution est en mode mise à jour et ajout
    if objetRecord.identifiant == "" or parameter == "add_update":
        if objetRecord.identifiant == "":

            # --------creation du compteur pour créer le numéro doi incrémenté--------#

            # le numéro doi suivant va continuer la numéroation du dernier numéro doi,
            # dont la valeur a été obtenue avec la méthode lastDoiNumber
            lastDoiNumber +=1

            # transformer le numéro en chaine de caractères pour connaître la longueur du numéro
            # à savoir le nombre de chiffres qui le compose
            doiNumber = str(lastDoiNumber)

            # trouver le nombre de zero à rajouter au doi. Un numéro doi peut être formé de maximum 7 chiffres
            # donc le nombre de zero est obtenu par la différence entre 7 et le chiffre représenant la taille du dernier numéro doi
            difference = 7 - len(doiNumber)

            # on intére sur les éléments de 0 à la différence de entre 7 et le nombre de chiffres du dernier doi
            for i in range(0, difference):
                # on rajoute un 0 sous forme de chaine de caractère pour chaque élément trouvé
                # on concatène avec le numéro doi déja incrémété de 1 par rapport au dernier
                doiNumber = "0" + doiNumber

            # on atttribue à l'objet record créée le numéro doi complet avec le prefixe,
            # en utilisant une nouvelle affectation de l'attribut identifiant de l'objet.
            objetRecord.identifiant = DOI_TEST+doiNumber

        # on utilise la methode build de la classe Record pour créer le fichier xml
        fichier_xmlRessource = objetRecord.build()

         # on utilise la fonction generatorFichierUrlDoi pour créer les fichiers avec les url et les DOI
        fichier_textRessource = objetRecord.generatorFichierUrlDoi()


        # methodes pour interroger l'API de Datacite et enregistrer le fichier de metadonnées et le fichier text avec l'url et le doi pour les ressources
        if fichier_xmlRessource:
            enregistrer_metadonneesRessource(fichier_xmlRessource, objetRecord.identifiant)

        if fichier_textRessource:
            enregistrer_url_doiRessource(fichier_textRessource, objetRecord.identifiant)


        # ---------------------------- PARSING ANNOTATION ---------------------#

        # extraire le lien url pour chaque fichier xml
        if objetRecord.lienAnnotation:
            # on appelle la fonction parseAnnotation pour récupérer une liste avec les id des phrases
            listeId, type = parseAnnotation(objetRecord.lienAnnotation)
            if listeId:
                # pour chaque id, on génère un numéro doi, un fichier xml et un fichier text
                for indexid, id in enumerate(listeId):
                    # numéro DOI de la phrase
                    if type=="sentence":
                        affixe = "S" + str(indexid+1)
                    elif type == "word":
                        affixe = "W" + str(indexid+1)

                    doiPhrase = objetRecord.identifiant + "." + affixe
                    # le fichier xml pour chaque phrase
                    objetPhrase = Phrase(id, doiPhrase, affixe, objetRecord)
                    fichier_xmlPhrase = objetPhrase.build()

                    # le fichier text avec le DOI et l'URL de la phrase
                    fichier_textPhrase = objetPhrase.generatorFichierUrlDoiPhrase()

                    # methodes pour interroger l'API de Datacite et enregistrer le fichier de metadonnées et le fichier text avec l'url et le doi pour les phrases
                    if fichier_xmlPhrase:
                        enregistrer_metadonneesPhrase(fichier_xmlPhrase, id)

                    if fichier_textPhrase:
                        enregistrer_url_doiPhrase(fichier_textPhrase, doiPhrase, id)

                    if indexid == 3:
                        break

        else:
            message = "La ressource {} ne contient pas de fichier d'annotations".format(objetRecord.identifiantOAI)
            logging.info(message)

    if index == 3:
       break

"""
control = False
if os.stat("mapping_oai_doi.csv").st_size == 0:
   with open("mapping_oai_doi.csv", "w", newline='') as mapping:
       spamwriter = csv.writer(mapping, delimiter=' ', quotechar='|', quoting=csv.QUOTE_MINIMAL)
       spamwriter.writerow([objetRecord.identifiantOAI[21:], objetRecord.identifiant])
   control = True
if control == True:
   with open("mapping_oai_doi.csv", newline='') as mappingread:
       spamreader = csv.reader(mappingread, delimiter=' ', quotechar='|')
       for row in spamreader:
           if row[0] == objetRecord.identifiantOAI[21:] and row[1] == objetRecord.identifiant_DOI_Cocoon[4:]:
               print("L'oai correspond au doi")

with open("mapping_oai_doi.csv", newline='') as mappingread:
   spamreader = csv.reader(mappingread, delimiter=' ', quotechar='|')
   for row in spamreader:
       if [objetRecord.identifiantOAI[21:], objetRecord.identifiant_DOI_Cocoon[4:]] not in spamreader:
               print ("On peut les rajouter")
               with open("mapping_oai_doi.csv", "a", newline='') as mapping:
                   spamwriter = csv.writer(mapping, delimiter=' ', quotechar='|',
                                           quoting=csv.QUOTE_MINIMAL)
                   spamwriter.writerow([objetRecord.identifiantOAI[21:], objetRecord.identifiant])
                   break
       else:
           print("le mapping oai-doi existe déja")
"""