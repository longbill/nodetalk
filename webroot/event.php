<?php
include('common.php');

$id = intval($_POST['id']);
$to = intval($_POST['to']);
$last_id = intval($_POST['last_id']);
if (!$id)
{
	sleep(5);
	die('error');
}
$t = time();
$re = array(
	'id'=>$id,
	'to'=>$to,
	'events'=>array(),
	'time'=>$t
);

//send words

if (!empty($_POST['send_content']) && $to)
{
	$content = $_POST['send_content'];
	if (function_exists('mb_ereg_replace'))
	{
		$badwords = file("badwords.txt");
		foreach($badwords as $_w)
		{
			$_w = trim($_w);
			$content = mb_ereg_replace($_w,'***',$content);
		}
	}
	if(get_magic_quotes_gpc()) $content = stripslashes($content);
	$content = htmlspecialchars($content);
	$_content = mysql_escape_string($content);
	$sql = "INSERT INTO `chat_event`(`from`,`to`,`time`,`type`,`content`) VALUES('$id','$to','$t','msg','$_content')";
	$re['send_status'] = (mysql_query($sql))?'ok':'error';
	$re['send_content'] = $content;
}

if($_POST['typing'] == 'yes')
{
	$sql = "INSERT INTO `chat_event`(`from`,`to`,`time`,`type`,`content`) VALUES('$id','$to','$t','typing','')";
	mysql_query($sql);
}


if ($_POST['load_online'] == 'yes')
{
	mysql_query("DELETE FROM `chat_event` WHERE `time`<'".(time()-30)."'");
	$r = mysql_query("SELECT count(id) AS total FROM `chat_online` WHERE `time`>'".($t-10)."'");
	$arr = mysql_fetch_assoc($r);
	$re['online'] = intval($arr['total']);
}


//check online
mysql_query("UPDATE `chat_online` SET `time`='$t' WHERE `id`='$id'");

if ($to)
{
	$r = mysql_query("SELECT id FROM `chat_online` WHERE `id`='$to' AND `time`<'".($t-20)."'");
	if (mysql_num_rows($r)>0)
	{
		mysql_query("DELETE FROM `chat_online` WHERE `to`='$id' OR `id`='$id' LIMIT 2;");
		$re['events'][] = array('type'=>'disconnect');
		echo json_encode($re);
		die;
	}
}

$r = mysql_query("SELECT * FROM `chat_event` WHERE `to`='$id' AND `id`>'$last_id' ORDER BY `id` ASC");
while($arr = mysql_fetch_assoc($r)) $re['events'][] = $arr;

echo json_encode($re);
die;
?>