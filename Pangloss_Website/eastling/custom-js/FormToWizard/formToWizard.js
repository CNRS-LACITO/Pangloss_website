/* Created by jankoatwarpspeed.com */

(function($) {
    $.fn.formToWizard = function(options) {
        options = $.extend({
            submitButton: "",
            prevLbl:"Précédent",
            nextLbl:"Suivant",
        }, options);

        var element = this;

        var steps = $(element).find("fieldset");
        var count = steps.size();
        var submmitButtonName = "#" + options.submitButton;
        $(submmitButtonName).hide();

        // 2
        //$(element).before("<ul id='steps'></ul>");
        //
        //
        //
        //
        //Adaptation semantic-ui
        //
        //
        //
        //
        //
        //

        $(element).before("<div class='ui steps' id='steps'></div>");

        steps.each(function(i) {

            //$(this).addClass('ui grid');

            (i == 0) ? disabled = "" : disabled = "disabled";

            $(this).wrap("<div id='step" + i + "'></div>");

            //$(this).append("<p id='step" + i + "commands'></p>");
            $(this).append("<div id='step" + i + "commands' class='ui'></div>");

            // 2
            var name = $(this).find("legend").html();
            $(this).find("legend").hide();
            //$("#steps").append("<li id='stepDesc" + i + "'>" + (i + 1) + ". <span>" + name + "</span></li>");
            $("#steps").append("<div class='ui step " + disabled + "' id='stepDesc" + i + "'>" + (i + 1) + ". <span>" + name + "</span></div>");

            $("#stepDesc" + i).bind("click", function() {
                if (!($(this).hasClass("disabled"))) {
                    showStep(i);
                }
            });

            if (i == 0) {
                //createNextButton(i);
                selectStep(i);
            }
            else if (i == count - 1) {
                $("#step" + i).hide();
                //createPrevButton(i);
            }
            else {
                $("#step" + i).hide();
                //createPrevButton(i);
                //createNextButton(i);
            }
        });

        function createPrevButton(i) {
            var stepName = "step" + i;

            //$("#" + stepName + "commands").append("<a href='#' id='" + stepName + "Prev' class='prev'>< Précédent</a>");
            $("#" + stepName + "commands").append("<button id='" + stepName + "Prev' class='prev small blue ui labeled icon button' type='button'>< "+options.prevLbl+"</button>");

            $("#" + stepName + "Prev").bind("click", function(e) {
                $("#" + stepName).hide();
                $("#step" + (i - 1)).show();
                $(submmitButtonName).hide();
                selectStep(i - 1);
            });
        }

        function createNextButton(i) {
            var stepName = "step" + i;

            //$("#" + stepName + "commands").append("<a href='#' id='" + stepName + "Next' class='next'>Suivant ></a>");
            $("#" + stepName + "commands").append("<button id='" + stepName + "Next' class='next small blue ui labeled icon button' type='button'>"+options.nextLbl+" ></button>");


            $("#" + stepName + "Next").bind("click", function(e) {
                $("#" + stepName).hide();
                $("#step" + (i + 1)).show();
                if (i + 2 == count)
                    $(submmitButtonName).show();
                selectStep(i + 1);
            });
        }

        function selectStep(i) {
            /*$("#steps li").removeClass("current");
             $("#stepDesc" + i).addClass("current");*/
            $("#steps div").removeClass("active");
            $("#stepDesc" + i).addClass("active");

        }

        function showStep(i) {
            
            for(var j=0;j<count;j++){
                $("#step" + j).hide();
            }
            
            $("#step" + i).show();
            
            /*if (i + 2 == count)
                $(submmitButtonName).show();*/
            selectStep(i);

        }

    }
})(jQuery); 