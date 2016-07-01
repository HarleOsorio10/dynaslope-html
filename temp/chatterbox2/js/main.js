// (function() {
	//Provide default user name
	//TODO: replace with session user name
	$('#user').val("Orutra-man");

	var user, contactnum, contactnumTrimmed;
	var contactInfo;
	var contactname;
	var multipleContacts;
	var messages = [];
	var temp, tempMsg, tempUser;
	var WSS_CONNECTION_STATUS = -1;
	var isFirstSuccessfulConnect = true;

	var messages_template = Handlebars.compile($('#messages-template').html());
	var messages_template_user = Handlebars.compile($('#messages-template-user').html());
	var messages_template_contact = Handlebars.compile($('#messages-template-contact').html());

	function updateMessages(msg) {
		console.log("User is: " + msg.user);

		//TODO: Make the segregation of message templates work!!!

		if (msg.user == "You") {
			messages.push(msg);
			// console.log(msg.user + " message template user");
			var messages_html_user = messages_template_contact({'messages': messages});
			$('#messages').html(messages_html_user);
			$('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight}, 300 );
		}
		else {
			//substitute number for name of registered user from contactInfo
			for (i in contactInfo) {
				// console.log(contactInfo[i].fullname + ' ' + contactInfo[i].numbers);

				if (contactInfo[i].numbers.search(trimmedContactNum(msg.user)) >= 0) {
					console.log(contactInfo[i].fullname + ' ' + contactInfo[i].numbers);

					//updateMessages(msg);
					msg.user = contactInfo[i].fullname;
					console.log(msg.user + " message template contact");
					messages.push(msg);
					var messages_html_contact = messages_template_contact({'messages': messages});
					$('#messages').html(messages_html_contact);
					$('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight}, 300 );
					break;
				}
			}
		}
	}

	function loadMessageHistory(msg) {
		//TODO: load the historical message here
		alert("loadMessageHistory!");
	}

	function initLoadMessageHistory(msgHistory) {
		console.log(msgHistory);
		console.log("initLoadMessageHistory");
		//Loop through the JSON msg and
		//	use updateMessages multiple times
		var history = msgHistory.data;
		temp = msgHistory.data;
		var msg;
		for (var i = history.length - 1; i >= 0; i--) {
			msg = history[i];
			updateMessages(msg);
		}
	}

	function loadCommunityContactRequest(msg) {
		//TODO: load the historical message here
		contactInfo = msg.data;
		var totalContacts = msg.total;
		var contact = msg.data[0];
		var fullname = contact.fullname.replace(/\?/g,function(){return "\u00f1"});
		var tempnum = contact.numbers;

		console.log("fullname: " + fullname + ", number: " + tempnum);
		$('#contactname').val(fullname);
		$('#contactnum').val(tempnum);
	}

	var timerID = 0;
	var conn = null;
	conn = connectWS();

	function connectWS() {
		console.log("trying to connect to web socket server");
		var tempConn = new WebSocket('ws://www.codesword.com:5050');

		tempConn.onopen = function(e) {
			console.log("Connection established!");
			WSS_CONNECTION_STATUS = 0;

			if (isFirstSuccessfulConnect) {
				//TODO: load contacts information for first successful connect
				//contacts currently 9KB in size. too big for the WSS setup

				//set flag to false after successful loading
				isFirstSuccessfulConnect = false;
			}

			// a setInterval has been fired
			if (window.timerID) {
				window.clearInterval(window.timerID);
				window.timerID = 0;
			}
		};

		tempConn.onmessage = function(e) {
			var msg = JSON.parse(e.data);

			if (msg.type == "smsload") {
				tempMsg = msg;
				initLoadMessageHistory(msg);
			} 
			else if (msg.type == "loadcommunitycontact") {
				loadCommunityContactRequest(msg);
			}
			else if (msg.type == "loadnamesuggestions") {
				if (msg.data == null) {
					return;
				}

				multipleContacts = msg.data;

				var suggestionsArray = [];
				for (var i in msg.data) {
				    var suggestion = msg.data[i].fullname.replace(/\?/g,function(){return "\u00f1"}) + 
				    					" (" + msg.data[i].numbers + ")";
				    suggestionsArray.push(suggestion);
				}

				comboplete.list = suggestionsArray;
			}
			else {
				var numbers = /^[0-9]+$/;  
				if(msg.user.match(numbers)) {
					if (contactnum == normalizedContactNum(msg.user)) {
						updateMessages(msg);
					}
				}
				else {
					//Assumption: Alpha numeric users only come from the browser client
					var tempNum;
					for (tempNum in msg.numbers) {
						if (tempNum.search(contactnumTrimmed) >= 0) {
							updateMessages(msg);
						}
					}
				}
			}
		}

		tempConn.onclose = function(e) {
			WSS_CONNECTION_STATUS = -1;

	        var reason;
	        //alert(event.code);
	        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
	        if (event.code == 1000)
	            reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
	        else if(event.code == 1001)
	            reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
	        else if(event.code == 1002)
	            reason = "An endpoint is terminating the connection due to a protocol error";
	        else if(event.code == 1003)
	            reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
	        else if(event.code == 1004)
	            reason = "Reserved. The specific meaning might be defined in the future.";
	        else if(event.code == 1005)
	            reason = "No status code was actually present.";
	        else if(event.code == 1006) {
	        	reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";

	       		//TODO: reconnect to the WSS
	       		waitForSocketConnection();
	       	}
	        else if(event.code == 1007)
	            reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
	        else if(event.code == 1008)
	            reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
	        else if(event.code == 1009)
	           reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
	        else if(event.code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
	            reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
	        else if(event.code == 1011)
	            reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
	        else if(event.code == 1015)
	            reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
	        else
	            reason = "Unknown reason";

	        console.log(reason);
		}

		return tempConn;
	}

	// Make the function wait until the connection is made...
	function waitForSocketConnection() {
		if (!window.timerID) {
			window.timerID = setInterval(
		        function () {
		            if (conn.readyState === 1) {
		                console.log("Connection is made");
		                return;

		            } else {
		                console.log("wait for connection...");
		                conn = connectWS();
		                waitForSocketConnection();
		            }

		        }, 5000); // wait 5 seconds for the connection...
		}
	}

	//9xx-xxxx-xxx format
	function trimmedContactNum(targetNumber) {
		var numbers = /^[0-9]+$/;  
		var trimmed;
		if(targetNumber.match(numbers)) {  
			var size = targetNumber.length;

			if (size == 12) {
				trimmed = targetNumber.slice(2, size);
			} 
			else if (size == 11) {
				trimmed = targetNumber.slice(1, size);
			}
			else if (size == 10) {
				trimmed = targetNumber;
			}
			else {
				console.log('Error: No such number in the Philippines');  
				return -1;
			}

			targetNumber = "63" + trimmed;
			return trimmed;
		}  
		else {  
			console.log('Please input numeric characters only');  
			return -1;
		}  
	}

	//639xx-xxxx-xxx format
	function normalizedContactNum(targetNumber) {
		var trimmed = trimmedContactNum(targetNumber);
		
		if (trimmed < 0) {
			console.log("Error: Invalid Contact Number");
			return -1;
		} 
		else {
			return "63" + trimmed;
		}
	}

	$('#generate-contact').click(function() {
		// conn = new WebSocket('ws://www.codesword.com:5050');
		sitename = $('#sitename').val();
		office = $('#office').val();

		if (sitename == "") {
			alert("Error: No sitename selected");
			return;
		}

		if (office == "") {
			office = "all";
			$('#office').val("all");
		}

		var contactRequest = {
			'type': 'loadcommunitycontactrequest',
			'sitename': sitename,
			'office': office
		};

		//request for message history of selected number
		conn.send(JSON.stringify(contactRequest));
	});

	$('#generate-contact-from-name').click(function() {
		// conn = new WebSocket('ws://www.codesword.com:5050');
		contactname = $('#contactname').val();

		if (contactname == "") {
			alert("Error: No contactname selected");
			return;
		}

		var contactRequest = {
			'type': 'loadcontactfromnamerequest',
			'contactname': contactname,
		};

		//request for message history of selected number
		conn.send(JSON.stringify(contactRequest));
	});

	$('#join-chat').click(function() {
		// conn = new WebSocket('ws://www.codesword.com:5050');

		user = $('#user').val();
		contactname = $('#contactname').val();
		contactnum = normalizedContactNum($('#contactnum').val());
		contactnumTrimmed = trimmedContactNum(contactnum);

		if (contactnum < 0) {
			alert("Error: Invalid Contact Number");
			return;
		}

		$('#user-container').addClass('hidden');
		$('#main-container').removeClass('hidden');

		var msg = {
			'type': 'joinchat',
			'user': user,
			'numbers': [contactnumTrimmed],
			'msg': user + ' is now online',
			'timestamp': moment().format('YYYY-MM-DD HH:mm')
		};

		var msgHistory = {
			'type': 'smsloadrequest',
			'number': contactnumTrimmed,
			'timestamp': moment().format('YYYY-MM-DD HH:mm')
		};

		conn.send(JSON.stringify(msg));

		$('#user').val('');

		//request for message history of selected number
		conn.send(JSON.stringify(msgHistory));
	});

	function getNameSuggestions (nameQuery) {
		var nameSuggestionRequest = {
			'type': 'requestnamesuggestions',
			'namequery': nameQuery,
		};

		//request for message history of selected number
		conn.send(JSON.stringify(nameSuggestionRequest));
	};

	var comboplete = new Awesomplete('input.dropdown-input', {
		minChars: 3,
	});
	comboplete.list = [];

	Awesomplete.$('.dropdown-input').addEventListener("click", function() {
		var nameQuery = $('.dropdown-input').val();

		if (nameQuery.length >= 3) {
			if (comboplete.ul.childNodes.length === 0) {
				//comboplete.minChars = 3;
				comboplete.evaluate();
			} 
			else if (comboplete.ul.hasAttribute('hidden')) {
				comboplete.open();
			}
			else {
				comboplete.close();
			}
		}
	});

	Awesomplete.$('.dropdown-input').addEventListener("keyup", function(e){
	    // get keycode of current keypress event
	    var code = (e.keyCode || e.which);

	    // do nothing if it's an arrow key
	    if(code == 37 || code == 38 || code == 39 || code == 40) {
	        return;
	    }

		var nameQuery = $('.dropdown-input').val();

		if (nameQuery.length >= 3) {
			//Get autocomplete data from the WSS
			getNameSuggestions(nameQuery);
		}
		else {
			comboplete.close();
		}
		
	}, false);

	Awesomplete.$('.dropdown-input').addEventListener("awesomplete-selectcomplete", function(e){
		// User made a selection from dropdown. 
		// This is fired after the selection is applied
		var nameQuery = $('.dropdown-input').val();

		getNameSuggestions(nameQuery);
	}, false);

	$('#send-msg').click(function() {
		var text = $('#msg').val();
		var msg = {
			'type': 'smssend',
			'user': user,
			'numbers': [contactnum],
			'msg': text,
			'timestamp': moment().format('YYYY-MM-DD HH:mm')
		};
		updateMessages(msg);
		conn.send(JSON.stringify(msg));

		$('#msg').val('');
	});

	$('#leave-room').click(function() {
		var msg = {
			'type': 'leavechat',
			'user': user,
			'numbers': [contactnum],
			'msg': user + ' is now offline',
			'timestamp': moment().format('YYYY-MM-DD HH:mm')
		};
		updateMessages(msg);
		conn.send(JSON.stringify(msg));

		$('#messages').html('');
		messages = [];

		$('#main-container').addClass('hidden');
		$('#user-container').removeClass('hidden');

		conn.close();
	});

// })();