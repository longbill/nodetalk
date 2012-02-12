<?php
include('common.php');

$r = mysql_query('SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";');
$r = mysql_query('DROP TABLE IF EXISTS `chat_event`;');
$r = mysql_query(<<<END
CREATE TABLE `chat_event` (
  `id` bigint(20) unsigned NOT NULL auto_increment,
  `from` bigint(20) unsigned NOT NULL default '0',
  `to` bigint(20) unsigned NOT NULL default '0',
  `time` int(10) unsigned NOT NULL default '0',
  `type` char(20) character set utf8 collate utf8_unicode_ci NOT NULL,
  `content` varchar(500) character set utf8 collate utf8_unicode_ci NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MEMORY  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5695 ;
END
);

$r = mysql_query('DROP TABLE IF EXISTS `chat_ip`;');
mysql_query(<<<END
CREATE TABLE `chat_ip` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `from` bigint(20) unsigned NOT NULL default '0',
  `to` bigint(20) unsigned NOT NULL default '0',
  `range` bigint(20) unsigned NOT NULL,
  `name` varchar(200) character set utf8 collate utf8_unicode_ci NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `range` (`range`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=494 ;
END
);
mysql_query('DROP TABLE IF EXISTS `chat_online`;');
mysql_query(<<<END
CREATE TABLE `chat_online` (
  `id` bigint(20) unsigned NOT NULL default '0',
  `to` bigint(20) unsigned NOT NULL default '0',
  `time` int(10) unsigned NOT NULL default '0',
  `ip` int(10) NOT NULL default '0'
) ENGINE=MEMORY DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
END
);

echo $r?'create tables ok<br>':'create tables failed!<br>';
echo mysql_error();

$ip = file_get_contents('ip.txt');

if (preg_match_all('/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*\-\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*([^\n]*)/i',$ip,$ms))
{
	$len = count($ms[0]);
	for($i=0;$i<$len;$i++)
	{
		$from = intval($ms[1][$i])*256*256*256+intval($ms[2][$i])*256*256+intval($ms[3][$i])*256+intval($ms[4][$i]);
		$to = intval($ms[5][$i])*256*256*256+intval($ms[6][$i])*256*256+intval($ms[7][$i])*256+intval($ms[8][$i]);
		
		$name = str_replace('=>','',trim($ms[9][$i]));
		//echo $from.' - '.$to.' '.$name."  <br> ";
		if ($from && $to && $name)
		{
			$range = abs($to-$from);
			$name = mysql_escape_string($name);
			$sql = "INSERT INTO chat_ip (`from`,`to`,`range`,`name`) VALUES('$from','$to','$range','$name');";
			mysql_query($sql);
		}
	}
}


$s = mysql_error();
if ($s)
 echo $s;
else echo 'ok';
?>