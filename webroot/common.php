<?php
/*
*  EndTalk
*  Author: Longbill  
*  http://php.js.cn
*/
/*
./common.php:
  common things of every request
*/

error_reporting(E_ALL ^ E_NOTICE);
ignore_user_abort(false);
set_time_limit(30);

/*
*  数据库设置
*  mysql_pconnect('数据库服务器地址','数据库用户名','数据库密码');
*  mysql_select_db('数据库名');
*/
mysql_pconnect('localhost','username','password');
mysql_select_db('databaseName');


$sleep_m_time = 500;
$max_clients_per_ip = 5; //max clients per ip



if(mysql_get_server_info() > '4.1')
{
	mysql_query("SET character_set_connection=utf8, character_set_results=utf8, character_set_client=binary");
}
if(mysql_get_server_info() > '5.0')
{
	mysql_query("SET sql_mode=''");
}

function_exists('date_default_timezone_set') && date_default_timezone_set('Etc/GMT-8');


if (!function_exists('json_encode'))
{
	function json_encode($arr)
	{
		$keys = array_keys($arr);
		$isarr = true;
		$json = "";
		for ( $i=0; $i<count($keys); $i++)
		{
			if ($keys[$i] !== $i)
			{
				$isarr = false;
				break;
			}
		}
		$json = $space;
		$json.= ($isarr)?"[":"{";
		for( $i=0; $i<count($keys); $i++)
		{
			if ($i!=0) $json.= ",";
			$item = $arr[$keys[$i]];
			$json.= ($isarr)?"":$keys[$i].':';
			if (is_array($item))
				$json.= json_encode($item);
			else if (is_string($item))
				$json.= '"'.str_replace(array("\r","\n"),array('\r','\n'),$item).'"';
			else 
				$json.= $item;
		}
		$json.= ($isarr)?"]":"}";
		return $json;
	}
}
