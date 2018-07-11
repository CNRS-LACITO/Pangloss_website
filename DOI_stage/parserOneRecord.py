# --------Parsing XML ------------------#
import xml.etree.ElementTree as ET
from constantes import NAMESPACES, DOI_Pangloss
import re

tree = ET.parse("lacito_1verif.xml")
root = tree.getroot()

# --------Parse.py header--------#

if root.find('.//identifier') != None:
    identifiantPrincipal = root.find('.//identifier').text
    identifiant = "10.5072/"+identifiantPrincipal[21:]

else:
    identifiant = ""
    print("La balise identifiant n'existe pas")

setSpec = "Linguistique"

# --------Parse.py metadata-OLAC--------#

olac = root.find('.//olac:olac', NAMESPACES)

#extraire les publisher
publisherInstitution = []
if olac.findall('dc:publisher', NAMESPACES) != None:
    for institution in olac.findall('dc:publisher', NAMESPACES):
        nomInstituion = institution.text
        publisherInstitution.append(nomInstituion)
else:
    print ("La balise publisher n'existe pas")

if olac.find('dc:format', NAMESPACES) != None:
    format = olac.find('dc:format', NAMESPACES).text.split("/")
else:
    format =[]


if olac.find("dcterms:available", NAMESPACES) != None:
    annee = olac.find("dcterms:available", NAMESPACES).text
else:
    annee =""


if olac.find("dcterms:extent", NAMESPACES) != None:
    taille = olac.find("dcterms:extent", NAMESPACES).text
else:
    taille = ""


# récupérer le contentnu de la balise titre
if olac.find("dc:title", NAMESPACES) != None:
    titre = olac.find("dc:title", NAMESPACES).text
else:
    titre = ""
    print("La balise Titre n'existe pas")


# récupérer la valeur de l'attribut xml:lang du titre
attributTitre = olac.find("dc:title", NAMESPACES).attrib
valeurXmlLang = attributTitre.get('{http://www.w3.org/XML/1998/namespace}lang')

# récupérer le titre alternatif et la langue dans une liste
titresSecondaire = []
for titreAlternatif in olac.findall('dcterms:alternative', NAMESPACES):
    titreLabel = titreAlternatif.text
    attribLang = titreAlternatif.attrib
    codeLangue = attribLang.get("{http://www.w3.org/XML/1998/namespace}lang")
    titreLangList = [codeLangue, titreLabel]
    titresSecondaire.append(titreLangList)

droits=''
if olac.find("dc:rights", NAMESPACES) != None:
    droitsComplet = olac.find("dc:rights", NAMESPACES).text
    if re.match("Copyright [^A-Z]*", droitsComplet):
        droits = re.sub("Copyright [^A-Z]*", '', droitsComplet)
    else:
        print("Il y a une autre forme de droits")
        droits = ""



contributeurs = []
if olac.findall('dc:contributor', NAMESPACES) != None:
    for contributor in olac.findall('dc:contributor', NAMESPACES):
        code = contributor.attrib['{http://www.language-archives.org/OLAC/1.1/}code']
        value = contributor.text
        contributorList = [value, code]
        contributeurs.append(contributorList)
else:
    print("La balise Contributeurs n'existe pas")

# récupère le code de la langue principale de la ressource
codeLangue = []
# récupère les labels de la langue principale de la ressource
labelLangue = []
# récupère des mots-clés sous forme de chaine de caractères et des listes de mot-clé et xml:lang
sujets = []

for sujet in olac.findall('dc:subject', NAMESPACES):
    sujetAttribut = sujet.attrib
    # si la balise subject n'a pas d'attributs, la valeur de l'élement est ajouté à la liste de mots-cles
    if not sujetAttribut:
        sujets.append(sujet.text)
    else:
        # si la balise subject contient l'attribut type et la valeur olac:langue, recupérer les diférents informations sur les langues
        for cle, valeur in sujetAttribut.items():
            if cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "olac:language":
                # récupère le code de la langue et l'ajoute à la liste de code
                code = sujetAttribut.get('{http://www.language-archives.org/OLAC/1.1/}code')
                codeLangue.append(code)
                # récupérer dans une liste la valeur de l'attribut xml:lang et le label de la langue et l'ajoute à la liste de label
                label = sujet.text
                attribXmlLangLabel = sujetAttribut.get('{http://www.w3.org/XML/1998/namespace}lang')
                listeAttribXmlLabel = [attribXmlLangLabel, label]
                labelLangue.append(listeAttribXmlLabel)
            # si la balise subject contient l'attribut xml:lang, récupérer dans une liste la valeur de l'attribut et le contenu de l'élément
            if cle == "{http://www.w3.org/XML/1998/namespace}lang" and "{http://www.w3.org/2001/XMLSchema-instance}type" not in sujetAttribut:
                attribXmlLang = valeur
                motCle = sujet.text
                listeAttribMot = [attribXmlLang, motCle]
                # ajout de la liste attribut langue et mot clé à la liste de mots clés
                sujets.append(listeAttribMot)


