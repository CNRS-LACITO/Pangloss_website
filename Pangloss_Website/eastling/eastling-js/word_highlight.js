function word_highlight(dom,highlight,strokeWidth,strokeColor){
    if(highlight){
        dom.css('border-style','solid');
        dom.css('border-width',strokeWidth+'px');
        dom.css('border-color','#'+strokeColor);
    }else{
        dom.css('border-style','none');
        dom.css('border-width','0px');
    }
}  