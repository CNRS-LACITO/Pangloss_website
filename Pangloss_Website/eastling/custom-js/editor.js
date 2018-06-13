    //Variables globales
    var documents = new Array();
    var user;
    var currentDocument = localStorage.getItem('document');
    var currentLangue = localStorage.getItem('langue');
    var currentStep = localStorage.getItem('step');
    var langUser = localStorage.getItem('langUser');
    
    var langues_user = new Array();
    // Create an instance
    //var wavesurfer = Object.create(WaveSurfer);


    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        scrollParent: true,
        waveColor: 'rgba(0,0,0,1)',
        height: 100
    });
    var timeline = Object.create(WaveSurfer.Timeline);

    var slider = document.querySelector('#slider');

    slider.oninput = function () {
      var zoomLevel = Number(slider.value);
      wavesurfer.zoom(zoomLevel);
    };
    //wavesurfer.enableDragSelection();

    var playerAction = "";

    var o_imgAreaSelect;

    var rules_newdoc;
    var rules_newselection;

    var selected_areas = new Array();
    
    var file_mp3 = '';
    var file_wav = '';
    var images = new Array();
    
    var o_Currentdocument;
    var json_document;
    
//____________________________________________________________________________________
//____________________________________________________________________________________
    // FONCTION POUR SELECTION SUR L'IMAGE           
    function preview(img, selections) {
        selected_areas = o_imgAreaSelect.getSelections();
    }
  

//______________________________________________
//______________________________________________
    // NOTIFICATIONS UTILISATEUR
    function notifier(message,type,target){
        
        target = target || "#annotations";
        
        var colordiv = "yellow";
        
        switch(type){
            case "success": colordiv = "green";
                break;
            case "error":  colordiv = "red";
                break;
            default: colordiv = "yellow";                       
        }
        var div_message = '<div class="ui '+colordiv+' message">'+message+'</div>';       
        
        $('#notification').popup({
            position : 'top left',
            target   : target, 
            transition : 'fade up',
            html  : div_message,
            onShow : function(){
                setTimeout(function () {
                        $('#notification').popup('hide');                    
                }, 3000);
            }
          })
        ;
        
        $('#notification').popup('show');
        $('.ui.popup').bind('click',function(){$(this).remove();})
    }

    //Récupère toutes les données d'une sélection depuis le DOM
    function Annotation2Json(idAnnotation){
        var title = $('#annotations .title[id-selection="'+idAnnotation+'"]');
        var container = $('#annotations .content[id-selection="'+idAnnotation+'"]');

        var startPosition = container.children('.recording').find('.audio.start').val();
        var endPosition = container.children('.recording').find('.audio.end').val();

        //TODO : multi-image
        var areas = new Array();

        container.find('>.image > .input > .input.image > div').each(function(){

            var image = $(this).attr('image');
            var x1 = parseInt($(this).attr('x1'));
            var y1 = parseInt($(this).attr('y1'));
            var h = parseInt($(this).attr('h'));
            var w = parseInt($(this).attr('w'));

            areas.push({
                image:image,
                x1:x1,
                y1:y1,
                x2:(x1+w),
                y2:(y1+h),
                w:w,
                h:h
            });
        });

        
        ///

        var transcriptions = [];
        var traductions = [];

        container.children('.transcriptions').children('.input').each(function(){
            var transcription = $(this).find('.transcription input').val();
            var lang = $(this).find('.selection > .menu> .item.active').attr('data-value');
            transcriptions.push({lang:lang,transcription:transcription});
        });

        container.children('.traductions').children('.input').each(function(){
            var traduction = $(this).find('.traduction input').val();
            var lang = $(this).find('.traduction-lang input').val();
            traductions.push({lang:lang,traduction:traduction});
        });

        var typeselection = $('.title[id-selection="'+idAnnotation+'"]').attr('typeannotation');

        result = {
            id:idAnnotation,
            typeselection:typeselection,
            startPosition:startPosition,
            endPosition:endPosition,
            areas:areas,
            transcriptions:transcriptions,
            traductions:traductions
        };

        $.each(o_Currentdocument.annotations.sentences,function(){
            if(typeselection == "sentence"){
                if(idAnnotation == this.id){
                    this.startPosition = startPosition;
                    this.endPosition = endPosition;
                    this.areas = areas;
                    this.transcriptions = transcriptions;
                    this.traductions = traductions;
                }
            }else{
                $.each(this.children,function(){
                    if(idAnnotation == this.id){
                        this.startPosition = startPosition;
                        this.endPosition = endPosition;
                        this.areas = areas;
                        this.transcriptions = transcriptions;
                        this.traductions = traductions;
                    }
                });
            }
        });

        return result;
    }

    function createMetadataInput(data, value, div){
        var d = $('<div class="metadata '+data+'"></div>');
        d.append('<h5 class="ui header">'+data+'</h5>');

        var input = $('<input disabled type="text">');
        input.attr('value',value);
        input.attr('text',value);


        d.append(input);
        d.append('<div class="edit-metadata ui icon button"><i class="green pencil icon"></i></div>');

        div.append(d);
    }


//_______________________________________________
//_______________________________________________
    //  AFFICHAGE DES METADATA
    function displayMetadata(metadata, div, hovercolor, borderStyle) {
    //_______________________________________________

        /////////////TITLE
        var div_accordion = $('<div></div>');
        var div_title = $('<div>Titre</div>');
        div_title.addClass('title');        
        div_title.append('<i class="dropdown icon"></i>');
        
        var div_content = $('<div></div>');
        div_content.addClass('content');
        div_content.css('background-color','rgba(0,0,0,0.1)');

        var div_form = $('<div class="ui form"></div>');
        var div_fields = $('<div class="inline fields"></div>');

        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['title']['title']);
        var div_field_titre = $('<div class="field"></div>');
        
        var input_titre_lang = $('<input size="3" id="metadata-title-lang" class="metadata-title" type="text" name="metadata-title-lang"/>');
        input_titre_lang.val(metadata['title']['lang']);
        var div_field_titre_lang = $('<div class="field"></div>');


        div_field_titre.append(input_titre);
        div_field_titre_lang.append(input_titre_lang);

        div_fields.append(div_field_titre).append(div_field_titre_lang);
        div_form.append(div_fields);
        div_content.append(div_form);

        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

        //////////////ALTERNATIVES

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Titres alternatifs</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['alternatives'],function(){

            var div_fields = $('<div class="inline fields"></div>');

            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this['alternative']);
            var div_field_titre = $('<div class="field"></div>');
            
            var input_titre_lang = $('<input size="3" id="metadata-title-lang" class="metadata-title" type="text" name="metadata-title-lang"/>');
            input_titre_lang.val(this['lang']);
            var div_field_titre_lang = $('<div class="field"></div>');


            div_field_titre.append(input_titre);
            div_field_titre_lang.append(input_titre_lang);

            div_fields.append(div_field_titre).append(div_field_titre_lang);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);

        //////////////SUBJECT

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Objets</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['subject'],function(){

            var div_fields = $('<div class="inline fields"></div>');

            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this['subject']);
            var div_field_titre = $('<div class="field"></div>');
            
            var input_titre_lang = $('<input size="3" id="metadata-title-lang" class="metadata-title" type="text" name="metadata-title-lang"/>');
            input_titre_lang.val(this['codelang']);
            var div_field_titre_lang = $('<div class="field"></div>');


            div_field_titre.append(input_titre);
            div_field_titre_lang.append(input_titre_lang);

            div_fields.append(div_field_titre).append(div_field_titre_lang);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

        //////////////LANGUAGES

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Langues</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['languages'],function(){

            var div_fields = $('<div class="inline fields"></div>');

            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this);
            var div_field_titre = $('<div class="field"></div>');
            

            div_field_titre.append(input_titre);

            div_fields.append(div_field_titre);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

        /////////////SPATIAL / GEOGRAPHIE
        var div_accordion = $('<div></div>');
        var div_title = $('<div>Géographie</div>');
        div_title.addClass('title');        
        div_title.append('<i class="dropdown icon"></i>');
        
        var div_content = $('<div></div>');
        div_content.addClass('content');
        div_content.css('background-color','rgba(0,0,0,0.1)');

        var div_form = $('<div class="ui form"></div>');
        //Code pays
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['countrycode']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées east
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['geo']['east']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées north
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['geo']['north']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées langue
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['lang']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //
        //Coordonnées localité
        var div_fields = $('<div class="inline fields"></div>');
        var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
        input_titre.val(metadata['spatial']['place']);
        var div_field_titre = $('<div class="field"></div>');

        div_field_titre.append(input_titre);

        div_fields.append(div_field_titre);
        div_form.append(div_fields);
        //

        //////////////CONTRIBUTEURS

        var div_accordion = $('<div></div>');
            var div_title = $('<div>Contributeurs</div>');
            div_title.addClass('title');        
            div_title.append('<i class="dropdown icon"></i>');
            
            var div_content = $('<div></div>');
            div_content.addClass('content');
            div_content.css('background-color','rgba(0,0,0,0.1)');

            var div_form = $('<div class="ui form"></div>');

        $.each(metadata['contributors'],function(){

            var div_fields = $('<div class="inline fields"></div>');
            var input_titre = $('<input size="40" id="metadata-title" class="metadata-title" type="text" name="metadata-title"/>');
            input_titre.val(this['contributor']);
            var div_field_titre = $('<div class="field"></div>');
            
            div_field_titre.append(input_titre);

            div_fields.append(div_field_titre);
            div_form.append(div_fields);
            div_content.append(div_form);

            
        });
        
        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////


        div_content.append(div_form);

        div_accordion.append(div_title);
        div_accordion.append(div_content);
        div_accordion.addClass('ui accordion');
        div_accordion.accordion({exclusive: false});
        div.append(div_accordion);
        //////////////////////////

    }

