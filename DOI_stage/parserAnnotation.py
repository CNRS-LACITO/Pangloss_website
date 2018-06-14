# --------Parsing XML ------------------#
import xml.etree.ElementTree as ET
import requests
import urllib.request


#response = urllib.request.urlopen('https://cocoon.huma-num.fr/exist/crdo/leconte-tilouine/nep/crdo-NEP_DAURE.xml')
#print(response.info())
#html = response.read()
#response.close()  # best practice to close the file

def parseAnnotation (lienUrl):
    req = requests.get(lienUrl)
    root = ET.fromstring(req.text)
    listeID = []
    #vérifier que la balise <S> existe
    if root.findall('.//S') != None:
        #boucler sur chaque élément <S>
        for phrase in root.findall('.//S'):
            #parser les attributs de la balise <S>
            attributsPhrase = phrase.attrib
            #extraire la valeur de l'attribut "id"
            idPhrase = attributsPhrase.get("id")
            listeID.append(idPhrase)
    else:
        #si la balise <S> n'existe pas, il faut parser la balise <W>
        for mot in root.findall('.//W'):
            # parser les attributs de la balise <W>
            attributsMot = mot.attrib
            # extraire la valeur de l'attribut "id"
            idMot = attributsMot.get("id")
            listeID.append(idMot)

    return listeID


"""
req = requests.get("http://cocoon.huma-num.fr/exist/crdo/leconte-tilouine/nep/crdo-NEP_DAURE.xml")
root = ET.fromstring(req.text)
listeID = []
#vérifier que la balise <S> existe
if root.findall('.//S') != None:
    #boucler sur chaque élément <S>
    for phrase in root.findall('.//S'):
        #parser les attributs de la balise <S>
        attributsPhrase = phrase.attrib
        #extraire la valeur de l'attribut "id"
        idPhrase = attributsPhrase.get("id")
        listeID.append(idPhrase)
else:
    #si lma balise S n'existe pas, il faut parser la balise W
    for mot in root.findall('.//W'):
        # parser les attributs de la balise <W>
        attributsMot = mot.attrib
        # extraire la valeur de l'attribut "id"
        idMot = attributsMot.get("id")
        listeID.append(idMot)
print (listeID)

"""