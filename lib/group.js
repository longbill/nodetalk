
var EventEmitter = require('events').EventEmitter;
var sys = require('sys');

/**
* user group
*/
exports.Group = function()
{
	var users = [];
	EventEmitter.call(this);
	
	var PLAYERS = 4;
	var started = false;
	
	this.status = 'waiting';
	
	
	this.usersCount = 0;

	this.currentUser = false;
	this.currentBid = {};
	this.doubled = 1;
	this.bidPassed = 0;

	this.currentTrip = [];

	var CARDS = ["S2", "H2", "D2", "C2", "S3", "H3", "D3", "C3", "S4", "H4", "D4", "C4", "S5", "H5", "D5", "C5", "S6", "H6", "D6", "C6", "S7", "H7", "D7", "C7", "S8", "H8", "D8", "C8", "S9", "H9", "D9", "C9", "S10", "H10", "D10", "C10", "SJ", "HJ", "DJ", "CJ", "SQ", "HQ", "DQ", "CQ", "SK", "HK", "DK", "CK", "SA", "HA", "DA", "CA"];
	
	var self = this;
	
	this.push = function(evt,data)
	{
		this.emit(evt,data);
	};
	
	this.join = function(user)
	{
		var onlined = false;
		for(var i=0;i<users.length;i++)
		{
			if (users[i].uid == user.uid)
			{
				if (started)
				{
					user.index = i;
					users[i].isBot = false;
					users[i].socket = user.socket;
					users[i].socket.emit('updateData',this.getDataForUser(i));
					onlined = true;
				}
			}
		}
		
		if (!onlined)
		{
			user.cards = [];
			user.index = users.length;
			user.trips = 0;
			users.push(user);
			this.usersCount = users.length;
			console.log('JION! users='+users.length);
			if (this.usersCount == PLAYERS)
			{
				this.initGame();
			}
		}
		
		
		
		
		user.socket.on('bid',function(card)
		{
			if (self.currentUser == user.index)
			{
				console.log('user'+user.index+' bid on '+card);
				var data = {
					card: card,
					user: user.index
				};
				if (self.currentBid.card && card == 'X' && self.doubled == 1)
				{
					self.doubled = 2;
					self.bidPassed++;
				}
				else if (self.currentBid.card && card == 'XX' && self.doubled == 2)
				{
					self.doubled = 4;
					self.bidPassed++;
				}
				else if (card == 'PASS')
				{
					self.bidPassed++;
				}
				else
				{
					self.bidPassed = 0;
					self.currentBid = data;
				}
				console.log('bid passeed='+self.bidPassed);
				self.broadcast('bid',data);
				if (self.bidPassed == 3)
				{
					self.status = 'playing';
					self.currentUser = self.currentBid.user;
					self.broadcast('begin-playing',
					{
						'currentBid':self.currentBid,
						'doubled':self.doubeld
					});
				}
				else
				{
					self.currentUser = (user.index+1)%4;
					self.broadcast('bid-start',self.currentUser);
				}
			}
		});
		
		
		user.socket.on('play',function(card)
		{
			if (self.currentUser == user.index && self.status == 'playing')
			{
				console.log('user '+user.index+' play '+card);
				var cardIndex = users[user.index].cards.indexOf(card);
				if (cardIndex > -1)
				{
					if (
						(
							self.currentTrip.length > 0 
							&& canPlay(users[user.index].cards,self.currentTrip[0].card,card)
						)
						||
						self.currentTrip.length == 0)
					{
						users[user.index].cards.splice(cardIndex,1);
						self.currentTrip.push({
							user: self.currentUser,
							card: card
						});
						self.broadcast('play',
						{
							user: self.currentUser,
							card: card
						});
						self.currentUser = (self.currentUser+1)%4;
						if (self.currentTrip.length == 4)
						{
							self.compareCards();
							self.currentTrip = [];
						}
					}
				}
			}
		});
	};
	
	this.compareCards = function()
	{
		var firstColor = self.currentTrip[0].card.substr(0,1);
		var topColor = self.currentBid.card.substr(1,1);
		var _cards = [];
		for(var i=0;i<4;i++)
		{
			var _color = self.currentTrip[i].card.substr(0,1);
			var _number = parseCardNumber(self.currentTrip[i].card.substr(1));
			if (_color == topColor)
				_color = 'Z';
			else if (_color != firstColor)
				_color = 'A';
			_cards.push({color:_color,number:_number,user:self.currentTrip[i].user})
		}
		_cards.sort(function(a,b)
		{
			if (a.color != b.color)
				return a.color > b.color ? 1 : -1;
			else
				return a.number > b.number ? 1 : -1;
		});
		var winUser = _cards.pop().user;
		users[winUser].trips++;
		this.currentUser = winUser;
		
		var data = [];
		for(var i=0;i<users.length;i++)
		{
			data.push({user:i,trips:users[i].trips});
		}
		this.broadcast('trip-end',{winUser:winUser,score:data});
		console.log('trip end, user '+winUser+' wins');
		/*
			TODO 算分
		*/
		
	}
	
	this.initGame = function()
	{
		console.log('initGame');
		started = true;
		this.dealCards();
		this.currentUser = getRand(4);
		this.status = 'bidding';
		for(var i=0;i<users.length;i++)
		{
			users[i].socket.emit('gamestart',this.getDataForUser(i));
		}
		this.broadcast('bid-start',this.currentUser);
	}
	
	this.getDataForUser = function(i)
	{
		return {
			myIndex: i,
			myCards: users[i].cards,
			status: this.status,
			currentUser: this.currentUser,
			currentBid: this.currentBid,
			doubled: this.doubled,
			currentTrip: this.currentTrip
		}
	}
	
	this.broadcast = function(evt,data)
	{
		for(var i=0;i<users.length;i++)
		{
			try
			{
				users[i].socket.emit(evt,data);
			}
			catch(e) { }
		}
	}
	
	this.dealCards = function()
	{
		CARDS.sort(function()
		{
			return [1,-1][getRand(1)];
		});
		
		for(var i=0;i<10;i++)
		{
			var _start = getRand(CARDS.length);
			var len = getRand(CARDS.length - _start);
			if (len > 0)
			{
				var o = CARDS.splice(_start,len);
				CARDS = CARDS.concat(o);
			}
		}
		
		CARDS.sort(function()
		{
			return [1,-1][getRand(1)];
		});
		
		
		for(var i=0;i<CARDS.length;i++)
		{
			users[i%PLAYERS].cards.push(CARDS[i]);
		}
	}
	
	
	

	/**
	* check if the game is over
	*/

	function getRand(max)
	{
		return Math.floor(Math.random(4)*max);
	}
	
	this.hasUser = function(user)
	{
		for(var i=0;i<users.length;i++)
		{
			if (users[i].uid == user.uid) return true;
		}
		return false;
	}
	
	this.makeBot = function(user)
	{
		for(var i=0;i<users.length;i++)
		{
			if (users[i].uid == user.uid) users[i].isBot = true;
		}
	}
	
	function canPlay(cards,firstCard,currentCard)
	{
		var firstColor = firstCard.substr(0,1);
		var hasSameColor = cards.join('').indexOf(firstColor) != -1;
		if (!hasSameColor) return true;
		return currentCard.indexOf(firstColor) != -1;
	}
	
	function parseCardNumber(n)
	{
		if (n.match(/^[\d]+$/)) return parseInt(n);
		var cache = {'J':11,'Q':12,'K':13,'A':14};
		return cache[n];
	}
	
}
sys.inherits(exports.Group, EventEmitter);
