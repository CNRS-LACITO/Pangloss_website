import xml.etree.ElementTree as ET
import logging
from constantes import SCHEME_URI, PURL, logFileName, DOI_Pangloss

logging.basicConfig(filename=logFileName,level=logging.INFO)



class Record:
    """
    Classe qui contient comme attributs les éléments composant la balise record du fichier Cocoon. On définit uniquement les attributs utiles pour la construction du xml
    La classe contient la methode bulid qui construit le fichier xml de sortie
    La classe contient la methode generatorFichierUrlDoi qui construit le fichier text contenant le numero DOI et l'adresse url de la ressource
    """

    def __init__(self, identifiant, identifiantPrincipal, publisherInstitution, format, annee, taille, titre, valeurXmlLang, titresSecondaire, droits, contributeurs, codeLangue, labelLangue, sujets, labelType, typeRessourceGeneral, isRequiredBy, requires, identifiant_Ark_Handle, abstract, tableDeMatiere, descriptionsOlac, labelLieux, longitudeLatitude, pointCardinaux, url, lienAnnotation):
        self.identifiant = identifiant
        self.identifiantPrincipal = identifiantPrincipal
        self.setSpec = "Linguistique"
        self.publisher = "Pangloss"
        self.publisherInstitution = publisherInstitution
        self.hostingInstitution = ["COllections de COrpus Oraux Numériques", "Huma-Num", "Langues et Civilisations à Tradition Orale", "Centre Informatique National de l'Enseignement Supérieur"]
        self.format = format
        self.annee = annee
        self.relatedIdPangloss = DOI_Pangloss
        self.taille = taille
        self.titre = titre
        self.valeurXmlLang = valeurXmlLang
        self.titresSecondaire = titresSecondaire
        self.droits = droits
        self.contributeurs = contributeurs
        self.codeLangue = codeLangue
        self.labelLangue =labelLangue
        self.sujets = sujets
        self.labelType = labelType
        self.typeRessourceGeneral = typeRessourceGeneral
        self.isRequiredBy = isRequiredBy
        self.requires =requires
        self.identifiant_Ark_Handle = identifiant_Ark_Handle
        self.abstract = abstract
        self.tableDeMatiere = tableDeMatiere
        self.descriptionsOlac =descriptionsOlac
        self.labelLieux = labelLieux
        self.longitudeLatitude = longitudeLatitude
        self.pointCardinaux = pointCardinaux
        self.url = url
        self.lienAnnotation = lienAnnotation


    def build(self):
        """Fonction qui construit le fichier xml à partir des attributs de la classe Record"""

        racine = ET.Element("resource", xmlns="http://datacite.org/schema/kernel-4")
        racineXmlns = racine.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        racineXsi = racine.set("xsi:schemaLocation",
                               "http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4.1/metadata.xsd")

        # l'identifiant DOI
        if self.identifiant:
            identifier = ET.SubElement(racine, "identifier", identifierType="DOI")
            identifier.text = self.identifiant
        else:
            message = "La balise IDENTIFIER pour le record {} est obligatoire!!".format(self.identifiantPrincipal)
            logging.info(message)


        # les createurs et contributeurs
        creators = ET.SubElement(racine, "creators")
        contributors = ET.SubElement(racine, "contributors")

        booleen = False
        for personneRole in self.contributeurs:
            if "researcher" in personneRole[1]:
                creator = ET.SubElement(creators, "creator")
                creatorName = ET.SubElement(creator, "creatorName", nameType="Personal")
                creatorName.text = personneRole[0]
                contributor = ET.SubElement(contributors, "contributor", contributorType='Researcher')
                contributorName = ET.SubElement(contributor, "contributorName", nameType="Personal")
                contributorName.text = personneRole[0]
                booleen = True
            elif "annotator" in personneRole[1] or "transcriber" in personneRole[1] or "translator" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='DataCurator')
                contributorName = ET.SubElement(contributor, "contributorName", nameType="Personal")
                contributorName.text = personneRole[0]
            elif "speaker" in personneRole[1] or "performer" in personneRole[1] or "singer" in personneRole[
                1] or "responder" in \
                    personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='Other')
                contributorName = ET.SubElement(contributor, "contributorName", nameType="Personal")
                contributorName.text = personneRole[0]
            elif "interviewer" in personneRole[1] or "interpreter" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='DataCollector')
                contributorName = ET.SubElement(contributor, "contributorName", nameType="Personal")
                contributorName.text = personneRole[0]
            elif "depositor" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='ContactPerson')
                contributorName = ET.SubElement(contributor, "contributorName", nameType="Personal")
                contributorName.text = personneRole[0]
            elif "compiler" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='DataCurator')
                contributorName = ET.SubElement(contributor, "contributorName", nameType="Personal")
                contributorName.text = personneRole[0]
            elif "editor" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='Editor')
                contributorName = ET.SubElement(contributor, "contributorName", nameType="Personal")
                contributorName.text = personneRole[0]
            elif "sponsor" in personneRole[1]:
                contributor = ET.SubElement(contributors, "contributor", contributorType='Sponsor')
                contributorName = ET.SubElement(contributor, "contributorName")
                contributorName.text = personneRole[0]
        if booleen == False:
            for personneRole in self.contributeurs:
                if "depositor" in personneRole[1]:
                    creator = ET.SubElement(creators, "creator")
                    creatorName = ET.SubElement(creator, "creatorName", nameType="Personal")
                    creatorName.text = personneRole[0]
                    booleen = True

        if booleen == False:
            message = "La balise CREATOR pour le record {} est obligatoire!!".format(self.identifiantPrincipal)
            logging.info(message)

        for institution in self.publisherInstitution:
            contributor = ET.SubElement(contributors, "contributor", contributorType="Producer")
            contributorName = ET.SubElement(contributor, "contributorName", nameType="Organizational")
            contributorName.text = institution

        for institution in self.hostingInstitution:
            contributor = ET.SubElement(contributors, "contributor", contributorType="HostingInstitution")
            contributorName = ET.SubElement(contributor, "contributorName", nameType="Organizational")
            contributorName.text = institution


        if self.droits:
            contributor = ET.SubElement(contributors, "contributor", contributorType='RightsHolder')
            contributorName = ET.SubElement(contributor, "contributorName")
            contributorName.text = self.droits

        # les titres
        if self.titre:
            titles = ET.SubElement(racine, "titles")
            title = ET.SubElement(titles, "title")
            title.text = self.titre
            if self.valeurXmlLang:
                title.set("xml:lang", self.valeurXmlLang)
        else:
            message = "La balise TITLE pour le record {} est obligatoire!!".format(self.identifiantPrincipal)
            logging.info(message)

        if self.titresSecondaire:
            for groupe in self.titresSecondaire:
                titreS = ET.SubElement(titles, "title")
                titreS.text = groupe[1]
                titreS.set("xml:lang", groupe[0])

        # le publisher
        publisher = ET.SubElement(racine, "publisher")
        publisher.text = self.publisher

        # année de publication
        if self.annee:
            publicationYear = ET.SubElement(racine, "publicationYear")
            publicationYear.text = self.annee[:4]
        else:
            message = "La balise PUBLICATIONYEAR pour le record {} est obligatoire!!".format(self.identifiantPrincipal)
            logging.info(message)

        # la langue
        if self.codeLangue:
            # prend la première valeur de la liste avec les codes des langues
            language = ET.SubElement(racine, "language")
            language.text = self.codeLangue[0]

        # les mots clés
        subjects = ET.SubElement(racine, "subjects")

        subject = ET.SubElement(subjects, "subject")
        subject.text = self.setSpec

        if self.labelLangue:
            for label in self.labelLangue:
                subject = ET.SubElement(subjects, "subject", subjectScheme="language",
                                        schemeURI = SCHEME_URI)
                subject.text = label[1]
                subject.set("xml:lang", label[0])

        if self.sujets:
            for mot in self.sujets:
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
        date.text = self.annee

        # le type de ressource
        if self.labelType:
            resourceType = ET.SubElement(racine, "resourceType", resourceTypeGeneral=self.typeRessourceGeneral)

            resourceType.text = ", ".join(self.labelType)
        else:
            message = "La balise RESOURCETYPE pour le record {} est obligatoire!!".format(self.identifiantPrincipal)
            logging.info(message)

        #les identifiants
        alternateIdentifiers = ET.SubElement(racine, "alternateIdentifiers")
        alternateIdentifier = ET.SubElement(alternateIdentifiers, "alternateIdentifier",
                                            alternateIdentifierType="internal_ID")
        alternateIdentifier.text = self.identifiantPrincipal
        alternateIdentifier = ET.SubElement(alternateIdentifiers, "alternateIdentifier",
                                            alternateIdentifierType="PURL")
        alternateIdentifier.text = PURL + self.identifiantPrincipal[21:]

        if self.identifiant_Ark_Handle or self.isRequiredBy or self.requires or self.relatedIdPangloss:
            relatedIdentifiers = ET.SubElement(racine, "relatedIdentifiers")

        if self.identifiant_Ark_Handle:
            for identifiant in self.identifiant_Ark_Handle:
                relatedIdentifier = ET.SubElement(relatedIdentifiers, "relatedIdentifier",
                                                  relatedIdentifierType=identifiant[0],
                                                  relationType="IsIdenticalTo")
                relatedIdentifier.text = identifiant[1]

        if self.isRequiredBy:
            for identifiantRel in self.isRequiredBy:
                relatedIdentifier = ET.SubElement(relatedIdentifiers, "relatedIdentifier", relatedIdentifierType="PURL",
                                                  relationType="IsRequiredBy")
                relatedIdentifier.text = PURL + identifiantRel[21:]

        if self.requires:
            for identifiantRequires in self.requires:
                relatedIdentifier = ET.SubElement(relatedIdentifiers, "relatedIdentifier", relatedIdentifierType="PURL",
                                                  relationType="Requires")
                relatedIdentifier.text = PURL + identifiantRequires[21:]

        idPangloss = ET.SubElement(relatedIdentifiers, "relatedIdentifier", relatedIdentifierType="DOI",
                                      relationType="IsPartOf")
        idPangloss.text = self.relatedIdPangloss

        #le format
        if self.format:
            formats = ET.SubElement(racine, "formats")
            for element in self.format:
                format = ET.SubElement(formats, "format")
                format.text = element

        if self.taille:
            sizes = ET.SubElement(racine, "sizes")
            size = ET.SubElement(sizes, "size")
            size.text = self.taille

        #les descriptions
        if self.abstract or self.tableDeMatiere or self.descriptionsOlac:
            descriptions = ET.SubElement(racine, "descriptions")

        if self.abstract:
            for element in self.abstract:
                # si la liste est composée d'une liste et d'une chaine de carractère, on récupère la chaine avec isistance()
                if isinstance(element, str):
                    description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                    description.text = element
                else:
                    description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                    description.text = element[1]
                    description.set("xml:lang", element[0])

        if self.tableDeMatiere:
            for element in self.tableDeMatiere:
                if isinstance(element, str):
                    description = ET.SubElement(descriptions, "description", descriptionType="TableOfContents")
                    description.text = element
                else:
                    description = ET.SubElement(descriptions, "description", descriptionType="TableOfContents")
                    description.text = element[1]
                    description.set("xml:lang", element[0])

        if self.descriptionsOlac:
            for element in self.descriptionsOlac:
                if isinstance(element, str):
                    # si la balise abstract existe, alors la balise description aura l'attribut Other, si elle n'existe pas, l'attribut Abstract
                    if self.abstract:
                        description = ET.SubElement(descriptions, "description", descriptionType="Other")
                        description.text = element
                    # si la balise abstract n'existe pas et que le mot Equipment fait partie du contenu de la balise description, alors cet élément aura l'attribut Other
                    elif "Equipment" in element:
                        description = ET.SubElement(descriptions, "description", descriptionType="TechnicalInfo")
                        description.text = element
                    else:
                        description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                        description.text = element
                    # la même chose, mais pour le cas où abstract contient l'attribut xml-lang
                else:
                    if self.abstract:
                        description = ET.SubElement(descriptions, "description", descriptionType="Other")
                        description.text = element[1]
                        description.set("xml:lang", element[0])

                    elif "Equipment" in element[1]:
                        description = ET.SubElement(descriptions, "description", descriptionType="TechnicalInfo")
                        description.text = element[1]
                        description.set("xml:lang", element[0])

                    else:
                        description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                        description.text = element[1]
                        description.set("xml:lang", element[0])

        if self.labelLieux:
            geoLocations = ET.SubElement(racine, "geoLocations")
            for element in self.labelLieux:
                geoLocation = ET.SubElement(geoLocations, "geoLocation")
                geoLocationPlace = ET.SubElement(geoLocation, "geoLocationPlace")
                geoLocationPlace.text = element

            if self.longitudeLatitude:
                geoLocationPoint = ET.SubElement(geoLocation, "geoLocationPoint")
                pointLongitude = ET.SubElement(geoLocationPoint, "pointLongitude")
                pointLongitude.text = self.longitudeLatitude[0]
                pointLatitude = ET.SubElement(geoLocationPoint, "pointLatitude")
                pointLatitude.text = self.longitudeLatitude[1]

            if self.pointCardinaux:
                geoLocationBox = ET.SubElement(geoLocation, "geoLocationBox")
                westBoundLongitude = ET.SubElement(geoLocationBox, "westBoundLongitude")
                westBoundLongitude.text = self.pointCardinaux[0]
                eastBoundLongitude = ET.SubElement(geoLocationBox, "eastBoundLongitude")
                eastBoundLongitude.text = self.pointCardinaux[1]
                southBoundLatitude = ET.SubElement(geoLocationBox, "southBoundLatitude")
                southBoundLatitude.text = self.pointCardinaux[2]
                northBoundLatitude = ET.SubElement(geoLocationBox, "northBoundLatitude")
                northBoundLatitude.text = self.pointCardinaux[3]

        tree = ET.ElementTree(racine)
        tree.write("test/" + self.identifiantPrincipal[21:]+".xml", encoding="UTF-8", xml_declaration=True, default_namespace=None, method="xml")

        # vérifier que le fichier XML est créé ou pas
        if "test/" + self.identifiantPrincipal[21:]+".xml" :
            return "test/" + self.identifiantPrincipal[21:]+".xml"
        else:
            return None

    def generatorFichierUrlDoi(self):
        with open("testURL/" + self.identifiantPrincipal[21:]+".txt", "w") as fichierUrl:
            url = "url= "+self.url
            doi = "doi= "+ self.identifiant
            fichierUrl.write(url + "\n" + doi)

        # vérifier que le fichier text est créé ou pas
        if "testURL/" + self.identifiantPrincipal[21:]+".txt":
            return "testURL/" + self.identifiantPrincipal[21:]+".txt"
        else:
            return None



