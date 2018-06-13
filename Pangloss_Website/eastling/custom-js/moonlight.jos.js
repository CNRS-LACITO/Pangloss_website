function transcrire(mot,t_source,t_cible){
	
    jQuery.ajax({
      type: "POST", // Le type de ma requete
      url: "../fonctions/transcrire", // L url vers laquelle la requete sera envoyee
      data: {
        mots: mot,
        transcription_from: t_source,
        transcription_to: t_cible
      }, 
      success: function(data, textStatus, jqXHR) {// La reponse du serveur est contenu dans data
        return data;
      },
      error: function(jqXHR, textStatus, errorThrown) {
          return "erreur";
      }
    });

}