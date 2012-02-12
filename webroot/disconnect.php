<?php
include('common.php');
$id = intval($_POST['id']);
$to = intval($_POST['to']);
if ($id && $to)
{
	if (mysql_query("DELETE FROM `chat_online` WHERE `to`='$id' OR `id`='$id' OR `id`='$to'"))
	{
		mysql_query("INSERT INTO `chat_event`(`from`,`to`,`time`,`type`,`content`) VALUES('$id','$to','".time()."','disconnect','')");
		echo 'win';
	}
	else
	{
		echo mysql_error();
	}
}
else
{
	echo 'data error';
}
?>