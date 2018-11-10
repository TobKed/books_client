$(document).ready(function () {
    console.log("test");
});

let DEBUG = true;
let ENDPOINTURL = "http://localhost:8000/book/";

let GENRES = {
    1: "Romans",
    2: "Obyczajowa",
    3: "Sci-fi i fantasy",
    4: "Literatura faktu",
    5: "Popularnonaukowa",
    6: "Poradnik",
    7: "Kryminał, sensacja"
};

function ajaxCall({bookId = "",
                  type = "GET",
                  dataType ="json",
                  data = {},
                  success=null, error=null, complete=null} = {}) {

    let ajaxSettings = {
        url: ENDPOINTURL + bookId,
        data: data,
        type: type,
        success: function (data) {
            if (DEBUG) console.log("success - ajaxCall()");
            if (DEBUG) console.log(data);
            if (success) success(data);
        },
        error: function (data) {
            if (DEBUG) console.log("error - ajaxCall()");
            if (DEBUG) console.log(data);
            if (error) error(data);
        },
        complete: function () {
            if (DEBUG) console.log("complete - ajaxCall()");
            if (complete) complete();
        }
    };
    if ((dataType != null) && (dataType !== undefined)) ajaxSettings.dataType = dataType;

    $.ajax(ajaxSettings);
}
