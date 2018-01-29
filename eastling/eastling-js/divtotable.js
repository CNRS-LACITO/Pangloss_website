/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function ($) {
    $.fn.divtotable = function ()
    {
                
    //AFFICHAGE DU HEADER : TITRE, OPTIONS D'AFFICHAGE
    //var div_header = $('<div xmlns:php="http://php.net/xsl" xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" xmlns:annot="http://crdo.risc.fr/schemas/annotation" style="margin-left: 5px;">');
    var div_header = $('<div class="row">');
  
    var header = $('<h2 align="center"></h2>');
    var title = $('<strong style="font-size:16px"></strong>');
    title.html($(this).find('#titre').html());
    title.append('<a href="show_metadatas.php?id='+$(this).find('#crdo_id').html()+'&amp;lg='+$(this).find('#langue').html()+'" target="_blank"><img class="sansBordure" src="http://lacito.vjf.cnrs.fr/images/icones/info_marron.jpg"></a>');

    header.append(title);
    var link_langue = $('<a></a>');
    link_langue.append($(this).find('#langue').html());
    var table_contributeurs = $('<table width="100%"></table>');
    var tbody_contributeurs = $('<tbody></tbody>');
    var tr_contributeurs = $('<tr></tr>');
    
    var td_chercheurs = $('<td align="left"></td>');
    var td_locuteurs = $('<td align="right"></td>');
    
    td_chercheurs.html('Chercheur(s) : ');   
    var span = $('<span style="color:#333"></span>');
    span.append($(this).find('#chercheurs').html());
    td_chercheurs.append(span);
            
    td_locuteurs.html('Locuteur(s) : ');
    var span = $('<span style="color:#333"></span>');
    span.append($(this).find('#locuteurs').html());
    td_locuteurs.append(span);
    
    tr_contributeurs.append(td_chercheurs).append(td_locuteurs);
    tbody_contributeurs.append(tr_contributeurs);
    table_contributeurs.append(tbody_contributeurs);
    
    header.append('<br>').append(messages('Langue')+' : ').append(link_langue).append('<br><br>').append(table_contributeurs);
    
    
    //AFFICHAGE DES OPTIONS DE LECTURE
    var div_audio = $('<div class="sixteen wide column"></div>');    
    div_audio.append($(this).find('audio'));
    
    div_audio.append('<span style="margin-left:10px">Lecture en continu :</span>');
    div_audio.append('<input id="karaoke" name="karaoke" checked="checked" type="checkbox">');   
    div_header.append(header).append('<br>').append(div_audio);
    
    //il faut détecter les types de transcription et les langues disponibles en traduction
    var opt_transcriptions = new Array();
    var opt_traductions = new Array();
    
    $(this).find('.transcription').each(function(){
        var text = $(this).attr('class').replace('transcription ','');
        
        if($.inArray(text, opt_transcriptions)<0)       
            opt_transcriptions.push(text);
        
    });
    //opt_transcriptions = $.unique(opt_transcriptions);

    
    $(this).find('.traduction').each(function(){
        var text = $(this).attr('class').replace('traduction ','');
        
        if($.inArray(text, opt_traductions)<0)       
            opt_traductions.push(text);
    });
    //opt_traductions = $.unique(opt_traductions);

    
    var div_opts = $('<div class="sixteen wide column"></div>');
    var table_opts = $('<table width="100%"></table>');
    var tbody_opts = $('<tbody></tbody>');
    var tr_opts = $('<tr></tr>');
    
    var td_opt1 = $('<td></td>');
    var table_opt1 = $('<table></table>');
    var tbody_opt1 = $('<tbody></tbody>');
    
    tbody_opt1.append('<tr><th>'+messages('Transcription par phrase')+'</th></tr>');
    var tr_transcription = $('<tr></tr>');
    var td_transcription = $('<td></td>');
    
    $.each(opt_transcriptions,function(){
        var name = 'transcription_'+this;
        var input_transcription = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        td_transcription.append(input_transcription).append(this);
    });
    
    tbody_opt1.append(tr_transcription.append(td_transcription));
    
    tbody_opt1.append('<tr> </tr>').append('<tr> </tr>').append('<tr> </tr>').append('<tr> </tr>').append('<tr><td><br></td></tr>');
    
    tbody_opt1.append('<tr><th>'+messages('Traduction par phrase')+'</th></tr>');
    var tr_traduction = $('<tr></tr>');
    var td_traduction = $('<td></td>');
    
    $.each(opt_traductions,function(){
        var name = 'translation_'+this;
        var input_traduction = $('<input type="checkbox" checked="checked" name="'+name+'">');
        
        td_traduction.append(input_traduction).append(this.toUpperCase());
    });
    
    tbody_opt1.append(tr_traduction.append(td_traduction));
    
       
    td_opt1.append(table_opt1.append(tbody_opt1));
    
    var td_opt2 = $('<td></td>');
    var table_opt2 = $('<table></table>');
    var tbody_opt2 = $('<tbody></tbody>');
    
    tbody_opt2.append('<tr><th>'+messages('Transcription du texte complet')+'</th></tr>');
    //tbody_opt2.append('<tr><td><input name="trans_text" type="checkbox"></td></tr>');
    var tr_transcription = $('<tr></tr>');
    var td_transcription = $('<td></td>');
    
    $.each(opt_transcriptions,function(){
        var name = 'trans_text_'+this;
        var input_transcription = $('<input type="checkbox" name="'+name+'">');
        
        td_transcription.append(input_transcription).append(this);
    });
    
    tbody_opt2.append(tr_transcription.append(td_transcription));
    
    tbody_opt2.append('<tr><td><br></td></tr>');
    
    tbody_opt2.append('<tr><th>'+messages('Traduction du texte complet')+'</th></tr>');
    var tr_traduction = $('<tr></tr>');
    var td_traduction = $('<td></td>');
    
    $.each(opt_traductions,function(){
        var name = 'trad_text_'+this;
        var input_traduction = $('<input type="checkbox" name="'+name+'">');
        
        td_traduction.append(input_traduction).append(this.toUpperCase());
    });
    
    tbody_opt2.append(tr_traduction.append(td_traduction));
    
    
    td_opt2.append(table_opt2.append(tbody_opt2));
    
    var td_opt3 = $('<td></td>');
    td_opt3.append('<table><tbody><tr><th>'+messages('Mot à mot')+'</th><td><input checked="checked" name="interlinear" type="checkbox"></td></tr><tr><td><br></td></tr><tr><td><br></td></tr></tbody></table>');    
    
    div_header.append(div_opts.append(table_opts.append(tbody_opts.append(tr_opts.append(td_opt1).append(td_opt2).append(td_opt3)))));
    
    //ajout du bloc entête au document
    $(this).parent().append(div_header);
    
    
    //----------------------------------------------------------------------------------
    //
    //AFFICHAGE DES ANNOTATIONS 
    //
    //----------------------------------------------------------------------------------
    
    var html_table = $('<table xmlns:php="http://php.net/xsl" xmlns:crdo="http://crdo.risc.cnrs.fr/schemas/" xmlns:annot="http://crdo.risc.fr/schemas/annotation" width="100%" border="1" bordercolor="#993300" cellspacing="0" cellpadding="0"></table>');
    
    var tbody = $('<tbody></tbody>');
    var main_tr = $('<tr></tr>');
    var main_td = $('<td></td>');
    
    var annotations_table = $('<table width="100%" border="0" cellpadding="5" cellspacing="0" bordercolor="#993300" class="it"></table>');
    var tbody_annotations = $('<tbody></tbody>');
    
    var cptSentence = 0;
    
    $(this).find('#sentences .sentence').each(function(){
        var tr = $('<tr class="transcriptTable"></tr>');
        
        var td_info = $('<td class="segmentInfo"></td>');       
        td_info.attr('width','25');
        cptSentence++;
        td_info.html('S'+cptSentence);       
        tr.append(td_info);
        
        var td_content = $('<td class="segmentContent"></td>');  
        var id = $(this).attr('id');       
        td_content.attr('id',id);
        
        td_content.append($(this).find('.map').parent());
        //td_content.append('<a href="javascript:boutonStop()"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/stop.gif" alt="stop"></a>');
        //td_content.append('<a href="javascript:playFrom(\''+id+'\')"><img src="http://lacito.vjf.cnrs.fr/pangloss/tools/play.gif" alt="écouter"></a>');
        
        td_content.append('<a href="#" class="boutonStop"><img src="http://lacito.vjf.cnrs.fr/images/icones/stop.gif" alt="stop"></a>');
        td_content.append('<a href="#" class="playFrom"><img src="http://lacito.vjf.cnrs.fr/images/icones/play.gif" alt="écouter"></a>');
        
        
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
            
            var table_w = $('<table class="word" link="'+$(this).attr('link')+'"></table>');
            var tbody_w = $('<tbody></tbody>');
            
            var tr_w_form = $('<tr></tr>');
            var td_w_form = $('<td class="word_form"></td>');
            td_w_form.html($(this).find('.word_transcription').html());
            tr_w_form.append(td_w_form);
            tbody_w.append(tr_w_form);
            
            var tr_w_transl = $('<tr></tr>');
            var td_w_transl = $('<td class="word_transl" valign="top"></td>');
            td_w_transl.html($(this).find('.word_traduction').first().html());
            tr_w_transl.append(td_w_transl);
            tbody_w.append(tr_w_transl);
            
            table_w.append(tbody_w);
            td_content.append(table_w);
        });
        
        td_content.append('<br><br>');
        
        $(this).find('.traduction').each(function(){
            //var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation').replace('eng','en').replace('fra','fr');//pas propre    
            var newclass = $(this).attr('class').replace(' ','_').replace('traduction','translation');    
            var div_translation = $('<div class="'+newclass+'"></div>');
            div_translation.html($(this).html());
            div_translation.append('<br><br>');
            td_content.append(div_translation);
        });
        
        td_content.append('<div class="note_info></div>'); //que met-on ici ?
        
        tbody_annotations.append(tr);
    });
    
    annotations_table.append(tbody_annotations);
    main_td.append(annotations_table);
    main_tr.append(main_td);
    tbody.append(main_tr);
    
    
    html_table.append(tbody);
    
    $(this).parent().append(html_table);
    
    
    //Ajout des traductions de texte
    $.each(opt_traductions,function(){
        var tr_trans_text = $('<tr class="transcriptTable"></tr>');
        tr_trans_text.append('<td class="segmentInfo"></td>');
        var td_trans_text = $('<td class="segmentContent"></td>');
        var div_trans_text = $('<div style="display:none;" class="trans_text trad_text_'+this+'"></div>');
        
        $('.translation_'+this).each(function(){
            div_trans_text.append($(this).html().replace(/<br>/g,''));
            div_trans_text.append('<br>');  
        });
        tbody_annotations.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
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
        tbody_annotations.prepend(tr_trans_text.append(td_trans_text.append(div_trans_text)));
              
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
            //$('.'+c).css('display','block !important');

            $('.'+c).each(function(){
                this.style.setProperty('display','block','important');
            });

        }else{
            //$('.'+c).css('display','none !important');

            $('.'+c).each(function(){
                this.style.setProperty('display','none','important');
            });
        }    
    });
    
    $("input[name='interlinear']").bind('click',function(){
        
        if($(this).is(':checked')){
            $('.word').css('display','inline-block');
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



