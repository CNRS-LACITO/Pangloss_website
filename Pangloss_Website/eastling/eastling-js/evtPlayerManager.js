/* ***** BEGIN LICENSE BLOCK *****
 *    Copyright 2002 Michel Jacobson jacobson@idf.ext.jussieu.fr
 *
 *    This program is free software; you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation; either version 2 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program; if not, write to the Free Software
 *    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * ***** END LICENSE BLOCK ***** */





//here you have to change the parameters
var styleProperty   = "border";                //what property you want to change for rendering startplay and the value of the styleProperty for a startplay event events (color, backgroundColor, fontSize, fontWeight, fontStyle,...)
var activateState   = "solid 1px #993300";         //the value of the styleProperty for a startplay event
var inactivateState = "solid 0px white";       //the value of the styleProperty for a endplay event


//-----------------------------------------------> you do not have to change these parameters
var ns = (navigator.appName =="Netscape");

//----------------------------------------------> from the applet or the plugin to the document
//what the browser should do when it recieve a startplay event
function startplay(id) {
	with(document) {
		if (ns) {
			var n = getElementById(id);
			if (n) {
				n.style[styleProperty] = activateState;
			}
		} else {
			var theItem = all.item(id);
			if (theItem) {
				eval('theItem.style.'+styleProperty+' = '+ "'" + activateState + "'");
			}
		}
	}
}
//what the browser should do when it recieve a stopplay event
function endplay(id) {
	with(document) {
		if (ns) {
			var n = getElementById(id);
			if (n) {
				n.style[styleProperty] = inactivateState;
			}
		} else {
			var theItem = all.item(id);
			if (theItem) {
				eval('theItem.style.'+styleProperty+' = '+ "'" + inactivateState + "'");
			}
		}
	}
}