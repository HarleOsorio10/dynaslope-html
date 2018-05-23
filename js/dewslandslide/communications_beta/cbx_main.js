let quick_inbox_registered = [];
let quick_inbox_unregistered = [];
let quick_inbox_event = [];
let quick_inbox_data_logger = [];

function getQuickGroupSelection () {
	getQuickCommunitySelection();
	getQuickEmployeeSelection();
}

function getQuickCommunitySelection () {
	try {
		let list_of_sites = {
			'type': "qgrSites"
		}

		let list_of_orgs = {
			'type': "qgrOrgs"
		}

		wss_connect.send(JSON.stringify(list_of_sites));
		wss_connect.send(JSON.stringify(list_of_orgs));
		$('#advanced-search').modal("toggle");
	} catch(err) {
		console.log(err);
		// Add PMS here
	}

}

function getEmployeeContact(){
	try {
		let employee_details = {
			'type': 'loadAllDewslContacts'
		};
		wss_connect.send(JSON.stringify(employee_details));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}
}

function getCommunityContact(){
	try {
		let community_details = {
			'type': 'loadAllCommunityContacts'
		};
		wss_connect.send(JSON.stringify(community_details));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}
}

function getQuickEmployeeSelection () {
	// requestTag = {
	// 	'type':'smsloadrequesttag',
	// 	'teams': dynaTags
	// }
	// conn.send(JSON.stringify(requestTag));
	// $('#main-container').removeClass('hidden');
}

function displaySitesSelection(data) {
	let sitenames = data;
	let sitename, site_id, psgc;
	
	for (var i = 0; i < sitenames.length; i++) {
		var modIndex = i % 6;
		$("#sitenames-"+i).empty();

		sitename = sitenames[i].site_code;
		site_id = sitenames[i].site_id;
		psgc = sitenames[i].psgc;
		$("#sitenames-"+modIndex).append('<div class="checkbox"><label><input name="sitenames" id="id_'+psgc+'" type="checkbox" value="'+sitename+'">'+sitename.toUpperCase()+'</label></div>');
	}
}

function startConversation(details) {
	try {
		let convo_details = {
			type: 'loadSmsConversation',
			data: details
		};
		wss_connect.send(JSON.stringify(convo_details));
	} catch(err) {
		console.log(err);
		// Add PMS here
	}	
}

function displayQuickInboxMain(msg_data) {
	try {
		var quick_inbox_template = Handlebars.compile($('#quick-inbox-template').html());
		try {
			for (let counter = 0; counter < msg_data.length; counter++) {
				msg_data[counter].isunknown = 0;
				quick_inbox_registered.unshift(msg_data[counter]);	
			}
			
		} catch(err) {
			console.log(err);
		}

		quick_inbox_html = quick_inbox_template({'quick_inbox_messages': quick_inbox_registered});
		$("#quick-inbox-display").html(quick_inbox_html);
		$("#quick-inbox-display").scrollTop(0);
	} catch (err) {
		console.log(err);
		//Add PMS here
	}
}

function displayOrgSelection(data){
	let offices = data;
	let office, office_id;

	for (var i = 0; i < offices.length; i++) {
		var modIndex = i % 5;
		$("#offices-"+i).empty();

		office = offices[i].org_name;
		office_id = offices[i].org_id;
		$("#offices-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+office+'" name="orgs" class="form-group" value="'+office+'">'+office.toUpperCase()+'</label></div>');
	}
}

function displayContactSettingsMenu() {
	$('#employee-contact-wrapper').prop('hidden', true);
	$('#community-contact-wrapper').prop('hidden', true);
	$('#comm-response-contact-container_wrapper').prop('hidden',true);
	$('#emp-response-contact-container_wrapper').prop('hidden',true);
	$('#update-contact-container').prop('hidden',true);
	$('#contact-result').remove();
	// fetchSiteAndOffice();
}

function displayDataTableCommunityContacts(cmmty_contact_data){
	$('#comm-response-contact-container').DataTable({
		destroy: true,
		data: cmmty_contact_data,
		columns: [
		{ "data": "user_id", "title": "User ID"},
		{ "data": "salutation", "title": "Salutation" },
		{ "data": "firstname", "title": "Firstname"},
		{ "data": "lastname", "title": "Lastname"},
		{ "data": "middlename", "title": "Middlename"},
		{ "data": "active_status", "title": "Active Status"}
		]
	});
	$('#comm-response-contact-container').prop('hidden',false);
}

function displayDataTableEmployeeContacts(dwsl_contact_data) {
	$('#emp-response-contact-container').DataTable({
		destroy: true,
		data: dwsl_contact_data,
		columns: [
		{ "data": "user_id", "title": "User ID"},
		{ "data": "firstname", "title": "Firstname"},
		{ "data": "lastname", "title": "Lastname"},
		{ "data": "team", "title": "Team"},
		{ "data": "active_status", "title": "Active Status"}
		]
	});
	$('#emp-response-contact-container').prop('hidden',false);
}

let employee_input_count = 0;
let community_input_count = 0;
function addNewMobileForEmployee () {
	$("#employee-add-number").click(function(){
		if (employee_input_count <= 3) {
			$("#mobile-div").append(
			"<div class='row'>"+
		    "<div class='col-md-4' title='Notes: If contact number is more than one seprate it by a comma.'>"+
			"<label for='mobile_ec_'>Mobile #:</label>"+
			"<input type='text' class='form-control' id='mobile_cc_' name='mobile_cc_' value='' required>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>Mobile ID #:</label>"+
			"<input type='text' id='mobile_cc_id_' class='form-control' value='' disabled>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<label>Mobile # Status:</label>"+
			"<select class='form-control' id='mobile_cc_status_' class='form-control' value=''>"+
			"<option value='1'>Active</option>"+
			"<option value='0'>Inactive</option>"+
			"</select>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<label>Mobile # Priority:</label>"+
			"<input type='text' id='mobile_cc_priority_' class='form-control' value=''>"+
			"</div>"+
			"</div>");
			employee_input_count +=1;
		} else {
			$.notify("Reach the maximum entry for mobile number", "err");
		}
		
	});
} 

function addNewMobileForCommunity () {
	$("#community-add-number").click(function(){
		if (community_input_count <= 3) {
			$("#mobile-div-cc").append(
			"<div class='row'>"+
		    "<div class='col-md-4' title='Notes: If contact number is more than one seprate it by a comma.'>"+
			"<label for='mobile_ec_'>Mobile #:</label>"+
			"<input type='text' class='form-control' id='mobile_cc_' name='mobile_cc_' value='' required>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>Mobile ID #:</label>"+
			"<input type='text' id='mobile_cc_id_' class='form-control' value='' disabled>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<label>Mobile # Status:</label>"+
			"<select class='form-control' id='mobile_cc_status_' class='form-control' value=''>"+
			"<option value='1'>Active</option>"+
			"<option value='0'>Inactive</option>"+
			"</select>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<label>Mobile # Priority:</label>"+
			"<input type='text' id='mobile_cc_priority_' class='form-control' value=''>"+
			"</div>"+
			"</div>");
			community_input_count +=1;
		} else {
			$.notify("Reach the maximum entry for mobile number", "err");
		}
		
	});
} 