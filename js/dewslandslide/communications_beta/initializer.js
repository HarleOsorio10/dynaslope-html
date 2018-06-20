let recipient_container = [];
let recent_contacts_collection = [];
let recent_sites_collection = [];
$(document).ready(function() {
	$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
	setTimeout(function() {
		initializeQuickInboxMessages();
		getRecentActivity();
        recentActivityInitializer();
        getRoutineSites();
        getRoutineTemplate();
        getImportantTags();
    	setTimeout(function(){
			try {
				initializeContactSuggestion($("#contact-suggestion").val());
				initializeOnClickUpdateEmployeeContact();
				initializeOnClickUpdateCommunityContact();
				getSiteSelection();
				getOrganizationSelection();
				$("#chatterbox-loader-modal").modal("hide");
			} catch (err) {
				$("#chatterbox-loader-modal").modal("hide");
				console.log(err.message);
				// Add PMS HERE.
			}
			
		}, 3000);
	},3000);

	$(".birthdate").datetimepicker({
		locale: "en",
		format: "YYYY-MM-DD"
	});

	getEmployeeContactGroups();
	initializeOnSubmitEmployeeContactForm();
	initializeOnSubmitCommunityContactForm();
});



function getContactSuggestion (name_suggestion) {
	let contact_suggestion_input = document.getElementById("contact-suggestion");
	let awesomplete = new Awesomplete(contact_suggestion_input);
	let contact_suggestion_container = [];

	name_suggestion.data.forEach(function(raw_names) {
		contact_suggestion_container.push(raw_names.fullname);
	});

	awesomplete.list = contact_suggestion_container;
}

function initializeQuickInboxMessages () {
	getQuickInboxMain();
	getQuickInboxEvent();
	getQuickInboxUnregistered();
	getQuickInboxDataLogger();
}

function getQuickInboxMain () {
	let msg = {
		type: 'smsloadquickinboxrequest'
	}
	wss_connect.send(JSON.stringify(msg));
}

function getQuickInboxEvent() {

}

function getQuickInboxUnregistered() {

}

function getQuickInboxDataLogger() {

}

function getRecentActivity () {
	getRecentlyViewedContacts();
	getRecentlyViewedSites();
	getOnRoutineSites();
}

function getRecentlyViewedContacts () {

}

function getRecentlyViewedSites () {

}

function getOnRoutineSites () {

}

function getQuickAcces () {
	getQASitesWithEvent();
	getQAGroupMessages();
}

function getQASitesWithEvent () {

}

function getQAGroupMessages () {

}

function initializeOnClickUpdateEmployeeContact () {
	$('#emp-response-contact-container').on('click', 'tr:has(td)', function(){
		$("#emp-response-contact-container_wrapper").hide();
		$("#update-contact-container").show(300);
		$("#employee-contact-wrapper").show(300);
		$("#emp-settings-cmd").hide();
		var table = $('#emp-response-contact-container').DataTable();
		var data = table.row(this).data();
		var msg = {
			'type': 'loadDewslContact',
			'data': data.user_id
		};	
		wss_connect.send(JSON.stringify(msg));
	});
}

function initializeOnClickUpdateCommunityContact () {
	$('#comm-response-contact-container').on('click', 'tr:has(td)', function(){
		$('#comm-response-contact-container_wrapper').hide();
		$("#update-comm-contact-container").show(300);
		$("#community-contact-wrapper").show(300);
		$("#comm-settings-cmd").hide();
		var table = $('#comm-response-contact-container').DataTable();
		var data = table.row(this).data();
		var msg = {
			'type': 'loadCommunityContact',
			'data': data.user_id
		};	
		wss_connect.send(JSON.stringify(msg));
	});
}

function getSiteSelection() {
	let msg = {
		type: 'getAllSitesConSet'
	}
	wss_connect.send(JSON.stringify(msg));
}

function getOrganizationSelection() {
	let msg = {
		type: 'getAllOrgsConSet'
	}
	wss_connect.send(JSON.stringify(msg));
}

function initializeContactSuggestion(name_query) {
	let msg = {
		'type': 'requestnamesuggestions',
		'namequery': name_query
	}
	wss_connect.send(JSON.stringify(msg));
}

function getImportantTags () {
	let msg = {
		type: 'getImportantTags'
	}
	wss_connect.send(JSON.stringify(msg));
}

