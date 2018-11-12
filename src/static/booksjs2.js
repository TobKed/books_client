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
    let addBook = new SingleBookElements({newBook: true});
    tbody.append(addBook.getSubElements());
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
    constructor({newRowData = null, bookId = null, newBook=false} = {}) {
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
        } else if (newBook) {
            this.titleAuthorRow = $(
                "<tr class='clickable-row  bg-primary text-light text-center'' data-bookId='-1'>" +
                    "<td colspan='2'> ADD NEW BOOK </td>" +
                "</tr>"
            );

            this.contentRow = $(
                "<tr class='content-row bg-light d-none' data-bookId='-1'>" +
                    "<td class='book-info container' colspan=2></td>" +
                "</tr>"
            );

            this.emptyRow = $("<tr class='fill-empty-row d-none'></tr>");
            this.makeRowClickable();
        }
    }

    makeRowClickable() {
        this.titleAuthorRow.click(function () {
            $(this).toggleClass("bg-info text-white");
            let contentRow = $(this).next(".content-row");
            contentRow.toggleClass("d-none");
            if (contentRow.children(".book-info").children().length === 0) {
                let bookId = $(this).attr("data-bookid");
                if (bookId != -1) {
                    ajaxCall({
                        bookId: bookId,
                        success: function (data) {
                            let bookInfo = new SingleBookInfo({newData: data});
                            contentRow.children(".book-info").html(bookInfo.info);
                        }
                    })
                } else {
                    let bookInfo = new SingleBookInfo({newBook: true});
                    contentRow.children(".book-info").html(bookInfo.info);
                }
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
    constructor ({newData=null, newBook=false} = {}) {
        let obj = this;
        if (newData == null) {
            newData = {
                author: '',
                title: '',
                publisher: '',
                genre: '',
                isbn: ''
            };
        }

        this.info = $(
            "<table class='table mb-2 book-info-table'>" +
                "<tr class='bg-light book-author' data-prop='author'>" +
                    "<td> author: </td>" +
                    "<td class='book-info-cell' >" + newData.author + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='author' placeholder='Author' type='text' value='" + newData.author + "'></td>" +
                "</tr>" +
                "<tr class='bg-light book-title' data-prop='title'>" +
                    "<td> title: </td>" +
                    "<td class='book-info-cell' >" + newData.title + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='title' placeholder='Title' type='text' value='" + newData.title + "'></td>" +
                "</tr>" +
                "<tr class='bg-light' data-prop='publisher'>" +
                    "<td> publisher: </td>" +
                    "<td class='book-info-cell' >" + newData.publisher + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='publisher' type='text' placeholder='Publisher' value='" + newData.publisher + "'></td>" +
                "</tr>" +
                "<tr class='bg-light' data-prop='genre'>" +
                    "<td> genre: </td>" +
                    "<td class='book-info-cell' >" + GENRES.genreFromNumbers(newData.genre) + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><select class='form-control' name='genre'>" + GENRES.generateGenreOptions(newData.genre) + "</select></td>" +
                "</tr>" +
                "<tr class='bg-light' data-prop='isbn'>" +
                    "<td> isbn: </td>" +
                    "<td class='book-info-cell' >" + newData.isbn + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input maxlength='17' class='form-control' name='isbn' placeholder='ISBN' type='text' value='" + newData.isbn + "'></td>" +
                "</tr>" +
            "</table>" +
            "<div class='s-book-buttons'>" +
                "<div class='book-edit-delete-buttons'>" +
                    "<button type='button' class='edit-book-button btn btn-info mx-2'>Edit</button>" +
                    "<button type='button' class='delete-book-button btn btn-danger mx-2' data-toggle='modal' data-target='#confirmBookRemoveModal'>Delete</button>" +
                "</div>" +
                "<div class='book-save-cancel-buttons d-none'>" +
                    "<button type='button' class='save-book-button btn btn-info mx-2'>Save</button>" +
                    "<button type='button' class='cancel-edit-book-button btn btn-secondary mx-2'>Cancel</button>" +
                "</div>" +
                "<div class='book-add-cancel-buttons d-none'>" +
                    "<button type='button' class='save-book-button btn btn-info mx-2'>Add</button>" +
                    "<button type='button' class='cancel-add-book-button btn btn-secondary mx-2'>Cancel</button>" +
                "</div>" +
            "</div>"
        );

        this.infoCells = $(this.info).find("td.book-info-cell");
        this.editCells = $(this.info).find("td.book-edit-cell");
        this.editDeleteButtons = $(this.info).find(".book-edit-delete-buttons");
        this.saveCancelButtons = $(this.info).find(".book-save-cancel-buttons");
        this.addCancelButtons = $(this.info).find(".book-add-cancel-buttons");

        if (newBook) goAddMode();

        this.editDeleteButtons.children(".delete-book-button").click(function() {
            let body = $("#confirmBookRemoveModal").find(".modal-body");
            let contentRow = $(this).closest(".content-row");
            let id = contentRow.attr("data-bookid");
            let author = contentRow.find(".book-author > .book-info-cell").first().text();
            let title = contentRow.find(".book-title > .book-info-cell").first().text();
            console.log(["DUPA" , body, id, author, title]);
            body.html("Do you want to delete book: " + author + " - " + title + " ?<br>");
            $("#deleteBookConfirmed").attr('data-bookid', id);
        });

        this.editDeleteButtons.children(".edit-book-button").click(goEditMode);

        this.saveCancelButtons.children(".cancel-edit-book-button").click(goInfoMode);

        this.saveCancelButtons.children(".save-book-button").click(function() {
            let contentRow = $(this).closest(".content-row");
            let id = (!newBook) ? contentRow.attr("data-bookid") : "";
            let type = !(newBook) ? "PUT" : "POST";
            let data = obj.editInputsToJson();
            ajaxCall({
                bookId: id,
                type: type,
                data: data,
                success: function(data) {
                    if (DEBUG) console.log("edit successful");
                    obj.updateData(data);
                    goInfoMode();
                },
                error: function(data) {
                    obj.showEditErrors(data);
                }
            })
        });

        this.addCancelButtons.children(".save-book-button").click(function() {
            /* TODO */
            console.log("test");
        });

        this.addCancelButtons.children(".cancel-add-book-button").click(function() {
            let contentRow = $(this).closest(".content-row");
            contentRow.addClass("d-none");
            $(contentRow).find("input").val("");
        });

        function goInfoMode() {
            obj.editDeleteButtons.removeClass("d-none");
            obj.infoCells.removeClass("d-none");
            obj.saveCancelButtons.addClass("d-none");
            obj.editCells.addClass("d-none");
        }


        function goEditMode() {
            obj.editDeleteButtons.addClass("d-none");
            obj.infoCells.addClass("d-none");
            obj.saveCancelButtons.removeClass("d-none");
            obj.editCells.removeClass("d-none");
        }

        function goAddMode() {
            obj.editDeleteButtons.addClass("d-none");
            obj.saveCancelButtons.addClass("d-none");
            obj.infoCells.addClass("d-none");
            obj.editCells.removeClass("d-none");
            obj.addCancelButtons.removeClass("d-none");
        }

    }



    editInputsToJson() {
        let data = {};
        $.each($(this.info).find(".book-edit-cell > input"), function () {
            let name = $(this).attr("name");
            let value = $(this).val();
            data[name] = value;
        });
        data['genre'] = $('select[name="genre"]').val();
        return data;
    };

    showEditErrors(data) {
        $.each($(this).find('input, select'), function() {
            $(this).removeClass('is-invalid');
        });

        let errors = $.parseJSON(data['responseText']);
        $.each(errors, function(key, values) {
            let failedElement = $('input[name="' + key + '"], select[name="' + key + '"]');
            failedElement.addClass('is-invalid');
            failedElement.tooltip({title: values.join(". ")});
            failedElement.tooltip('show');
        });
    };

    updateData(data) {
        $.each($(this.info).find("tr"), function() {
            let prop = $(this).attr("data-prop");
            let propValue = data[prop];
            let infoCell = $(this).find(".book-info-cell");
            let editCell = $(this).find(".book-edit-cell");
            if (prop === "genre") {
                infoCell.text(GENRES.genreFromNumbers(propValue));
                editCell.html("<select class='form-control' name='genre'>" + GENRES.generateGenreOptions(propValue) + "</select>");
            } else {
                infoCell.text(propValue);
                editCell.attr("value", propValue);
            }

        });
        // update cickable row title and author
        let selector = ".clickable-row[data-bookid='" + data.id + "']";
        let clickableRow = $(selector);
        clickableRow.children().eq(0).text(data.author);
        clickableRow.children().eq(1).text(data.title);
    };
}
