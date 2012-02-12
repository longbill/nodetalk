<?php
include('common.php');
$r = mysql_query("SELECT * FROM `chat_online` WHERE `time`<'".(time()-20)."'");
if (mysql_num_rows($r) > 0)
{
	$arr = mysql_fetch_assoc($r);
	mysql_query("DELETE FROM `chat_online` WHERE `id`='".$arr['id']."'");
	mysql_query("INSERT INTO `chat_event`(`from`,`to`,`time`,`type`,`content`) VALUES('".$arr['id']."','".$arr['to']."','".time()."','disconnect','')");
}

//show online
$r = mysql_query("SELECT count(id) AS total FROM `chat_online`");
$arr = mysql_fetch_assoc($r);
echo $arr['total'];
?>