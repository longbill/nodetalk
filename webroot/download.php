<?php
/*
*  EndTalk
*  Author: Longbill  
*  http://php.js.cn
*/

include('common.php');
$content = $_POST['content'];
$title = $_POST['title'];
$url = $_POST['url'];
$content = str_replace('<div',"\r\n<div",$content);
$content = strip_tags($content,'<span><div><a>');
$content = stripslashes(str_replace('&nbsp;'," ",$content));
$content = trim($content);
$tpl = file_get_contents('log.tpl');
$content = str_replace(array('{time}','{content}','{url}','{title}'),array(date('Y-m-d'),$content,$url,$title),$tpl);
$filename = $title.' '.date('Y-m-d').'.html';
if (preg_match('/MSIE/',$_SERVER['HTTP_USER_AGENT'])) $filename = rawurlencode($filename);
$filesize = strlen($content);
header('Pragma: public');
header('Last-Modified: '.gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: pre-check=0, post-check=0, max-age=0');
header('Content-Transfer-Encoding: binary');
header('Content-Encoding: none');
header('Content-type: application/force-download');
header('Content-Disposition: attachment; filename="'.$filename.'"');
header('Content-length: '.$filesize);
echo $content;
?>