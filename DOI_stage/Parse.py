from Record import Record
from constantes import NAMESPACES, DOI_TEST, SHOW_TEXT, IDREF, SHOW_OTHER, logFileName
import re
import logging


logging.basicConfig(filename=logFileName,level=logging.INFO)

def parserRecord (record):
        """
        Methode qui parse les éléments xml contenus dans la balise <record> du fichier metadata_cocoon.xml et récupère la valeur des attributs de l'objet
        :param record: les éléments contenus dans la balise <record>
        :type record: class 'xml.etree.ElementTree.Element'

        """

        # --------Parse.py header--------#
        identifiantPrincipal = ""
        if record.find('.//nsDefault:identifier', NAMESPACES) != None:
            identifiantPrincipal = record.find('.//nsDefault:identifier', NAMESPACES).text
            identifiant = DOI_TEST + identifiantPrincipal[21:]

        else:
            identifiant = ""
            # print("La balise identifiant n'existe pas")

        setSpec =  "Linguistique"

        # --------Parse.py metadata-OLAC--------#

        olac = record.find('.//olac:olac', NAMESPACES)

        publisherInstitution = []
        if olac.findall('dc:publisher', NAMESPACES) != None:
            for institution in olac.findall('dc:publisher', NAMESPACES):
                nomInstituion = institution.text
                publisherInstitution.append(nomInstituion)

        if olac.find('dc:format', NAMESPACES) != None:
            format = olac.find('dc:format', NAMESPACES).text.split("/")

        else:
            format = []

        if olac.find("dcterms:available", NAMESPACES) != None:
            annee = olac.find("dcterms:available", NAMESPACES).text
        else:
            annee = ""

        if olac.find("dcterms:extent", NAMESPACES) != None:
            taille = olac.find("dcterms:extent", NAMESPACES).text
        else:
            taille = ""

        # récupérer le contentnu de la balise titre
        if olac.find("dc:title", NAMESPACES) != None:
            titre = olac.find("dc:title", NAMESPACES).text
        else:
            titre = ""

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

        droits =""
        if olac.find("dc:rights", NAMESPACES) != None:
            droitsComplet = olac.find("dc:rights", NAMESPACES).text
            if re.match("Copyright [^A-Z]*", droitsComplet):
                droits = re.sub("Copyright [^A-Z]*", '', droitsComplet)
            else:
                message = "Il y a une autre forme d'écrire les droits"
                logging.info(message)

        contributeurs = []
        if olac.findall('dc:contributor', NAMESPACES) != None:
            for contributor in olac.findall('dc:contributor', NAMESPACES):
                code = contributor.attrib['{http://www.language-archives.org/OLAC/1.1/}code']
                value = contributor.text
                contributorList = [value, code]
                contributeurs.append(contributorList)

        # récupère les codes des langues des corpus
        codeLangue = []
        # récupère les labels des langues des corpus
        labelLangue = []
        # récupère des mots-clés sous forme de chaine de caractères et des listes de mot-clé et xml:lang
        sujets = []

        for sujet in olac.findall('dc:subject', NAMESPACES):
            sujetAttribut = sujet.attrib
            # si la balise subject n'a pas d'attributs, la valeur de l'élement est ajouté à la liste de mots-cles
            if not sujetAttribut:
                sujets.append(sujet.text)
            else:
                # si la balise subject contient l'attribut type et la valeur olac:langue, recupère les diférents informations sur les langues
                for cle, valeur in sujetAttribut.items():
                    if cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "olac:language":
                        # récupère le code de la langue et l'ajoute à la liste
                        code = sujetAttribut.get('{http://www.language-archives.org/OLAC/1.1/}code')
                        codeLangue.append(code)
                        # récupère le texte de la balise sujet pour la langue et l'ajoute à la liste
                        label = sujet.text
                        labelLangue.append(label)
                    # si la balise subject contient l'attribut xml:lang, récupère dans une liste la valeur de l'attribut et le contenu de l'élément
                    if cle == "{http://www.w3.org/XML/1998/namespace}lang" and "{http://www.w3.org/2001/XMLSchema-instance}type" not in sujetAttribut:
                        attribXmlLang = valeur
                        motCle = sujet.text
                        listeAttribMot = [attribXmlLang, motCle]
                        # ajout de la liste attribut langue et mot clé à la liste de mots clés
                        sujets.append(listeAttribMot)

        # Le type de ressource: récupère les informations des balises dc:type
        # liste qui récupère le contenu de la balise type et la valeur de l'attribut olac:code et qui vont être affectés à l'élément type en sortie
        labelType = []
        typeRessourceGeneral = ""
        bool = False
        for element in olac.findall("dc:type", NAMESPACES):
            typeAttribut = element.attrib

            if not typeAttribut:
                labelType.append(element.text)

            else :
                for cle, valeur in typeAttribut.items():
                    if cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "dcterms:DCMIType":
                        # variable qui récupère le type de ressource general qui va être affecté à l'attribut typeRessourceGeneral en sortie
                        if element.text == "MovingImage":
                            typeRessourceGeneral = "Audiovisual"
                        else:
                            typeRessourceGeneral = element.text
                    # on récupère le contenu de l'atttribut olac:code de la balise dc:type qui a comme valeur d'attribut olac:discourse-type,sinon afficher "(:unkn)"
                    elif cle == "{http://www.w3.org/2001/XMLSchema-instance}type" and valeur == "olac:discourse-type":
                        labelCode = typeAttribut.get('{http://www.language-archives.org/OLAC/1.1/}code')
                        labelType.append(labelCode)
                        bool = True
        if bool == False:
            labelType.append("(:unkn)")
            bool = True
        print(labelType, identifiantPrincipal)

        isRequiredBy = []
        if olac.find('dcterms:isRequiredBy', NAMESPACES) != None:
            for ressource in olac.findall('dcterms:isRequiredBy', NAMESPACES):
                isRequiredBy.append(ressource.text)

        requires = []
        if olac.find('dcterms:requires', NAMESPACES) != None:
            for ressource in olac.findall('dcterms:requires', NAMESPACES):
                requires.append(ressource.text)

        # lien ark, handle
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

        #identifiant contenant le lien url vers le fichier xml de l'annotation
        lienAnnotation = ""
        for identifiantAnnotation in olac.findall('dc:identifier', NAMESPACES):
            #extraire le lien du fichier xml contenant l'annontation
            if ".xml" in identifiantAnnotation.text:
                lienAnnotation = identifiantAnnotation.text
                break


        # récupère la description de la balise abstract sous la forme d'une liste avec le contenu de la balise
        # et/ou avec une liste contenant l'attribut langue et le contenu de la balise
        abstract = []
        if olac.findall("dcterms:abstract", NAMESPACES) != None:

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
        if olac.findall("dcterms:tableOfContents", NAMESPACES) != None:

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
        if olac.findall("dc:description", NAMESPACES):

            for texte in olac.findall("dc:description", NAMESPACES):
                descriptionAttrib = texte.attrib
                if not descriptionAttrib:
                    descriptionsOlac.append(texte.text)
                else:
                    langueDescription = descriptionAttrib.get("{http://www.w3.org/XML/1998/namespace}lang")
                    texteDescription = texte.text
                    listeLangueContenu = [langueDescription, texteDescription]
                    descriptionsOlac.append(listeLangueContenu)

        # liste qui récupère les labels du lieu
        labelLieux = []
        longitudeLatitude = []
        pointCardiaux = []
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
                    # transforme la chaine en une liste avec deux éléments :north:valeur latitude et east:valeur longitude
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

                    # récupère uniquement la valeur chiffrée des quatres points
                    sud = sudSansEspace[11:]
                    nord = nordSansEspace[11:]
                    est = estSansEspace[10:]
                    west = westSansEspace[10:]
                    pointCardiaux.append(west)
                    pointCardiaux.append(est)
                    pointCardiaux.append(sud)
                    pointCardiaux.append(nord)

        url = ""
        if typeRessourceGeneral == "Audiovisual" or typeRessourceGeneral == "Sound":
            url = SHOW_TEXT + identifiantPrincipal[21:]
        elif typeRessourceGeneral == "Text" and format[0] == "text" and requires:
            for lienRequires in requires:
                url = SHOW_TEXT + lienRequires[21:] + IDREF + identifiantPrincipal[21:]
        elif typeRessourceGeneral == "Text" and format[0] == "application" and requires:
            for lienRequires in requires:
                url = SHOW_OTHER + lienRequires[21:] + IDREF + identifiantPrincipal[21:]
        else:
            url = identifiantPrincipal[21:]


        record_object = Record(identifiant, identifiantPrincipal, publisherInstitution, format, annee, taille, titre, valeurXmlLang, titresSecondaire, droits, contributeurs, codeLangue, labelLangue, sujets, labelType, typeRessourceGeneral, isRequiredBy, requires, identifiant_Ark_Handle, abstract, tableDeMatiere, descriptionsOlac, labelLieux, longitudeLatitude, pointCardiaux, url, lienAnnotation)
        return record_object