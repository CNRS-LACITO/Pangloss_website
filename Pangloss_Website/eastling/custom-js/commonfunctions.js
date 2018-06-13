function sortJSON(tableau,key,asc){
    tableau = tableau.sort(function(a, b) {
        if (asc) return (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0);
        else return (b[key] > a[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0);
    });
}

function bindAutocomplete(){
        $('.autocomplete.isolangue').each(function(){
        var that = $(this);
        
        $(this).next('.results_autocomplete').remove();
        
        var div_result_autocomplete = $('<div></div>');
        div_result_autocomplete.addClass('results_autocomplete');
        div_result_autocomplete.css('position','absolute');
        //div_result_autocomplete.css('top','100%');
        div_result_autocomplete.css('left','0');
        div_result_autocomplete.css('-webkit-transform-origin','center top');
        div_result_autocomplete.css('-ms-transform-origin','center top');
        div_result_autocomplete.css('transform-origin','center top');
        div_result_autocomplete.css('background','#fff');
        div_result_autocomplete.css('z-index','998');
        div_result_autocomplete.css('border-radius','.30rem');
        div_result_autocomplete.css('border','1px solid #d4d4d5');

        $(this).after(div_result_autocomplete);
        
        $(this).on('keyup', function() {

            var that = $(this);
            var search = that.val();       
            var acin = $(this).attr('acin');
            $(this).next('.results_autocomplete').empty().show();

            if(search.length < 3) return false;

            $.post(
                'getLanguageFromISO',
                {
                    YII_CSRF_TOKEN: token,
                    search: search,
                    in: acin
                },
                function (result) {
 
                    var languesISO = $.parseJSON(result);
                    
                    $.each(languesISO,function(){
                        that.next('.results_autocomplete').append('<a class="result"><div class="">'+this["langue"]+' / '+this["codeISO"]+'</div></a>');
                    });
                    
                    $('.results_autocomplete .result').on('click',function(){
                        var that = $(this).parent().parent().find('input');
                        var id = that.attr('id');
                        var actarget = that.attr('actarget');
                        var acin = that.attr('acin');
                        
                        var langueStr = $(this).text();
                        var libLangue = langueStr.split(' / ')[0];
                        var codeLangue = langueStr.split(' / ')[1];

                        if(actarget === id){
                            that.val(codeLangue);
                        }else{
                            if(acin === 'Id'){
                                that.val(codeLangue);
                                that.parent().parent().find('#'+actarget).val(libLangue); 
                            }else{
                                that.val(libLangue);
                                that.parent().parent().find('#'+actarget).val(codeLangue); 
                            }
                        }
                        
                        $(this).parent().empty().hide();
                        //console.log(that.attr('id'));
                        if($.inArray(that.attr('id'),["codelangue_1","subject_1"])){
                            var d = new Date();
                            $("#identifier-doc").html('crdo-' + $('#codelangue_1').val().toUpperCase() + '_' + $("#user").val() + '_' + d.getTime().toString());
                        }
                        
                    });

                }
            );
            
        });
    });
    
}

$(document).ready(function(){
    
    bindAutocomplete();
    
    //FACTORISER AVEC AUTOCOMPLETE LANGUE ISO
    $('.autocomplete.isopays').each(function(){
        var that = $(this);
        
        $(this).next('results_autocomplete').remove();
        
        var div_result_autocomplete = $('<div></div>');
        div_result_autocomplete.addClass('results_autocomplete');
        div_result_autocomplete.css('position','absolute');
        //div_result_autocomplete.css('top','100%');
        div_result_autocomplete.css('left','0');
        div_result_autocomplete.css('-webkit-transform-origin','center top');
        div_result_autocomplete.css('-ms-transform-origin','center top');
        div_result_autocomplete.css('transform-origin','center top');
        div_result_autocomplete.css('background','#fff');
        div_result_autocomplete.css('z-index','998');
        div_result_autocomplete.css('border-radius','.30rem');
        div_result_autocomplete.css('border','1px solid #d4d4d5');
        
        $(this).after(div_result_autocomplete);
        

        $(this).on('keyup', function() {
            
            $(this).next('.results_autocomplete').empty().show();
            
            var that = $(this);
            var search = that.val();       
            var acin = $(this).attr('acin');
            
            $.post(
                'getCountryFromISO',
                {
                    YII_CSRF_TOKEN: token,
                    search: search,
                    in: acin
                },
                function (result) {
 
                    var countriesISO = $.parseJSON(result);
                    
                    $.each(countriesISO,function(){
                        that.next('.results_autocomplete').append('<a class="result"><div class="content"><div class="title">'+this["Name"]+' / '+this["Code"]+'</div></div></a>');
                    });
                    
                    $('.results_autocomplete .result').on('click',function(){
                        var that = $(this).parent().parent().find('input');
                        var id = that.attr('id');
                        var actarget = that.attr('actarget');
                        var acin = that.attr('acin');
                        
                        var paysStr = $(this).find('.title').html();
                        var Pays = paysStr.split(' / ')[0];
                        var codePays = paysStr.split(' / ')[1];

                        if(actarget === id){
                            that.val(codePays);
                        }else{
                            if(acin === 'Code'){
                                that.val(codePays);
                                that.parent().parent().find('#'+actarget).val(Pays); 
                            }else{
                                that.val(Pays);
                                that.parent().parent().find('#'+actarget).val(codePays); 
                            }
                        }
                        
                        $(this).parent().empty().hide();
                        $("input#codepays").change();
                        
                    });

                }
            );

        });
    });
    
});

