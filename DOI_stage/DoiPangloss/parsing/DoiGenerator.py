import xml.etree.ElementTree as ETree
from DOI_stage.DoiPangloss.constantes import NAMESPACES

# --------utilisations des trois méthodes suivantes pour crééer le nom DOI à l'aide d'un compteur et retour du dernier numéro --------# --------#

def extractDoiIdentifiant(record):
    doiIdentifiant = ""
    for identifiant in record.findall('.//dc:identifier', NAMESPACES):
        if "doi:" in identifiant.text:
            doiIdentifiant = identifiant.text[4:]
    return doiIdentifiant


def lastDoiNumber(file):
    """
    Méthode qui parcourt la liste contenant tous les identifiants DOI et retroune la valeur chiffrée du dernier doi,
    sans les zéros qui précèdent le dernier chiffre
    :return:le dernier doi
    :rtype: int
    """
    lastDoi = 0
    listAllDoiIdentifier = []

    tree = ETree.parse(file)
    root = tree.getroot()

    for record in root.findall(".//oai:record", NAMESPACES):

        # appel de la fonction extractDoiIdentifiant pour extraire uniquement le DOI
        doiIdentifiant = extractDoiIdentifiant(record)

        if doiIdentifiant != "":
            listAllDoiIdentifier.append(doiIdentifiant)

    for doi in listAllDoiIdentifier:
        # puisqu'un doi aura ce type de structure "doi:10.5072/PANGLOSS-0000003",
        # il faut récupérer uniquement les 7 dernières chiffres
        number = int(doi[-7:])

        if lastDoi < number:
            lastDoi = number

    return lastDoi


def increment_doi(lastDoiNumber):
    lastDoiNumber += 1
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

    return doiNumber, lastDoiNumber


