
$(document).ready(function(){
    console.log('eastling_menu');
    
    $('#mainmenu')
            .sidebar({
            exclusive:false})
                .sidebar('attach events', '.toggle-menu', 'toggle')
        .sidebar('hide')
                ;
         
    
    $('#lang_user').dropdown('setting','onChange',function(val){
            localStorage.setItem('langUser',val);
            var url = window.location.href;

            var curLang = window.location.href.split('index.php/')[1].split('/')[0]; 

            var strSearch = 'index.php/' + curLang;
            var strReplace = 'index.php/' + val;

            var newUrl = url.replace(strSearch,strReplace);

            window.location.href = newUrl;
        }
    );
    
    var curLang = window.location.href.split('index.php/')[1].split('/')[0];
    if(curLang == 'fr'){
        $('#traduction_1_langue').val('fra');
        $('#title_1_langue').val('fra');
        
    }else if(curLang == 'en'){
        $('#traduction_1_langue').val('eng');
        $('#title_1_langue').val('eng');
    }
});