//_______________________________________________
    //  AFFICHAGE DES ANNOTATIONS DANS LE VOLET "ANNOTATIONS"
    function displayAnnotation(annotation, div, hovercolor, borderStyle,typeannotation,idparent) {
        ////console.log(annotation);
        var div_annotation = $('<div></div>');
        var div_title = $('<div></div>');
        div_title.addClass('title');
        div_title.attr('id-selection',annotation['id']);
        //useful for sortable changes
        div_title.attr('typeannotation',typeannotation);
        div_title.attr('idparent',idparent);

        if(annotation.hasOwnProperty('areas') && annotation['areas'][0]){
            div_title.attr('x1',annotation['areas'][0]['x1']);
            div_title.attr('y1',annotation['areas'][0]['y1']);
            div_title.attr('w',annotation['areas'][0]['w']);
            div_title.attr('h',annotation['areas'][0]['h']);
            div_title.attr('image',annotation['areas'][0]['image']);
        }
        
        div_title.append('<i class="dropdown icon"></i>');

        var transcriptionToDisplay = annotation['transcriptions'][0]['transcription']; 

        $.each(annotation['transcriptions'],function(){
            if(this['lang'] === 'phono'){
                transcriptionToDisplay = this['transcription'];
            }
        });

        div_title.append(transcriptionToDisplay);
        
        var div_content = $('<div></div>');
        div_content.append('<i class="delete-selection ui red trash icon"></i>');
        div_content.addClass('content');
        div_content.attr('id-selection',annotation['id']);
        div_content.attr('startposition',annotation['startPosition']);
        div_content.attr('endposition',annotation['endPosition']);
        div_content.css('background-color','rgba(0,0,0,0.1)');


        /////////////////////////////////////////
        // AUDIO
        ///////////////////////////////////////
        var div_audio = $('<div></div>');
        div_audio.addClass('recording');
        div_audio.append('<h5 class="ui header">Audio position</h5>');

        var div_play = $('<div class="play-selection ui icon button"><i class="dark icon play"></i></div>');
        

        var div_line_input = $('<div class="line input"></div>');

        var div_input_audio = $('<div class="ui input audio"></div>');

        div_input_audio.append('Start : <input class="audio start" disabled type="text" value="' + annotation['startPosition'] + '" text="' + annotation['startPosition'] + '">');
        div_input_audio.append('End : <input class="audio end" disabled type="text" value="' + annotation['endPosition'] + '" text="' + annotation['endPosition'] + '">');

        div_line_input.append(div_input_audio);

        div_line_input.append(div_play);
        div_line_input.append('<div class="edit-audio ui icon button"><i class="green pencil icon"></i></div>');
        div_line_input.append('<div class="delete-audio ui icon button"><i class="red trash icon"></i></div>');

        div_line_input.appendTo(div_audio);

        div_audio.appendTo(div_content);
          
        // IMAGE
        div_content.append('<div class="ui divider"></div>');
        var div_image = $('<div></div>');
        div_image.addClass('image');
        div_image.append('<h5 class="ui header">Image position</h5>');

        var div_line_input = $('<div class="line input"></div>');
        var div_input_image = $('<div class="ui input image"></div>');

        if(annotation.hasOwnProperty('areas') && annotation['areas'][0]){

            $.each(annotation['areas'],function(){

                var that = this;
                var img = $("<img>");
                var div_img = $("<div>");
                var path_doc = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+o_Currentdocument.id+"/";
                var image_file = "";

                $.each(images,function(){
                    image_str = this.file.toString();
                     if(this.id == that['image']){
                         image_file = image_str;
                     }
                 });

                img.attr('src', path_doc+image_file);
                img.attr('width', that['w']);
                img.attr('height', that['h']);
                
                div_img.css('display','block');
                div_img.css('position','relative');
                div_img.css('padding','0px');
                div_img.css('width',that['w']);
                div_img.css('height',that['h']);
                div_img.css('background-image','url('+path_doc+image_file+')');
                div_img.css('background-position-x',0-that['x1']);
                div_img.css('background-position-y',0-that['y1']);

                 //img.attr('class', '');

                var a_input = $('<a>View Image on screen</a>');
                a_input.attr('href','#');

                if(that){
                    div_img.attr('x1',that['x1']);
                    div_img.attr('y1',that['y1']);
                    div_img.attr('w',that['w']);
                    div_img.attr('h',that['h']);
                    div_img.attr('image',that['image']);
                }else{
                    div_img.attr('x1',0);
                    div_img.attr('y1',0);
                    div_img.attr('w',0);
                    div_img.attr('h',0);
                    div_img.attr('image','');
                }
                

                //div_input_image.append(a_input);
                //div_input_image.append(img);
                div_input_image.append(div_img);

            });

            

        }
        

        div_line_input.append(div_input_image);
        div_line_input.append('<div class="edit-image ui icon button"><i class="green pencil icon"></i></div>');
        div_line_input.append('<div class="delete-image ui icon button"><i class="red trash icon"></i></div>');

        div_line_input.appendTo(div_image);
        div_image.appendTo(div_content);


        //////////////////////////////////////////////
        // TRANSCRIPTIONS
        /////////////////////////////////////////////
        div_content.append('<div class="ui divider"></div>');
        var div_transc = $('<div></div>');
        div_transc.addClass('transcriptions');
        div_transc.append('<h5 class="ui header">Transcriptions</h5>');

        var firstInputLine = true;
        
                    
        $.each(annotation['transcriptions'], function () {

            var line_transc = $('<div></div>');
            line_transc.addClass('line input');

            var input_transc = $('<div></div>');
            input_transc.addClass('ui input transcription');
            input_transc.append('<input disabled lang="' + this['lang'] + '" type="text" value="' + this['transcription'] + '" text="' + this['transcription'] + '">');
                                      
            var input_transc_lg = $('<div></div>');
            input_transc_lg.addClass('ui input transcription-lang');
            input_transc_lg.append('<input disabled type="text" value="' + this['lang'] + '" maxlength=10 size=2>');
            
            var div_transc_dropdown_ui = $('<div class="ui selection dropdown disabled"></div>');
            div_transc_dropdown_ui.append('<input type="hidden" name="transcription-lang">')
            var div_transc_dropdown_text = $('<div class="text">Transcription<i class="dropdown icon"></i></div>');
            var div_transc_dropdown_menu = $('<div class="menu"></div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="phono">Phonologique</div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="phone">Phonétique</div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="ortho">Orthographique</div>');
            div_transc_dropdown_menu.append('<div class="item" data-value="transliter">Translittération</div>');
            
            div_transc_dropdown_ui.append(div_transc_dropdown_text).append(div_transc_dropdown_menu);
                       
            //DIV DE STOCKAGE DE L'AUTOCOMPLETE
            //input_transc_lg.append('<div class="autocomplete"></div>');
  
            //line_transc.append(input_transc).append(input_transc_lg);
            line_transc.append(input_transc).append(div_transc_dropdown_ui);
            line_transc.append('<div class="edit-annotation edit-transcription ui icon button"><i class="green pencil icon"></i></div>');
            
            if(!firstInputLine){
                line_transc.append('<div class="delete-annotation delete-transcription ui icon button"><i class="red trash icon"></i></div>');
            }

            line_transc.appendTo(div_transc);
            
            firstInputLine = false;
            
            div_transc_dropdown_ui.dropdown('set selected',this['lang']);     
            div_transc_dropdown_ui.dropdown('destroy');

        });

        div_transc.append('<br><div class="add-transcription ui icon tiny button"><i class="blue plus icon"></i></div>');
        div_transc.appendTo(div_content);                    

        //////////////////////////////////////////////
        // TRADUCTIONS
        /////////////////////////////////////////////
        div_content.append('<div class="ui divider"></div>');
        var div_transl = $('<div></div>');
        div_transl.addClass('traductions');
        div_transl.append('<h5 class="ui header">'+messages("Traductions")+'</h5>');

        var firstInputLine = true;

        $.each(annotation['traductions'], function () {
            var line_transc = $('<div></div>');
            line_transc.addClass('line input');

            var input_transc = $('<div></div>');
            input_transc.addClass('ui input traduction');
            input_transc.append('<input disabled lang="' + this['lang'] + '" type="text" value="' + this['traduction'] + '" text="' + this['traduction'] + '">');


            var input_transc_lg = $('<div></div>');
            input_transc_lg.addClass('ui input traduction-lang');
            input_transc_lg.append('<input id="traduction-lang_'+annotation['id']+'" class="autocomplete isolangue" actarget="traduction-lang_'+annotation['id']+'" acin="Id" disabled type="text" value="' + this['lang'] + '" maxlength=3 size=2>');

            line_transc.append(input_transc).append(input_transc_lg);
            line_transc.append('<div class="edit-annotation edit-traduction ui icon button"><i class="green pencil icon"></i></div>');
            
            if(!firstInputLine){
                line_transc.append('<div class="delete-annotation delete-traduction ui icon button"><i class="red trash icon"></i></div>');
            }

            line_transc.appendTo(div_transl);
            
            firstInputLine = false;

        });
        div_transl.append('<br><div class="add-traduction ui icon tiny button"><i class="blue plus icon"></i></div>');
        div_transl.appendTo(div_content);

        //////////////////////////////////
        /// MOTS
        ///////////////////////////////////
        //Plus tard si morphèmes ? if(annotation['children']){
        if(idparent == 0){
            div_content.append('<div class="ui divider"></div>');
            var div_mots = $('<div></div>');
            div_mots.addClass('words').addClass('segment sortable');
            //div_mots.css('font-size','0.8rem').css('background-color','lightblue');
            div_mots.append('<h5 class="ui header">'+messages("Mots")+'</h5>');


            $.each(annotation['children'], function () {
                displayAnnotation(this,div_mots,"rgba(255, 0, 0, 0.2)","dotted","word",annotation['id']);
            });

            div_mots.appendTo(div_content);
            div_mots.append('<div class="add-word ui icon tiny button"><i class="blue plus icon"></i></div>');

        }
       

        ///////////////////////////////////////
        //TODO (not important) 13/02/2017 : replace typeannotation by typeselection IN THIS KIND OF CASE (not everywhere)
        $( ".sortable" ).sortable({
            stop: function( event, ui ) {
               // var idAnnotation = ui.item[0].firstChild.attributes['id-selection'].nodeValue;
                var typeAnnotation = ui.item[0].firstChild.attributes['typeannotation'].nodeValue;
                var idparent = ui.item[0].firstChild.attributes['idparent'].nodeValue;
                var sortedIds = [];
                //sortChange();
                if(typeAnnotation=="sentence"){
                    //console.log("change sort sentences");

                    $('#annotations-sentences [typeannotation="sentence"]').each(function(){
                        sortedIds.push($(this).attr('id-selection'));
                    });

                    var sortedData = [];

                    $.each(sortedIds,function(){
                        var idselection = this;
                        $.each(o_Currentdocument.annotations.sentences,function(){
                            if(this.id == idselection){
                                sortedData.push(this);
                            }
                        });
                    });

                    o_Currentdocument.annotations.sentences = sortedData;


                }else if(typeAnnotation=="word"){
                    
                    $('#annotations-sentences [id-selection="'+idparent+'"] [typeannotation="word"]').each(function(){
                        sortedIds.push($(this).attr('id-selection'));
                    });

                    var sortedData = [];

                    $.each(o_Currentdocument.annotations.sentences,function(){
                        var sentence = this;
                        if(sentence.id == idparent){
                            $.each(sortedIds,function(){
                                var idselection = this;
                                $.each(sentence.children,function(){
                                    if(this.id == idselection){
                                        sortedData.push(this);
                                    }
                                });
                            });
                            this.children = sortedData;
                        }

                    });

                }

                //console.log(sortedIds);
                //console.log(idparent);
                $.ajax({
                    url: "sortAnnotations",
                    data: {
                        YII_CSRF_TOKEN: token,
                        user:user,
                        iddoc:o_Currentdocument.id,
                        idparent:idparent,
                        sortedIds:sortedIds
                    },
                    type:'POST',
                    success:function(response){
                        
                    },
                    error:function(){}
                });

            }
        });

        $( ".sortable" ).disableSelection();

        div_annotation.append(div_title);
        div_annotation.append(div_content);
        div_annotation.addClass('ui accordion');
        div_annotation.accordion({exclusive: false,callback: function(){
            //01/11/2016 - Bouton pour la suppression de la sélection
            var i_trash = $('<i class="red trash icon"></i>');
            var div_trash = $('<div class="delete-selection ui icon"></div>');
            div_title.append(i_trash);
            div_trash.append(i_trash);
        }});

        div.append(div_annotation);
        

        // EN COURS 24.07.2015
        //var padding = parseInt($('.ui.tab.segment.active').css('padding'));
        var padding = parseInt($("body").css("font-size"));

        var x1 = 0;
        var y1 = 0;
        var w = 0;
        var h = 0;
        var image = '';

        if(annotation['areas'] && annotation['areas'].length > 0){
            x1 = parseInt(annotation['areas'][0]['x1']) + padding;
            y1 = parseInt(annotation['areas'][0]['y1']) + padding;
            w = parseInt(annotation['areas'][0]['w']);
            h = parseInt(annotation['areas'][0]['h']);
            image = annotation['areas'][0]['image'];
        }
        

        //if ($('.images-tab .item.active').html() == image) {
            var mask = $('<div id="maskSelection_'+annotation['id']+'" style="cursor:pointer;float: left; position: absolute; display: block; border-style: '+borderStyle+'; border-width: 1px; background-color: '+hovercolor+';"></div>');
            mask.css('left',x1);
            mask.css('top',y1);
            mask.css('width',w);
            mask.css('height',h);
            mask.css('display', 'none');

            $("img[id='"+image+"']").before(mask);                        
        //}
    }

//_______________________________________________
//_______________________________________________
    // SURLIGNAGE DES ANNOTATIONS MANQUANTES
    function checkMissingAnnotations(){
        //28/11/2015 MISE EN EVIDENCE DES ANNOTATIONS INCOMPLETES (POSITIONNEMENT AUDIO/IMAGE, TRANSCR/TRADUC)
        //30/01/2016 CAS PARTICULIER pour les mots écrits et non lus
        //$('.words .title').css('background-color','inherit');
        //$("#annotations-sentences .title").css('background-color','inherit');
        $("#annotations-sentences .title i.icon.red").remove();
        

        $('.words .content .input input.audio.end').each(function(){
            var div_word = $(this).parent().parent().parent().parent().prev();
       
            if($(this).val()==0) {
                
                if((div_word.text().indexOf('(') === -1) && (div_word.text().indexOf(')') === -1)){
                    //div_word.css('background-color','orange');
                    div_word.addClass('ui message warning');
                    div_word.append('<i class="icon red music"></i>');
                }


                //$(this).parent().parent().parent().parent().prev().append('<i class="icon red chat outline"></i>');
                //$(this).parent().parent().parent().parent().prev().append('<i class="icon red screenshot"></i>');
            }

        });

        $(".words .transcriptions").each(function(){
           if($(this).find('.line.input').length ==0){
             var div_word = $(this).parent().prev(); 
             if((div_word.text().indexOf('(') === -1) && (div_word.text().indexOf(')') === -1)){
                    //div_word.css('background-color','orange');
                    div_word.addClass('ui message warning');
                    div_word.append('<i class="icon red code"></i>');
              }
            }

        });

        $("#annotations-sentences .content").each(function(){
           if(($(this).find('.icon.red.code').length + $(this).find('.icon.red.music').length) > 0){
             //$(this).prev().css('background-color','orange');  
             $(this).prev().addClass('ui message warning');
            }

        });
    }

    //Find last available word ID
    function generateNewId(motphrase){
        var prefixId = o_Currentdocument.id.replace('crdo-','');

        var idMax = 0;
        var idSentenceMax = 0;
        var idWordMax = 0;

        var newId = prefixId + '_' + motphrase;

        $('#annotations-sentences > div > .title').each(
            function(){
                ids = $(this).attr('id-selection').split(prefixId+'_S');
                id = parseInt(ids[1]);
                idSentenceMax = (id > idSentenceMax)?id:idSentenceMax;
            }
        );

        $('.words > div > .title').each(
            function(){
                ids = $(this).attr('id-selection').split(prefixId+'_W');
                id = parseInt(ids[1]);
                idWordMax = (id > idWordMax)?id:idWordMax;
            }
        );

        if(o_Currentdocument.hasOwnProperty('annotations')){
            //on récupère le dernier id disponible
            if(motphrase == 'S'){
                idMax = idSentenceMax;
            }else{
                idMax = idWordMax;
            }

            //digit = ("000" + (idMax+1)).slice(-3);
            digit = idMax+1;
            newId += digit;   
            

        }else{
            o_Currentdocument.annotations = {};
            o_Currentdocument.annotations.sentences = [];
            newId += '1';
            
        }

        return newId;
    }

