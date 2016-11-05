// JavaScript Document
function showhide(obj, n, how) {
	if (navigator.appName =="Netscape") {
		if (obj.checked) {
			document.styleSheets[2].cssRules[n].style.display = how; 
		} else {
			document.styleSheets[2].cssRules[n].style.display = 'none'; 
		}
	} else {
		if (obj.checked) {
			document.styleSheets[2].rules[n].style.display = how; 
		} else {
			document.styleSheets[2].rules[n].style.display = 'none'; 
		}
	}
}