# Le type de ressource: récupère les informations des balises dc:type
# liste qui récupère le contenu de la balise type et la valeur de l'attribut olac:code et qui vont être affectés à l'élément type en sortie

labelType = []
bool = False
for element in olac.findall("dc:type", NAMESPACES):
    typeAttribut = element.attrib

    if not typeAttribut:
        sujets.append(element.text)

    else:
        for cle, valeur in typeAttribut.items():
            if cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "dcterms:DCMIType":
                # variable qui récupère le type de ressource general qui va être affecté à l'attribut typeRessourceGeneral en sortie
                if element.text == "MovingImage":
                    typeRessourceGeneral = "Audiovisual"
                else:
                    typeRessourceGeneral = element.text


            # on récupère le contenu de l'atttribut olac:code de la balise dc:type qui a comme valeur d'attribut olac:discourse-type,sinon afficher "Non renseigné"
            elif cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "olac:discourse-type":
                labelCode = typeAttribut.get('{http://www.language-archives.org/OLAC/1.1/}code')
                labelType.append(labelCode)
                bool = True

if bool == False:
    labelType.append("(:unkn)")
    bool = True


isRequiredBy = []
if olac.find('dcterms:isRequiredBy', NAMESPACES) != None:
    for ressource in olac.findall('dcterms:isRequiredBy', NAMESPACES):
        isRequiredBy.append(ressource.text)

requires = []
if olac.find('dcterms:requires', NAMESPACES) != None:
    for ressource in olac.findall('dcterms:requires', NAMESPACES):
        requires.append(ressource.text)


identifiant_Ark_Handle = []
for identifiantAlternatif in olac.findall('dc:identifier', NAMESPACES):
    identifiantAttribut = identifiantAlternatif.attrib

    for cle, valeur in identifiantAttribut.items():
        if cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "dcterms:URI":
            if "ark" in identifiantAlternatif.text:
                identifiantType = "ARK"
                lienArk = identifiantAlternatif.text
                listeIdLienArk = [identifiantType, lienArk]
                identifiant_Ark_Handle.append(listeIdLienArk)
            if "handle" in identifiantAlternatif.text:
                identifiantType = "Handle"
                lienHandle = identifiantAlternatif.text
                listeIdLienHandle = [identifiantType, lienHandle]
                identifiant_Ark_Handle.append(listeIdLienHandle)

lienAnnotation = ""
for identifiantAnnotation in olac.findall('dc:identifier', NAMESPACES):
    # extraire le lien du fichier xml contenant l'annontation
    if ".xml" in identifiantAnnotation.text:
        lienAnnotation = identifiantAnnotation.text
        break


# récupère la description de la balise abstract sous la forme d'une liste avec le contenu de la balise
# et/ou avec une liste contenant l'attribut langue et le contenu de la balise
abstract = []
for contenu in olac.findall("dcterms:abstract", NAMESPACES):
    # récupère les attributs et valeurs d'attributs sous la forme d'un dictionnaire
    abstractAttrib = contenu.attrib
    # si la balise ne contient pas d'attributs, alors ajouter le contenu de l'élément à la liste
    if not abstractAttrib:
        abstract.append(contenu.text)
    # si la balise contient d'attributs (attributs xml:lang d'office), créer une liste avec le code de la langue et le contenu de la balise
    else:
        langueAbstract = abstractAttrib.get("{http://www.w3.org/XML/1998/namespace}lang")
        texteAbstract = contenu.text
        listeLangueContenu = [langueAbstract, texteAbstract]
        abstract.append(listeLangueContenu)

