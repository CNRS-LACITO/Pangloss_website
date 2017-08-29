# txt2xml.pl 
# Inserts markup in plain-text glossed documents.
# Created in 2011 by Alexis Michaud.
# This is version 5 of the script, May 2013.
# Based on Boyd Michailovsky's chk_spc6_new.
# COMMANDLINE: perl -w txt2xml.pl < infile
# Messages appear on screen (can be redirected by command line >); xml output in a file "xmlout.xml".
# program treats groups of lines in fixed order. 
# sentence in IPA
# words separated by spaces and/or tabs
# French glosses
# notes: any paragraph starting with a percent sign % is a note
# French translation of sentences
# OPTIONALLY: translations into another language such as Chinese. The option must be set within the script below.

# Declaration of modules used in this script
use Encode;		# to decode UTF-8
use utf8; 			# UTF-8 coding for Unicode. 
# "UTF-8 treats the first 128 codepoints, 0..127, the same as ASCII. They take only one byte per character. 
# All other characters are encoded as two or more (up to six) bytes using a complex scheme. 
# Fortunately, Perl handles this for us, so we don't have to worry about this."
use strict; 			# All variables must be declared
use warnings; 	


my $textlineno = my $sno = my $wordsnb = my $i = my $nblines = 0;
my $textname = my $ortholine = my $formline = my $glossline = my $extraformline = my $transline = my $line = my $word =  my $morph = my $mgloss = my $testchr = my $note = my $translinecn = my $glosslinecn = my $textfr = my $textcn = my $translineen = my $texten = ""; 
my @words = my @glosses = my @morphs = my @mglosses = my @glossescn = ();
open XOUT, ">xmlout.xml";

# Selecting whether there are glosses at the word level.
my $gloss_wdlevel = 0;

# Selecting whether there are Chinese glosses (value: 1) or not (value: 0). Same for Chinese translation of entire sentence, and for English translation.
my $gloss_cn = 0;
my $transl_cn = 0;
my $transl_en = 0;
# Selecting whether there is an extra line of transcription: orthography, phonetic...
my $extratranscrlevel = 0;


# Reading first line of text, to serve as title.
$textname=<STDIN>;
# Keeping count of the number of lines of text read, for ease of reference to input text file
$nblines = 1;
# Removing line break.
chomp ($textname);

# Writing header of file
## Old version:
# print  XOUT "<xml version=\"1.0\"  encoding=\"utf-8\">\n";
# print  XOUT "<xml-stylesheet type=\"text/xsl\" href=\"showText3.xsl\">\n";
# print  XOUT "<TEXT id=\"crdo-NBF_$textname\" xml:lang=\"nbf\">\n";
# print  XOUT "<HEADER>\n";
# print  XOUT "<TITLE xml:lang=\"fr\">$textname</TITLE>\n";
# print  XOUT "<SOUNDFILE href=\"xxx.wav\"/>\n";
# print  XOUT "</HEADER>\n";

# New version (2013): 
# print  XOUT "<xml-stylesheet type=\"text/xsl\" href=\"view_text.xsl\">\n";
# <TEXT id=\"crdo-LanguageCodeInMaj_$textname\" xml:lang=\"LanguageCode\">\n";
print  XOUT "<TEXT id=\"crdo-NXQ_$textname\" xml:lang=\"nru\">\n";
print  XOUT "<HEADER>\n";

