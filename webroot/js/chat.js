var user = {id:'',to:'',load_online:'',send:[],typing:'',last_id:0};
var typing_delay = 2000; //in m second
if (!ajax_delay) var ajax_delay=1000;
var socket;
var connected = false;

function debug(s)
{
}

$(function()
{
	$(document.body).data('focus','yes');
	
	
	$('<iframe id="download_frame" style="display:none" name="download_frame"></iframe>').appendTo($(document.body));
	$(document.body).data('title',document.title);
	$(window).blur(function()
	{
		$(document.body).data('focus','no');
	}).focus(function()
	{
		on_focus();
		$('#content').focus();
	});
	
	$(document.body).keydown(on_focus).mousemove(on_focus);
	
	
	if (window.location.href.indexOf('#autostart') != -1)
	{
		setTimeout(init_chat,10);
	}
	
	load_online();
	
	if ($.cookie('city'))
	{
		var city = $.cookie('city');
		$('.city').each(function()
		{
			if ($(this).html() == city) $(this).addClass('on');
		});
	}
	
	if ($.cookie('sex'))
	{
		var sex = $.cookie('sex');
		$('.sex').each(function()
		{
			if ($(this).attr('value') == sex) $(this).addClass('on');
		});
	}
	
	
	if ($.cookie('he'))
	{
		var he = $.cookie('he');
		$('.he').each(function()
		{
			if ($(this).attr('value') == he) $(this).addClass('on');
		});
	}
});


function load_online()
{
	$.get('/onlines?t='+Math.random(),{ },function(s)
	{
		$('#online_num').html(s);
		setTimeout(load_online,10000);
	});
}

function start_blur()
{
	try
	{
		clearTimeout(window.blur_timer);
	}	
	catch(e)
	{
	}
	window.blur_timer = setTimeout(function()
	{	
		$(document.body).data('focus','no');
	},10000);
}

function on_focus()
{
	try
	{
		clearTimeout(window.blur_timer);
	}	
	catch(e)
	{
	}
	$(document.body).data('focus','yes');
	start_blur();
}

function init_chat()
{
	if (user && user.id) return;
	user.id = '';
	user.to = '';
	$('#description').fadeOut(300,function()
	{
		$('#chat').fadeIn(300,init_window);
		init_window();
		setTimeout(init_window,1);
	});
	
	$('#content').focus();
			
	$('<div id="typing"></div>').html(lang.typing).css('opacity','0').appendTo($('#chat_window'));
	show_notification(lang.logining);
	
	$.cookie('city',$('.city.on').html());
	$.cookie('sex',$('.sex.on').attr('value'));
	$.cookie('he',$('.he.on').attr('value'));
	
	socket = io.connect(window.location.origin);
	socket.on('connect',function()
	{
		if (connected) return;
		connected = true;
		
		socket.emit('login',
		{
			city:$('.city.on').html(),
			sex:$('.sex.on').attr('value'),
			he:$('.he.on').attr('value')
		},function(id)
		{
			user.id = id;
			show_notification(lang.logined);
			show_notification(lang.waiting);
			
			
			
			$(window).bind('unload',function(event)
			{
				if (user && user.id && user.to)
				{
					disconnect(1);
					alert(lang.bye);
				}
			});
			
			socket.on('start',function(toid)
			{
				user.to = toid;
				show_notification(lang.connected);
				
				$('#content').keydown(_typing);
				function _typing()
				{
					if (user.typing) return;
					user.typing = 'yes';
					socket.emit('typing');
					setTimeout("window.user.typing=false;",typing_delay);
				}
				
				
				$('#content').keypress(function(event)
				{
					if (event.keyCode == 13)
					{
						send();
						event.preventDefault();
					}
				});
				
				
			});
			
			socket.on('typing',show_typing);
			socket.on('msg',function(data)
			{
				show_msg(lang.stranger+data);
				stop_typing();
				//console.log(data);
			});
			
			socket.on('userexit',function()
			{
				delete(user.id);
				delete(user.to);
				show_notification(lang.disconnected);
				show_reconnect();
			});
			
			socket.on('disconnect',function()
			{
				delete(user.id);
				delete(user.to);
				show_notification(lang.serverError);
				show_reconnect();
			});
			
		});
		
		setInterval(function()
		{
			socket.emit('noop');
		},20000);
		
	});

}