# récupérer le contenu de la balise tableOfContent
tableDeMatiere = []
for contenu in olac.findall("dcterms:tableOfContents", NAMESPACES):
    # récupère les attributs et valeurs de la balise sous la forme d'un dictionnaire
    tableAttrib = contenu.attrib
    # si la balise ne contient pas d'attributs, alors ajouter le contenu à la liste
    if not tableAttrib:
        tableDeMatiere.append(contenu.text)
    # si la balise contient d'attributs (attributs xml:lang d'office), créer une liste avec le code de la langue et le contenu de la balise
    else:
        langueTable = tableAttrib.get("{http://www.w3.org/XML/1998/namespace}lang")
        texteTable = contenu.text
        listeLangueContenu = [langueTable, texteTable]
        tableDeMatiere.append(listeLangueContenu)

# récupérer la description
descriptionsOlac = []
for texte in olac.findall("dc:description", NAMESPACES):
    descriptionAttrib = texte.attrib
    if not descriptionAttrib:
        contenuDescription = texte.text
        descriptionsOlac.append(contenuDescription)
    else:
        langueDescription = descriptionAttrib.get("{http://www.w3.org/XML/1998/namespace}lang")
        texteDescription = texte.text
        listeLangueContenu = [langueDescription, texteDescription]
        descriptionsOlac.append(listeLangueContenu)


# liste qui récupère les labels du lieu
labelLieux = []
longitudeLatitude = []
pointCardinaux = []
for lieu in olac.findall('dcterms:spatial', NAMESPACES):
    lieuAttrib = lieu.attrib
    if not lieuAttrib:
        labelLieux.append(lieu.text)
    for cle, valeur in lieuAttrib.items():
        if cle == '{http://www.w3.org/XML/1998/namespace}lang':
            labelLieux.append(lieu.text)

        # récupère les 2 points de la longitude et latitude en une seule chaine de caractères pour le cas où l'attribut est Point
        if cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "dcterms:Point":
            pointLieux = lieu.text

            # transforme la chaine en une liste avec deux élémentscomme suit: 'east=valeur', 'north=valeur'
            long_lat = pointLieux.split(";")

            # élimine l'espace en trop du contenu texte des deux éléments de la liste (north et east)
            point1sansEspaces = long_lat[0].strip()
            point2sansEspaces = long_lat[1].strip()

            # condition pour régler le problème d'ordre des éléments nord et sud. Récupération des valeurs chiffrées de la longitude et de la latitude
            if "east" in point1sansEspaces:
                longitude = point1sansEspaces[5:]
                latitude = point2sansEspaces[6:]
            else:
                longitude = point2sansEspaces[5:]
                latitude = point1sansEspaces[6:]

            longitudeLatitude.append(longitude)
            longitudeLatitude.append(latitude)


        # récupère les 4 points de la longitude et latitude en une seule chaine de caractères pour le cas où l'attribut est Box
        elif cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "dcterms:Box":
            boxLieux = lieu.text
            # transforme la chaine en une liste avec quatre éléments : southlimit, northlimit, eastlimit, westlimit
            sudNordEstWest = boxLieux.split(';')

            # supression des espaces pour les quatres points
            sudSansEspace = sudNordEstWest[0].strip()
            nordSansEspace = sudNordEstWest[1].strip()
            estSansEspace = sudNordEstWest[2].strip()
            westSansEspace = sudNordEstWest[3].strip()

            # récupère uniquement la valeur chiffrée des quatre points
            sud = sudSansEspace[11:]
            nord = nordSansEspace[11:]
            est = estSansEspace[10:]
            west = westSansEspace[10:]
            pointCardinaux.append(west)
            pointCardinaux.append(est)
            pointCardinaux.append(sud)
            pointCardinaux.append(nord)

# --------Building XML ------------------#

