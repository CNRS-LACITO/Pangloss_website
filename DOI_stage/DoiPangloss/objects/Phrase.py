import xml.etree.ElementTree as ET
import logging
from DOI_stage.DoiPangloss.constantes import CRITICAL_LOG, FOLDER_METADATA_PHRASE, FOLDER_URL_DOI_PHRASE

logging.basicConfig(filename=CRITICAL_LOG,level=logging.INFO)



class Phrase:
    """
    Classe Phrase qui hérite de la classe Record
    """

    def __init__(self, id, doiPhrase, affixe, objetRecord):
            self.doiPhrase = doiPhrase
            self.objetRecord = objetRecord
            self.id = id
            self.affixe = affixe

    def buildMetadataPhrase(self):
        """Fonction qui construit le fichier xml à partir des attributs de la classe Record"""


        racine = ET.Element("resource", xmlns="http://datacite.org/schema/kernel-4")
        racine.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        racine.set("xsi:schemaLocation",
                               "http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4.1/metadata.xsd")

        # l'identifiant DOI
        if self.doiPhrase:
            identifier = ET.SubElement(racine, "identifier", identifierType="DOI")
            identifier.text = self.doiPhrase
        else:
            message = "La balise IDENTIFIER pour le record {} est obligatoire!!".format(self.doiPhrase)
            logging.info(message)

         # les createurs et contributeurs
        creators = ET.SubElement(racine, "creators")

        booleen = False
        for personneRole in self.objetRecord.contributeursDoi:
            if "Researcher" in personneRole[1]:
                creator = ET.SubElement(creators, "creator")
                creatorName = ET.SubElement(creator, "creatorName", nameType="Personal")
                creatorName.text = personneRole[0]
                booleen = True
        if booleen == False:
            for personneRole in self.objetRecord.contributeursDoi:
                if "ContactPerson" in personneRole[1]:
                    creator = ET.SubElement(creators, "creator")
                    creatorName = ET.SubElement(creator, "creatorName", nameType="Personal")
                    creatorName.text = personneRole[0]
                    booleen = True

        if booleen == False:
            message = "La balise CREATOR pour le record {} est obligatoire!!".format(self.objetRecord.identifiantOAI)
            logging.info(message)

        # les titres
        if self.objetRecord.titre:
            titles = ET.SubElement(racine, "titles")
            title = ET.SubElement(titles, "title")
            title.text = self.affixe + ':' + self.objetRecord.titre
            if self.objetRecord.codeXmlLangTitre:
                title.set("xml:lang", self.objetRecord.codeXmlLangTitre)
        else:
            message = "La balise TITLE pour le record {} est obligatoire!!".format(self.objetRecord.identifiantOAI)
            logging.info(message)

        # le publisher
        publisher = ET.SubElement(racine, "publisher")
        publisher.text = self.objetRecord.publisher

        # année de publication
        if self.objetRecord.annee:
            publicationYear = ET.SubElement(racine, "publicationYear")
            publicationYear.text = self.objetRecord.annee[:4]
        else:
            message = "La balise PUBLICATIONYEAR pour le record {} est obligatoire!!".format(self.objetRecord.identifiantOAI)
            logging.info(message)

        # la langue
        if self.objetRecord.codeLangue:
            # prend la première valeur de la liste avec les codes des langues
            language = ET.SubElement(racine, "language")
            language.text = self.objetRecord.codeLangue[0]

        # le type de ressource
        if self.objetRecord.labelType:
            resourceType = ET.SubElement(racine, "resourceType", resourceTypeGeneral=self.objetRecord.typeRessourceGeneral)
            resourceType.text = self.objetRecord.labelType
        else:
            message = "La balise RESOURCETYPE pour le record {} est obligatoire!!".format(self.objetRecord.identifiantOAI)
            logging.info(message)

        alternateIdentifiers = ET.SubElement(racine, "alternateIdentifiers")
        alternateIdentifier = ET.SubElement(alternateIdentifiers, "alternateIdentifier",
                                            alternateIdentifierType="XML_ID")
        alternateIdentifier.text = self.id

        # is Part of
        if self.objetRecord.doiIdentifiant:
            relatedIdentifiers = ET.SubElement(racine, "relatedIdentifiers")
            isPartof = ET.SubElement(relatedIdentifiers, "relatedIdentifier",
                                     relatedIdentifierType="DOI",
                                     relationType="IsPartOf")
            isPartof.text = self.objetRecord.doiIdentifiant
        else:
            message = "La balise IDENTIFIER pour le record {} est obligatoire!!".format(
                self.objetRecord.identifiantOAI)
            logging.info(message)
        

        tree = ET.ElementTree(racine)
        tree.write(FOLDER_METADATA_PHRASE + self.objetRecord.identifiantOAI[21:] + "." + self.id + ".xml", encoding="UTF-8", xml_declaration=True, default_namespace=None, method="xml")

        # vérifier que le fichier XML est créé ou pas
        if FOLDER_METADATA_PHRASE + self.objetRecord.identifiantOAI[21:]+"."+self.id+".xml":
            return FOLDER_METADATA_PHRASE + self.objetRecord.identifiantOAI[21:]+ "." +self.id + ".xml"
        else:
            return None


    def generatorFichierUrlDoiPhrase(self):
        with open(FOLDER_URL_DOI_PHRASE + self.objetRecord.identifiantOAI[21:]+"."+self.id +".txt", "w") as fichierUrlPhrase:
            url = "url= " + self.objetRecord.url + "/#/" + self.id
            doi = "doi= " + self.doiPhrase
            fichierUrlPhrase.write(doi + "\n" + url)

        # vérifier que le fichier text est créé ou pas
        if FOLDER_URL_DOI_PHRASE + self.objetRecord.identifiantOAI[21:]+"."+self.id +".txt":
            return FOLDER_URL_DOI_PHRASE + self.objetRecord.identifiantOAI[21:]+"."+self.id +".txt"
        else:
            return None



