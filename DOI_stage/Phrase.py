import xml.etree.ElementTree as ET
import logging
from constantes import SCHEME_URI, PURL

logFileName='critical.log'
logging.basicConfig(filename=logFileName,level=logging.INFO)



class Phrase:
    """
    Classe Phrase qui hérite de la classe Record
    """

    #def __init__(self, id, doiPhrase, identifiant, identifiantPrincipal, publisherInstitution, format, annee, taille, titre, valeurXmlLang, titresSecondaire, droits, contributeurs, codeLangue, labelLangue, sujets, labelType, typeRessourceGeneral, isRequiredBy, requires, identifiant_Ark_Handle, abstract, tableDeMatiere, descriptionsOlac, labelLieux, longitudeLatitude, pointCardinaux, url, lienAnnotation):
    #    self.objetRecord.doiPhrase = doiPhrase
     #   self.objetRecord.id = id
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
        else:
            message = "La balise IDENTIFIER pour le record {} est obligatoire!!".format(self.objetRecord.identifiant)
            logging.info(message)

         # les createurs et contributeurs
        creators = ET.SubElement(racine, "creators")
        contributors = ET.SubElement(racine, "contributors")

        booleen = False
        for personneRole in self.objetRecord.contributeurs:
            if "researcher" in personneRole[1]:
                creator = ET.SubElement(creators, "creator")
                creatorName = ET.SubElement(creator, "creatorName")
                creatorName.text = personneRole[0]
                contributor = ET.SubElement(contributors, "contributor", contributorType='Researcher')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
                booleen = True
            elif "annotator" in personneRole[1] or "transcriber" in personneRole[1] or "translator" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='DataCurator')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
            elif "speaker" in personneRole[1] or "performer" in personneRole[1] or "singer" in personneRole[
                1] or "responder" in \
                    personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='Other')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
            elif "interviewer" in personneRole[1] or "interpreter" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='DataCollector')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
            elif "depositor" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='ContactPerson')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
            elif "compiler" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='DataCurator')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
            elif "editor" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='Editor')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
            elif "sponsor" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='Sponsor')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
        if booleen == False:
            for personneRole in self.objetRecord.contributeurs:
                if "depositor" in personneRole[1]:
                    creator = ET.SubElement(creators, "creator")
                    creatorName = ET.SubElement(creator, "creatorName")
                    creatorName.text = personneRole[0]
                    booleen = True

        if booleen == False:
            message = "La balise CREATOR pour le record {} est obligatoire!!".format(self.objetRecord.identifiantPrincipal)
            logging.info(message)

        for institution in self.objetRecord.publisherInstitution:
            contributor = ET.SubElement(contributors, "contributor", contributorType="Producer")
            contributorName = ET.SubElement(contributor, "contributorName", nameType="Organizational")
            contributorName.text = institution

        for institution in self.objetRecord.hostingInstitution:
            contributor = ET.SubElement(contributors, "contributor", contributorType="HostingInstitution")
            contributorName = ET.SubElement(contributor, "contributorName", nameType="Organizational")
            contributorName.text = institution


        if self.objetRecord.droits:
            contributor = ET.SubElement(contributors, "contributor", contributorType='RightsHolder')
            contributorName = ET.SubElement(contributor, "contributorName")
            contributorName.text = self.objetRecord.droits

        # les titres
        if self.objetRecord.titre:
            titles = ET.SubElement(racine, "titles")
            title = ET.SubElement(titles, "title")
            title.text = self.objetRecord.titre
            if self.objetRecord.valeurXmlLang:
                title.set("xml:lang", self.objetRecord.valeurXmlLang)
        else:
            message = "La balise TITLE pour le record {} est obligatoire!!".format(self.objetRecord.identifiantPrincipal)
            logging.info(message)

        if self.objetRecord.titresSecondaire:
            for groupe in self.objetRecord.titresSecondaire:
                titreS = ET.SubElement(titles, "title")
                titreS.text = groupe[1]
                titreS.set("xml:lang", groupe[0])

        # le publisher
        publisher = ET.SubElement(racine, "publisher")
        publisher.text = self.objetRecord.publisher

        # année de publication
        if self.objetRecord.annee:
            publicationYear = ET.SubElement(racine, "publicationYear")
            publicationYear.text = self.objetRecord.annee[:4]
        else:
            message = "La balise PUBLICATIONYEAR pour le record {} est obligatoire!!".format(self.objetRecord.identifiantPrincipal)
            logging.info(message)

        # la langue
        if self.objetRecord.codeLangue:
            # prend la première valeur de la liste avec les codes des langues
            language = ET.SubElement(racine, "language")
            language.text = self.objetRecord.codeLangue[0]

        # les mots clés
        subjects = ET.SubElement(racine, "subjects")

        subject = ET.SubElement(subjects, "subject")
        subject.text = self.objetRecord.setSpec

        if self.objetRecord.labelLangue:
            for label in self.objetRecord.labelLangue:
                subject = ET.SubElement(subjects, "subject", subjectScheme="language",
                                        schemeURI = SCHEME_URI)
                subject.text = label

        if self.objetRecord.sujets:
            for mot in self.objetRecord.sujets:
                if isinstance(mot, str):
                    subject = ET.SubElement(subjects, "subject")
                    subject.text = mot
                else:
                    subject = ET.SubElement(subjects, "subject")
                    subject.text = mot[1]
                    subject.set("xml:lang", mot[0])

        # les dates
        dates = ET.SubElement(racine, "dates")
        date = ET.SubElement(dates, "date", dateType="Available")
        date.text = self.objetRecord.annee

        # le type de ressource
        if self.objetRecord.labelType:
            resourceType = ET.SubElement(racine, "resourceType", resourceTypeGeneral=self.objetRecord.typeRessourceGeneral)
            resourceType.text = ", ".join(self.objetRecord.labelType)
        else:
            message = "La balise RESOURCETYPE pour le record {} est obligatoire!!".format(self.objetRecord.identifiantPrincipal)
            logging.info(message)

        # is Part of
        if self.objetRecord.identifiant:
            relatedIdentifiers = ET.SubElement(racine, "relatedIdentifiers")
            isPartof = ET.SubElement(relatedIdentifiers, "relatedIdentifier",
                                     relatedIdentifierType="DOI",
                                     relationType="IsPartOf")
            isPartof.text = self.objetRecord.identifiant
        else:
            message = "La balise IDENTIFIER pour le record {} est obligatoire!!".format(
                self.objetRecord.identifiant)
            logging.info(message)

        if self.objetRecord.format:
            formats = ET.SubElement(racine, "formats")
            for element in self.objetRecord.format:
                format = ET.SubElement(formats, "format")
                format.text = element

        if self.objetRecord.taille:
            sizes = ET.SubElement(racine, "sizes")
            size = ET.SubElement(sizes, "size")
            size.text = self.objetRecord.taille

        if self.objetRecord.abstract or self.objetRecord.tableDeMatiere or self.objetRecord.descriptionsOlac:
            descriptions = ET.SubElement(racine, "descriptions")

        if self.objetRecord.abstract:
            for element in self.objetRecord.abstract:
                # si la liste est composée d'une liste et d'une chaine de carractère, on récupère la chaine avec isistance()
                if isinstance(element, str):
                    description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                    description.text = element
                else:
                    description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                    description.text = element[1]
                    description.set("xml:lang", element[0])

        if self.objetRecord.tableDeMatiere:
            for element in self.objetRecord.tableDeMatiere:
                if isinstance(element, str):
                    description = ET.SubElement(descriptions, "description", descriptionType="TableOfContents")
                    description.text = element
                else:
                    description = ET.SubElement(descriptions, "description", descriptionType="TableOfContents")
                    description.text = element[1]
                    description.set("xml:lang", element[0])

        if self.objetRecord.descriptionsOlac:
            for element in self.objetRecord.descriptionsOlac:
                if isinstance(element, str):
                    # si la balise abstract existe, alors la balise description aura l'attribut Other, si elle n'existe pas, l'attribut Abstract
                    if self.objetRecord.abstract:
                        description = ET.SubElement(descriptions, "description", descriptionType="Other")
                        description.text = element
                    else:
                        description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                        description.text = element
                    # la même chose, mais pour le cas où abstract contient l'attribut xml-lang
                else:
                    if self.objetRecord.abstract:
                        description = ET.SubElement(descriptions, "description", descriptionType="Other")
                        description.text = element[1]
                        description.set("xml:lang", element[0])
                    else:
                        description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                        description.text = element[1]
                        description.set("xml:lang", element[0])

        if self.objetRecord.labelLieux:
            geoLocations = ET.SubElement(racine, "geoLocations")
            for element in self.objetRecord.labelLieux:
                geoLocation = ET.SubElement(geoLocations, "geoLocation")
                geoLocationPlace = ET.SubElement(geoLocation, "geoLocationPlace")
                geoLocationPlace.text = element

            if self.objetRecord.longitudeLatitude:
                geoLocationPoint = ET.SubElement(geoLocation, "geoLocationPoint")
                pointLongitude = ET.SubElement(geoLocationPoint, "pointLongitude")
                pointLongitude.text = self.objetRecord.longitudeLatitude[0]
                pointLatitude = ET.SubElement(geoLocationPoint, "pointLatitude")
                pointLatitude.text = self.objetRecord.longitudeLatitude[1]

            if self.objetRecord.pointCardinaux:
                geoLocationBox = ET.SubElement(geoLocation, "geoLocationBox")
                westBoundLongitude = ET.SubElement(geoLocationBox, "westBoundLongitude")
                westBoundLongitude.text = self.objetRecord.pointCardinaux[0]
                eastBoundLongitude = ET.SubElement(geoLocationBox, "eastBoundLongitude")
                eastBoundLongitude.text = self.objetRecord.pointCardinaux[1]
                southBoundLatitude = ET.SubElement(geoLocationBox, "southBoundLatitude")
                southBoundLatitude.text = self.objetRecord.pointCardinaux[2]
                northBoundLatitude = ET.SubElement(geoLocationBox, "northBoundLatitude")
                northBoundLatitude.text = self.objetRecord.pointCardinaux[3]
        

        tree = ET.ElementTree(racine)
        tree.write("testPhrase/" + self.objetRecord.identifiantPrincipal[21:] + "." + self.id + ".xml", encoding="UTF-8", xml_declaration=True, default_namespace=None, method="xml")

        # vérifier que le fichier XML est créé ou pas
        if "testPhrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id+".xml":
            return "testPhrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id + ".xml"
        else:
            return None



    def generatorFichierUrlDoiPhrase(self):
        with open("testURL_Phrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id +".txt", "w") as fichierUrlPhrase:
            url = "url= " + self.objetRecord.url + "/#/" + self.id
            doi = "doi= " + self.doiPhrase
            fichierUrlPhrase.write(url + "\n" + doi)

        # vérifier que le fichier text est créé ou pas
        if "testURL_Phrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id +".txt":
            return "testURL_Phrase/" + self.objetRecord.identifiantPrincipal[21:]+"."+self.id +".txt"
        else:
            return None



