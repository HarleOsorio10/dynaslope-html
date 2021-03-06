let WSS_CONNECTION_STATUS = -1;
let connection_status = false;
let reconnection_delay = 10000;
let routine_site = [];
let routine_template = [];
let inbox_container = [];
let wss_connect = connectWS();

function connectWS() {
	console.log("trying to connect to web socket server");
	let url = window.location.host;
	let split_url = url.split(":");
	let update_url = `ws://${split_url[0]}:5150`;
	var wssConnection = new WebSocket(update_url);

	wssConnection.onopen = function (e) {
		console.log("Connection established!");
		connection_status = true;
		reconnection_delay = 10000;
		WSS_CONNECTION_STATUS = 0;
		$("#send-msg").removeClass("disabled");
	};

	wssConnection.onmessage = function (e) {
		let msg_data = JSON.parse(e.data);
		switch (msg_data.type) {
			case "loadnamesuggestions":
				getContactSuggestion(msg_data);
				break;
			case "qgrAllSites":
				displaySitesSelection(msg_data.data);
				break;
			case "qgrAllOrgs":
				displayOrgSelection(msg_data.data);
				break;
			case "smsloadquickinbox":
				displayQuickInboxMain(msg_data.data);
				// console.log(msg_data)
				break;
			case "smsloadunregisteredinbox":
				displayUnregisteredInboxMain(msg_data.data);
				// displayDataTableUnregisteredContacts(msg_data.data);
				break;
			case "allUnregisteredNumbers":
				displayDataTableUnregisteredContacts(msg_data.data);
				break;
			case "latestAlerts":
				initLoadLatestAlerts(msg_data.data);
				break;
			case "fetchedCmmtyContacts":
				displayDataTableCommunityContacts(msg_data.data);
				break;
			case "fetchedDwslContacts":
				displayDataTableEmployeeContacts(msg_data.data);
				break;
			case "loadSmsConversation":
				isNewConvo = false;
				initializeScrollOldMessages();
				displayConversationPanel(msg_data.data, msg_data.full_name, msg_data.recipients, msg_data.titles);
				$('#chatterbox-loader-modal').modal("hide");
				break;
			case "fetchContactHierarchy":
				displayContactHierarchy(msg_data.data);
				break;
			case "updatedDwslContact":
				contactSettingsFeedback(msg_data);
				break;
			case "updatedCmmtyContact":
				contactSettingsFeedback(msg_data);
				break;
			case "getLEWCMobileDetailsViaSiteName":
				sendRoutineSMSToLEWC(msg_data);
				break;
			case "sendSms":
				updateConversationBubble(msg_data);
				break;
			case "callLogSaved":
				$("#call-log-modal").modal('hide');
				$("#data_timestamp").val("");
				$("#call_log_message").val("");

				updateConversationBubble(msg_data);
				if (current_user_id == msg_data.account_id) {
					$.notify("Succesfully added call log!", "success");
					$(`li.clearfix :input[value="${msg_data.convo_id}<split>${msg_data.mobile_id}<split>${msg_data.user}<split>${msg_data.timestamp}<split>${msg_data.sms_msg}"]`).closest('li.clearfix').addClass('tagged');
				} else {
					$(`li.clearfix :input[value="${msg_data.convo_id}<split>${msg_data.mobile_id}<split>${msg_data.user}<split>${msg_data.timestamp}<split>${msg_data.sms_msg}"]`).closest('li.clearfix').remove();
				}
				break;
			case "newAddedDwslContact":
				displayAddEmployeeContactMessage(msg_data);
				break;
			case "fetchedSelectedDwslContact":
				displayUpdateEmployeeDetails(msg_data.data);
				break;
			case "fetchedSelectedCmmtyContact":
				displayUpdateCommunityDetails(msg_data.data);
				break;
			case "unregisteredNumber":
				displayUnregisteredMobiles(msg_data.data);
				break;
			case "newCommunityContact":
				displayAddCommunityContactMessage(msg_data);
				break;
			case "updateCommunityContact":
				displayUpdateCommunityDetails(msg_data.data);
				break;
			case "conSetAllSites":
				displaySiteSelection(msg_data.data);
				break;
			case "conSetAllOrgs":
				displayOrganizationSelection(msg_data.data);
				break;
			case "newSmsInbox":
				updateSmsInbox(msg_data.data);
				updateSmsConversationBubble(msg_data.data);
				break;
			case "smsoutboxStatusUpdate":
				updateSmsoutboxConversationBubble(msg_data.data);
				break;
			case "fetchedImportantTags":
				displayImportantTags(msg_data.data, true);
				break;
			case "fetchSitesForRoutine":
				routine_site = msg_data.data;
				break;
			case "fetchRoutineReminder":
				routine_template = msg_data.data;
				displayRoutineReminder(routine_site, routine_template);
				break;
			case "fetchRoutineTemplate":
				displayRoutineTemplate(msg_data.data);
				break;
			case "fetchedSmsTags":
				displaySitesToTag(msg_data.sites);
				displayConversationTags(msg_data.data);
				updateSMSTagInformation(msg_data.tag_information);
				break;
			case "deleteTagStatus":
				displayDeleteTagStatus(msg_data.status);
				break;
			case "fetchAlertStatus":
				displayEWITemplateOptions(msg_data.data);
				break;
			case "fetchEWISettings":
				displayEWIAlertLvlInternalLvl(msg_data.data);
				break;
			case "fetchedSearchKeyViaGlobalMessage":
				$('#chatterbox-loader-modal').modal("hide");
				displaySearchedKey(msg_data.data);
				break;
			case "searchMessageGlobal":
				break;
			case "fetchedEWITemplateViaCbx":
				displayTemplateInChatbox(msg_data.data);
				break;
			case "messageTaggingStatus":
				if (msg_data.status == true) {
					$.notify(msg_data.status_message, "success");
					console.log($(this));
					$(this).closest("li.clearfix").find("input[class='msg_details']").addClass("tagged");
				} else {
					$.notify(msg_data.status_message, "err");
				}
				break;
			case "fetchedTeams":
				displayTeamsGroupSending(msg_data.data);
				break;
			case "fetchedEwiDashboardTemplate":
				displayTemplatesAndRecipients(msg_data.recipients, msg_data.template);
				break;
			case "sentEwiDashboard":
				displayEwiStatus(msg_data.statuses, msg_data.gintag_status);
				break;
			case "taggingStatus":
				displayConversationTaggingStatus(msg_data.status);
				break;
			case "fetchGndMeasReminderSettings":
				console.log(msg_data.saved);
				if (msg_data.saved == true) {
					reconstructSavedSettingsForGndMeasReminder(msg_data.save_settings, msg_data.event_sites, msg_data.extended_sites, msg_data.routine_sites, msg_data);

				} else {
					displaySitesForGndMeasReminder(msg_data);
				}
				$("#ground-meas-reminder-modal").modal("show");
				$("#add-special-case").prop("disabled", false);
				break;
			case "insertGndMeasReminderSettingsStatus":
				displayGndMeasSavingStatus(msg_data.status);
				break;
			case "fetchedSamarSites":
				samar_sites_details = msg_data.data;
				break;
			case "fetchedBenguetSites":
				benguet_sites_details = msg_data.data;
				break;
			case "loadOldSmsConversation":
				if (msg_data.data.length == 0) {
					isNewConvo = true;
				} else {
					isNewConvo = false;
				}
				displayConversationPanel(msg_data.data, msg_data.full_name, msg_data.recipients, msg_data.titles, isOld = true);
				$('.modal-backdrop').remove();
				initializeScrollOldMessages();
				break;
			default:
				console.log("No request to load.");
				break;
		}
	}

	wssConnection.onclose = function (e) {
		let reason;
		WSS_CONNECTION_STATUS = -1;
		if (event.code == 1000)
			reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
		else if (event.code == 1001)
			reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
		else if (event.code == 1002)
			reason = "An endpoint is terminating the connection due to a protocol error";
		else if (event.code == 1003)
			reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
		else if (event.code == 1004)
			reason = "Reserved. The specific meaning might be defined in the future.";
		else if (event.code == 1005)
			reason = "No status code was actually present.";
		else if (event.code == 1006) {
			reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
			// disableCommands();
			connection_status = false;
			$("#send-msg").addClass("disabled");
			waitForSocketConnection();
		}
		else if (event.code == 1007)
			reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
		else if (event.code == 1008)
			reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
		else if (event.code == 1009)
			reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
		else if (event.code == 1010)
			reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
		else if (event.code == 1011)
			reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
		else if (event.code == 1015)
			reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
		else
			reason = "Unknown reason";
		console.log(reason);
	}

	return wssConnection;
}

function waitForSocketConnection() {
	$('#chatterbox-loader-modal').modal("show");
	if (!window.timerID) {
		window.timerID = setInterval(() => {
			if (wss_connect.readyState === 1) {
				console.log("Connection is made");
				reinitializeContainers();
				return;
			}
			console.log(`wait for connection... ${reconnection_delay}`);
			wss_connect = connectWS();
			waitForSocketConnection();
			if (reconnection_delay < 20000) {
				reconnection_delay += 1000;
			}
		}, reconnection_delay);
	}
}


function reinitializeContainers() {
	location.reload();
}
