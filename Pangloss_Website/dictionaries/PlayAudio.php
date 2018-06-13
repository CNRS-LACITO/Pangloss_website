<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Language" content="fr">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Listen</title>
<link href="styles.css" rel="stylesheet" type="text/css" />
</head>

<body marginheight="0" marginwidth="0">
<p align="center">
  <?php
                $sound_url = isset($_GET["sound_url"]) ? $_GET["sound_url"] : "*";
                $file_format = isset($_GET["file_format"]) ? $_GET["file_format"] : "*";
                echo "<audio  width=\"300\" height=\"30\" preload=\"auto\" controls=\"controls\" id=\"player\" name=\"player\" autoplay=\"autoplay\">";
                echo "<source src=\"$sound_url\" type=\"audio/$file_format\"/>";
                echo "Your browser does not support the audio tag";
                echo "</audio>";
            ?>
</p>
</body>
</html>
