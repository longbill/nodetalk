var SERVER_PORT = 8878;

var express = require('express'),
	sio = require('socket.io'),
	qs = require('querystring');

var users = {},user_count = 0;

var LOG_TPL = require('fs').readFileSync(__dirname+'/webroot/log.tpl');


var app = express.createServer();
app.configure(function () 
{
	app.use(express["static"](__dirname + '/webroot'));
});

app.listen(SERVER_PORT, function ()
{
	var addr = app.address();
	console.log('   app listening on http://' + addr.address + ':' + addr.port);
});



app.get('/onlines', function(req, res)
{
	res.end(user_count+'');
});


app.post('/download', function(req, res)
{
	var post_body = '';
	req.on('data',function(data)
	{
		post_body+= data.toString('utf8');
	});
	req.on('end',function()
	{
		var d = new Date();
		var params = qs.parse(post_body);
		var tpl = LOG_TPL+' ';
		tpl = tpl.replace(/\{title\}/ig,params.title)
			.replace(/\{content\}/ig,params.content)
			.replace(/\{time\}/ig,d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes())
			.replace(/<form[\s\S]*?<\/form>/ig,'')
			.replace(/<input[\s\S]*?>/ig,'')
			.replace(/\{url\}/ig,params.url);
		
		var filename = params.title+' '+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'.html';
		if (req.headers['user-agent'].match(/MSIE/i)) filename = encodeURIComponent(filename);
		res.setHeader('Pragma','public');
		res.setHeader('Last-Modified','Tue, 15 Nov 2011 07:39:12 GMT');
		res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
		res.setHeader('Cache-Control','pre-check=0, post-check=0, max-age=0');
		res.setHeader('Content-Transfer-Encoding','binary');
		res.setHeader('Content-Encoding','none');
		res.setHeader('Content-type','application/force-download');
		res.setHeader('Content-Disposition','attachment; filename="'+filename+'"');
		res.setHeader('Content-length',new Buffer(tpl,'utf8').length);
		res.end(tpl);
	});
});





var io = sio.listen(app);

//if set log level to 10 ,socket.io will output more detailed log lines
io.set('log level',2);

io.sockets.on('connection', function (socket)
{
	var user = {};

	socket.on('lougout',function(callback)
	{
		console.log('logout');
		callback('ok');
	});
	
	socket.on('login',function(data,callback)
	{
		user.id = Math.random()+'x'+Math.random();
		user.time = (new Date()).getTime();
		user.socket = socket;
		user.to = false;
		users[user.id] = user;
		callback(user.id);
		for(var _id in users)
		{
			if (!users[_id].to && _id != user.id )
			{
				users[_id].to = user.id;
				user.socket.emit("start",_id);
				user.to = _id;
				users[_id].socket.emit("start",user.id);
			}
		}
		
	});
	
	
	socket.on('typing',function()
	{
		exchange('typing');
	});
	socket.on('msg',function(data,callback)
	{
		data = data.replace(/</g,'&lt;');
		exchange('msg',data);
		callback(data);
	});
	socket.on('userexit',function(callback)
	{
		console.log('exit');
		exchange('userexit');
		callback();
	});
	
	function exchange(evt,data)
	{
		if (user.to && users[user.to] && users[user.to].socket)
		{
			users[user.to].socket.emit(evt,data);
		}
	}
	
	socket.on('noop',function()
	{
		user.time = new Date().getTime();
	});
	
	socket.on('disconnect',function()
	{
		if (user.to && users[user.to] && users[user.to].socket)
		{
			users[user.to].socket.emit('userexit');
		}
		delete(users[user.id]);
		count_users--;
	});
});


setInterval(count_users,5000);
function count_users()
{
	var now = (new Date()).getTime();
	var n = 0;
	for(var id in users)
	{
		if (users[id].time + 180000 < now)
		{
			if (users[id].to && users[users[id].to].socket) users[users[id].to].socket.emit('userexit');
			delete(users[id]);	
		}
		else
		{
			n++;
		}
	}
	user_count = n;
}

/**
* error handling
*/
process.on('uncaughtException', function(err)
{
   console.log("Error!!!!\r\n"+err.toString());
});


function md5(name)
{
	var data = 'xxxggg'+name;
	return require('crypto').createHash('md5').update(data).digest("hex");
}
