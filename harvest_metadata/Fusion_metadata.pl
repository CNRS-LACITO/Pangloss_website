#! C:\perl\bin\perl.exe
# Perl trim function to remove whitespace from the start and end of the string
sub trim($)
{
	my $string = shift;
	$string =~ s/^\s+//;
	$string =~ s/\s+$//;
	return $string;
}
$prems = $ARGV[0];
$deux = $ARGV[1];
$trois = $ARGV[2];

  print "Demarrage de la fusion\n";

open (IN1, $ARGV[0])|| die "Probleme a l\'ouverture du fichier d'entree";

open (IN2, $ARGV[1])|| die "Probleme a l\'ouverture du fichier d'entree";

open (OUT, ">$ARGV[2]")|| die "Probleme a l\'ouverture du fichier de sortie";
 

$i=-1;
$s=0;
$p=0;
$att=0;

$item=0;
$fin_tout=0;

while ($line_tout=<IN1>) {

	if ($line_tout=~m/<\/harvest>/){
		$fin_tout=1;
	}
	
	if ($fin_tout eq 0)	{
		print OUT $line_tout;
	}
}
	
$debut_autres=0;
	
while ($line_autres=<IN2>) {
	
	if ($line_autres=~m/<harvest>/){
		$debut_autres=1;
	}

	
	if ($debut_autres eq 1)	{
		$debut_autres=2;;
	}
	elsif  ($debut_autres eq 2)	{
		print OUT $line_autres;
	}		
		
}
	
print "Fini !\n";

	close(IN1);
	close(IN2);
	close(OUT);


	