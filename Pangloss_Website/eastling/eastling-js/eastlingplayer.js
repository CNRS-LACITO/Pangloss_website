/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var idlist = new Array();
var timelist_starts = new Array();
var timelist_ends = new Array();

var idwordlist = new Array();
var timewordlist_starts = new Array();
var timewordlist_ends = new Array();

var idwordlist2 = new Array();
var timewordlist_starts2 = new Array();
var timewordlist_ends2 = new Array();

var highlight_color = 'blue';

(function ($) {
    $.fn.eastlingplayer = function (options)
    {
        var defauts=
            {
                idref:null,
                url:null,
                local:false,
                localDocument:null,
                callback: null,
                strokeColor: "0088cc",
                strokeWidth:4,
                fillColor:"ffffff",
                fillOpacity:0.0
            };
        //On fusionne nos deux objets ! =D
        var parametres=$.extend(defauts, options);

        highlight_color = "#"+parametres.strokeColor;
        
        
        this.each(function () {
            // Les instructions du plugin
            var player = $('<audio class="eastlingplayer" id="player" src="" controls></audio>');
            
            $(this).empty();
            $(this).append(player);

            
            var p_metadata;
            var p_url_images = new Array();
            var p_url_audio;
            var p_annotations;

            //REVUE 28/05/2015 : en paramètre, il n'y a plus de fichier metadata_crdo...xml
                    //il faut lire les metadata dans metadata_lacito.xml avec l'identifiant, ainsi que les url            

            if(parametres.local){
                var localDocument = parametres.localDocument;
                p_annotations = localDocument.annotations;
                p_metadata = localDocument.metadata;
                p_url_images = localDocument.url_images;
                p_url_audio = localDocument.url_audio;
                
                local_to_DOM(p_annotations,p_metadata,p_url_images,p_url_audio,player);   
                        
                if(parametres.callback)
                    {
                       parametres.callback();
                    }
                
            }else{
                if(parametres.url){
                    
                }else{
                                    
                    $.ajax({
                        type: "POST",
                        url: "getDocument.php",
                        data: {idref:parametres.idref},
                        dataType: "json",
                        success: function (oDocument)
                        {
                            p_annotations = oDocument.annotations;
                            p_metadata = oDocument.metadata;
                            p_url_images = oDocument.url_image;
                            p_url_audio = oDocument.url_audio;

                            to_DOM(p_annotations,p_metadata,p_url_images,p_url_audio,player);
                             //Si le parametre callback ne vaut pas null, c'est qu'on a précisé une fonction !   

                            if(parametres.callback)
                                {
                                    //console.log("callback OK");
                                   parametres.callback();
                                }
                            },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr);
                            console.log(thrownError);
                          }

                    });

                }

            }

        });//]]> 
        
        function to_DOM(annotations,metadata,url_images,url_audio,player){
            
            var doc_id = '';
            var i = 1;

            var titles = new Array();
            var contributors = new Array();
            var subject;
            var crdo_id_audio;
            var spatials = new Array();
            var date = '';
            
            
            var ligne = 0;
            var nb_mots = 0;

            player.attr('src', url_audio);

            var doc_identifier = doc_id.split('_')[1];

            //console.log(titles); // TODO: regrouper dans un objet METADATA
            //console.log(annotations.length);

            var div_info = $('<div id="info"></div>');
            var div_titre = $('<div id="titre"></div>');
            var div_chercheurs = $('<div id="chercheurs"></div>');
            var div_langue = $('<div id="langue"></div>');
            var div_locuteurs = $('<div id="locuteurs"></div>');
            var div_date = $('<div id="date"></div>');
            var div_crdo_id = $('<div id="crdo_id"></div>');

            //METADONNEES
            //**********************************************************
            var researchers = new Array();
            var speakers = new Array();

            $.each(metadata.contributors,function(){
                switch(this.code){
                    case 'researcher':researchers.push(this.contributor);break;
                    case 'speaker':speakers.push(this.contributor);break;                               
                }
            });

            div_titre.html(metadata.title.title);
            div_chercheurs.html(researchers.join((';')));
            div_langue.html(metadata.subject[0].subject);//BUG sans [0]
            div_locuteurs.html(speakers.join(','));
            //div_info.append(' / Locuteur: ' + locuteur + ' (' + lieu + ')');
            //div_info.append(' / Enregistrement: ' + droits);
            div_date.html(metadata.date);
            
            //console.log(parametres.local);
            if(!parametres.local){
                div_crdo_id.html(metadata.crdo_id_audio);
            }
            div_info.append(div_titre).append(div_chercheurs).append(div_langue);
            div_info.append(div_locuteurs).append(div_date).append(div_crdo_id);

            player.before(div_info);

            //**********************************************************
            //Parse des lignes du texte
            //**********************************************************
            //  
            //A CHANGER
            var offset = -120;

            var div_sentences = $('<div id="sentences"></div>');
            var i_s = 1;
            var i_w = 1;
            
             $.each(annotations,function () {

             offset +=120;

             ligne++;

             //var offset = $(this).find('offset').text();
             var xMin = 99999;
             var xMax = 0;
             var yMin = 99999;
             var yMax = 0;

             $.each(this.areas,function(){
                if(this.y2 > yMax) yMax = this.y2;
                if(this.y1 < yMin) yMin = this.y1;
                if(this.x2 > xMax) xMax = this.x2;
                if(this.x1 < xMin) xMin = this.x1;

             });


             //image_scope = this.areas[0].y2-this.areas[0].y1;
             //image_width = this.areas[0].x2-this.areas[0].x1;
             image_scope = yMax-yMin;
             image_width = xMax-xMin;


             var image_bottom = 0;
             //image_bottom = parseInt(this.areas[0].y1);   
            image_bottom = parseInt(yMin);   

             //var audio_tag = doc_identifier + 's' + i_s;
             //TODO: javascript qui transforme une structure DIV en TABLE style LACITO

             var div_sentence = $('<div class="sentence"></div>');
             div_sentence.attr('id',this.id);

             idlist.push(this.id);
             timelist_starts.push(this.startPosition*1000);
             timelist_ends.push(this.endPosition*1000);

             // IMAGE
             var div_map = $("<div class='map'></div>");

             var img = $("<img>");

             var map = $('<map></map>');

             var div_div_map = $("<div></div>");

             //************************
             //TODO : phrase multi-page
             //************************

             image_id = this.areas[0].image;
             var url_image = '';

             $.each(url_images,function(){
                 if(this.indexOf(image_id) > 0){
                     url_image = this;
                 }
             });


             img.attr('src', url_image);
             img.attr('width', image_width);
             img.attr('height', image_scope);
             img.attr('usemap', '#map' + ligne);
             img.attr('id', 'ligne' + ligne);
             img.attr('class', 'map maphilighted');
             
             //var delta_x = this.areas[0].x1;
             //var delta_y = this.areas[0].y1;
             var delta_x = xMin;
             var delta_y = yMin;
             
                 
             img.css('background-position', '-' + delta_x + 'px -' + delta_y + 'px');

             div_map.append(img);

             div_map.css('background','url('+url_image+') -' + delta_x + 'px -' + delta_y + 'px');
             div_map.css('width',image_width);
             div_map.css('height',image_scope);

             // fin affichage des images => OK

             map.attr('id', 'map' + ligne);
             map.attr('name', 'map' + ligne);

             div_div_map.append(div_map);
             div_sentence.append(div_div_map);
             //FIN IMAGE

             $.each(this.transcriptions,function(){
                 var div_transcription = $('<div class="transcription '+this.lang+'">'+this.transcription+'</div>');
                 div_sentence.append(div_transcription);
             });

             var div_words = $('<div class="words"></div>');

             /*
              * les variables suivantes permettent de positionner 
              * correctement les portions/clips d'image
              * 
              */

             var first_word = true;                     
             var offset_left = 0;
             var offset_top = 0;
             
             //PATCH TEMPORAIRE
             var words = new Array();
             if(parametres.local){
                words = this.children; 
             }else{
                words = this.words; 
             }
             //END PATCH
                 
             if(words.length > 0){

                $.each(words,function(){

                    var id_area = this.id;

                    if(first_word){
                        offset_left = this.areas[0].x1;
                        offset_top = this.areas[0].y1;   
                        first_word = false;
                    }
                  
                   this.areas[0].x1-=delta_x;
                   this.areas[0].y1-=delta_y;
                   this.areas[0].x2-=delta_x;
                   this.areas[0].y2-=delta_y;  
                   
                   

                    var div_word = $('<div class="word" link="'+this.id+'"></div>');

                    $.each(this.transcriptions,function(){
                        div_word.append('<div class="word_transcription '+this.lang+'">'+this.transcription+'</div>');
                    });

                    $.each(this.traductions,function(){
                        div_word.append('<div class="word_traduction '+this.lang+'">'+this.traduction+'</div>');
                    });

                    div_words.append(div_word);

                   var area = $("<area>");                        

                   //données pour le lecteur audio
                   idwordlist.push(id_area);
                   timewordlist_starts.push(this.startPosition*1000);
                   timewordlist_ends.push(this.endPosition*1000);
                   //

                   area.attr("id", id_area);
                   area.attr("shape", "rect");
                   area.attr("coords", this.areas[0].x1 + "," +this.areas[0].y1 + "," +this.areas[0].x2 + "," +this.areas[0].y2);
                   area.attr("title", this.transcriptions[0].transcription);
                   area.attr("href", "#");
                   area.attr('data-maphilight', '{"strokeColor":"'+parametres.strokeColor+
                           '","strokeWidth":'+parametres.strokeWidth+',"fillColor":"'+parametres.fillColor+'","fillOpacity":'+parametres.fillOpacity+'}');

                   area.appendTo(map);

                });

             }
             div_div_map.append(map);


             div_sentence.append(div_words);


             $.each(this.traductions,function(){
                 var div_traduction = $('<div class="traduction '+this.lang+'">'+this.traduction+'</div>');
                 div_sentence.append(div_traduction);
             });

             i_s++;

             div_sentences.append(div_sentence);

             player.parent().append(div_sentences);

             });
             
             $('#player').on('play',function(){
                console.log(this.currentTime);
                if(this.currentTime === 0){
                    $('a.playFrom:first').click();
                }
            });

        }

        //09/02/2017 : forked from to_DOM and adapted to JSON version for images urls
        function local_to_DOM(annotations,metadata,url_images,url_audio,player){
            
            var doc_id = '';
            var i = 1;

            var titles = new Array();
            var contributors = new Array();
            var subject;
            var crdo_id_audio;
            var spatials = new Array();
            var date = '';
            
            
            var ligne = 0;
            var nb_mots = 0;

            player.attr('src', url_audio);

            var doc_identifier = doc_id.split('_')[1];

            //console.log(titles); // TODO: regrouper dans un objet METADATA
            //console.log(annotations.length);

            var div_info = $('<div id="info"></div>');
            var div_titre = $('<div id="titre"></div>');
            var div_chercheurs = $('<div id="chercheurs"></div>');
            var div_langue = $('<div id="langue"></div>');
            var div_locuteurs = $('<div id="locuteurs"></div>');
            var div_date = $('<div id="date"></div>');
            var div_crdo_id = $('<div id="crdo_id"></div>');

            //METADONNEES
            //**********************************************************
            var researchers = new Array();
            var speakers = new Array();

            $.each(metadata.contributors,function(){
                switch(this.code){
                    case 'researcher':researchers.push(this.contributor);break;
                    case 'speaker':speakers.push(this.contributor);break;                               
                }
            });

            div_titre.html(metadata.title.title);
            div_chercheurs.html(researchers.join((';')));
            div_langue.html(metadata.subject[0].subject);//BUG sans [0]
            div_locuteurs.html(speakers.join(','));
            //div_info.append(' / Locuteur: ' + locuteur + ' (' + lieu + ')');
            //div_info.append(' / Enregistrement: ' + droits);
            div_date.html(metadata.date);
            
            //console.log(parametres.local);
            if(!parametres.local){
                div_crdo_id.html(metadata.crdo_id_audio);
            }
            div_info.append(div_titre).append(div_chercheurs).append(div_langue);
            div_info.append(div_locuteurs).append(div_date).append(div_crdo_id);

            player.before(div_info);

            //**********************************************************
            //Parse des lignes du texte
            //**********************************************************
            //  
            //A CHANGER
            var offset = -120;

            var div_sentences = $('<div id="sentences"></div>');
            var i_s = 1;
            var i_w = 1;
            
             $.each(annotations,function () {

                var idSentence = this.id;

                //25/04/2017 TEST improve perf live play
                idwordlist2[idSentence] = new Array();
                timewordlist_starts2[idSentence] = new Array();
                timewordlist_ends2[idSentence] = new Array();

                //

             offset +=120;

             ligne++;

             //var offset = $(this).find('offset').text();

             var xMin = 99999;
             var xMax = 0;
             var yMin = 99999;
             var yMax = 0;

             $.each(this.areas,function(){
                if(this.y2 > yMax) yMax = this.y2;
                if(this.y1 < yMin) yMin = this.y1;
                if(this.x2 > xMax) xMax = this.x2;
                if(this.x1 < xMin) xMin = this.x1;

             });


             //image_scope = this.areas[0].y2-this.areas[0].y1;
             //image_width = this.areas[0].x2-this.areas[0].x1;
             image_scope = yMax-yMin;
             image_width = xMax-xMin;


             var image_bottom = 0;
             //image_bottom = parseInt(this.areas[0].y1);   
            image_bottom = parseInt(yMin);  

             //var audio_tag = doc_identifier + 's' + i_s;
             //TODO: javascript qui transforme une structure DIV en TABLE style LACITO

             var div_sentence = $('<div class="sentence"></div>');

             div_sentence.attr('id',idSentence);

             idlist.push(idSentence);
             timelist_starts.push(this.startPosition*1000);
             timelist_ends.push(this.endPosition*1000);

             // IMAGE
             var div_map = $("<div class='map'></div>");

             var img = $("<img>");

             var map = $('<map></map>');

             var div_div_map = $("<div></div>");

             image_id = this.areas[0].image;
             var url_image = '';

             //09/02/2017
             //DEPRECATED in JSON version 
             /*$.each(url_images,function(){
                 if(this.indexOf(image_id) > 0){
                     url_image = this;
                 }
             });
             */
             //replaced by the following code ($.each statement)

             $.each(url_images,function(){
                 if(this.id == image_id){
                     url_image = this.url;
                 }
             });

             img.attr('src', url_image);
             img.attr('width', image_width);
             img.attr('height', image_scope);
             img.attr('usemap', '#map' + ligne);
             img.attr('id', 'ligne' + ligne);
             img.attr('class', 'map maphilighted');
             //img.attr('style', 'width:' + image_width + 'px;height:' + image_scope + 'px;position: absolute; padding: 0px; border: 0px; clip:rect(' + offset + 'px,' + image_width + 'px,' + image_bottom + 'px,0px);');
             
             var delta_x = xMin;
             var delta_y = yMin;
             
                 
             img.css('background-position', '-' + delta_x + 'px -' + delta_y + 'px');

             div_map.append(img);

             div_map.css('background','url('+url_image+') -' + delta_x + 'px -' + delta_y + 'px');
             div_map.css('width',image_width);
             div_map.css('height',image_scope);

             // fin affichage des images => OK

             map.attr('id', 'map' + ligne);
             map.attr('name', 'map' + ligne);

             div_div_map.append(div_map);
             div_sentence.append(div_div_map);
             //FIN IMAGE

             $.each(this.transcriptions,function(){
                 var div_transcription = $('<div class="transcription '+this.lang+'">'+this.transcription+'</div>');
                 div_sentence.append(div_transcription);
             });

             var div_words = $('<div class="words"></div>');

             /*
              * les variables suivantes permettent de positionner 
              * correctement les portions/clips d'image
              * 
              */

             var first_word = true;                     
             var offset_left = 0;
             var offset_top = 0;
             
             //PATCH TEMPORAIRE
             var words = new Array();
             words = this.children;
                 
             if(words.length > 0){

                $.each(words,function(){

                    if(this.areas.length == 0){
                        this.areas.push({
                            x1:0,x2:0,y1:0,y2:0
                        });

                    }

                    var id_area = this.id;

                    if(first_word){
                        offset_left = this.areas[0].x1;
                        offset_top = this.areas[0].y1;   
                        first_word = false;
                    }
                  
                   var correctedCoords = {
                    x1:this.areas[0].x1-delta_x,
                    x2:this.areas[0].x2-delta_x,
                    y1:this.areas[0].y1-delta_y,
                    y2:this.areas[0].y2-delta_y
                   };

                    var div_word = $('<div class="word" link="'+this.id+'"></div>');

                    $.each(this.transcriptions,function(){
                        div_word.append('<div class="word_transcription '+this.lang+'">'+this.transcription+'</div>');
                    });

                    $.each(this.traductions,function(){
                        div_word.append('<div class="word_traduction '+this.lang+'">'+this.traduction+'</div>');
                    });

                    div_words.append(div_word);

                   var area = $("<area>");                        

                   //données pour le lecteur audio
                   idwordlist.push(id_area);
                   timewordlist_starts.push(this.startPosition*1000);
                   timewordlist_ends.push(this.endPosition*1000);
                   //

                   //25/04/2017 TEST improve perf audio live play
                   idwordlist2[idSentence].push(id_area);
                   timewordlist_starts2[idSentence].push(this.startPosition*1000);
                   timewordlist_ends2[idSentence].push(this.endPosition*1000);
                   //


                   area.attr("id", id_area);
                   area.attr("shape", "rect");
                   area.attr("coords", correctedCoords.x1 + "," +correctedCoords.y1 + "," +correctedCoords.x2 + "," +correctedCoords.y2);
                   area.attr("title", this.transcriptions[0].transcription);
                   area.attr("href", "#");
                   area.attr('data-maphilight', '{"strokeColor":"'+parametres.strokeColor+
                           '","strokeWidth":'+parametres.strokeWidth+',"fillColor":"'+parametres.fillColor+'","fillOpacity":'+parametres.fillOpacity+'}');

                   area.appendTo(map);

                });

             }
             div_div_map.append(map);


             div_sentence.append(div_words);


             $.each(this.traductions,function(){
                 var div_traduction = $('<div class="traduction '+this.lang+'">'+this.traduction+'</div>');
                 div_sentence.append(div_traduction);
             });

             i_s++;

             div_sentences.append(div_sentence);

             player.parent().append(div_sentences);

             });
             
             $('#player').on('play',function(){
                console.log(this.currentTime);
                if(this.currentTime === 0){
                    $('a.playFrom:first').click();
                }
            });

        }
        
        return true;
        
        //return this;
        
    };
})(jQuery);