function send()
{
	var s = $('#content').val();
	if (s == '') return;
	var msg = show_msg(lang.me+s,1);
	socket.emit('msg',s,function(s)
	{
		msg.css('opacity',1).removeClass('sending').html(lang.me+ '<span class="mywords">'+s+'</span>');
	});
	
	$('#content').val('');
	user.typing = '';
}

function show_notification(s)
{
	$('#typing').before($('<div class="notification">'+s+'</div>'));
	$('#chat_window').get(0).scrollTop = $('#chat_window').get(0).scrollHeight;
	toggle_title(1000);
}

function show_msg(s,me)
{
	
	if (!me)
	{
		$('#typing').css('opacity','0');
		s = '<span class="hiswords">'+s+'</span>';
		var msg = $('<div class="msg">'+s+'</div>');
		$('#typing').before(msg);
		toggle_title(300);
	}
	else
	{
		s = '<span class="mywords">'+s+'</span>';
		var msg = $('<div class="msg"></div>').html(s).addClass('sending').css('opacity',0.5);
		$('#typing').before(msg);
		
		$('#content').focus();
	}
	msg.width('0%').show().animate({width:'100%'},300);
	$('#chat_window').get(0).scrollTop = $('#chat_window').get(0).scrollHeight;
	return msg;
}

function show_typing()
{
	try{ clearTimeout(window.typing_timer);} catch(e) { }
	window.typing_timer = setTimeout(stop_typing,typing_delay+1000);
	$('#typing').stop().fadeTo(300,1);
	$('#chat_window').get(0).scrollTop = $('#chat_window').get(0).scrollHeight;
}

function stop_typing()
{
	$('#typing').stop().fadeTo(300,0);
}

function show_reconnect()
{
	$('#typing').before($('<div class="noticication"></div>').html(
		'<input type="button" onclick="reconnect()" value="'+lang.reconnect+'" />'+lang.contact_me
		+'&nbsp;<form action="/download" method="post" target="download_frame" onsubmit="this.content.value = $(\'#chat_window\').html();return true;">'
		+'<input type="hidden" name="content" />'
		+'<input type="hidden" name="url" value="'+window.location.href.replace(/\??t?=?[0-9\.]*#?[a-z]*$/i,'')+'" />'
		+'<input type="hidden" name="title" value="'+$(document.body).data('title')+'" />'
		+'<input type="submit" value="'+lang.download+'" /></form>'
		));
	$('#typing').remove();
	$('#chat_window').get(0).scrollTop = $('#chat_window').get(0).scrollHeight;
}

function reconnect()
{
	window.location.href = window.location.href.replace(/\??t?=?[0-9\.]*#?[a-z]*$/i,'')+'?t='+Math.random()+'#autostart';
}

function toggle_title(t)
{
	if (t>0 && $(document.body).data('focus') == 'no')
	{
		switch(t%3)
		{
			case 1:
				document.title = lang.new_msg;
				break;
			case 2:
				document.title = '_____________________';
				break;
			case 0:
				document.title = $(document.body).data('title');
				break;
		}
		setTimeout("toggle_title("+(t-1)+")",1000);	
	}
	else
	{
		document.title = $(document.body).data('title');
	}
}

function send_bt()
{
	send();
	$('#content').focus();
}

function disconnect(force)
{
	console.log(user);
	if (!user.id || !user.to) return;
	if (socket && socket.emit)
	{
		socket.emit('userexit',function()
		{
			show_reconnect();
		});
	}
	delete(user.id);
	delete(user.to);
	console.log(2);
	show_notification(lang.you_disconnect);
}

