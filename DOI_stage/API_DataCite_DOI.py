import requests

from constantes import USERNAME, PASSWORD, ENDPOINTDOI

def enregistrer_urlRessource(filename, doi):
    file = open(filename, 'r').read().strip()
    #recupDoi = file.split("\n")
    #doi = recupDoi[1][5:]
    response = requests.put(ENDPOINTDOI + doi, auth = (USERNAME, PASSWORD), data = file.encode('utf-8'), headers = {'Content-Type':'text/plain;charset=UTF-8'})
    print(str(response.status_code) + " " + response.text)

def enregistrer_urlPhrase(filename, doi):
    file = open(filename, 'r').read().strip()
    response = requests.put(ENDPOINTDOI + doi, auth = (USERNAME, PASSWORD), data = file.encode('utf-8'), headers = {'Content-Type':'text/plain;charset=UTF-8'})
    print(str(response.status_code) + " " + response.text)

