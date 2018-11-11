$(document).ready(function () {
    ajaxCall({success: fillBooksTable});
    confirmedDeleteBookButtonAction();  // action binding when book deletion is confirmed
});


/* VARIABLES */
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


/* FUNCTIONS */
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


function fillBooksTable(data) {
    let tbody = $("#booksTable > tbody");
    $.each(data, function (key, val) {
        let singleBook = new SingleBookElements({newRowData: val});
        tbody.append(singleBook.getSubElements());
    });
}


function confirmedDeleteBookButtonAction() {
    // http://webroxtar.com/2011/10/solution-jquery-click-event-gets-called-twice-fires-twice/
    $('#deleteBookConfirmed').unbind('click').click(function () {
        let id = $(this).attr("data-bookid");
        ajaxCall({
            bookId: id,
            type: "DELETE",
            success: function () {
                $('#confirmBookRemoveModal').modal('hide');
                let bookToDelete = new SingleBookElements({bookId:id});
                bookToDelete.delete();
                bookToDelete = undefined;
            }
        })
    });
}


/* CLASSES */
class SingleBookElements {
    constructor({newRowData = null, bookId = null, newBook=null} = {}) {
        if (newRowData) {
            this.titleAuthorRow = $(
                "<tr class='clickable-row' data-bookId=" + newRowData.id + ">" +
                    "<td>" + newRowData.author + "</td>" +
                    "<td>" + newRowData.title + "</td>" +
                "</tr>"
            );

            this.contentRow = $(
                "<tr class='content-row bg-light d-none' data-bookId=" + newRowData.id + ">" +
                    "<td class='book-info container' colspan=2></td>" +
                "</tr>"
            );

            this.emptyRow = $("<tr class='fill-empty-row d-none'></tr>");
            this.makeRowClickable();
        } else if (bookId) {
            let selector = ".clickable-row[data-bookid='" + bookId + "']";
            this.titleAuthorRow = $(selector);
            this.contentRow = this.titleAuthorRow.nextAll(".content-row:first");
            this.emptyRow = this.titleAuthorRow.nextAll(".fill-empty-row:first");
        }
    }

    makeRowClickable() {
        this.titleAuthorRow.click(function () {
            $(this).toggleClass("bg-info text-white");
            let contentRow = $(this).next(".content-row");
            contentRow.toggleClass("d-none");
            if (contentRow.children(".book-info").children().length === 0) {
                let bookId = $(this).attr("data-bookid");
                console.log('load book info (id: ' + bookId + ")");
                ajaxCall({bookId:bookId, success:function(data) {
                        let bookInfo = new SingleBookInfo({newData:data});
                        contentRow.children(".book-info").html(bookInfo.info);
                    }})
            }
        });
        this.titleAuthorRow.css('cursor', 'pointer')
    }

    getSubElements() {return [this.titleAuthorRow, this.contentRow, this.emptyRow]}

    delete() {
        this.emptyRow.remove();
        this.contentRow.remove();
        this.titleAuthorRow.remove();
    }
}


class SingleBookInfo {
    constructor ({newData=null, existingInfo=null} = {}) {
        if (existingInfo == null) {
            if (newData == null) newData = {
                author: '',
                title: '',
                publisher: '',
                genre: '',
                isbn: ''
            };
            this.info = $(
                "<table class='table mb-2 book-info-table'>" +
                    "<tr class='bg-light book-author'>" +
                        "<td> author: </td>" +
                        "<td class='book-info-cell' >" + newData.author + "</td>" +
                        "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='author' placeholder='Author' type='text' value='" + newData.author + "'></td>" +
                    "</tr>" +
                    "<tr class='bg-light book-title'>" +
                        "<td> title: </td>" +
                        "<td class='book-info-cell' >" + newData.title + "</td>" +
                        "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='title' placeholder='Title' type='text' value='" + newData.title + "'></td>" +
                    "</tr>" +
                    "<tr class='bg-light book-publisher'>" +
                        "<td> publisher: </td>" +
                        "<td class='book-info-cell' >" + newData.publisher + "</td>" +
                        "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='publisher' type='text' placeholder='Publisher' value='" + newData.publisher + "'></td>" +
                    "</tr>" +
                    "<tr class='bg-light book-genre'>" +
                        "<td> genre: </td>" +
                        "<td class='book-info-cell' >" + GENRES.genreFromNumbers(newData.genre) + "</td>" +
                        "<td class='book-edit-cell p-1 align-middle d-none'><select class='form-control' name='genre'>" + GENRES.generateGenreOptions(newData.genre) + "</select></td>" +
                    "</tr>" +
                    "<tr class='bg-light book-isbn'>" +
                        "<td> isbn: </td>" +
                        "<td class='book-info-cell' >" + newData.isbn + "</td>" +
                        "<td class='book-edit-cell p-1 align-middle d-none'><input maxlength='17' class='form-control' name='isbn' placeholder='ISBN' type='text' value='" + newData.isbn + "'></td>" +
                    "</tr>" +
                "</table>" +
                "<div class='s-book-buttons'>" +
                    "<div class='book-edit-delete-buttons'>" +
                        "<button type='button' class='btn btn-info mx-2 edit-book-button'>Edit</button>" +
                        "<button type='button' class='btn btn-danger mx-2 delete-book-button' data-toggle='modal' data-target='#confirmBookRemoveModal'>Delete</button>" +
                    "</div>" +
                    "<div class='book-save-cancel-buttons d-none'>" +
                        "<button type='button' class='btn btn-info mx-2 save-book-button'>Save</button>" +
                        "<button type='button' class='btn btn-secondary mx-2 cancel-edit-book-button'>Cancel</button>" +
                    "</div>" +
                    "<div class='book-add-cancel-buttons d-none'>" +
                        "<button type='button' class='btn btn-info mx-2 save-book-button'>Add</button>" +
                        "<button type='button' class='btn btn-secondary mx-2 cancel-edit-book-button'>Cancel</button>" +
                    "</div>" +
                "</div>"
            );
        }

        this.infoCells = $(this.info).find("table > .book-info-cell");
        this.editCells = $(this.info).find("table > .book-edit-cell");
        this.editDeleteButtons = $(this.info).find(".book-edit-delete-buttons");
        this.saveCancelButtons = $(this.info).find(".book-save-cancel-buttons");
        this.addCancelButtons = $(this.info).find(".book-add-cancel-buttons");

        this.editDeleteButtons.children(".delete-book-button").click(function() {
            console.log("test");
            let body = $("#confirmBookRemoveModal").find(".modal-body");
            let contentRow = $(this).closest(".content-row");
            let id = contentRow.attr("data-bookid");
            let author = contentRow.find(".book-author > .book-info-cell").first().text();
            let title = contentRow.find(".book-title > .book-info-cell").first().text();
            body.html("Do you want to delete book: " + author + " - " + title + " ?<br>");
            $("#deleteBookConfirmed").attr('data-bookid', id);
        })

    }

}