racine = ET.Element("resource", xmlns="http://datacite.org/schema/kernel-4")
racineXmlns = racine.set ("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
racineXsi = racine.set("xsi:schemaLocation", "http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4.1/metadata.xsd")

# l'identifiant DOI
if identifiant:
    identifier = ET.SubElement(racine, "identifier", identifierType="DOI")
    identifier.text = identifiant
else:
    print("La balise IDENTIFIER est obligatoire!!")

#le publisher
publisher = ET.SubElement(racine, "publisher")
publisher.text = "Pangloss"

# les createurs et contributeurs
creators = ET.SubElement(racine, "creators")
contributors = ET.SubElement(racine, "contributors")

booleen = False
for personneRole in contributeurs:
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
    elif "speaker" in personneRole[1] or "performer" in personneRole[1] or "singer" in personneRole[1] or "responder" in \
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
    for personneRole in contributeurs:
        if "depositor" in personneRole[1]:
            creator = ET.SubElement(creators, "creator")
            creatorName = ET.SubElement(creator, "creatorName", nameType="Personal")
            creatorName.text = personneRole[0]
            booleen = True
if booleen == False:
    print("La balise CREATOR est obligatoire!")

if publisherInstitution:
    for institution in publisherInstitution:
        contributor = ET.SubElement(contributors, "contributor", contributorType="Producer")
        contributorName = ET.SubElement(contributor, "contributorName", nameType="Organizational")
        contributorName.text = institution

hostingInstitution = ["COllections de COrpus Oraux Numériques", "Huma-Num",
                      "Langues et Civilisations à Tradition Orale",
                      "Centre Informatique National de l'Enseignement Supérieur"]
for institution in hostingInstitution:
    contributor = ET.SubElement(contributors, "contributor", contributorType="HostingInstitution")
    contributorName = ET.SubElement(contributor, "contributorName", nameType="Organizational")
    contributorName.text = institution

if droits:
    contributor = ET.SubElement(contributors, "contributor", contributorType='RightsHolder')
    contributorName = ET.SubElement(contributor, "contributorName")
    contributorName.text = droits
else:
    print("L'attribut RightsHolder n'a pas pu être généré")

# les titres
if titre:
    titles = ET.SubElement(racine, "titles")
    title = ET.SubElement(titles, "title")
    title.text = titre
    if valeurXmlLang:
        title.set("xml:lang", valeurXmlLang)
else:
    print("La Balise TITLE est obligatoire")

if titresSecondaire:
    for groupe in titresSecondaire:
        titreS = ET.SubElement(titles, "title")
        titreS.text = groupe[1]
        titreS.set("xml:lang", groupe[0])

# le publisher
publisher = ET.SubElement(racine, "publisher")
publisher.text = "Pangloss"

# année de publication
if annee:
    publicationYear = ET.SubElement(racine, "publicationYear")
    publicationYear.text = annee[:4]
else:
    print("La balise PUBLICATIONYEAR est obligatoire")

# la langue
if codeLangue:
    # prend la première valeur de la liste avec les codes des langues
    language = ET.SubElement(racine, "language")
    language.text = codeLangue[0]

# les mots clés
subjects = ET.SubElement(racine, "subjects")

subject = ET.SubElement(subjects, "subject")
subject.text = setSpec

if labelLangue:
    for label in labelLangue:
        subject = ET.SubElement(subjects, "subject", subjectScheme="language",
                                schemeURI="http://search.language-archives.org/index.html")
        subject.text = label[1]
        subject.set("xml:lang", label[0])

if sujets:
    for mot in sujets:
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
date.text = annee

# le type de ressource
if labelType:
    resourceType = ET.SubElement(racine, "resourceType", resourceTypeGeneral=typeRessourceGeneral)
    if len(labelType) >1 and "(:unkn)" in labelType:
        labelType.remove("(:unkn)")
        resourceType.text = ", ".join(labelType)
    else:
        resourceType.text = ", ".join(labelType)
else:
    print("La balise RESOURCETYPE est obligatoire")


alternateIdentifiers = ET.SubElement(racine, "alternateIdentifiers")
alternateIdentifier = ET.SubElement(alternateIdentifiers, "alternateIdentifier",
                                    alternateIdentifierType="internal_ID")
alternateIdentifier.text = identifiantPrincipal
alternateIdentifier = ET.SubElement(alternateIdentifiers, "alternateIdentifier",
                                    alternateIdentifierType="PURL")
alternateIdentifier.text = "http://purl.org/poi/crdo.vjf.cnrs.fr/"+identifiantPrincipal[21:]

if identifiant_Ark_Handle or isRequiredBy or requires:
    relatedIdentifiers = ET.SubElement(racine, "relatedIdentifiers")

if identifiant_Ark_Handle:
    for identifiant in identifiant_Ark_Handle:
        relatedIdentifier = ET.SubElement(relatedIdentifiers, "relatedIdentifier", relatedIdentifierType=identifiant[0],
                                          relationType="IsIdenticalTo")
        relatedIdentifier.text = identifiant[1]

if isRequiredBy:
    for identifiantRel in isRequiredBy:
        relatedIdentifier = ET.SubElement(relatedIdentifiers, "relatedIdentifier", relatedIdentifierType="PURL",
                                      relationType="IsRequiredBy")
        relatedIdentifier.text = "http://purl.org/poi/crdo.vjf.cnrs.fr/"+identifiantRel[21:]

if requires:
    for identifiantRequires in requires:
        relatedIdentifier = ET.SubElement(relatedIdentifiers, "relatedIdentifier", relatedIdentifierType="PURL",
                                      relationType="Requires")
        relatedIdentifier.text = "http://purl.org/poi/crdo.vjf.cnrs.fr/"+identifiantRequires[21:]

relatedIdPangloss = ET.SubElement(relatedIdentifiers, "relatedIdentifier", relatedIdentifierType="DOI",
                                      relationType="IsPartOf")
relatedIdPangloss.text = DOI_Pangloss

if format:
    formats = ET.SubElement(racine, "formats")
    for element in format:
        format = ET.SubElement(formats, "format")
        format.text = element

if taille:
    sizes = ET.SubElement(racine, "sizes")
    size = ET.SubElement(sizes, "size")
    size.text = taille

if abstract or tableDeMatiere or descriptionsOlac:
    descriptions = ET.SubElement(racine, "descriptions")

if abstract:
    for element in abstract:
        # si la liste est composée d'une liste et d'une chaine de carractère, on récupère la chaine avec isistance()
        if isinstance(element, str):
            description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
            description.text = element
        else:
            description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
            description.text = element[1]
            description.set("xml:lang", element[0])

if tableDeMatiere:
    for element in tableDeMatiere:
        if isinstance(element, str):
            description = ET.SubElement(descriptions, "description", descriptionType="TableOfContents")
            description.text = element
        else:
            description = ET.SubElement(descriptions, "description", descriptionType="TableOfContents")
            description.text = element[1]
            description.set("xml:lang", element[0])

if descriptionsOlac:
    for element in descriptionsOlac:
        if isinstance(element, str):
            # si la balise abstract existe, alors la balise description aura l'attribut Other, si elle n'existe pas, l'attribut Abstract
            if abstract:
                description = ET.SubElement(descriptions, "description", descriptionType="Other")
                description.text = element
            # si la balise abstract n'existe pas et que le mot Equipment fait partie du contenu de la balise description, alors cet élément aura l'attribut Other
            elif "Equipment" in element:
                description = ET.SubElement(descriptions, "description", descriptionType="TechnicalInfo")
                description.text = element
            else:
                description = ET.SubElement(descriptions, "description", descriptionType="Abstract")
                description.text = element
            #la même chose, mais pour le cas où abstract contient l'attribut xml-lang
        else:
            if abstract:
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

if labelLieux:
    geoLocations = ET.SubElement(racine, "geoLocations")
    for element in labelLieux:
        geoLocation = ET.SubElement(geoLocations, "geoLocation")
        geoLocationPlace = ET.SubElement(geoLocation, "geoLocationPlace")
        geoLocationPlace.text = element

    if longitudeLatitude:
        geoLocationPoint = ET.SubElement(geoLocation, "geoLocationPoint")
        pointLongitude = ET.SubElement(geoLocationPoint, "pointLongitude")
        pointLongitude.text = longitudeLatitude[0]
        pointLatitude = ET.SubElement(geoLocationPoint, "pointLatitude")
        pointLatitude.text = longitudeLatitude[1]

    if pointCardinaux:
        geoLocationBox = ET.SubElement(geoLocation, "geoLocationBox")
        westBoundLongitude = ET.SubElement(geoLocationBox, "westBoundLongitude")
        westBoundLongitude.text = pointCardinaux[0]
        eastBoundLongitude = ET.SubElement(geoLocationBox, "eastBoundLongitude")
        eastBoundLongitude.text = pointCardinaux[1]
        southBoundLatitude = ET.SubElement(geoLocationBox, "southBoundLatitude")
        southBoundLatitude.text = pointCardinaux[2]
        northBoundLatitude = ET.SubElement(geoLocationBox, "northBoundLatitude")
        northBoundLatitude.text = pointCardinaux[3]

tree = ET.ElementTree(racine)
tree.write("sortie.xml", encoding="UTF-8", xml_declaration=True, default_namespace=None, method="xml")


