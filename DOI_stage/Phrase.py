import xml.etree.ElementTree as ET
import logging
from constantes import SCHEME_URI, PURL
from Record import Record

logFileName='critical.log'
logging.basicConfig(filename=logFileName,level=logging.INFO)



class Phrase:
    """
    Classe Phrase qui hérite de la classe Record
    """

    #def __init__(self, id, doiPhrase, identifiant, identifiantPrincipal, publisherInstitution, format, annee, taille, titre, valeurXmlLang, titresSecondaire, droits, contributeurs, codeLangue, labelLangue, sujets, labelType, typeRessourceGeneral, isRequiredBy, requires, identifiant_Ark_Handle, abstract, tableDeMatiere, descriptionsOlac, labelLieux, longitudeLatitude, pointCardinaux, url, lienAnnotation):
    #    self.doiPhrase = doiPhrase
     #   self.id = id
     #   Record.__init__(self, identifiant, identifiantPrincipal, publisherInstitution, format, annee, taille, titre, valeurXmlLang, titresSecondaire, droits, contributeurs, codeLangue, labelLangue, sujets, labelType, typeRessourceGeneral, isRequiredBy, requires, identifiant_Ark_Handle, abstract, tableDeMatiere, descriptionsOlac, labelLieux, longitudeLatitude, pointCardinaux, url, lienAnnotation)

    def __init__(self, id, doiPhrase, objetRecord):
            self.doiPhrase = doiPhrase
            self.objetRecord = objetRecord
            self.id = id

    def build(self):
        """Fonction qui construit le fichier xml à partir des attributs de la classe Record"""


        racine = ET.Element("resource", xmlns="http://datacite.org/schema/kernel-4")
        racineXmlns = racine.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        racineXsi = racine.set("xsi:schemaLocation",
                               "http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4.1/metadata.xsd")

        # l'identifiant DOI
        if self.objetRecord.identifiant:
            identifier = ET.SubElement(racine, "identifier", identifierType="DOI")
            identifier.text = self.doiPhrase

        #is Part of
            relatedIdentifiers = ET.SubElement(racine, "relatedIdentifiers")
            isPartof = ET.SubElement(relatedIdentifiers, "relatedIdentifier",
                                                  relatedIdentifierType="DOI",
                                                  relationType="IsPartOf")
            isPartof.text = self.objetRecord.identifiant
        else:
            message = "La balise IDENTIFIER pour le record {} est obligatoire!!".format(self.objetRecord.identifiant)
            logging.info(message)

            # les titres
        if self.objetRecord.titre:
            titles = ET.SubElement(racine, "titles")
            title = ET.SubElement(titles, "title")
            title.text = self.objetRecord.titre
            if self.objetRecord.valeurXmlLang:
                title.set("xml:lang", self.objetRecord.valeurXmlLang)

        tree = ET.ElementTree(racine)
        tree.write("testPhrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id+".xml", encoding="UTF-8", xml_declaration=True, default_namespace=None, method="xml")

        # vérifier que le fichier XML est créé ou pas
        if "testPhrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id+".xml" :
            return "testPhrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id+".xml"
        else:
            return None


"""
    def generatorFichierUrlDoi(self):
        with open("testURL/" + self.identifiantPrincipal[21:]+".txt", "w") as fichierUrl:
            fichierUrl.write("url= "+self.url + "\n" + "doi= "+ self.identifiant)

        # vérifier que le fichier text est créé ou pas
        if "testURL/" + self.identifiantPrincipal[21:]+".txt":
            return "testURL/" + self.identifiantPrincipal[21:]+".txt"
        else:
            return None
"""


