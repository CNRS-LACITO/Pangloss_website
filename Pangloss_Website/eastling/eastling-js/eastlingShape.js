/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function ($) {
    $.fn.eastlingShape = function ()
    {
                
    //AFFICHAGE DU HEADER : TITRE, OPTIONS D'AFFICHAGE
    //var div_header = $('<div xmlns:php="http://php.net/xsl" xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" xmlns:annot="http://crdo.risc.fr/schemas/annotation" style="margin-left: 5px;">');
    var div_titre = $('<div class="row ui one column doubling grid">');
    var div_info = $('<div class="row ui three column doubling grid">');
    var div_lecteur = $('<div class="row ui two column doubling grid">');
    var div_options_lecteur = $('<div class="row ui three column doubling grid">');
    
    $(this).parent().append(div_titre);
    $(this).parent().append(div_info);
    $(this).parent().append(div_lecteur);
    $(this).parent().append(div_options_lecteur);
    
    //$(this).parent().addClass('ui form');
    
    var header = $('<h2 align="center"></h2>');
    var title = $('<h1 class="ui header aligned center"></h1>');
    div_titre.append(title);
    
    title.html($(this).find('#titre').html());
    //title.append('<a href="show_metadatas.php?id='+$(this).find('#crdo_id').html()+'&amp;lg='+$(this).find('#langue').html()+'" target="_blank"><img class="sansBordure" src="http://lacito.vjf.cnrs.fr/images/icones/info_marron.jpg"></a>');

    //header.append(title);
    var link_langue = $('<a></a>');
    link_langue.append($(this).find('#langue').html());
    //var div_contributeurs = $('<div class="column"></div>');
    
    var div_langue = $('<div class="column"></div>');
    div_langue.html('Langue : ');   
    div_langue.append($(this).find('#langue').html());
    
    var div_chercheurs = $('<div class="column"></div>');
    div_chercheurs.html('Chercheur(s) : ');   
    div_chercheurs.append($(this).find('#chercheurs').html());
    
    var div_locuteurs = $('<div class="column"></div>');   
    div_locuteurs.html('Locuteur(s) : ');
    div_locuteurs.append($(this).find('#locuteurs').html());
        
    div_info.append(messages('Langue')+' : ').append(div_langue).append(div_chercheurs).append(div_locuteurs);    
      
    //AFFICHAGE DES OPTIONS DE LECTURE
    var div_audio = $('<div class="column"></div>');    
    div_audio.append($(this).find('audio'));
          
    //div_header.append(header).append('<br>').append(div_audio);
    div_lecteur.append(div_audio);
    
    div_lecteur.append('<div class="column checkbox"><label>Lecture en continu</label> : <input id="karaoke" name="karaoke" checked="checked" type="checkbox"></div>');
    
    //il faut détecter les types de transcription et les langues disponibles en traduction
    var opt_transcriptions = new Array();
    var opt_traductions = new Array();
    
    $(this).find('.transcription').each(function(){
        var text = $(this).attr('class').replace('transcription ','');
        
        if($.inArray(text, opt_transcriptions)<0)       
            opt_transcriptions.push(text);
        
    });
 
    $(this).find('.traduction').each(function(){
        var text = $(this).attr('class').replace('traduction ','');
        
        if($.inArray(text, opt_traductions)<0)       
            opt_traductions.push(text);
    });

    var div_opt_motamot = $('<div class="column"></div>');
    
    var div_transc_phrase = $('<div class="column"></div>');
    var div_transc_complet = $('<div class="column"></div>');
    var div_trad_phrase = $('<div class="column"></div>');
    var div_trad_complet = $('<div class="column"></div>');
    var sizes = ["zero","one","two","three","four","five","six","seven","eight","nine","ten"];
    
    div_options_lecteur.append(div_transc_phrase).append(div_transc_complet).append(div_opt_motamot);
    div_options_lecteur.append(div_trad_phrase).append(div_trad_complet);
    
    div_transc_phrase.append('<h3 class="ui header">'+messages('Transcription par phrase')+'</h3>');
       
    var div_transc_phrase_opts = $('<div class="ui '+sizes[opt_transcriptions.length]+' column grid"></div>');
    div_transc_phrase.append(div_transc_phrase_opts);
    
    var div_form = $('<div class="ui form"></div>');
    
    $.each(opt_transcriptions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'transcription_'+this;
        var input_transcription = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        div_item.append(input_transcription).append('<label>'+this+'</label>');
        div_transc_phrase_opts.append(div_item);
        
    });
    
    
    div_trad_phrase.append('<h3 class="ui header">'+messages('Traduction par phrase')+'</h3>');
    var div_trad_phrase_opts = $('<div class="ui '+sizes[opt_traductions.length]+' column grid"></div>');
    div_trad_phrase.append(div_trad_phrase_opts);
    
    $.each(opt_traductions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'translation_'+this;
        var input_traduction = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        div_item.append(input_traduction).append('<label>'+this.toUpperCase()+'</label>');
        div_trad_phrase_opts.append(div_item);
    });
    
    div_transc_complet.append('<h3 class="ui header">'+messages('Transcription du texte complet')+'</div>');
    var div_transc_complet_opts = $('<div class="ui '+sizes[opt_transcriptions.length]+' column grid"></div>');
    div_transc_complet.append(div_transc_complet_opts);

    $.each(opt_transcriptions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'trans_text_'+this;
        var input_transcription = $('<input type="checkbox" name="'+name+'">');
        
        div_item.append(input_transcription).append('<label>'+this+'</label>');
        div_transc_complet_opts.append(div_item);
        
    });

    
    div_trad_complet.append('<h3 class="ui header">'+messages('Traduction du texte complet')+'</div>');
    var div_trad_complet_opts = $('<div class="ui '+sizes[opt_traductions.length]+' column grid"></div>');
    div_trad_complet.append(div_trad_complet_opts);
    
    $.each(opt_traductions,function(){
        var div_item = $('<div class="column inline field"><div class = "ui checkbox"></div></div>');
        var name = 'trad_text_'+this;
        var input_traduction = $('<input type="checkbox" name="'+name+'">');
        
        div_item.append(input_traduction).append('<label>'+this.toUpperCase()+'</label>');
        div_trad_complet_opts.append(div_item);
        
    });

    var div_item = $('<div class="inline field"><div class = "ui checkbox"></div></div>');
    div_item.append('<input checked="checked" name="interlinear" type="checkbox">').append('<label>'+messages('Mot à mot')+'</label>');
        
    div_opt_motamot.append(div_item);    
    
    
    //----------------------------------------------------------------------------------
    //
    //AFFICHAGE DES ANNOTATIONS 
    //
    //----------------------------------------------------------------------------------
    
    var html_table = $('<div class="ui"></div>');
    
    var cptSentence = 0;
    
    $(this).find('#sentences .sentence').each(function(){
        var tr = $('<div class=""></div>');
        
        var td_info = $('<div class="segmentInfo"></div>');       
        td_info.attr('width','25');
        cptSentence++;
        td_info.html('S'+cptSentence);       
        tr.append(td_info);
        
        var td_content = $('<div class="eastlingShape"></td>');  
        var id = $(this).attr('id');       
        td_content.attr('id',id);
        
        td_content.append($(this).find('.map').parent());
        //td_content.append('<a href="javascript:boutonStop()"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/stop.gif" alt="stop"></a>');
        //td_content.append('<a href="javascript:playFrom(\''+id+'\')"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/play.gif" alt="écouter"></a>');
        
        //td_content.append('<a href="#" class="boutonStop"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/stop.gif" alt="stop"></a>');
        //td_content.append('<a href="#" class="playFrom"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/play.gif" alt="écouter"></a>');
        td_content.append('<a href="#" class="boutonStop" style="font-size:12px;">⏹</a>');
        td_content.append('<a href="#" class="playFrom" style="font-size:12px;">▶️</a>');
        
        
        tr.append(td_content);
        
        var div_w_s = $('<div class="word_sentence"></div>');      
        
        $(this).find('.transcription').each(function(){
            var newclass = $(this).attr('class').replace(' ','_');
            var div_transcription = $('<div class="'+newclass+'"></div>');
            div_transcription.html($(this).html());
            
            div_w_s.append(div_transcription);
        });
        td_content.append(div_w_s);
        td_content.append('<br>');
        
        $(this).find('.words > .word').each(function(){
    
            var div_w = $('<div style="display:inline;" class="word ui basic accordion" link="'+$(this).attr('link')+'"></div>');

            var div_w_form = $('<div class="word_form title" style="padding:0px !important;"></div>');
            div_w_form.append('<i class="dropdown icon"></i>');
            div_w_form.append($(this).find('.word_transcription').html());
            div_w.append(div_w_form);

            var div_w_transl= $('<div class="content"></div>');
            div_w.append(div_w_transl);
            
            $(this).find('.word_traduction').each(function(){
                var lang = $(this).attr('class').split('word_traduction')[1].trim();
                div_w_transl.append('<p>'+lang+' : '+$(this).html()+'</p>');
            });
            
            td_content.append(div_w);
            div_w.accordion();
        });
              
        
        $(this).find('.traduction').each(function(){
            //var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation').replace('eng','en').replace('fra','fr');//pas propre    
            var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation');    
            var div_translation = $('<div class="'+newclass+'"></div>');
            div_translation.html($(this).html());
            div_translation.append('<br><br>');
            td_content.append(div_translation);
        });
        
        td_content.append('<div class="note_info></div>'); //que met-on ici ?
        
        html_table.append(tr);
        
    });

    
    $(this).parent().append(html_table);
    
    
    //Ajout des traductions de texte
    $.each(opt_traductions,function(){
        var tr_trans_text = $('<div class="transcriptTable"></div>');
        tr_trans_text.append('<div class="segmentInfo"></div>');
        var td_trans_text = $('<div class="segmentContent"></div>');
        var div_trans_text = $('<div style="display:none;" class="trans_text trad_text_'+this+'"></div>');
        
        $('.translation_'+this).each(function(){
            div_trans_text.append($(this).html().replace(/<br>/g,''));
            div_trans_text.append('<br>');  
        });
        html_table.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
    });
    //Ajout des transcriptions de texte
    $.each(opt_transcriptions,function(){
        var tr_trans_text = $('<tr class="transcriptTable"></tr>');
        tr_trans_text.append('<td class="segmentInfo"></td>');
        var td_trans_text = $('<td class="segmentContent"></td>');
        var div_trans_text = $('<div class="trans_text trans_text_'+this+'"></div>');
        
        $('.word_sentence > .transcription_'+this).each(function(){
            div_trans_text.append($(this).html());
            div_trans_text.append('<br>');  
        });
        html_table.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
    });
       
    //gestion de l'affichage des transcriptions et traductions selon les options cochées
    $("input[name^='trans_text_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name^='trad_text_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name^='transcription_'], input[name^='translation_']").bind('click',function(){
        var c = $(this).attr('name');
        if($(this).is(':checked')){
            $('.'+c).css('display','block');
        }else{
            $('.'+c).css('display','none');
        }    
    });
    
    $("input[name='interlinear']").bind('click',function(){
        
        if($(this).is(':checked')){
            $('.word').css('display','inline');
        }else{
            $('.word').css('display','none');
        }    
    });
    
    $('a.playFrom').bind('click',function(){
        var id = $(this).parent().attr('id');
        playFrom(id);
    });
    
    $('a.boutonStop').bind('click',function(){
        boutonStop();
        console.log('click stop');
    });
    
    //
    $(this).css('display','none');
    };

})(jQuery);



