import requests
from DOI_stage.DoiPangloss.constantes import USERNAME, PASSWORD, ENDPOINTDOI

def enregistrer_url_doiRessource(filename, doi):
    urlFile = open(filename, 'r').read().strip()
    response = requests.put(ENDPOINTDOI + doi, auth=(USERNAME, PASSWORD), data=urlFile.encode('utf-8'),
                            headers={'Content-Type': 'text/plain;charset=UTF-8'})
    file = open('DoiPangloss/Data/apiUrl', 'a')
    if response.status_code != requests.codes.ok:
        file.write(str(response.status_code) + " " + doi + response.text + "\n")
        print(str(response.status_code) + " " + response.text)


def enregistrer_url_doiPhrase(filename, doi, id):
    urlFile = open(filename, 'r').read().strip()
    response = requests.put(ENDPOINTDOI + doi, auth=(USERNAME, PASSWORD), data=urlFile.encode('utf-8'),
                            headers={'Content-Type': 'text/plain;charset=UTF-8'})
    file = open('DoiPangloss/Data/apiUrl', 'a')
    if response.status_code != requests.codes.ok:
        file.write(str(response.status_code) + " " + id + response.text + "\n")
        print(str(response.status_code) + " " + response.text)
