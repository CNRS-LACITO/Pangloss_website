# --------Parsing XML ------------------#
import xml.etree.ElementTree as ET
import requests
import logging
from constantes import logFileName

logging.basicConfig(filename=logFileName,level=logging.INFO)


def parseAnnotation (lienUrl):
    req = requests.get(lienUrl)
    if req.status_code !=200 and req.status_code != 201:
        message = "Le lien {} ne fonctionne pas".format(lienUrl)
        logging.error(message)
    else:
        root = ET.fromstring(req.text)
        listeID = []
        #vérifier que la balise <S> existe
        if root.findall('.//S'):
            #boucler sur chaque élément <S>
            for phrase in root.findall('.//S'):
                #parser les attributs de la balise <S>
                attributsPhrase = phrase.attrib
                #extraire la valeur de l'attribut "id"
                idPhrase = attributsPhrase.get("id")
                listeID.append(idPhrase)
        elif root.findall('.//W'):
            #si la balise <S> n'existe pas, il faut parser la balise <W>
            for mot in root.findall('.//W'):
                # parser les attributs de la balise <W>
                attributsMot = mot.attrib
                # extraire la valeur de l'attribut "id"
                idMot = attributsMot.get("id")
                listeID.append(idMot)

        return listeID
"""
req = requests.get("https://cocoon.huma-num.fr/data/michaud/masters/crdo-NRU_F4_DEM_CL3.xml")
print(req.status_code)
if req.status_code !=200 and req.status_code != 201:
    print("ups")
else:
    root = ET.fromstring(req.text)
    print(root)
    listeID = []
    #vérifier que la balise <S> existe
    if root.findall('.//S'):
        #boucler sur chaque élément <S>
        for phrase in root.findall('.//S'):
            #parser les attributs de la balise <S>
            attributsPhrase = phrase.attrib
            #extraire la valeur de l'attribut "id"
            idPhrase = attributsPhrase.get("id")
            listeID.append(idPhrase)
    elif root.findall('.//W'):
        #si la balise <S> n'existe pas, il faut parser la balise <W>
        for mot in root.findall('.//W'):
            # parser les attributs de la balise <W>
            attributsMot = mot.attrib
            # extraire la valeur de l'attribut "id"
            idMot = attributsMot.get("id")
            listeID.append(idMot)
    print(listeID)
"""