#print  XOUT "<SOUNDFILE>AudioFILE.wav</SOUNDFILE>\n";
print  XOUT "<SOUNDFILE>../audio/crdo-NXQ_$textname.wav</SOUNDFILE>\n";
print  XOUT "<TITLE xml:lang=\"fr\">$textname</TITLE>\n";
print  XOUT "</HEADER>\n";
# Treat glossed lines. Count starts at 1.
while ($line=<STDIN>) {
		# incrementing counter of sentences in output file
		$textlineno++;
		# formatting glossed-line count
		$sno = sprintf ("%03u", $textlineno);
		$ortholine=<STDIN>;#full sentence ("orthography")
		# incrementing counter of lines read in source file
		$nblines++;		
		# removing end-of-line at end of input line
		chomp $ortholine;
		# replacing angle brackets < > by an explicit description: even the corresponding XML formulas cause problems with the SoundIndex software, so other labels are used. Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
		# $ortholine =~ s{<}{&lt;}g;
		# $ortholine =~ s{>}{&gt;}g;
		$ortholine =~ s{<}{CHEVRONGAUCHE}g;
		$ortholine =~ s{>}{CHEVRONDROIT}g;

		# writing the sentence into the XML file
		print  XOUT "<S id=\"$textname", "S$sno\">\n\t<FORM kindOf=\"phono\">$ortholine</FORM>\n";

		# if there is an extra level of transcription: integrating it, with special mention
		if ($extratranscrlevel == 1) {
			$extraformline=<STDIN>; # extra level of transcription
			chomp $extraformline;
			# replacing angle brackets < > by an explicit description: even the corresponding XML formulas cause problems with the SoundIndex software, so other labels are used. Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
			$extraformline =~ s{<}{CHEVRONGAUCHE}g;
			$extraformline =~ s{>}{CHEVRONDROIT}g;
			print  XOUT "\t<FORM kindOf=\"full\">$extraformline</FORM>\n";
		} # end of condition on presence of extra level of transcription
		
		if ($gloss_wdlevel == 1) {
			$formline=<STDIN>;#reading the line that contains the morphophonological breakup into words
			$nblines++;		
			# replacing angle brackets < > by the corresponding XML formulas (otherwise they result in messy markup). Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
			$formline =~ s{<}{CHEVRONGAUCHE}g;
			$formline =~ s{>}{CHEVRONDROIT}g;
			# $formline =~ s{<}{&lt;}g;
			# $formline =~ s{>}{&gt;}g;
			chomp $formline;
			
			$glossline=<STDIN>;	# French glosses
			$nblines++;	
			chomp $glossline;
			# replacing angle brackets < > by the corresponding XML formulas (otherwise they result in messy markup). Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
			# $glossline =~ s{<}{&lt;}g;
			# $glossline =~ s{>}{&gt;}g;
			$glossline =~ s{<}{CHEVRONGAUCHE}g;
			$glossline =~ s{>}{CHEVRONDROIT}g;

			
			# Chinese glosses: only if the $gloss_cn variable was set to 1 above.
			if ($gloss_cn == 1) {
				$glosslinecn=<STDIN>;# Chinese glosses
				$nblines++;		
				chomp $glosslinecn;
				# replacing angle brackets < > by the corresponding XML formulas (otherwise they result in messy markup). Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
				# $glosslinecn =~ s{<}{&lt;}g;
				# $glosslinecn =~ s{>}{&gt;}g;
				$glosslinecn =~ s{<}{CHEVRONGAUCHE}g;
				$glosslinecn =~ s{>}{CHEVRONDROIT}g;

			# parsing this line (after replacing spaces by tabs, in case the user mistakenly used spaces instead of tabs)
				$glosslinecn =~ s/\s/\t/g;
				@glossescn = split /\t+/, $glosslinecn;
			} # end of condition on presence of Chinese glosses
		} # end of condition on presence of word-level glosses
		$transline=<STDIN>;# French translation of sentence -- or comment
		$nblines++; 		
		chomp $transline;
		# replacing angle brackets < > by the corresponding XML formulas (otherwise they result in messy markup). Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
		# $transline =~ s{<}{&lt;}g;
		# $transline =~ s{>}{&gt;}g;
		$transline =~ s{<}{CHEVRONGAUCHE}g;
		$transline =~ s{>}{CHEVRONDROIT}g;

			# Loop for the case in which there are comments. At this point there may be any number of comments. 
		# Procedure: retrieve first character in line and see if it's a %.
		$testchr = substr($transline,0,1);
		while ($testchr eq '%') {
			# substracting the first character of that line: the %. This is done inelegantly.
			$note = reverse $transline;
			chop $note;
			$note=reverse $note;
			# Writing the comment into the XML file. By default it is assumed that the comment is in French (for no better reason than because that is the language in which I write my comments). This can be changed below by changing fr to en or another language code.
			# Also, any " symbol in the message must be replaced, otherwise it will count as end of message. The < > symbols must also be replaced.
			$note =~ s{"}{'}g;
			$note =~ s{<}{CHEVRONGAUCHE}g;
			$note =~ s{>}{CHEVRONDROIT}g;
			# $note =~ s{<}{&lt;}g;
			# $note =~ s{>}{&gt;}g;
			print  XOUT "\t<NOTE xml:lang=\"fr\" message = \"$note\"/>\n";
			# Reading a new line, and deleting its final return
			$transline=<STDIN>;
			$nblines++;
			chomp $transline;
			$testchr = substr($transline,0,1);
		}
		# replacing angle brackets < > by the corresponding XML formulas (otherwise they result in messy markup). Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
		# $transline =~ s{<}{&lt;}g;
		# $transline =~ s{>}{&gt;}g;
		$transline =~ s{<}{CHEVRONGAUCHE}g;
		$transline =~ s{>}{CHEVRONDROIT}g;

		print  XOUT "\t<TRANSL xml:lang=\"fr\">$transline</TRANSL>\n";
		# adding the translation of the sentence to a translation of the whole text, to be manually edited later and to serve as a free translation at the text level
		$textfr = "$textfr$transline ";

		# Chinese translation of sentence: only if the $transl_cn variable was set to 1 above.
		if ($transl_cn == 1) {
			$translinecn=<STDIN>;# Chinese translation of sentence
			$nblines++;	
			chomp $translinecn;
			# replacing angle brackets < > by the corresponding XML formulas (otherwise they result in messy markup). Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
			# $translinecn =~ s{<}{&lt;}g;
			# $translinecn =~ s{>}{&gt;}g;
			$translinecn =~ s{<}{CHEVRONGAUCHE}g;
			$translinecn =~ s{>}{CHEVRONDROIT}g;

			print  XOUT "\t<TRANSL xml:lang=\"cn\">$translinecn</TRANSL>\n";
			# adding the translation of the sentence to a translation of the whole text, to be manually edited later and to serve as a free translation at the text level
			$textcn = "$textcn$translinecn\n";
		}
		
		# English translation of sentence: only if the $transl_en variable was set to 1 above.
		if ($transl_en == 1) {
			$translineen=<STDIN>;# English translation of sentence
			$nblines++;	
			chomp $translineen;
			# replacing angle brackets < > by the corresponding XML formulas (otherwise they result in messy markup). Note: the g at the end of the expression tells Perl to replace globally (=as many times as there are occurrences of the pattern).
			# $translinecn =~ s{<}{&lt;}g;
			# $translinecn =~ s{>}{&gt;}g;
			$translineen =~ s{<}{CHEVRONGAUCHE}g;
			$translineen =~ s{>}{CHEVRONDROIT}g;

			print  XOUT "\t<TRANSL xml:lang=\"en\">$translineen</TRANSL>\n";
			# adding the translation of the sentence to a translation of the whole text, to be manually edited later and to serve as a free translation at the text level
			$texten = "$texten$translineen\n";
		}

		# Splitting the lines with the words and their glosses. First, tabs are substituted for spaces: this takes charge of cases where the user has not used a tab between two words, which are thus separated only by a space (or several spaces) and is not parsed properly.
		$formline =~ s/\s/\t/g;
		$glossline =~ s/\s/\t/g;
		@words = split /\t+/, $formline;
		@glosses = split /\t+/, $glossline;
		if (@words != @glosses) {
			print "spaces mismatch line $textlineno  corresponding to input file line $nblines \n";
			print XOUT "@words\n";
			print XOUT "@glosses\n";
		}
		else{
			$wordsnb = @words; 
			print "Number of words in sentence $textlineno: $wordsnb \n";
			# Loop for providing the glosses of words
			while ($i < $wordsnb) {
					print XOUT "\t\t<W>\n";
					print XOUT "\t\t\t<FORM>$words[$i]</FORM>\n"; 
					print XOUT  "\t\t\t<TRANSL xml:lang=\"fr\">$glosses[$i]</TRANSL>\n";
					if ($gloss_cn == 1) {
						print XOUT  "\t\t\t<TRANSL xml:lang=\"cn\">$glossescn[$i]</TRANSL>\n";
					}
					print XOUT "\t\t</W>\n";
					$i++;
			}
			# On remet i à zéro, pour la phrase suivante
			$i = 0;
		}
		print XOUT "</S>\n";
		$nblines++;	
}
# Adding free translation of entire text at end
print XOUT  "\t<TRANSL xml:lang=\"fr\">$textfr</TRANSL>\n";
print XOUT  "\t<TRANSL xml:lang=\"cn\">$textcn</TRANSL>\n";
print XOUT  "\t<TRANSL xml:lang=\"en\">$texten</TRANSL>\n";
print XOUT "</TEXT>\n";
unlink ("foobar");
