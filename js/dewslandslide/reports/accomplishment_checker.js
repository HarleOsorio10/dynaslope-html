
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Monitoring Shift Checker [reports/accomplishment_checker.php]
 *  [host]/reports/accomplishment/checker
 *
****/

$(document).ready((a) => {
    // Initializers
    initializeDefaults();
    initializeDisplayOptionOnChange();
});

function initializeDefaults () {
    prepareSearchByShiftFunctions();
    prepareSearchByStaffFunctions();
    initializeStaffNameOptions();
}

function prepareSearchByShiftFunctions () {
    $(".datetime").datetimepicker({
        format: "YYYY-MM-DD HH:30:00",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    })
    .on("dp.hide", (e) => {
        $("#shift_end").val(moment(e.date).add(13, "hours").format("YYYY-MM-DD HH:30:00"));
    });

    let message;
    jQuery.validator.addMethod("TimestampTest", (value, element) => checkTimestamp(value, element), () => message);

    $("#checkerForm").validate({
        rules: {
            shift_start: {
                required: true,
                TimestampTest: true
            },
            shift_end: {
                required: true,
                TimestampTest: true
            }
        },
        errorPlacement (error, element) {
            var placement = $(element).closest(".form-group");
            // console.log(placement);

            if ($(element).hasClass("cbox_trigger_switch")) {
                $("#errorLabel").append(error).show();
            } else if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!element.next("span")[0]) {
                if (element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if (element.is("select")) element.next("span").css({ top: "18px", right: "30px" });
                if (element.is("input[type=number]")) element.next("span").css({ top: "18px", right: "13px" });
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

            if ($(element).parent().is(".datetime") || $(element).parent().is(".time") || $(element).parent().is(".date")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
        },
        unhighlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");

            if ($(element).parent().is(".datetime") || $(element).parent().is(".time") || $(element).parent().is(".date")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
        },
        submitHandler (form) {
            const form_data = {
                start: $("#shift_start").val(),
                end: $("#shift_end").val()
            };

            getShiftReleases(form_data, (data) => {
                if (data.length === 0) {
                    $("#reports").html("<td class='text-center td-padding' colspan='2'>No monitoring events and releases for the shift</td>");
                    $("#mt, #ct").text("No monitoring personnel on-duty");
                } else {
                    const grouped_by_site = groupBy(data, "site_id");

                    const unique_ct = getUnique(data, "reporter_id_ct");
                    const unique_mt = getUnique(data, "reporter_id_mt");

                    $("#mt").text(unique_mt.join(", "));
                    $("#ct").text(unique_ct.join(", "));

                    $("#reports").html("");

                    grouped_by_site.forEach((group) => {
                        const { length } = group;
                        let str = `<tr><td class='col-sm-4 text-center v-middle' rowspan='${length}'><strong>${group[0].site_code.toUpperCase()}</strong></td>`;

                        for (let i = 0; i < length; i += 1) {
                            if (i !== 0) str += "<tr>";
                            str += `<td class=" col-sm-8 text-center"><a href="../../monitoring/events/${group[i].event_id}/${group[i].release_id}" target="_blank"> EWI Release for ${moment(group[i].data_timestamp).add(30, "minutes").format("HH:mm:00")}</a></td></tr>`;
                        }

                        $("#reports").append(str);
                    });
                }
            });
        }
    });
}

function checkTimestamp (value, element) {
    var hour = moment(value).hour();
    var minute = moment(value).minute();
    let isValidTimestamp;

    if (element.id === "shift_start") {
        message = "Acceptable times of shift start are 07:30 and 19:30 only.";
        const temp = moment(value).add(13, "hours");
        $("#shift_end").val(moment(temp).format("YYYY-MM-DD HH:mm:ss"));
        $("#shift_end").prop("readonly", true).trigger("focus");
        setTimeout(() => {
            $("#shift_end").trigger("focusout");
        }, 500);
        isValidTimestamp = (hour === 7 || hour === 19) && minute === 30;
    } else if (element.id === "shift_end") {
        message = "Acceptable times of shift end are 08:30 and 20:30 only.";
        isValidTimestamp = ((hour === 8 || hour === 20) && minute === 30);
    }
    return isValidTimestamp;
}

function getShiftReleases (formData, callback) {
    $.ajax({
        url: "../../accomplishment/getShiftReleases",
        type: "GET",
        data: formData,
        success (response, textStatus, jqXHR) {
            result = JSON.parse(response);
            callback(result);
        },
        error (xhr, status, error) {
            var err = eval(`(${xhr.responseText})`);
            alert(err.Message);
        }
    });
}

function groupBy (collection, property) {
    let i = 0;
    let val;
    let index;
    let values = [];
    let result = [];

    for (; i < collection.length; i += 1) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1) result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }

    return result;
}