function getEmployeeContactGroups () {
	$('#team_ec').tagsinput({
		typeahead: {
			displayKey: 'text',
			source: function (query) {
				var group_tag = [];
				$.ajax({
					url : "../chatterbox/get_employee_contacts",
					type : "GET",
					async: false,
					success : function(data) {
						var data = JSON.parse(data);
						for (var counter = 0; counter < data.length; counter ++) {
							var raw_grouptags = data[counter].grouptags.split(",");
							for (var raw_counter = 0; raw_counter < raw_grouptags.length; raw_counter++) {
								if ($.inArray(raw_grouptags[raw_counter],group_tag) == -1) {
									group_tag.push(raw_grouptags[raw_counter]);
						
								}
							}
						}
					}
				});
				return group_tag;
			}
		} 
	});
}

function initializeOnSubmitEmployeeContactForm () {
	$('#emp-settings-cmd button[type="submit"], #sbt-update-contact-info').on('click',function(){
		employeeContactFormValidation();
	});
}

function initializeOnSubmitCommunityContactForm () {
	$('#comm-settings-cmd button[type="submit"], #sbt-update-comm-contact-info').on('click',function(){
		try{
			communityContactFormValidation();
			alert();
		} catch (e) {
			console.log(e.message);
		}
	});
}

function employeeContactFormValidation() {
	$("#employee-contact-form").validate({
        debug: true,
        rules: {
            firstname_ec: "required",
			lastname_ec: "required",
			middlename_ec: "required",
			nickname_ec: "required",
			salutation_ec: "required",
			gender_ec: "required",
			birthdate_ec: "required",
			email_ec: "required",
			active_status_ec: "required",
			team_ec: "required"
        },
        messages: { comments: "" },
        errorPlacement (error, element) {
            const placement = $(element).closest(".form-group");
            if ($(element).hasClass("cbox_trigger_switch")) {
                $("#errorLabel").append(error).show();
            } else if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!$(element).next("span")) {
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            }

            $(element).closest(".form-group").children("label.error").remove();
        },
        highlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
        },
        unhighlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
        },
        submitHandler (form) {
            submitEmployeeInformation();
            console.log("success");
        }
    });
}

function communityContactFormValidation () {

	$("#community-contact-form").validate({
        debug: true,
        rules: {
            firstname_cc: "required",
			lastname_cc: "required",
			middlename_cc: "required",
			nickname_cc: "required",
			salutation_cc: "required",
			gender_cc: "required",
			birthdate_cc: "required",
			active_status_cc: "required",
			ewirecipient_cc: "required"
        },
        messages: { comments: "" },
        errorPlacement (error, element) {
        	console.log("errorPlacement");
            const placement = $(element).closest(".form-group");
            if ($(element).hasClass("cbox_trigger_switch")) {
                $("#errorLabel").append(error).show();
            } else if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
        	console.log("success");
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!$(element).next("span")) {
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            }

            $(element).closest(".form-group").children("label.error").remove();
        },
        highlight (element, errorClass, validClass) {
        	console.log("highlight");
            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
        },
        unhighlight (element, errorClass, validClass) {
        	console.log("unhighlight");
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
        },
        submitHandler (form) {
        	console.log("submit");
        	site_selected = [];
			organization_selected = [];
			$('#site-selection-div input:checked').each(function() {
			    site_selected.push($(this).attr('value'));
			});

			$('#organization-selection-div input:checked').each(function() {
			    organization_selected.push($(this).attr('value'));
			});

			$("#org-and-site-alert").show(300);
			if (site_selected.length === 0 && organization_selected.length === 0) {
				$("#selection-feedback").text("site and organization selection");
			} else if (site_selected.length === 0) {
				$("#selection-feedback").text("site selection");
			} else if (organization_selected.length === 0) {
				$("#selection-feedback").text("organization selection");
			} else {
				$("#org-and-site-alert").hide(300);
				//success function here
				onSubmitCommunityContactForm(site_selected, organization_selected);
			}
            
        }
    });
}


