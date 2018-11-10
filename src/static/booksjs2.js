$(document).ready(function () {
    ajaxCall({success: fillBooksTable});
    confirmedDeleteBookButtonAction();  // action binding when book deletion is confirmed
});

let DEBUG = true;
const ENDPOINTURL = "http://localhost:8000/book/";

let GENRES = {
    genres: {
        1: "Romans",
        2: "Obyczajowa",
        3: "Sci-fi i fantasy",
        4: "Literatura faktu",
        5: "Popularnonaukowa",
        6: "Poradnik",
        7: "Kryminał, sensacja"
    },

    genreFromNumbers(num) {
        return this.genres.hasOwnProperty(num) ? this.genres[num] : null;
    },

    generateGenreOptions(num) {
        let rv = "";
        $.each(this.genres, function(genreNum, genreName) {
            rv += "<option value='" + genreNum + "'";
            if (genreNum == num) rv += "selected";
            rv += ">" + genreName + "</option>";
        });
        return rv;
    }
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


class singleBookElements {
    constructor({newRowData = null} = {}) {
        if (newRowData) {
            this.titleAuthorRow = $(
                "<tr class='clickable-row' data-bookId=" + newRowData.id + ">" +
                "<td>" + newRowData.author + "</td>" +
                "<td>" + newRowData.title + "</td>" +
                "</tr>"
            );

            this.contentRow = $(
                "<tr class='bg-light d-none content-row'>" +
                "<td class='book-info container' colspan=2>" +
                "</td>" +
                "</tr>"
            );

            this.emptyRow = $("<tr class='fill-empty-row d-none'></tr>");
            this.constructor.makeRowClickable(this.titleAuthorRow);
        }
    }

    static makeRowClickable(row) {
        row.click(function () {
            $(this).toggleClass("bg-info text-white");
            $(this).next().toggleClass("d-none");
        });
        row.css('cursor', 'pointer')
    }

    getSubElements() {return [this.titleAuthorRow, this.contentRow, this.emptyRow]}
}


function fillBooksTable(data) {
    let tbody = $("#booksTable > tbody");
    $.each(data, function (key, val) {
        let singleBook = new singleBookElements({newRowData: val});
        tbody.append(singleBook.getSubElements());
    });
}


function confirmedDeleteBookButtonAction() {
    // http://webroxtar.com/2011/10/solution-jquery-click-event-gets-called-twice-fires-twice/
    $('#deleteBookConfirmed').unbind('click').click(function () {
        let id = $(this).attr("data-bookid");
        ajaxCall({
            bookId: id,
            success: function () {
                $('#confirmBookRemoveModal').modal('hide');
                deleteBookTrs(id);
            }
        })
    });

    function deleteBookTrs(id) {
        let selector = ".clickable-row[data-bookid='" + id + "']";
        let mainTr = $(selector);
        mainTr.next(".fill-empty-row").remove();
        mainTr.next(".book-info").remove();
        mainTr.remove();
    }
}