//_______________________________________________
//_______________________________________________
    // REFRESH DE LA FENETRE DES ANNOTATIONS
    function refreshAnnotations(doc) {

        if(doc == null) doc = o_Currentdocument;

        $('#annotations-sentences').empty();
        
        var id_doc = doc.id;
        
        displayMetadata(doc['metadata'], $('#metadata-data'),"rgba(0,0,0,0.2)","dashed");
        //13/11/2016 order of sentences in 'annotations'
       // $.each(doc['annotations'], function () { 
        //    var id_sentence = this;

            $.each(doc.annotations.sentences, function () { 
                //if(this.id == id_sentence)
                displayAnnotation(this, $('#annotations-sentences'),"rgba(0, 0, 0, 0.2)","dashed","sentence",0);                      
            });

        //});

        $('#annotations-sentences .words .accordion').accordion();

        $('.add-word').bind('click',function(){
            
            var idparent =  $(this).parent().parent().attr('id-selection');

            var newId = generateNewId('W');

            var newAnnotation = {
                id:newId,
                startPosition:0,
                endPosition:0,
                areas:[],
                transcriptions:[{lang:'phono',transcription:' '}],
                traductions:[{lang:'phono',traduction:' '}],
                children:[]
            };


            //displayAnnotation(newAnnotation,$(this).parent(),"rgba(255, 0, 0, 0.2)","dotted","word",idparent);

//var lastWordDiv = $(this).parent().find('.ui.accordion:last');
            //var newWordDiv = lastWordDiv.clone();

            //$(this).before(newWordDiv);
            //newWordDiv.accordion();

            //var newvalues = Annotation2Json(newId);

            //console.log(newAnnotation);


            $.ajax({
                    //url: "createSelection",
                    url: "createAnnotation",
                    dataType: 'json',
                    data: {
                        YII_CSRF_TOKEN: token,
                        user: user,
                        iddoc: o_Currentdocument.id,
                        annotation: newAnnotation,
                        idparent: idparent
                    },
                    type: 'POST',
                    success: function (response) {

                        notifier(messages("Création de l'annotation réussie."),"success");

                        $.each(o_Currentdocument.annotations.sentences,function(){
                            if(this.id == idparent){
                                this.children.push(newAnnotation);
                                refreshAnnotations();
                            }
                        });

                        //refreshPreview();
                        o_imgAreaSelect.cancelSelections();

                        $('wave region').remove();
                        checkMissingAnnotations(); 
                        
                    },
                    error: function (request, status, error) {
                        notifier(messages("Erreur lors de la création de l'annotation (createAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");  
                    }
                });
        


        });


        $('.add-transcription,.add-traduction').bind('click', function () {
            //
            var div_line = $(this).parent().find('.line.input:last');
            var new_div_line = div_line.clone();
            div_line.after(new_div_line);
            //
            $(this).hide();


            new_div_line.find('input').each(function () {
                $(this).val('');
                $(this).removeAttr('disabled');
                
                if($(this).parent().hasClass('dropdown')){
                    $(this).parent().dropdown();
                }
            });

            new_div_line.find('.button.edit-annotation').addClass('save-edit-annotation').find('.pencil').removeClass('pencil').addClass('save');
            new_div_line.find('.button.edit-annotation').bind('click', function () {
                var typeAnnotation;

                $(this).hasClass('edit-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

                var idAnnotation = $(this).parent().parent().parent().attr('id-selection');

                //var inputText = $(this).prev().prev().find('input');
                //var inputLang = $(this).prev().find('input');

                var inputText = $(this).parent().find('.input:nth-of-type(1) input');
                var Text = inputText.val();
                var inputLang;
                var Lang;
                
                if($(this).parent().find('.ui.dropdown').length > 0){
                    Lang = $(this).parent().find('.ui.dropdown').dropdown('get value');
                }else{
                    inputLang = $(this).parent().find('.input:nth-of-type(2) input');
                    Lang = inputLang.val();
                }


/*deprecated
                $.ajax({
                    url: "addAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        document: id_doc,
                        directory: user,
                        typeannotation: typeAnnotation,
                        idannotation: idAnnotation,
                        text: Text,
                        lang: Lang
                    },
                    type: 'POST',
                    success: function (response) {

                        ////console.log(response);
                        //getDoc(id_doc);
                        notifier(messages("Ajout de l'annotation réussie."),"success");
                        refreshContent(id_doc);
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de l'ajout de l'annotation (addAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });
*/

                //on enregistre les modifications
                newvalues = Annotation2Json(idAnnotation);

                $.ajax({
                    url: "updateAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user,
                        json: newvalues
                    },
                    type: 'POST',
                    success: function (response) {
                        notifier(messages("Mise à jour de l'annotation réussie."),"success");
                        $('wave region').remove();
                        //refreshContent(id_doc);
                        //refreshPreview();
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });

                $(this).removeClass('save-edit-annotation');
                $(this).find('.save').removeClass('save').addClass('pencil');
                $(this).after('<div class="delete-annotation delete-transcription ui icon button"><i class="red trash icon"></i></div>');

                inputText.attr('disabled', 'disabled');
                inputLang.attr('disabled', 'disabled');
                
                $('.delete-annotation').bind('click', function () {
                    $('.basic.modal').find('.header').html('Supprimer');
                    $('.basic.modal').find('.content .right').html("Supprimer l'annotation ?");

                    var divInput = $(this).parent();

                    var typeAnnotation;
                    $(this).hasClass('delete-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

                    var idAnnotation = divInput.parent().parent().attr('id-selection');

                    var inputText = $(this).parent().find('.input:nth-of-type(1) input');
                    var Text = inputText.val();
                    var Lang = inputText.attr('lang');


                    $('.basic.modal').modal('setting', {
                        closable: false,
                        onDeny: function () {
                            //return false;
                        },
                        onApprove: function () {

                            $.ajax({
                                //url: "delAnnotation",//DEPRECATED since JSON version
                                url: "delAnnotation",
                                data: {
                                    YII_CSRF_TOKEN: token,
                                    iddoc: o_Currentdocument.id,
                                    user: user,
                                    typeannotation: typeAnnotation,
                                    idannotation: idAnnotation,
                                    text: Text,
                                    lang: Lang,
                                },
                                type: 'POST',
                                success: function (response) {
                                    //console.log(response);
                                    //getDoc(id_doc);
                                    //refreshPreview(o_Currentdocument)
                                    notifier(messages("Suppression de l'annotation réussie."),"success");
                                    divInput.remove();
                                    refreshContent(id_doc);

                                },
                                error: function (resultat, statut, erreur) {
                                    notifier(messages("Erreur lors de la suppression de l'annotation (delAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                                }
                            });


                        }
                    }).modal('show');


                });

                
            });
            
            $(this).show();
        });
        
        //DECLARE 2 FOIS A CAUSE DE LA CREATION DYNAMQIUE DU BOUTON DE SUPPRESSION DES ANNOTATIONS DANS addAnnotation
        $('.delete-annotation').bind('click', function () {
            $('.basic.modal').find('.header').html('Supprimer');
            $('.basic.modal').find('.content .right').html("Supprimer l'annotation ?");

            var divInput = $(this).parent();

            var typeAnnotation;
            $(this).hasClass('delete-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

            var idAnnotation = divInput.parent().parent().attr('id-selection');

            var inputText = $(this).parent().find('.input:nth-of-type(1) input');
            var Text = inputText.val();
            var Lang = inputText.attr('lang');
            
            $('.basic.modal').modal('setting', {
                closable: false,
                onDeny: function () {
                    //return false;
                },
                onApprove: function () {

                    $.ajax({
                        url: "delAnnotation",
                        data: {
                            YII_CSRF_TOKEN: token,
                            document: id_doc,
                            directory: user,
                            typeannotation: typeAnnotation,
                            idannotation: idAnnotation,
                            text: Text,
                            lang: Lang,
                        },
                        type: 'POST',
                        success: function (response) {
                            //console.log(response);
                            //getDoc(id_doc);
                            //refreshPreview(o_Currentdocument)
                            notifier(messages("Suppression de l'annotation réussie."),"success");
                            divInput.remove();
                            refreshContent(id_doc);

                        },
                        error: function (resultat, statut, erreur) {
                            notifier(messages("Erreur lors de la suppression de l'annotation (delAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                        }
                    });


                }
            }).modal('show');


        });
        
        //IHM : boutons de MAJ des annotations
        $('.button.edit-annotation').bind('click', function () {

            var typeAnnotation;
            $(this).hasClass('edit-traduction') ? typeAnnotation = 'traduction' : typeAnnotation = 'transcription';

            var idAnnotation = $(this).parent().parent().parent().attr('id-selection');

            var inputText = $(this).parent().find('.input:nth-of-type(1) input');
            
            var Text = inputText.val();
            
            var inputLang = $(this).parent().find('.input:nth-of-type(2) input');;
            var Lang;

            if($(this).parent().find('.ui.dropdown').length > 0){
                Lang = $(this).parent().find('.ui.dropdown').dropdown('get value');
            }else{                 
                Lang = inputLang.val();
            }


            var TextBeforeUpdate = inputText.attr('text');
            var LangBeforeUpdate = inputText.attr('lang');

            if (!$(this).hasClass('save-edit-annotation')) {
                //on rentre en mode édition
                $(this).addClass('save-edit-annotation');
                $(this).find('.pencil').removeClass('pencil').addClass('save');
                
                inputText.removeAttr('disabled');
                inputLang.removeAttr('disabled');                
                $(this).parent().find('.ui.dropdown').dropdown();

                $(this).after('<div class="button cancel-edition ui icon"><i class="blue icon undo"></i></div>');

                $('.button.cancel-edition').bind('click',function(){
                    $(this).parent().find('.save').removeClass('save').addClass('pencil');
                    $(this).parent().find('.save-edit-annotation').removeClass('save-edit-annotation');
                    inputText.attr('disabled', 'disabled');
                    inputLang.attr('disabled', 'disabled');
                    $(this).parent().find('.ui.dropdown').dropdown('destroy');
                    $(this).remove();
                });

            } else {
                //on enregistre les modifications
                newvalues = Annotation2Json(idAnnotation);

                $.ajax({
                    url: "updateAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user,
                        json: newvalues
                    },
                    type: 'POST',
                    success: function (response) {
                        notifier(messages("Mise à jour de l'annotation réussie."),"success");
                        $('wave region').remove();
                        //refreshContent(id_doc);
                        if(typeAnnotation == "transcription"){
                            refreshAnnotations();
                        }
                        //refreshPreview();
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });

                $(this).removeClass('save-edit-annotation');
                $(this).find('.save').removeClass('save').addClass('pencil');

                inputText.attr('disabled', 'disabled');
                inputLang.attr('disabled', 'disabled');
                $(this).parent().find('.ui.dropdown').dropdown('destroy');

                $(this).next('.cancel-edition').remove();

            }

        });

        //IHM : boutons de MAJ des position audio
        $('.button.edit-audio').bind('click', function () {

            var idAnnotation = $(this).parent().parent().parent().attr('id-selection');
            var typeAnnotation = $('.title[id-selection="'+idAnnotation+'"]').attr('typeannotation');

            var spInput = $(this).parent().find('.input.audio > .start');
            var sp = spInput.val();

            var epInput = $(this).parent().find('.input.audio > .end');
            var ep = epInput.val();


            if (!$(this).hasClass('save-edit-annotation')) {
                $('.edit-audio.save-edit-annotation').removeClass('save-edit-annotation').find('.save').removeClass('save').addClass('pencil');
                //on rentre en mode édition
                $(this).addClass('save-edit-annotation');
                $(this).find('.pencil').removeClass('pencil').addClass('save');

                spInput.removeAttr('disabled');
                epInput.removeAttr('disabled');

                if((parseFloat(spInput)===0 && parseFloat(epInput)===0) || (spInput==="" && epInput==="")){
                    spInput.val($('#startPosition').val());
                    epInput.val($('#endPosition').val());
                }

                $(this).after('<div class="button cancel-edition ui icon"><i class="blue icon undo"></i></div>');

                $('.button.cancel-edition').bind('click',function(){
                    $(this).parent().find('.save').removeClass('save').addClass('pencil');
                    $(this).parent().find('.save-edit-annotation').removeClass('save-edit-annotation');

                    $.each(o_Currentdocument.annotations.sentences, function(){
                        if(typeAnnotation == "sentence"){
                            if(this.id == idAnnotation){
                                spInput.val(this.startPosition);
                                epInput.val(this.endPosition);
                            }
                        }else{
                            $.each(this.children, function(){
                                if(this.id == idAnnotation){
                                    spInput.val(this.startPosition);
                                    epInput.val(this.endPosition);
                                }
                            });
                        }
                        
                    });        

                    spInput.attr('disabled', 'disabled');
                    epInput.attr('disabled', 'disabled');
                    $(this).remove();
                });

            } else {
                //on enregistre les modifications
                newvalues = Annotation2Json(idAnnotation);

                $.ajax({
                    url: "updateAnnotation",
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user,
                        json: newvalues
                    },
                    type: 'POST',
                    success: function (response) {
                        notifier(messages("Mise à jour de l'annotation réussie."),"success");
                        $('wave region').remove();
                        //refreshContent(id_doc);
                        //refreshPreview();
                        checkMissingAnnotations();
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                    }
                });

                $(this).removeClass('save-edit-annotation');
                $(this).find('.save').removeClass('save').addClass('pencil');

                spInput.attr('disabled', 'disabled');
                epInput.attr('disabled', 'disabled');
                
                $(this).next('.cancel-edition').remove();
            }

        });

        //IHM : boutons de MAJ des positions area image
        $('.button.edit-image').bind('click', function () {
            //TODO : il faut autant de div_preview que de sélections
            var that = this;
            var div_preview;

            if($(this).parent().find('.input.image > div').length != 0){
                div_preview = $(this).parent().find('.input.image > div');
            }else{
                div_preview = $('<div></div>');
                div_preview.css('display','block');
                div_preview.css('position','relative');
                div_preview.css('padding','0px');
                $(this).parent().find('.input.image').append(div_preview);              

            }
            

            var idAnnotation = $(this).parent().parent().parent().attr('id-selection');
            var selected_areas = new Array();

            var div_bloc =$('[id-selection="'+idAnnotation+'"]:first');

            $.each(o_imgAreaSelect.getSelections(), function () {
                selected_areas.push({
                    image: $('.images-tab a.item.active').attr('image'),
                    area: this
                });
            });


            if (!$(this).hasClass('save-edit-annotation')) {
                $('.edit-image.save-edit-annotation').removeClass('save-edit-annotation').find('.save').removeClass('save').addClass('pencil');
                //on rentre en mode édition
                $(this).addClass('save-edit-annotation');
                $(this).find('.pencil').removeClass('pencil').addClass('save');

                $(this).after('<div class="button cancel-edition ui icon"><i class="blue icon undo"></i></div>');
                $('.button.cancel-edition').bind('click',function(){
                    $(this).parent().find('.save').removeClass('save').addClass('pencil');
                    $(this).parent().find('.save-edit-annotation').removeClass('save-edit-annotation');
                                   
                    $(this).remove();
                });

            } else {
                if(selected_areas.length > 0){

                    $(this).parent().find('.input.image > div').remove();

                    $.each(selected_areas,function(){
                        var x1 = this.area.x1;
                        var y1 = this.area.y1;
                        var x2 = this.area.x2;
                        var y2 = this.area.y2;

                        var w = x2 - x1;
                        var h = y2 - y1;
                        var padding = isNaN(parseInt($('.ui.tab.segment.active').css('padding-top'))) ? 0 : parseInt($('.ui.tab.segment.active').css('padding-top'));

                        var x12 = x1 + padding;
                        var y12 = y1 + padding;
                        //     
                        
                        var div_preview;

                        div_preview = $('<div></div>');
                        div_preview.css('display','block');
                        div_preview.css('position','relative');
                        div_preview.css('padding','0px');
                        $(that).parent().find('.input.image').append(div_preview);              
   
                        //

                        //var path_doc = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+o_Currentdocument.id+"/";
                        div_preview.css('background-image','url('+$('.images-tab .tab.active img').attr('src')+')');
                        div_preview.attr('x1',x12);
                        div_preview.attr('y1',y12);
                        div_preview.attr('h',h);
                        div_preview.attr('w',w);
                        div_preview.attr('image',this.image);
                        div_preview.css('background-position-x','-'+x12+'px');
                        div_preview.css('background-position-y','-'+y12+'px');


                        div_preview.css('width',w);
                        div_preview.css('height',h);
                    });

                    

                    div_bloc.attr('x1',selected_areas[0].x1);
                    div_bloc.attr('y1',selected_areas[0].y1);
                    div_bloc.attr('h',selected_areas[0].h);
                    div_bloc.attr('w',selected_areas[0].w);
                    div_bloc.attr('image',selected_areas[0].image);



                    //on enregistre les modifications
                    newvalues = Annotation2Json(idAnnotation);

                    $.ajax({
                        url: "updateAnnotation",
                        data: {
                            YII_CSRF_TOKEN: token,
                            iddoc: id_doc,
                            user: user,
                            json: newvalues
                        },
                        type: 'POST',
                        success: function (response) {
                            notifier(messages("Mise à jour de l'annotation réussie."),"success");
                            $('wave region').remove();
                            //refreshContent(id_doc);
                            //refreshAnnotations();
                            //refreshPreview(); put only on preview click, not performant at each update
                            checkMissingAnnotations();
                            o_imgAreaSelect.cancelSelections();
                        },
                        error: function (resultat, statut, erreur) {
                            notifier(messages("Erreur lors de la mise à jour de l'annotation (updateAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                        }
                    });

                    $(this).removeClass('save-edit-annotation');
                    $(this).find('.save').removeClass('save').addClass('pencil');

                }

                $(this).parent().find('.cancel-edition').click();

            }

        });

        //$('#annotations-sentences .title').bind('mouseover', function() {
        $('[id^="annotations-"] .title').bind('mouseover', function () {
            ////console.log('mouseover');

            //var padding = parseInt($('.ui.tab.segment.active').css('padding'));
            //BUG FIXED 04/09/2015 : comportement different entre Chrome et Firefox
            var padding = isNaN(parseInt($('.ui.tab.segment.active').css('padding-top'))) ? 0 : parseInt($('.ui.tab.segment.active').css('padding-top'));

            var x1 = parseInt($(this).attr('x1')) + padding;
            var y1 = parseInt($(this).attr('y1')) + padding;
            var w = parseInt($(this).attr('w'));
            var h = parseInt($(this).attr('h'));
            var image = $(this).attr('image');


            if ($('.images-tab .item.active').attr('image') == image) {

                $('div#maskCurrentSelection').css('left', x1);
                $('div#maskCurrentSelection').css('top', y1);
                $('div#maskCurrentSelection').css('width', w);
                $('div#maskCurrentSelection').css('height', h);
                $('div#maskCurrentSelection').css('display', 'block');
            }

        });

        $('[id^="annotations-"] .input.image a').bind('mouseover', function(){
            var padding = isNaN(parseInt($('.ui.tab.segment.active').css('padding-top'))) ? 0 : parseInt($('.ui.tab.segment.active').css('padding-top'));

            var x1 = parseInt($(this).attr('x1')) + padding;
            var y1 = parseInt($(this).attr('y1')) + padding;
            var w = parseInt($(this).attr('w'));
            var h = parseInt($(this).attr('h'));
            var image = $(this).attr('image');


            if ($('.images-tab .item.active').attr('image') == image) {

                $('div#maskCurrentSelection').css('left', x1);
                $('div#maskCurrentSelection').css('top', y1);
                $('div#maskCurrentSelection').css('width', w);
                $('div#maskCurrentSelection').css('height', h);
                $('div#maskCurrentSelection').css('display', 'block');
            }
        });

        //$('#annotations-sentences .title').bind('mouseout', function() {
        $('[id^="annotations-"] .title').bind('mouseout', function () {
            ////console.log('mouseout');
            $('div#maskCurrentSelection').css('display', 'none');
        });

        $('[id^="annotations-"] .input.image a').bind('mouseout', function () {
            ////console.log('mouseout');
            $('div#maskCurrentSelection').css('display', 'none');
        });

        $('.play-selection').bind('click', function () {
            //var start = $(this).parent().parent().attr('startposition');
            //var end = $(this).parent().parent().attr('endposition');
            //31/01/2016 POUR LECTURE LIVE SANS RECHARGEMENT (PLUS LOGIQUE)
            if($(this).hasClass('stop')){
                $(this).removeClass('stop');
                $(this).find('i').removeClass('stop').addClass('play');
                wavesurfer.pause();
            }else{
                $(this).addClass('stop');
                $(this).find('i').removeClass('play').addClass('stop');

                var start = parseFloat($(this).parent().find('input.audio.start').val());
                var end = parseFloat($(this).parent().find('input.audio.end').val());
                wavesurfer.play(start, end);
            }

        });

        // suppression de la sélection complète : positionnement image+audio et annotations
        $('.delete-selection').bind('click', function () {
            var motphrase;
            var id_selection = $(this).parent().attr('id-selection');

            /*if ($(this).parent().parent().attr('id') == 'annotations-sentences') {
                motphrase = 'phrase';
            } else {
                motphrase = 'mot';
            }
            */

            //13/02/2017 : TODO (not important) replace typeannotation by typeselection IN THIS CASE 
            //--> typeannotation enable to distinguish between translation and transcription
            //--> typeselection between sentence and word

            motphrase = $('.title[id-selection="'+id_selection+'"]').attr('typeannotation');


            $('.basic.modal').find('.header').html(messages("Supprimer"));
            $('.basic.modal').find('.content .right').html(messages("Supprimer la sélection ?"));

            $('.basic.modal').modal('setting', {
                closable: false,
                onDeny: function () {
                    //return false;
                },
                onApprove: function () {

                    $.ajax({
                        //url: "delSelection",
                        url: "deleteSelection",
                        data: {
                            YII_CSRF_TOKEN: token,
                            iddoc: o_Currentdocument.id,
                            user: user,
                            idselection: id_selection,
                            motphrase: motphrase
                        },
                        type: 'POST',
                        success: function (response) {
                            //console.log(response);
                            notifier(messages("Suppression de la sélection réussie."),"success");

                            $.each(o_Currentdocument.annotations.sentences, function(id){

                                var that = this;

                                if(motphrase == 'sentence'){
                                    
                                    if(this.id == id_selection){

                                        o_Currentdocument.annotations.sentences.splice(id,1);
                                        refreshAnnotations(o_Currentdocument);
                                        
                                    }
                                }else{
                                    $.each(that.children,function(idw){
                                        if(this.id == id_selection){
                                            o_Currentdocument.annotations.sentences[id].children.splice(idw,1);
                                            refreshAnnotations(o_Currentdocument);
                                            //refreshPreview(o_Currentdocument);
                                        }   
                                    });
                                }
                            });
                            
                        },
                        error: function (resultat, statut, erreur) {
                            //sinon on le crée
                            //console.log("suppression en erreur");
                            notifier(messages("Suppression en erreur.")+" "+messages("Veuillez reporter l'incident à l'équipe informatique."),"error");
                        }
                    });
                }
            }).modal('show');


        });

        $("#select-ressources > tbody > tr > td > i.trash").on("click", function () {

            var idresource = $(this).parent().parent().attr("id");
            var typeresource = $(this).parent().parent().attr("type");

            $('#file-to-delete').html(idresource);

            $('.basic.modal').find('.header').html(messages("Supprimer"));
            $('.basic.modal').find('.content .right').html(messages("Supprimer la ressource ?"));

            $('.basic.modal').modal('setting', {
                closable: false,
                onDeny: function () {
                    //return false;
                },
                onApprove: function () {                            
                    $.ajax({
                        //url: "delCrdo",//deprecated in JSON version
                        url: "delResource",
                        data: {
                            YII_CSRF_TOKEN: token,
                            iddoc: id_doc,
                            user: user,
                            idresource: idresource,
                            typeresource: typeresource
                        },
                        type: 'POST',
                        //dataType: 'xml',
                        success: function (response) { 
                            localStorage.setItem('step',$('#steps .step:nth(1)').attr('id'));
                            location.reload();                        
                            notifier(messages("Suppression de la ressource réussie."),"success");

                        },
                        error: function (resultat, statut, erreur) {
                            //sinon on le crée

                            notifier(messages("Erreur lors de la suppression de la ressource (delResource).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");

                        }
                    });
                }
            }).modal('show');
        });
        //$("audio > source").attr("src");
        //refreshAudio();

        checkMissingAnnotations();

    }
//____________________________________________________________________________________
//____________________________________________________________________________________
    // RECUPERATION DES ANNOTATIONS DU DOCUMENT id_doc    
    //deprecated in JSON version
    function refreshContent(id_doc){
        
        var activeTabs = [];
        $('#annotations .title.active').each(function(){
            activeTabs.push($(this).attr('id-selection'));
        });

        
        $.post(
            "getDoc",
            {
                YII_CSRF_TOKEN: token,
                metadata_file: id_doc,
                directory: user
            },
            function (response) {
                o_Currentdocument = $.parseJSON(response);
                refreshAnnotations(o_Currentdocument);
                refreshPreview(o_Currentdocument);
                $.each(activeTabs,function(){
                    $('[id-selection="'+this+'"]').show().addClass('active');
                });
                bindAutocomplete();
            }
        );
    }

//_________________________

//__________________________
//  REFRESH DU PREVIEW
    function refreshPreview(o_document){
        if(o_document == null) o_document = o_Currentdocument;
        //29/01/2016
        var path_doc = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+o_document.id+"/";
        var url_doc = path_doc + o_document.metadata_file;
        var http_url_images = new Array();

        $.each(o_Currentdocument.resources.images,function(){
           var url = path_doc + this.file;
           http_url_images.push({"id":this.id,"url":url});
        });                       

        var strokeColor = "333333"; //!!toujours mettre le code couleur hexadecimal !!
        var strokeWidth = 4;
        var fillColor = "ffffff";
        var fillOpacity = 0.0;

        //$('.eastling').parent().empty().append("<div class='eastling'></div>");
        $('.eastling').parent().children(':not(.eastling,.preview)').remove();

        $('.eastling').eastlingplayer({
            idref: url_doc,
            local:true,
            localDocument:{
                annotations : o_document.annotations.sentences,
                metadata : o_document.metadata,
                url_images : http_url_images,
                url_audio : path_doc + o_document.resources.audio
            },
            strokeColor: strokeColor,
            strokeWidth: strokeWidth,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            callback:function(){

                $('.map').maphilight();

                $('.eastling').eastlingShape();

                //surlignage de la zone sur survol du mot
                $('.word').bind('mouseover',function(){
                 var link = $(this).attr('link');                        
                 $('#'+link).mouseover();
                 word_highlight($(this),true,strokeWidth,strokeColor);

                }).bind('mouseout',function(){
                    var link = $(this).attr('link');
                    $('#'+link).mouseout();
                    word_highlight($(this),false,'','');

                });

                $('area').bind('mouseover',function(){
                    var link = $(this).attr('id');
                    word_highlight($("[link='"+link+"']"),true,strokeWidth,strokeColor);
                }).bind('mouseout',function(){
                    var link = $(this).attr('id');
                    word_highlight($("[link='"+link+"']"),false,'','');
                });


            }
        });
    }
//____________________________________________________________________________________
//____________________________________________________________________________________
    // RECUPERATION DU DOCUMENT id_doc
    //DEPRECATED IN JSON VERSION 
    function getDoc(id_doc) {

        var nb_error = 0;
        //console.log('getDoc:');
        ////console.log("set dimmer");
        //$("#loading .loader").html('<?php echo Yii::t('general', 'Chargement du document'); ?>');
        $("#loading .loader").html(messages("Chargement du document"));
        
        $("#loading").addClass('active');       
 

        $(".images-tab").empty();
        //$("#images-compo > div[class!=images-tab]").remove();
        $("#images-compo > div:not(.images-tab)").remove();



        $.post(
            "getDoc",
            {
                YII_CSRF_TOKEN: token,
                metadata_file: id_doc,
                user: user

            },
            //type: 'POST',
            //dataType: 'xml',
            function (response) {

                //var o_Currentdocument = $.parseJSON(response);
                o_Currentdocument = $.parseJSON(response);

                ////console.log(['sentences']);

                $("#select-ressources tbody").empty();
                $("#selected-doc").html(" : <b>" + o_Currentdocument['metadata']['crdos'][0]['title']['title'] + "</b>&nbsp;<div class='ui icon green button'><i class='icon download disk'></i></div>");

                //bouton de téléchargement
                $('#selected-doc .button').bind('click', function () {

                    $.ajax({
                        url: 'zipDoc',
                        data: {
                            YII_CSRF_TOKEN: token,
                            metadata_file: $("#select-document > tbody > tr.active").attr('id'),
                            directory: $("#user").val()
                        },
                        type: 'POST',
                        dataType: 'text',
                        success: function (result) {
                            //ZIP SUR LE VRAI FICHIER
                            var url_file = window.location.href.split('index.php')[0]+ "documents/"+user+"/" + result;

                            var link = document.createElement('a');
                            document.body.appendChild(link);
                            link.href = url_file;
                            link.download = $("#select-document > tbody > tr.active").attr('id') + '.zip';
                            link.click();
                            notifier(messages("Création de l'archive réussie."),"success");
                        
                            
                        },
                        error: function (resultat, statut, erreur) {
                            notifier(messages("Erreur lors de la création de l'archive (zipDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                        
                        }
                    });
                });

                var cpt_images = 0;
                
                var repertoire = baseUrl+'/documents/' + o_Currentdocument['user'] + '/';
                
                
                var coordGeo = o_Currentdocument['metadata']['crdos'][0].spatial[1].spatial.split(';');
                
                var east = coordGeo[0].split('=')[1];
                var north = coordGeo[1].split('=')[1];
                
                //map.setCenter({ lat: north, lng: east });
                    
                $.each(o_Currentdocument['metadata']['crdos'], function () {

                    var icon_type = '';
                    var that = this; //that -> crdo en cours
                    //02/02/2016
                    //Modification du programme pour importation ancien format Pangloss
                    //Factoriser ???
                    if(this['type']===""){
                        
                        var extImage = new Array('jpg','jpeg','png','tiff','pdf','bmp','gif');
                        var extSound = new Array('mp3','wav','ogg');
                        
                       $.each(this['isFormatOf'], function (i, col) {
                           
                            var filePath = this.split('.'); 
                            var ext = filePath[filePath.length-1].toLowerCase();

                            if($.inArray(ext,extImage)>=0){
                                that['type']='Image';
                            }
                            if($.inArray(ext,extSound)>=0){
                                that['type']='Sound';
                            }
                        }); 
                    }

                    
                    ///////////////////////////////////////////////////////

                    if (this['type'] == 'Sound') {

                        icon_type = 'music';
                        
                        
                        $.each(this['isFormatOf'], function (i, col) {
                            if (col.toLowerCase().indexOf('mp3') >= 0) {
                                file_mp3 = col;
                            } else if (col.toLowerCase().indexOf('wav') >= 0) {
                                file_wav = col;
                            }
                        });
                        
                        //TESTER L'EXISTENCE DU FICHIER ICI
                        //nb_error++; --> rapport d'erreur


                        if (file_mp3 != '') {
                            if(file_mp3.indexOf("http://")>=0){
                                $("#src-mp3").attr("src", file_mp3);
                            }else{
                                $("#src-mp3").attr("src", repertoire + file_mp3);
                            }
                            
                            $("#src-mp3").attr("type", "audio/mpeg");


                        } else {
                            if(file_wav.indexOf("http://")>=0){
                                $("#src-wav").attr("src", file_wav);
                            }else{
                                $("#src-wav").attr("src", repertoire + file_wav);
                            }
                            $("#src-wav").attr("type", "audio/wav");
                        }


                    } else if (this['type'] == 'Image') {
                        icon_type = 'photo';

                        
                        var urls_image = this['isFormatOf'];
                        //OK //console.log(urls_image);
                        var img_id = this['id'];
          
                        $.each(urls_image,function(){
                            //Vérification de l'existence du fichier
                            var that_image = this;
                            images.push(that_image);
                            $.ajax({
                                url: repertoire + that_image, 
                                type: 'get',
                                error: function(XMLHttpRequest, textStatus, errorThrown){
                                    if(XMLHttpRequest.status === 404){
                                       notifier("Fichier image introuvable.","error","tr#"+img_id);
                                       nb_error++;
                                       //console.log()
                                       $("tr#"+img_id).addClass('error');
                                    }
                                },
                                success: function(data){
                                    //images.push(that_image);

                                    cpt_images++;
                                    //var html_tab = '<a class="teal item" data-tab="tab_image_' + cpt_images + '">' + this['identifier'] + '</a>';
                                    var html_tab = '<a class="teal item" data-tab="tab_image_' + cpt_images + '" image="'+that['id']+'">...' + that['id'].slice(-12) + '</a>';
                                    var html_div = '<div class="ui tab segment" style="position:relative;" data-tab="tab_image_' + cpt_images + '">';
                                    html_div += '<div id="maskCurrentSelection" style="display:none;float: left;position: absolute;left: 59px;top: 150px;width: 934px;height: 76px;background-color: rgba(110,207,245,0.3);"></div>';
                                    html_div += '<img src="' + repertoire + that_image + '" id="' + that['id'] + '" />';
                                    //html_div += '<map name="map_' + this['id'] + '" id="map_' + this['id'] + '" href="#"></map>';
                                    html_div += '</div>';
                                    $(".images-tab").append(html_tab);
                                    $(".images-tab").after(html_div);
                                }
                            });
                        });


                    } else if (this['type'] == 'Text') {
                        icon_type = 'file outline';
                        var name_file = this['identifier'];
                        var id_file = this['id'];
                        
                        $.ajax({
                            url: repertoire + name_file, 
                            type: 'get',
                            error: function(XMLHttpRequest, textStatus, errorThrown){
                                if(XMLHttpRequest.status === 404){
                                   notifier("Fichier d'annotation introuvable.","error","tr#"+id_file);
                                   nb_error++;
                                   $("tr#"+id_file).addClass('error');
                                }
                            },
                            success: function(data){
                                
                            }
                        });
                    }

                    var html_crdo = '<tr id="' + this['id'] + '">';
                    html_crdo += '<td>' + this['id'] + '</td>';
                    html_crdo += '<td>' + this['type'] + ' <i class="icon ' + icon_type + '"></i></td>';
                    html_crdo += '<td>';
                    /*html_crdo += '<i class="icon blue edit"></i>';*/
                    
                    ////console.log(this['type'].trim());
                    
                    if (this['type'].trim()==="Sound" || this['type'].trim()==="Image") {
                        html_crdo += '<i class="icon red trash"></i>';
                    }
                    
                    html_crdo += '</td>';
                    html_crdo += '</tr>';
                    $("#select-ressources > tbody").append(html_crdo);
                    //$("#fieldset-ressources > label").append("<a style='display:inherit;'>" + this['id'] + "</a>");
                });

                $('#metadata .ui.form').empty();
                $('#annotations-sentences').empty();
                $('#annotations-words').empty();
                $('.imgareaselect-box').remove();
                $('.imgareaselect-closebtn').remove();

                //$('map[name^="map_"]').empty();
                
                refreshContent(id_doc);

                if (file_mp3 !== '') {
                    //console.log(file_mp3+ ' audio loading wavesurfer');
                    if(file_mp3.indexOf("http://")>=0){                        
                        wavesurfer.load(file_mp3);
                    }else{
                        var repertoire = baseUrl+'/documents/' + o_Currentdocument['user'] + '/';                        
                        wavesurfer.load(repertoire + file_mp3);
                    }

                }

            }

        ).done(function(){
            //console.log("remove dimmer");
            $("#loading").removeClass('active');
        });

        

    }

    //CURRENT : ajout d'un mot à une phrase
    function addSelectionToDOM(parameters){

        var motphrase = (parameters.motphrase == "phrase") ? 'S' : 'W' ;
        var prefixId = o_Currentdocument.id.replace('crdo-','');

        var idMax = 0;
        var idSentenceMax = 0;
        var idWordMax = 0;

        var newId = prefixId + '_' + motphrase;

        $('#annotations-sentences > div > .title').each(
            function(){
                id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                idSentenceMax = (id > idSentenceMax)?id:idSentenceMax;
            }
        );

        $('.words > div > .title').each(
            function(){
                id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                idWordMax = (id > idWordMax)?id:idWordMax;
            }
        ); 

        if(o_Currentdocument.hasOwnProperty('annotations')){
            //on récupère le dernier id disponible
            if(motphrase == 'S'){
                idMax = idSentenceMax;
            }else{
                idMax = idWordMax;
            }

            //digit = ("000" + (idMax+1)).slice(-3);
            digit = idMax+1;
            newId += digit;   
            

        }else{
            o_Currentdocument.annotations = {};
            o_Currentdocument.annotations.sentences = [];
            //newId += '001';
            newId += '1';
            
        }

        //10/02/2017
        //MOT à MOT
        var arrayMots = [];

        if(motphrase == 'S'){
            var mots = parameters.transcriptions[0].transcription.split(' ');
        
            $.each(mots,function(){
                idWordMax++;
                //digit = ("000" + (idWordMax+1)).slice(-3);
                digit = idWordMax+1;
                var idWord = prefixId + '_W' + digit;
                arrayMots.push({
                    id: idWord,
                    startPosition: parameters.startPosition,
                    endPosition: parameters.endPosition,
                    areas: [],
                    traductions: [],
                    transcriptions: [{'lang':parameters.transcriptions[0].lang,'transcription':this}]
                    });


            });
        }
        
        //

        var annotation = {
            id: newId,
            startPosition: parameters.startPosition,
            endPosition: parameters.endPosition,
            areas: parameters.selectedAreas,
            traductions: parameters.traductions,
            transcriptions: parameters.transcriptions,
            children: arrayMots
        };

        console.log(annotation);

        if(motphrase == 'S'){
            o_Currentdocument.annotations.sentences.push(annotation);
        }else{
            //o_Currentdocument.annotations.sentences.push(annotation);
            $.each(o_Currentdocument.annotations.sentences,function(){
                if(this.id == parameters.idParent){
                    this.children.push(annotation);
                }
            });
        }

        refreshAnnotations();

    }

function addInfoRessource(ressource){
    var html_crdo = '<tr id="' + ressource['id'] + '" type="'+ressource['type']+'">';
    html_crdo += '<td>' + ressource['id'] + '</td>';
    html_crdo += '<td>' + ressource['type'] + ' <i class="icon ' + ((ressource['type']=="image")?'photo':'music') + '"></i></td>';
    html_crdo += '<td>';

    if (ressource['type'].trim()==="audio" || ressource['type'].trim()==="image") {
        html_crdo += '<i class="icon red trash"></i>';
    }
    
    html_crdo += '</td>';
    html_crdo += '</tr>';
    $("#select-ressources > tbody").append(html_crdo);
}

function progressCompute(toload,loaded){
    var totalToLoad = 0;
    var totalLoaded = 0;
    var progressRate = 0;
    
    $.each(toload,function(im){                           
        totalToLoad += toload[im];
        totalLoaded += loaded[im];
    });

    progressRate = (totalLoaded/totalToLoad)*100;

    if(progressRate == 100) $("#loading").removeClass('active');

    return progressRate;

}

var fileids = [];
var toload = [];
var loaded = [];

//13/11/2016 : get everything about a document to the DOM : meta (todo), annotations, resources (audio+images)
function getDocument(){

    var filepath = baseUrl+'/documents/'+user+'/'+o_Currentdocument.id+'/';
    var cpt_images = 0;
    var nb_files = 0;

    fileids = [];
    toload = [];
    loaded = [];

    $('#annotations-sentences').empty();
    $('#metadata-data').empty();
    $("#select-ressources > tbody").empty();
    $("#images-compo").empty();
    wavesurfer.empty(); //ignoré, why??

    if(o_Currentdocument.hasOwnProperty('resources')){
        if(o_Currentdocument.resources.hasOwnProperty('images') && (o_Currentdocument.resources.images.length > 0)){

            nb_files = o_Currentdocument.resources.images.length;

            var div_image_tab = $('<div class="images-tab ui pointing secondary menu"></div>');
            //get images
            $.each(o_Currentdocument.resources.images,function(){

                var that = this;
                var that_image = this.file;
                images.push({id:this.id,file:this.file});

                addInfoRessource({id:this.id,type:"image"});

                cpt_images++;

                //toload[that.id] = 0;loaded[that.id] = 0; 
                fileids.push(that.id);
                toload.push(100000);
                loaded.push(0);
                

                var active = (cpt_images==1) ? "active":"";

                var dom_tab_item = $('<a class="teal '+ active +' item" data-tab="tab_image_' + cpt_images + '" image="'+that.id+'">...' + that.id.slice(-12) + '</a>');
                var dom_segment = $('<div class="ui tab segment '+ active +'" style="position:relative;" data-tab="tab_image_' + cpt_images + '"></div>');
                var dom_mask = $('<div id="maskCurrentSelection" style="display:none;float: left;position: absolute;left: 59px;top: 150px;width: 934px;height: 76px;background-color: rgba(110,207,245,0.3);"></div>');
                var dom_img = $('<img src="' + filepath + that_image + '" id="' + that.id + '" />');

                dom_img.load(function() {

                    if(that.id == fileids[0]){
                        o_imgAreaSelect = $('#images-compo [data-tab=tab_image_1] img').imgAreaSelect({
                            instance: true,
                            handles: true,
                            fadeSpeed: 200,
                            parent: $('#images-compo'),
                            onSelectEnd: preview
                        });
                    };
                
                    $(".images-tab .item").bind("click", function () {
                    //$(document).bind("click",".images-tab .item", function () {

                        $(".images-tab .item").removeClass("active");
                        var that = $(this);
                        var id_img = that.attr('data-tab');
                        that.tab('deactivate all')
                                .tab('activate tab', id_img)
                                .tab('activate navigation', id_img)
                                ;

                        var indice = $(this).attr('data-tab');

                        //console.log(indice);

                        o_imgAreaSelect.cancelSelections();
                        o_imgAreaSelect.remove();

                        o_imgAreaSelect = $('#images-compo [data-tab="' + indice + '"] img').imgAreaSelect({
                            instance: true,
                            handles: true,
                            fadeSpeed: 200,
                            parent: $('#images-compo'),
                            onSelectEnd: preview
                        });
                    });

                    $.each(fileids,function(im){
                        if(fileids[im] == that.id){
                            //toload[im] = e.total;
                            loaded[im] = 100000; 
                        }
                    });

                    $('progress').val(progressCompute(toload,loaded));
                });
                //TODO: OPTIMISER CAR 2 chargement pas image : XHR + IMG REQUEST SEE NETWORK ACTIVITY) var dom_img = $('<test />');
                
                dom_segment.append(dom_mask).append(dom_img);

                if(div_image_tab.find('.item').length > 0){
                    div_image_tab.find('.item:last').after(dom_tab_item);
                }else{
                    div_image_tab.append(dom_tab_item);
                }
                div_image_tab.append(dom_segment);
                
                        
                        ////////
                /*
                $.ajax({
                    url: filepath + that_image, 
                    type: 'get',
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        if(XMLHttpRequest.status === 404){
                           notifier("Fichier image introuvable.","error","tr#"+this.id);
                           nb_error++;
                           //console.log()
                           $("tr#"+this.id).addClass('error');
                        }
                    },
                    success: function(data){
                        //console.log(this);
                        //: jquery object style code

                        if(cpt_images==1){
                            o_imgAreaSelect = $('#images-compo [data-tab=tab_image_1] img').imgAreaSelect({
                                instance: true,
                                handles: true,
                                fadeSpeed: 200,
                                parent: $('#images-compo'),
                                onSelectEnd: preview
                            });
                        }
                        
                        $(".images-tab .item").bind("click", function () {
                        //$(document).bind("click",".images-tab .item", function () {

                            $(".images-tab .item").removeClass("active");
                            that = $(this);
                            var id_img = that.attr('data-tab');
                            that.tab('deactivate all')
                                    .tab('activate tab', id_img)
                                    .tab('activate navigation', id_img)
                                    ;

                            var indice = $(this).attr('data-tab');

                            console.log(indice);

                            o_imgAreaSelect.cancelSelections();
                            o_imgAreaSelect.remove();

                            o_imgAreaSelect = $('#images-compo [data-tab="' + indice + '"] img').imgAreaSelect({
                                instance: true,
                                handles: true,
                                fadeSpeed: 200,
                                parent: $('#images-compo'),
                                onSelectEnd: preview
                            });
                        });

                    }
                });
                */
            });


            $("#images-compo").append(div_image_tab);
        }else{

        }
        
        if(o_Currentdocument.resources.hasOwnProperty('audio') && (o_Currentdocument.resources.audio !== "")){
            //get audio
            nb_files++;
            fileids.push(o_Currentdocument.resources.audio);
            toload.push(1000000);
            loaded.push(0);

            wavesurfer.load(filepath+o_Currentdocument.resources.audio);
            addInfoRessource({id:o_Currentdocument.resources.audio,type:"audio"});
        }

    }

    if(nb_files==0){
        $("#loading").removeClass('active');
    }

    if(o_Currentdocument.hasOwnProperty('annotations')){
        //get annotations
        refreshAnnotations(); 
    }else{
        displayMetadata(o_Currentdocument.metadata, $('#metadata-data'),"rgba(0,0,0,0.2)","dashed");
    }  
}
//____________________________________________________________________________________
//____________________________________________________________________________________
    // RAFRAICHISSEMENT DE LA LISTE DES DOCUMENTS DE L'UTILISATEUR POUR LA LANGUE SELECTIONNEE

    function refreshDocLang(langue) {

        //console.log('refreshDocLang:');

        $("#select-document tbody").empty();
        $("#select-langue tbody").empty();
        $("#select-ressources tbody").empty();

        $("#step0Next").hide();

        $("#stepDesc1").addClass("disabled");
        $("#stepDesc2").addClass("disabled");
        $("#stepDesc3").addClass("disabled");


        $.each(documents, function () {
            /*var json_document = JSON.stringify(this);
             var document = $.parseJSON(json_document);*/
        
             //CORRECTION EVOL Plusieurs sujets dans un doc (27/05/2015)
             var langues_doc = new Array();
            $.each(this.metadata.subject,function(){
                langues_doc.push(this.codelang);
            });
            

            //if (this.metadata.crdos[0].subject.codelang == langue) {
            if ($.inArray(langue,langues_doc) !== -1) {
                
                var htmlToAppend = '<tr id="' + this.id + '">';
                htmlToAppend += '<td class="ui accordion">';


                htmlToAppend += '<div class="title">';
                htmlToAppend += '<i class="dropdown icon"></i>';
                htmlToAppend += this.metadata.title.title;
                htmlToAppend += '</div>';

                htmlToAppend += '<div class="content ui small message info">';
                htmlToAppend += '<p>'+messages("fichier")+' : ' + this.id + '</p>';

                $.each(this.metadata.contributors, function () {
                    if (this.code == "speaker")
                        htmlToAppend += '<p>'+messages("locuteur")+' : ' + this.contributor + '</p>';
                });

                if(this.hasOwnProperty('resources')){
                    if(this.resources.hasOwnProperty('images')){
                        $.each(this.resources.images, function () {
                            htmlToAppend += '<p>' +messages("ressource") +' : <i class="ui icon photo"></i> ' + this.id + '</p>';          
                        });
                    }
                    
                    if(this.resources.hasOwnProperty('audio')){
                        htmlToAppend += '<p>' +messages("ressource") +' : <i class="ui icon music"></i> ' + this.resources.audio + '</p>';
                    }
                }

                

                htmlToAppend += '</div>';

                htmlToAppend += '</td>';
                //htmlToAppend += '<td>' + this.metadata.crdos[0].datestamp + '</td>';
                htmlToAppend += '<td>';

                htmlToAppend += '<a class="ui"><i class="ui red icon trash"></i></a>';
                htmlToAppend += '<a class="ui action-select-document" idDoc="' + this.id + '"><i class="ui icon check"></i></a>';
                htmlToAppend += '</td></tr>';

                $("#select-document > tbody").append(htmlToAppend);

                $("#select-document tbody .ui.trash").bind("click", function () {
                    //var token = "<?php echo Yii::app()->request->csrfToken; ?>";
                    var id_doc = $(this).parent().parent().parent().attr('id');

                    $('.basic.modal').find('.header').html(messages("Supprimer"));
                    $('.basic.modal').find('.content .right').html(messages("Supprimer le document ? (les ressources associées seront également supprimées)"));

                    $('.basic.modal').modal('setting', {
                        closable: false,
                        onDeny: function () {
                            //return false;
                        },
                        onApprove: function () {
                            $.ajax({
                                url: "deleteDocument",
                                data: {
                                    YII_CSRF_TOKEN: token,
                                    iddoc: id_doc,
                                    user: user
                                },
                                type: 'POST',
                                success: function (response) {
                                    //console.log(response);
                                    location.reload();
                                    notifier(messages("Suppression du document réussie."),"success");
                           
                                    //refreshUserDoc(token);
                                },
                                error: function (resultat, statut, erreur) {
                                    //sinon on le crée
                                    notifier(messages("Erreur lors de la suppression du document (delDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                           
                                }
                            });
                        }
                    }).modal('show');


                });

                $('.images-doc.menu .item')
                        .tab('deactivate all')
                        .tab('activate tab', 'third')
                        .tab('activate navigation', 'third')
                        ;
            }

        });

        $('.ui.accordion').accordion();

        //$("#select-document > tbody > tr").bind("click", function () {
        $(".action-select-document").bind("click", function () {
            alert(messages('Le document va se charger. Cela peut prendre plusieurs secondes à minutes selon le nombre et la taille des fichiers. Merci de patienter.'));
            //$('#loading').show();
            $("#loading").addClass('active'); 

            $('#metadata-data').empty();
            
            $("#newdoc").hide();
            var id_doc = $(this).attr('idDoc');

            $("#uploaded-document").val(id_doc);
            $("#import-iddoc").val(id_doc);

            $("#select-document > tbody > tr").removeClass("active");
            $(this).parent().parent().addClass("active");
            //console.log(id_doc);

            localStorage.setItem('document', id_doc);
            currentDocument = id_doc;

            $("#step0Next").show();
            $("#stepDesc1").removeClass("disabled");
            $("#stepDesc2").removeClass("disabled");
            $("#stepDesc3").removeClass("disabled");
            

            //getDoc(id_doc);

            $.each(documents,function(){
                //if(this['metadata_file']==id_doc)
                if(this['id']==id_doc){
                    $("#loading .loader").html(messages("Chargement en cours"));
                    o_Currentdocument = this;
                    getDocument();
                    //$("#loading").removeClass('active');

                }
            });


            $("#selected-doc").html(o_Currentdocument.metadata.title.title + "</b>&nbsp;<div class='ui icon green button'><i class='icon download disk'></i></div>");

            //bouton de téléchargement
            $('#selected-doc .button').bind('click', function () {

                $.ajax({
                    url: 'zipDoc',
                    data: {
                        YII_CSRF_TOKEN: token,
                        iddoc: id_doc,
                        user: user
                        /*metadata_file: $("#select-document > tbody > tr.active").attr('id'),
                        directory: $("#user").val()
                        */

                    },
                    type: 'POST',
                    dataType: 'text',
                    success: function (result) {
                        // ZIP SUR LE VRAI FICHIER
                        var url_file = window.location.href.split('index.php')[0]+ "documents/"+user+"/"+id_doc+"/"+result;

                        var link = document.createElement('a');
                        document.body.appendChild(link);
                        link.href = url_file;
                        link.download = $("#select-document > tbody > tr.active").attr('id') + '.zip';
                        link.click();
                        notifier(messages("Création de l'archive réussie."),"success");
                    
                        
                    },
                    error: function (resultat, statut, erreur) {
                        notifier(messages("Erreur lors de la création de l'archive (zipDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                    
                    }
                });
            });
            /*$.each(activeTabs,function(){
                $('[id-selection="'+this+'"]').show().addClass('active');
            });*/
            bindAutocomplete();

            //getJSON(id_doc.replace('metadata_','').replace('.xml',''),user);
            ////////////////
            $('#selected-doc').show();
            //$('#selected-doc').css('display','block');
            //$("#loading").removeClass('active');

        });
        
             
        if($('#identifier-doc').html().length > 0){
            //console.log('select on ' + $('#identifier-doc').html())
            $("#metadata_" + $('#identifier-doc').html()).click();
        }
        
        return true;
    }

//____________________________________________________________________________________
//____________________________________________________________________________________
    // RAFRAICHISSEMENT DE LA PAGE EN FONCTION DE L'UTILISATEUR

    function refreshUserDoc(token) {
        //console.log('refreshUserDoc:');
        var res = false;
        //Récupération de la liste des documents de l'utilisateur
        //return $.post('getListDocUser',{YII_CSRF_TOKEN: token,user: user},
        return $.post('getListJSON',{YII_CSRF_TOKEN: token,user: user},
            function (result) {

                documents.length = 0;
                langues_user.length = 0;
                $("#select-document tbody").empty();
                $("#select-langue").empty();
                $("#select-langue").parent().find("div.text").empty();
                $("#selected-doc").empty();

                var data = jQuery.parseJSON(result);
                // ON AFFICHE LES DOCUMENTS DE L'UTILISATEUR DANS LA LISTE
                $.each(data, function (index, document) {
                    if(document){
                        //console.log(document);
                        $.each(document['metadata']['subject'],function(index,subject){
                            langues_user.push({"codelang":this['codelang'],"subject":this['subject']});
                        });
                        
                        //langues_user.push(document['crdos'][0]['subject']['codelang']);
                        
                        documents.push(document);
                    }

                });

                langues_user = $.unique(langues_user);
                langues_user.sort();
                
                
                $.each(langues_user, function () {  
                    var active_item="";
                    if(this['codelang'] == currentLangue){ 
                        //console.log(currentLangue);
                        active_item = " active";
                    }
                    $("#select-langue").append('<div class="item'+active_item+'" data-value="' + this['codelang'] + '">' + this['subject'] + '</div>');
                });
                
                $("#select_subject").dropdown('setting','onChange',function (val) {
                   
                    currentLangue = val;
                    localStorage.setItem('langue',val);
                    refreshDocLang(val);

                });
                
                //Pour charger automatiquement le document en cours de travail
                //console.log(currentDocument);
                $("#select_subject").dropdown('set selected',currentLangue);
                $("#select-langue .item.active").click();
                $('#select-document tr[id="'+currentDocument+'"]').click(); 
                //
                
                $("[id='"+localStorage.getItem('step')+"']").click();
                
                $('table').tablesort();
                //$("#select-langue").change();
                res = true;
            }
            
        ).promise();

        
    }

function getAnnotationsFromUser(div){
    var result = new Object;
    result.id = div.attr('id-selection');
    var div_recording = div.children('.recording');
    var div_image = div.children('.image');
    var div_transcriptions = div.children('.transcriptions');
    var div_traductions = div.children('.traductions');

    //audio data
    var audio_start = div_recording.find('.audio.start').val();
    var audio_end = div_recording.find('.audio.end').val();
    result.startPosition = audio_start;
    result.endPosition = audio_end;

    //image data
    var image = div_image.find('.image > div').attr('image');
    var x1 = parseInt(div_image.find('.image > div').attr('x1'));
    var y1 = parseInt(div_image.find('.image > div').attr('y1'));
    var w = parseInt(div_image.find('.image > div').attr('w'));
    var h = parseInt(div_image.find('.image > div').attr('h'));
    var x2 = x1 + w;
    var y2 = y1 + h;
    /*
    result.x1 = x1;
    result.y1 = y1;
    result.w = w;
    result.h = h;
    */
    result.areas = new Array();
    result.areas.push({
        image:image,
        x1:x1,
        y1:y1,
        x2:x2,
        y2:y2,
        w:w,
        h:h
    });

    //transcriptions data
    var transcriptions = new Array();
    div_transcriptions.find('.transcription > input').each(function(){
        transcriptions.push({lang:$(this).attr('lang'),transcription:$(this).val()});
    });
    result.transcriptions = transcriptions;

    //traductions data
    var traductions = new Array();
    div_traductions.find('.traduction > input').each(function(){
        traductions.push({lang:$(this).attr('lang'),traduction:$(this).val()});
    });
    result.traductions = traductions;

    return result;

}

function postJSON(parameters){
    $.ajax({           
            url: "storeJSON",
            data: {
                YII_CSRF_TOKEN: token,
                id: parameters.id,
                jsonfile: parameters.jsonfile,
                user: parameters.user,
                content: parameters.content
            },
            //datatype: 'json',
            type: 'POST',
            success: function (response) {
                //notifier(messages("Document enregistré sur le serveur."),"success");  
                //console.log(parameters.jsonfile+".json mis à jour sur le serveur")                                      
            },
            error: function (request, status, error) {
                //BUG AU MOMENT DE LA CREATION D'UN NOUVEAU TJRS MESSAGE ERREUR --> attente d'un format JSON retourné par le serveur ?
                notifier(messages("Erreur lors de la sauvegarde du document (json).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                //console.log(error);
                //console.log(request);
            }
        });
}
//TODO function with parameter on sentence ID to update only sentence JSON file
//NOT USED !
function postAllJSON(){
    var result = new Object;
    result.metadata = new Object;
    result.annotations = new Object;

    result.id = currentDocument.split('metadata_')[1].replace('.xml','');
    result.user = user;
    result.annotations.sentences = new Array();

    $('#annotations #annotations-sentences > div > .content').each(function(){
        
        var data = getAnnotationsFromUser($(this));
        //data.words = new Array();
        data.children = new Array();
        var div_words = $(this).find('.words > div > .content');

        div_words.each(function(){
            var data_word = getAnnotationsFromUser($(this));
            data.children.push(data_word);
        });

        result.annotations.sentences.push(data);
    });  

    $.each(result.annotations.sentences,function(){
        postJSON({id: result.id,jsonfile: this.id,user: user,content: this});
    });

    localStorage.setItem('annotations',JSON.stringify(result));
    //console.log(result);
    //console.log(o_Currentdocument);

}
//getJSON reparse le JSON sur le serveur pour prendre en compte les changements de contenu suite à l'ajout de ressources notamment 
function getJSON(id,user){

    $.ajax({                   
        url: "getJSON",
        data: {
            YII_CSRF_TOKEN: token,
            user:user,
            iddoc: id,
            jsonfile: id
        },
        type: 'POST',
        success: function (response) {
            notifier(messages("Document téléchargé."),"success"); 
            o_Currentdocument = JSON.parse(response);   


                getDocument();
                /*$.each(activeTabs,function(){
                    $('[id-selection="'+this+'"]').show().addClass('active');
                });
                */
                bindAutocomplete();
                $("#loading").removeClass('active');

                                                 
        },
        error: function (request, status, error) {
            
            notifier(messages("Erreur lors du téléchargement du document (json).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
            //console.log(error);
            //console.log(request);
            return false;
        }
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// DOCUMENT CHARGE
// 
// 
/////////////////////////////////////////////////////////////////////////////////////////////////
$( document ).ajaxStart(function() {
  $("#loading").addClass('active');
});
$( document ).ajaxStop(function() {
  $("#loading").removeClass('active');
});

    $(document).ready(function () {

        //____________________________________________________________________________________
        // AFFICHAGE DU FORMULAIRE D'AJOUT DE RESSOURCE POUR LE DOCUMENT
        $("#btn-refresh-preview").on("click", function () {
            refreshPreview();
        });

        //____________________________________________________________________________________

        $( ".sortable" ).sortable();
        $( ".sortable" ).disableSelection();
        
        //on cache la barre d'édition au début
        $("#audio-compo").toggle();

        //on construit la sidebar pour les annotations
        $('#annotations')
                .sidebar({
                    exclusive: false,
                    onShow: function () {
                        $('#open-annotations').css('right', $(this).width());
                    },
                    onHide: function () {
                        $('#open-annotations').css('right', 0);
                    }
                })
                .sidebar('attach events', '#open-annotations', 'toggle')
                ;
        //on construit la sidebar pour les metadata
        $('#metadata')
                .sidebar({
                    exclusive: false,
                    onShow: function () {
                        $('#open-metadata').css('right', $(this).width());
                    },
                    onHide: function () {
                        $('#open-metadata').css('right', 0);
                    }
                })
                .sidebar('attach events', '#open-metadata', 'toggle')
                ;

        //si un document est sélectionné dans la liste -> $("#select-document  tr.active").length
        $("#loading .loader").html(messages("Chargement du formulaire"));
        $("#loading").addClass('active'); 

        $("#form-compo").formToWizard({
            submitButton: 'Enregistrer',
            //prevLbl:messages("Précédent"),
            //nextLbl:messages("Suivant")
        });
        $("#loading").removeClass('active'); 
        $('#form-compo').show();

        //$("button.next").hide();//A revoir plus tard au moment des annotations
        $("#step0Next").hide();
        
        //par défaut on cache les boutons de suppressions de lignes input
        $('#newdoc .fields .remove').hide();

        $("#form-compo button[id^='step']").on('click', function () {
            if ($("#step2").css('display') == 'block') {
                $("#audio-compo").show();
                wavesurfer.drawBuffer();
            } else {
                $("#audio-compo").hide();
            }

        });

        $("[id^='stepDesc']").on('click', function () {
            localStorage.setItem('step',$(this).attr('id'));
            if ($("#step2").css('display') == 'block') {
                $("#audio-compo").show();
                wavesurfer.drawBuffer();
            } else {
                $("#audio-compo").hide();
            }

        });
  
        jQuery("#upload-wrapper").detach().insertAfter('#btn-add-crdo');
        jQuery("#newdoc").detach().insertAfter('#btn-add-doc');
        jQuery("#import-form").detach().insertAfter('#btn-import-doc');


        user = $("#user").val();
        localStorage.setItem('user', user);


        //var token = "<?php echo Yii::app()->request->csrfToken; ?>";

        $("#uploaded-user").val(user);
        $("#import-user").val(user);

        $("#form-newdoc .field").each(function () {
            $(this).children("input").attr("placeholder", $(this).children("label").html());
            $(this).addClass('ui small input');
        });

        //_______________________________________________________
        // INITIALISATION DU WAVESURFER
        //_______________________________________________________
        
        //DEPRECATED
        /*
        wavesurfer.init({
            container: document.querySelector('#waveform'),
            scrollParent: true,
            minPxPerSec: 200,
            waveColor: 'violet',
            progressColor: 'purple',
            selectionColor: '#ccc',
            height: 100,
            normalize: true
        });
*/
        wavesurfer.on('loading', function (e) {
            //$("#loading .loader").html(messages("Chargement du fichier audio"));
            //console.log(e);
            //$('#progress_audio').attr('value',e);
            //$('progress').max = e.total;
            //$('progress').val($('progress').val() + e);
            loaded[o_Currentdocument.resources.images.length] = e * 10000;
            $('progress').val(progressCompute(toload,loaded));

        });
        
        wavesurfer.on('ready', function () {

            var totalPixels = $('#waveform').width();
            var minRatio = Math.round(totalPixels/wavesurfer.getDuration());
            var maxRatio = Math.round(32000/wavesurfer.getDuration());

            $('#slider').attr('min',minRatio).attr('max',maxRatio);

            timeline.init({
                wavesurfer: wavesurfer,
                container: '#waveform-timeline'
              });

            //$("#loading").removeClass("active");
            //wavesurfer.toggleScroll();
            wavesurfer.enableDragSelection(
                {
                    //'region-created':function(){//console.log(e);},
                    'color':'rgba(0,0,0,0.3)'
                    
                });

            wavesurfer.on('region-created',function(e){
                $('wave region[data-id!="'+$(e.element).attr('data-id')+'"]').remove();
            });
            
            wavesurfer.on('region-updated',function(e){
                ////console.log(e);
                var eid = e.id;
                ////console.log(wavesurfer.regions.list[eid].start);
                $('#startPosition').val(e.start);
                $('#endPosition').val(e.end); 

                $('input.audio.start:enabled').val(e.start);
                $('input.audio.end:enabled').val(e.end);


            });
            
            wavesurfer.on('region-dblclick',function(e){
                e.remove();
            });


        });
        
        wavesurfer.on('pause',function(){
            $('.play-selection i.stop').removeClass('stop').addClass('play');
            $('.play-selection').removeClass('stop');

        });
        
        wavesurfer.on('error', function () {
            $("#loading").removeClass("active");
            $("#select-ressources .music").parent().parent().addClass('error');

            notifier("Fichier audio introuvable.","error",$("#select-ressources .music").parent().parent().attr('id'));
        });

        



        rules_newdoc = {
            title: {
                identifier: 'title_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un titre'
                    }
                ]
            },
            titlelangue: {
                identifier: 'title_1_langue', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir la langue du titre'
                    }
                ]
            },
            codelangue: {
                identifier: 'codelangue_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un code langue'
                    },
                    {
                        type: 'maxLength[3]',
                        prompt: 'Le code langue doit être sur 3 caractères'
                    }
                ]
            }, codelanguerec: {
                identifier: 'codelanguerec_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un code langue'
                    },
                    {
                        type: 'maxLength[3]',
                        prompt: 'Le code langue doit être sur 3 caractères'
                    }
                ]
            },
            codepays: {
                identifier: 'codepays', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un code pays'
                    },
                    {
                        type: 'maxLength[2]',
                        prompt: 'Le code pays doit être sur 2 caractères'
                    }
                ]
            }, lieu: {
                identifier: 'spatial_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un lieu'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
            }, depositor: {
                identifier: 'depositor_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un dépositaire'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
            }, researcher: {
                identifier: 'researcher_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un chercheur'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
            }, sponsor: {
                identifier: 'sponsor_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un sponsor'
                    }
                ]
            }, publisher: {
                identifier: 'publisher_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir un éditeur'
                    },
                    {
                        type: 'length[2]',
                        prompt: 'Veuillez saisir au moins 2 caractères'
                    }
                ]
              }, 
//            identifieruser: {
//                identifier: 'identifier-user', rules: [
//                    {
//                        type: 'empty',
//                        prompt: 'Veuillez saisir un identifiant de document'
//                    },
//                    {
//                        type: 'length[2]',
//                        prompt: 'Veuillez saisir au moins 2 caractères'
//                    }
//                ]
//            }

        };

        $('#newdoc').form(rules_newdoc, {
            inline: true,
            on: 'blur'
        });

        rules_newselection = {
            transcription: {
                identifier: 'transcription_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir une transcription'
                    }
                ]
            },
            transcriptionlangue: {
                identifier: 'transcription_1_langue', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir la langue de la transcription'
                    }
                ]
            },
            traduction: {
                identifier: 'traduction_1', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir une traduction'
                    }
                ]
            },
            traductionlangue: {
                identifier: 'traduction_1_langue', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez saisir la langue de la traduction'
                    }
                ]
            },
            startPosition: {
                identifier: 'startPosition', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez sélectionner une plage audio'
                    }
                ]
            },
            endPosition: {
                identifier: 'endPosition', rules: [
                    {
                        type: 'empty',
                        prompt: 'Veuillez sélectionner une plage audio'
                    }
                ]
            }

        };

        $('#newselection').form(rules_newselection, {
            inline: true,
            on: 'blur'
        });

        refreshUserDoc(token);


//____________________________________________________________________________________
//____________________________________________________________________________________


        // AJOUT D'UNE LIGNE DE SAISIE
        $(".btn-add-input-line").click(function () {

            //var $new_div_title = $("<div class='" + $(this).parent().parent()[0].className + "'></div>");
            var $new_div = $(this).parent().parent().clone(true,true);
            $(this).parent().parent().after($new_div);
            $new_div.find('.remove').show();
//          $(this).hide();
            //$new_div.append($(this).parent().parent().html());

            $new_div.find('input').val('');
            var id = $(this).parent().parent().find('input:first').attr('id');
            
            var id_array = id.split('_');
            var id_num = parseInt(id_array[1]) + 1;

            $new_div.find('input').each(function(){    
                var id = $(this).attr('id');
                var id_array = id.split('_');
                var new_id_id = id_array[0] + '_' + id_num;
                $(this).attr('id', new_id_id); 
                $(this).attr('name', new_id_id); 
                
                var actarget = $(this).attr('actarget');
                if(typeof actarget!== typeof undefined && actarget !== false){   
                    var actarget_array = actarget.split('_');
                    var new_id_actarget = actarget_array[0] + '_' + id_num;
                    $(this).attr('actarget', new_id_actarget); 
                }       
            });

            //CHECK CORRECTION REVUE LACITO 08/01/2015 : liste déroulante pour valeurs de transcription
            $new_div.find('.ui.dropdown').each(function () {
                $(this).dropdown();
            });
        });
        
        $(".remove, .btn-remove").click(function () {
            $(this).parent().parent().remove();
        });

//____________________________________________________________________________________
//____________________________________________________________________________________


        // CODES LANGUES ISO
//        $('body').on('keyup', '.codelangue', function() {
//
//            var that = $(this);
//            $.post(
//                'getLanguageFromISO',
//                {
//                    YII_CSRF_TOKEN: token,
//                    codelang: $(this).val(),
//                },
//                function (result) {
//                    //$("#subject").val(result);
//                    //console.log(that);
//                    ////console.log($(this).parent().next().find('input').attr('id'));
//                    that.parent().next().find('input').val(result);
////                    $("#subject").next('.label').html(result);
//                }
//            );
//            var d = new Date();
//            $("#identifier-doc").html('crdo-' + $(this).val().toUpperCase() + '_' + $("#user").val() + '_' + d.getTime().toString());
//        });

//____________________________________________________________________________________
//____________________________________________________________________________________


        // GOOGLE MAP API: MISE A JOUR DES LOCALITES EN FONCTION DU PAYS SELECTIONNE
        $("input#codepays").on('change', function () {

            var input = document.getElementById('spatial_1');
            var options = {componentRestrictions: {country: $(this).val()}};
            var autocomplete = new google.maps.places.Autocomplete(input, options);

            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();

                /* CORRECTION REVUE LACITO 08/01/2015 : 2 chiffres après la virgule */
                $("input#spatial_lat").val(Math.round(place.geometry.location.lat() * 100) / 100);
                $("input#spatial_long").val(Math.round(place.geometry.location.lng() * 100) / 100);

            });
        });
                
        $("#select_transcription").dropdown();
        $('.ui.radio.checkbox').checkbox();

//____________________________________________________________________________________
//____________________________________________________________________________________

        // CREATION D'UN NOUVEAU DOCUMENT
        $("#creer-doc").click(function () {

            if ($('#newdoc').form('validate form')) {

                //var token = "<?php echo Yii::app()->request->csrfToken; ?>";

                var depositors = new Array();
                var researchers = new Array();
                var speakers = new Array();
                var recorders = new Array();
                var interviewers = new Array();
                var sponsors = new Array();
                //BUG: oubli 060315
                var publishers = new Array();

                $(".depositor").each(function () {
                    depositors.push($(this).val());
                });
                $(".researcher").each(function () {
                    researchers.push($(this).val());
                });
                $(".speaker").each(function () {
                    speakers.push($(this).val());
                });
                $(".recorder").each(function () {
                    recorders.push($(this).val());
                });
                $(".interviewer").each(function () {
                    interviewers.push($(this).val());
                });
                $(".sponsor").each(function () {
                    sponsors.push($(this).val());
                });
                //BUG oubli 060315
                $(".publisher").each(function () {
                    publishers.push($(this).val());
                });
                
                var contributors = {
                    depositor: depositors,
                    researcher: researchers,
                    speaker: speakers,
                    recorder: recorders,
                    interviewer: interviewers,
                    sponsor: sponsors

                };

                var title = new Array();

                $(".doc-title").each(function () {
                    var title_langue = $(this).parent().parent().find('.doc-title-langue').val();
                    //console.log(title_langue);
                    title.push({title: $(this).val(), lang: title_langue});
                });

                /* CORRECTION REVUE LACITO 08/01/2015 */
                var codelanguerec = new Array();

                $(".codelanguerec").each(function () {
                    codelanguerec.push($(this).val());
                });
                /**/

                var spatial = {
                    place: $("#spatial_1").val(),
                    geo: {
                        east: $("#spatial_long").val(),
                        north: $("#spatial_lat").val()
                    }, 
                    countrycode: $("#codepays").val(),
                    lang:'en'
                };
                
                /* CORRECTION REVUE LACITO 27/05/2015 */
                var subject = new Array();

                $(".codelangue").each(function () {
                    subject.push({
                        codelangue:$(this).val(),
                        subject:$(this).parent().next().find('.subject').val()
                    });
                });
                /*        
                var subject = {
                    codelang: $("#codelangue").val(),
                    subject: $("#subject").val(),
                };
                */

                $.ajax({
                    url: "createDocument",
                    dataType: 'json',
                    data: {
                        YII_CSRF_TOKEN: token,
                        user: user,
                        id: $('#identifier-doc').html(),
                        title: title,
                        languages: codelanguerec,
                        subject: subject,
                        spatial: spatial,
                        contributors: contributors,
                        publishers: publishers,
                        format: $('#format').val(),
                        type: $('#type').val(),
                        conformsTo: '',
                        identifier: $('#identifier-doc').html(),
                        isFormatOf: $('#identifier-doc').html() + '.xhtml',
                        isPartOf: $('#ispartof').val(),
                        collection: $('#collection').val(),
                        accessRights: $('#accessrights').val(),
                        license: $('#license').val(),
                        rights: $('#rights').val()
                    },
                    type: 'POST',
                    success: function (response) {
                        $("#newdoc").hide();
                        //console.log("Document créé");
                        //DEPRECATED
                        //currentDocument = "metadata_"+$('#identifier-doc').html()+".xml";
                        currentLangue = $('#codelangue_1').val();
                        localStorage.setItem('document',currentDocument);
                        localStorage.setItem('langue',currentLangue);
                        
                        //console.log(currentDocument);
                        
                        location.reload();
                        //TODO reload doc
                        notifier(messages("Création du document réussie."),"success");
                                                              

                    },
                    error: function (request, status, error) {
                        //TODO : BUG AU MOMENT DE LA CREATION D'UN NOUVEAU TJRS MESSAGE ERREUR
                        console.log(status);
                        console.log(error);
                        //console.log("Erreur création Document");
                        notifier(messages("Erreur lors de la création du document (createDoc).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");
                           
                        refreshDocLang($("#codelangue").val());
                        //$("#newdoc").form('add prompt', 'identifier-user', "Un document porte déjà ce nom. Veuillez changer d'identifiant.");
                    }
                });

            } else {
                $('#newdoc').find('.field.error:first input').focus();
            }
        });


//____________________________________________________________________________________
//____________________________________________________________________________________

        // CREATION D'UNE NOUVELLE SELECTION (MOT, PHRASE)
        $("#creer-selection").click(function () {

            if ($('#newselection').form('validate form')) {

                //var token = "<?php echo Yii::app()->request->csrfToken; ?>";

                var transcriptions = new Array();
                var traductions = new Array();
                var selected_areas = new Array();//deprecated, use following areas instead
                var areas = new Array();


                $.each(o_imgAreaSelect.getSelections(), function () {
                    selected_areas.push({
                        image: $('.images-tab a.item.active').attr('image'),
                        area: this
                    });

                    areas.push({
                        image: $('.images-tab a.item.active').attr('image'),
                        h:this.height,
                        w:this.width,
                        x1:this.x1,
                        y1:this.y1,
                        x2:this.x2,
                        y2:this.y2
                    });
                });

                $("#newselection .transcription").each(function () {
                    //var transcription_langue = $(this).parent().parent().find('.transcription-langue').val();
                    var transcription_langue = $(this).parent().parent().find('.transcription-langue').find('.item.active').attr('data-value');
                    /*  : CORRECTION REVUE LACITO 08/01/2015 : liste déroulante 4 type de transcriptions */
                    //console.log(transcription_langue);
                    transcriptions.push({transcription: $(this).val(), lang: transcription_langue});
                });

                $("#newselection .traduction").each(function () {
                    var traduction_langue = $(this).parent().parent().find('.traduction-langue').val();
                    //console.log(traduction_langue);
                    traductions.push({traduction: $(this).val(), lang: traduction_langue});
                });
                
                
                if($("#startPosition").val().trim()===""){
                    var sp = 0;
                }else{
                    var sp = parseFloat($("#startPosition").val());
                }
                
                if($("#endPosition").val().trim()===""){
                    var ep = 0;
                }else{
                    var ep = parseFloat($("#endPosition").val());
                }
                
                var motphrase = $("[name=motphrase]:checked").attr('id');

                //update DOM 
                var parameters ={
                    startPosition: sp,
                    endPosition: ep,
                    selectedAreas: areas,
                    transcriptions: transcriptions,
                    traductions: traductions,
                    motphrase: motphrase
                };

                var motphrase = (parameters.motphrase == "phrase") ? 'S' : 'W' ;

                var prefixId = o_Currentdocument.id.replace('crdo-','');

                var idMax = 0;
                var idSentenceMax = 0;
                var idWordMax = 0;


                //var newId = prefixId + '_' + motphrase;

                $('#annotations-sentences > div > .title').each(
                    function(){
                        id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                        idSentenceMax = (id > idSentenceMax)?id:idSentenceMax;
                    }
                );

                $('.words > div > .title').each(
                    function(){
                        id = parseInt($(this).attr('id-selection').substr(prefixId.length+2));
                        idWordMax = (id > idWordMax)?id:idWordMax;
                    }
                );
    

                if(o_Currentdocument.hasOwnProperty('annotations')){
                    //on récupère le dernier id disponible
                    if(motphrase == 'S'){
                        idMax = idSentenceMax;
                    }else{
                        idMax = idWordMax;
                    }

                    //digit = ("000" + (idMax+1)).slice(-3);
                    //newId += digit;   
                    

                }else{
                    o_Currentdocument.annotations = {};
                    o_Currentdocument.annotations.sentences = [];
                    //newId += '001';
                    
                }

                //
                newId = generateNewId('S');

                //10/02/2017
                //MOT à MOT
                var mots = parameters.transcriptions[0].transcription.trim().split(' ');

                var arrayMots = [];

                $.each(mots,function(){
                    idWordMax++;
                    //digit = ("000" + (idWordMax+1)).slice(-3);
                    digit = idWordMax+1;
                    var idWord = prefixId + '_W' + digit;

                    arrayMots.push({
                        id: idWord,
                        startPosition: parameters.startPosition,
                        endPosition: parameters.endPosition,
                        areas: parameters.selectedAreas,
                        traductions: [{'lang':'','traduction':''}],
                        transcriptions: [{'lang':parameters.transcriptions[0].lang,'transcription':this}]
                        });


                });
                //

                var annotation = {
                    id: newId,
                    startPosition: parameters.startPosition,
                    endPosition: parameters.endPosition,
                    areas: parameters.selectedAreas,
                    traductions: parameters.traductions,
                    transcriptions: parameters.transcriptions,
                    children: arrayMots
                };

                //addSelectionToDOM(selection);

                // push json on server

                
                $.ajax({
                    //url: "createSelection",
                    url: "createAnnotation",
                    dataType: 'json',
                    data: {
                        YII_CSRF_TOKEN: token,
                        user: user,
                        iddoc: o_Currentdocument.id,
                        annotation: annotation
                    },
                    type: 'POST',
                    success: function (response) {

                        notifier(messages("Création de l'annotation réussie."),"success");
                        o_Currentdocument.annotations.sentences.push(annotation);
                        refreshAnnotations();
                        //refreshPreview();
                        o_imgAreaSelect.cancelSelections();

                        $('wave region').remove();
                        checkMissingAnnotations(); 
                        
                    },
                    error: function (request, status, error) {
                        notifier(messages("Erreur lors de la création de l'annotation (createAnnotation).")+" "+messages("Veuillez reporter cet incident à l'équipe informatique."),"error");  
                    }
                });
                
                $('#audio-compo input:not(.traduction-langue):not(.transcription-langue)[type=text]').val('');
                //getDoc(currentDocument);

            } else {
                $('#newdoc').find('.field.error:first input').focus();
            }
        });

//        $("#uploaded-type").val($("[name=file-type]:checked").attr('id'));
//        $('[name=file-type]').change(function () {
//            $("#uploaded-type").val($("[name=file-type]:checked").attr('id'));
//        });

        //$("#uploaded-file")[0].files[0].name


        $("input#uploaded-file").change(function () {
 
            $("#selected-file").html($("#uploaded-file")[0].files[0].name);
            notifier(messages("Fichier importé avec succès.")+' ('+$("#uploaded-file")[0].files[0].name+')',"success");
            
        });

        $("input#annotation-file").change(function () {
 
            $("#selected-annotation-file").html($("#annotation-file")[0].files[0].name);
            notifier(messages("Fichier importé avec succès.")+' ('+$("#annotation-file")[0].files[0].name+')',"success");
            
        });
        /*
        $("input#meta-file").change(function () {
 
            $("#selected-meta-file").html($("#meta-file")[0].files[0].name);
            notifier(messages("Fichier importé avec succès.")+' ('+$("#meta-file")[0].files[0].name+')',"success");
            
        });
        */
        $('#toggleSelections').checkbox({
            "onEnable":function(){
                $('[id^="maskSelection"]').css('display','block');
                
                $('[id^="maskSelection"]').bind('click',function(){
                    var idSel = $(this).attr('id').replace('maskSelection_','');
                    
                    $('#annotations .title.active').click();
                    $('.title[id-selection^="'+idSel+'"]').click();
                    $('.content[id-selection^="'+idSel+'"] .play-selection').click();
                    
                });
            },
            "onDisable":function(){
                $('[id^="maskSelection"]').css('display','none');
            }
            
        });
      
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // AFFICHAGE DU FORMULAIRE D'AJOUT DE RESSOURCE POUR LE DOCUMENT
    $("#btn-add-crdo").on("click", function () {
        $("#upload-wrapper").toggle();
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // AFFICHAGE DU FORMULAIRE DE SAISIE D'UN NOUVEAU DOCUMENT
    $("#btn-add-doc").on("click", function () {
        $("#newdoc").toggle();
    });
    
        // AFFICHAGE DU FORMULAIRE DE SAISIE D'UN NOUVEAU DOCUMENT
    $("#btn-import-doc").on("click", function () {
        $("#import-form").toggle();
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // SOUMISSION DU FORMULAIRE D'AJOUT DE RESSOURCE/CRDO
    $('form#upload').submit(function () {

        /* nouvelle version JSON : 
        il faut:
            - valider la ressource à uploader : image ou audio
            - convertir si WAV ? Pas pour le moment
            - uploader le fichier
            - modifier le metadata.resources
        */

        $('#upload-wrapper').hide();
        ////console.log('set dimmer upload');
        $("#loading .loader").html(messages("Téléchargement en cours"));
        $('#loading').addClass('active');
        
        $('#upload-target').unbind().load(function () {
            var filename = $('#upload-target').contents().find('#filename').html();           

            $("#selected-file").html($("#upload-target body").html());
            //getDoc($("#select-document > tbody > tr.active").attr('id'));
            getJSON($("#select-document > tbody > tr.active").attr('id'),user);
            
            //$("#select-document > tbody > tr.active").click();            
        });
        
    });
    
    // SOUMISSION DU FORMULAIRE D'IMPORT DE DOC XML
    $('form#import').submit(function () {

        $('#import-form').hide();
        ////console.log('set dimmer upload');
        $("#loading .loader").html(messages("Téléchargement en cours"));
        $('#loading').addClass('active');
        
        $('#import-target').unbind().load(function () {
            var filename = $('#import-target').contents().find('#filename').html();         
            getJSON($("#select-document > tbody > tr.active").attr('id'),user);  
            
        });
        
    });

    $("#step2").show(function () {
        $("#audio-compo").show();
    });

//____________________________________________________________________________________
//____________________________________________________________________________________


    // CONTROLES AUDIO
    $('#player-controls button[data-action=play]').click(function () {
        wavesurfer.playPause();

        //if (playerAction != "playSelOnce") {
        if ($(this).find('i').hasClass('play')) {
            $(this).find('i').removeClass('play').addClass('pause');
        } else {
            $(this).find('i').removeClass('pause').addClass('play');
        }
        //}

        playerAction = $(this).attr("data-action");
        //if(wavesurfer.getSelection()){
        //wavesurfer.play(wavesurfer.getSelection().startPosition,wavesurfer.getSelection().endPosition);
        //}else{

        //}

    });

    $('#player-controls button[data-action=playSelOnce]').click(function () {
        playerAction = $(this).attr("data-action");
        var sel = wavesurfer.getSelection();
        if (sel) {
            wavesurfer.play(sel.startPosition, sel.endPosition);
            $('#player-controls button[data-action=play] i').removeClass('play').addClass('pause');
            //wavesurfer.seekAndCenter(sel.startPercentage);
        }

    });
    /*
     $('#player-controls button[data-action=playSelLoop]').click(function() {
     wavesurfer.playPauseSelection();
     });
     */
    $('#player-controls button[data-action=rewind]').click(function () {
        playerAction = $(this).attr("data-action");
        wavesurfer.stop();
        wavesurfer.seekAndCenter(0);
        $('#player-controls button[data-action=play] i').removeClass('pause').addClass('play');


    });

    $('#player-controls button[data-action=toggleScroll]').click(function () {
        wavesurfer.toggleScroll();

        var sel = wavesurfer.getSelection();
        var SP = sel.startPercentage;
        var EP = sel.endPercentage;

        wavesurfer.updateSelection({startPercentage: SP, endPercentage: EP});
        ////console.log(EP);
        wavesurfer.seekAndCenter(SP);

        if ($(this).find('i').hasClass('in')) {
            $(this).find('i').removeClass('in').addClass('out');
        } else {
            $(this).find('i').removeClass('out').addClass('in');
        }
    });
    
    $('#startPosition,#endPosition').change(function(){
        
        var SP = parseFloat($('#startPosition').val()/wavesurfer.getDuration());
        var EP = parseFloat($('#endPosition').val()/wavesurfer.getDuration());

        wavesurfer.updateSelection({startPercentage: SP, endPercentage: EP});
    });
   /* 
    * 
$('#annotations .words .traduction input:text[value=""]').each(function(){
    var block = $(this).parent().parent().parent().parent();
    var transcr = block.find('.transcriptions .transcription:first input').val();
    //console.log(transcr);
    
    var inputToCopy = $('#annotations .words .title:contains("'+transcr+'")').next().find('.traductions .traduction:first input:text[value!=""]').first();
    
    var text = inputToCopy.val();
    var lang = inputToCopy.attr('lang');
    
    $(this).val(text);
    $(this).attr('lang',lang);
    
    $(this).parent().parent().find('.button.edit-annotation').click().click();
    

    });
 */