function recentActivityInitializer() {
$("#routine-actual-option").on("click", function () {
        $("#routine-reminder-option").removeClass("active");
        $("#routine-msg").val("");
        $(this).addClass("active");
        $("#def-recipients").text("Default recipients: LEWC, BLGU, MLGU");
        $.get("../communications/getRoutine", (data) => {
            var routine_template = JSON.parse(data);
            $("#routine-msg").val(routine_template[0].template);
        });
    });

    $("#routine-reminder-option").on("click", function () {
        $("#routine-actual-option").removeClass("active");
        $("#def-recipients").text("Default recipients: LEWC");
        $("#routine-msg").val("");
        $("#routine-msg").val(routine_reminder_msg);
        $(this).addClass("active");
    });

    $(".rv_contacts a").on("click", function () {
        $(".recent_activities").hide();
        var index = $(this).closest("div").find("input[name='rc_index']").val();
        index = index.replace("activity_contacts_index_", "");
        var data = recent_contacts_collection[parseInt(index)];
        $(".dropdown-input").val(data.name[0].fullname);
        $("#go-chat").trigger("click");
    });

    $(".rv_sites a").on("click", function () {
        $(".recent_activities").hide();
        $("input[name=\"sitenames\"]").prop("checked", false);
        $("input[name=\"offices\"]").prop("checked", false);

        var index = $(this).closest("div").find("input[name='rs_index']").val();
        index = index.replace("activity_sites_index_", "");
        var data = recent_sites_collection[parseInt(index)];

        for (var counter = 0; counter < data.offices.length; counter++) {
            $("input[name=\"offices\"]:unchecked").each(function () {
                if (data.offices[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        for (var counter = 0; counter < data.sitenames.length; counter++) {
            $("input[name=\"sitenames\"]:unchecked").each(function () {
                if (data.sitenames[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        $("#go-load-groups").trigger("click");
    });

    $(".rv_searched div.recent_searched").on("click", function () {
        $(".recent_activities").hide();
        wss_connect.send(JSON.stringify(recent_searched_collection[$(this).index()]));
    });
}

function getRecentActivity () {
    var division = 1;

    if (localStorage.getItem("rv_searched") != null) {
        recent_searched_collection = JSON.parse(localStorage.rv_searched);
    }

    if (localStorage.getItem("rv_sites") != null) {
        recent_sites_collection = JSON.parse(localStorage.rv_sites);
    }

    if (localStorage.getItem("rv_contacts") != null) {
        recent_contacts_collection = JSON.parse(localStorage.rv_contacts);
    }

    if (recent_contacts_collection.length != 0) {
        division = 12 / recent_contacts_collection.length;
        for (var counter = 0; counter < recent_contacts_collection.length; counter++) {
            $(".rv_contacts").append(`<div class='col-md-${parseInt(division)} col-sm-${parseInt(division)} col-xs-${parseInt(division)} recent_contacts'><input name='rc_index' value = 'activity_contacts_index_${counter}' hidden><a href='#' class='clearfix'>   <img src='/images/Chatterbox/boy_avatar.png' alt='' class='img-circle'><div class='friend-name'><strong>${recent_contacts_collection[counter].name[0].fullname}</strong></div></a></div>`);
        }
    } else {
        $(".rv_contacts").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No recent activities</h6></div>");
    }

    if (recent_sites_collection.length != 0) {
        division = 12 / recent_sites_collection.length;
        var rv_quick_sites = "";
        var rv_quick_offices = "";
        for (var counter = 0; counter < recent_sites_collection.length; counter++) {
            for (var sub_counter = 0; sub_counter < recent_sites_collection[counter].offices.length; sub_counter++) {
                if (sub_counter == 0) {
                    rv_quick_offices = recent_sites_collection[counter].offices[sub_counter];
                } else {
                    rv_quick_offices = `${rv_quick_offices}, ${recent_sites_collection[counter].offices[sub_counter]}`;
                }
            }

            for (var sub_counter = 0; sub_counter < recent_sites_collection[counter].sitenames.length; sub_counter++) {
                if (sub_counter == 0) {
                    rv_quick_sites = recent_sites_collection[counter].sitenames[sub_counter];
                } else {
                    rv_quick_sites = `${rv_quick_sites}, ${recent_sites_collection[counter].sitenames[sub_counter]}`;
                }
            }

            $(".rv_sites").append(`<div class='col-md-${parseInt(division)} col-sm-${parseInt(division)} col-xs-${parseInt(division)} recent_sites'><input name='rs_index' value = 'activity_sites_index_${counter}' hidden><a href='#' class='clearfix'><img src='/images/Chatterbox/dewsl_03.png' alt='' class='img-circle'><div class='friend-name'><strong style='text-transform: uppercase;'>Site: ${rv_quick_sites}</strong><div class='last-message text-muted'>Offices: ${rv_quick_offices}</div></div></a></div>`);
        }
    } else {
        $(".rv_sites").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No recent activities</h6></div>");
    }
}


function getRoutineSites() {
	let msg = {
		type: 'getRoutineSites'
	};
	wss_connect.send(JSON.stringify(msg));
}

function getRoutineTemplate() {
	let msg = {
		type: 'getRoutineTemplate'
	};
	wss_connect.send(JSON.stringify(msg));
}

function displayRoutineTemplate(sites,template) {
	let day = moment().format("dddd");
    let month = moment().month();
    month += 1;

    let wet = [[1, 2, 6, 7, 8, 9, 10, 11, 12], [5, 6, 7, 8, 9, 10]];
    let dry = [[3, 4, 5], [1, 2, 3, 4, 11, 12]];
    let routine_sites = [];

    switch (day) {
        case "Friday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-msg").css("display", "inline");
            routine_reminder_msg = "Magandang umaga po.\n\nInaasahan namin ang pagpapadala ng LEWC ng ground data bago mag-11:30 AM para sa wet season routine monitoring.\nTiyakin ang kaligtasan sa pagpunta sa site.\n\nSalamat.";
            for (var counter = 0; counter < sites_for_routine.length; counter++) {
                if (wet[sites_for_routine[counter].season - 1].includes(month)) {
                    routine_sites.push(sites_for_routine[counter].site);
                }
            }

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");
            for (var counter = 0; counter < routine_sites.length; counter++) {
                $(".routine-site-selection").append(`<label><input name='offices-routine' type='checkbox' value='${routine_sites[counter]}' checked> ${routine_sites[counter].toUpperCase()}</label>`);
            }

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $(".routine-msg-container").append("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
            $("#routine-msg").val(routine_reminder_msg);
            break;
        case "Tuesday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-msg").css("display", "inline");
            routine_reminder_msg = "Magandang umaga po.\n\nInaasahan namin ang pagpapadala ng LEWC ng ground data bago mag-11:30 AM para sa wet season routine monitoring.\nTiyakin ang kaligtasan sa pagpunta sa site.\n\nSalamat.";
            for (var counter = 0; counter < sites_for_routine.length; counter++) {
                if (wet[sites_for_routine[counter].season - 1].includes(month)) {
                    routine_sites.push(sites_for_routine[counter].site);
                }
            }

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");
            for (var counter = 0; counter < routine_sites.length; counter++) {
                $(".routine-site-selection").append(`<label><input name='offices-routine' type='checkbox' value='${routine_sites[counter]}' checked> ${routine_sites[counter].toUpperCase()}</label>`);
            }

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $(".routine-msg-container").append("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
            $("#routine-msg").val(routine_reminder_msg);
            break;
        case "Wednesday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-msg").css("display", "inline");
            routine_reminder_msg = "Magandang umaga.\n\nInaasahan na magpadala ng ground data ang LEWC bago mag-11:30AM para sa ating DRY SEASON routine monitoring. Para sa mga nakapagpadala na ng sukat, salamat po.\nTiyakin ang kaligtasan kung pupunta sa site. Magsabi po lamang kung hindi makakapagsukat.\n\nSalamat at ingat kayo.";
            for (var counter = 0; counter < sites_for_routine.length; counter++) {
                if (dry[sites_for_routine[counter].season - 1].includes(month)) {
                    routine_sites.push(sites_for_routine[counter].site);
                }
            }

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");
            for (var counter = 0; counter < routine_sites.length; counter++) {
                $(".routine-site-selection").append(`<label><input name='offices-routine' type='checkbox' value='${routine_sites[counter]}' checked> ${routine_sites[counter].toUpperCase()}</label>`);
            }

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $(".routine-msg-container").prepend("<textarea class='form-control' id='routine-msg' cols='30'rows='10'></textarea>");
            $("#routine-msg").val(routine_reminder_msg);
            break;
        default:
            $(".routine_section").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No Routine Monitoring for today.</h6></div>");
            break;
    }
}

function addSitesActivity (sites) {
    $(".recent_activities").hide();

    for (var counter = 0; counter < recent_sites_collection.length; counter++) {
        if (recent_sites_collection[counter].sitenames[0] == sites.sitenames[0]) {
            return 1;
        }
    }

    if (recent_sites_collection.length == 6) {
        recent_sites_collection.shift();
    }
    recent_sites_collection.push(sites);
    localStorage.rv_sites = JSON.stringify(recent_sites_collection);
}

function addContactsActivity (contacts) {
    for (var counter = 0; counter < recent_contacts_collection.length; counter++) {
        if (recent_contacts_collection[counter].number[0] == contacts.number[0]) {
            return 1;
        }
    }

    if (recent_contacts_collection.length == 6) {
        recent_contacts_collection.shift();
    }
    recent_contacts_collection.push(contacts);
    localStorage.rv_contacts = JSON.stringify(recent_contacts_collection);
}