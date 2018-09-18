import requests, sys
from DOI_stage.DoiPangloss.constantes import USERNAME, PASSWORD, ENDPOINTDOI
import xml.etree.ElementTree as ETree




def get_doi(doi):
    response = requests.get(ENDPOINTDOI + '/' + doi)
    return response.status_code

"""
doi1="10.5072/CRDO-NGE_FOURMI"
doiList = []
doiList.append(doi1)

for doi in doiList:
    response = requests.get(ENDPOINTDOI+"/"+doi, auth=(USERNAME, PASSWORD))
    if (response.status_code != 200):
        print(str(response.status_code) + " " + response.text)
    else:
        print(response.text)
        root = ETree.fromstring(response.text)
        print(root.text)
        idOai = root.find('{http://datacite.org/schema/kernel-4}resource')
"""
"""

def get_doi(doi):
    response = requests.get(ENDPOINTDOI + '/' + doi, auth=(USERNAME, PASSWORD))
    if (response.status_code != 200):
        print( str(response.status_code) + " " + response.text)
    else:
        print(response.text)
    return response.status_code
"""
"""

response = requests.get(ENDPOINTDOI + '/' + "10.5072/CRDO-NEP_DAURE", auth=(USERNAME, PASSWORD))
if (response.status_code != 200):
    print(str(response.status_code) + " " + response.text)
else:
    print(response.text)
"""
""" if identifiant_DOI_Cocoon[4:]!= None:

 if os.stat("mapping_oai_doi.csv").st_size == 0:
     with open("mapping_oai_doi.csv", "w", newline='') as mapping:
         spamwriter = csv.writer(mapping, delimiter=' ', quotechar='|', quoting=csv.QUOTE_MINIMAL)
         spamwriter.writerow([identifiantOAI[21:], identifiant])

 elif os.stat ("mapping_oai_doi.csv").st_size != 0:
     with open("mapping_oai_doi.csv", newline='') as mappingread:
         spamreader = csv.reader(mappingread, delimiter=' ', quotechar='|')
         for row in spamreader:
             if row[0] == identifiantOAI[21:] and row[1] == identifiant_DOI_Cocoon[4:]:
                 print("L'oai correspond au doi")

 with open("mapping_oai_doi.csv", newline='') as mappingread:
     spamreader = csv.reader(mappingread, delimiter=' ', quotechar='|')
     for row in spamreader:
         if [identifiantOAI[21:], identifiant_DOI_Cocoon[4:]] not in spamreader:
             print("On peut les rajouter")
             with open("mapping_oai_doi.csv", "a", newline='') as mapping:
                 spamwriter = csv.writer(mapping, delimiter=' ', quotechar='|',
                                         quoting=csv.QUOTE_MINIMAL)
                 spamwriter.writerow([identifiantOAI[21:], identifiant])
                 break
         else:
             print("le mapping oai-doi existe déja")
else:
 print("la ressource n'a pas de doi")"""