function getUnique (arr, prop, type) {
    let n = {};
    let r = [];
    for (let i = 0; i < arr.length; i += 1) {
        if (!n[arr[i][prop]]) {
            n[arr[i][prop]] = true;
            if (prop === "reporter_id_mt") r.push(`${arr[i].mt_first} ${arr[i].mt_last}`);
            else if (prop === "reporter_id_ct") r.push(`${arr[i].ct_first} ${arr[i].ct_last}`);
        }
    }

    return r;
}

function prepareSearchByStaffFunctions () {
    $("#duration_start").datetimepicker({
        format: "YYYY-MM-DD HH:00:00",
        enabledHours: [8, 20],
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    })
    .on("dp.hide", (e) => {
        $("#duration_end").val(moment(e.date).add(12, "hours").format("YYYY-MM-DD HH:30:00"));
    });

    $("#duration_end").datetimepicker({
        format: "YYYY-MM-DD HH:00:00",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        },
        useCurrent: false // Important! See issue #1075
    });

    $("#check").click(() => {
        if ($("#display-option").val() === "staff") {
            const staff_id = $("#staff-name").val();
            const start = $("#duration_start").val();
            const end = $("#duration_end").val();
            getReleasesByStaff(staff_id, start, end);
        }
    });
}

function getReleasesByStaff (staff_id, start, end) {
    $.getJSON(`../../accomplishment/getReleasesByStaff/${staff_id}/${start}/${end}`)
    .then((releases) => {
        console.log(releases);
        plotReleasesTable(releases);
    });
}

function plotReleasesTable (table_data) {
    $("#releases-table").empty();
    console.log("PASOK SA plotReleasesTable", table_data);
    $("#releases-table").DataTable({
        destroy: true,
        data: table_data,
        columns: [
            {
                data: "data_timestamp",
                title: "Data Timestamp"
            },
            {
                data: "site_code",
                title: "Site Code",
                render (data, type, full, meta) {
                    return `${data.toUpperCase()}`;
                }
            },
            {
                data: "event_id",
                title: "Event ID",
                render (data, type, full, meta) {
                    return `<a href='/../monitoring/events/${data}'>${data} <span class="fa fa-link"></span></a>`;
                }
            },
            {
                data: "release_id",
                title: "Release ID",
                render (data, type, full, meta) {
                    return `<a href='/../monitoring/events/${full.event_id}/${full.release_id}'>${full.release_id} <span class="fa fa-link"></span></a>`;
                }
            },
            {
                data: "internal_alert_level",
                title: "Internal Alert"
            },
            {
                data: "mt",
                title: "Reporter MT"
            },
            {
                data: "ct",
                title: "Reporter CT"
            }
        ]
    });
}

function initializeStaffNameOptions () {
    // Append full names, family name first, to the selection
    const $staff_list = $("#staff-name");
    $staff_list.empty();

    getStaff()
    .done((staff) => {
        staff.forEach(({ id, last_name, first_name }) => {
            const fullname = formatToFullName(last_name, first_name);
            const $option = $("<option>");
            $option.attr({
                value: id,
                label: fullname
            });
            $staff_list.append($option);
        });
    })
    .catch((error) => {
        console.log(error);
    });
}

function getStaff () {
    return $.getJSON("../../api/getStaff");
}

function formatToFullName (l_name, f_name) {
    return `${l_name}, ${f_name}`;
}

function initializeDisplayOptionOnChange () {
    $("#display-option").change(({ currentTarget }) => {
        changeShiftCheckerOptions();
    });
}

function changeShiftCheckerOptions () {
    const display_opt = $("#display-option").val();
    const $staff_form_div = $(".staff-form");
    const $shift_form_div = $(".shift-form");
    const $staff_table = $(".search-by-staff");
    const $shift_table = $(".search-by-shift");

    switch (display_opt) {
        case "staff":
            $shift_form_div.prop("hidden", true);
            $shift_table.prop("hidden", true);
            $staff_form_div.prop("hidden", false);
            $staff_table.prop("hidden", false);
            break;
        case "shift":
            $staff_form_div.prop("hidden", true);
            $staff_table.prop("hidden", true);
            $shift_form_div.prop("hidden", false);
            $shift_table.prop("hidden", false);
            break;
        default:
            console.error(display_opt, "has no value");
            break;
    }
}
