$(document).ready(function () {

    loadBooks();
    confirmedDeleteBookButtonAction()
});

let genres = {
    1: "Romans",
    2: "Obyczajowa",
    3: "Sci-fi i fantasy",
    4: "Literatura faktu",
    5: "Popularnonaukowa",
    6: "Poradnik",
    7: "Kryminał, sensacja"
};


function loadBooks() {
    $.ajax(
        {
            url: 'book/',
            data: {},
            type: "GET",
            dataType: "json",
            success: booksSucces,
            error: function () {
                console.log("error - loadBooks()");
                errorLoadingBooks();
            },
            complete: function () {
                console.log("complete - loadBooks()");
                makeTableClickable();
            }
        });
}


function errorLoadingBooks() {
    $('#booksTable > tbody').append("<tr><td colspan=2 class='text-center'> Error loading books </td></tr>")
}


function booksSucces(data) {
    let tbody = $('#booksTable > tbody');

    $.each(data, function (key, val) {
        let titleAuthorRow = $(
            "<tr class='clickable-row' data-bookId=" + val.id + ">" +
                "<td>" + val.author + "</td>" +
                "<td>" + val.title + "</td>" +
            "</tr>"
        );

        let contentRow = $(
            "<tr class='bg-light d-none'>" +
                "<td class='book-info container' colspan=2>" +
                "</td>" +
            "</tr>"
        );

        let emptyRow = $("<tr style='display:none;'></tr>");

        tbody.append([titleAuthorRow, contentRow, emptyRow]);
    });

    confirmedDeleteBookButtonAction();
    addNewBookRow();
}


function makeTableClickable() {
    let clickableRows = $(".clickable-row");
    clickableRows.click(function () {
        $(this).toggleClass("bg-info text-white");
        $(this).next().toggleClass("d-none");
        loadSingleBookInfo($(this).data('bookid'), $(this));
    });
    clickableRows.css('cursor', 'pointer')
}


function loadSingleBookInfo(id, row) {
    let info = row.next().find('.book-info');

    if (info.children().length == 0) {
        $.ajax(
            {
                url: 'book/' + id,
                data: {},
                type: "GET",
                dataType: "json",
                success: function (data) {
                    console.log("success - loadSingleBookInfo()");
                    successloadSingleBookInfo(data);
                },
                error: function () {
                    console.log("error - loadSingleBookInfo()");
                },
                complete: function () {
                    console.log("complete - loadSingleBookInfo()");
                }
            });
    }

    function successloadSingleBookInfo(data) {
        let div = getSingleBookInfoDiv(data);
        info.append(div);
        assignToggleShowEditBook(div);
        updateDeleteBookButton(div, id, data);
        updateSaveBookButton(div, id, data);
    }

    function toggleButtonsDivs(div) {
        let buttonDivs = $(div).siblings(".s-book-buttons").children();
        $.each(buttonDivs, function () {
            $(this).toggleClass("d-none");
        })
    }

    function updateDeleteBookModal(id, data) {
        let body = $("#confirmBookRemoveModal").find(".modal-body");
        body.html("Do you want to delete book: " + data.author + " - " + data.title + " ?<br>");
        $("#deleteBookConfirmed").attr('data-bookid', id);
    }

    function assignToggleShowEditBook(div) {
        $(div).find(".edit-book-button, .cancel-edit-book-button").click(function () {
            toggleShowEditBook(div);
        });
    }

    function toggleShowEditBook(div) {
        let tableDataToFields = $(div).find(".book-info-cell, .book-edit-cell");
        $.each(tableDataToFields, function () {
            $(this).toggleClass("d-none");
        });
        toggleButtonsDivs(div);
    }

    function updateDeleteBookButton(div, id, data) {
        $(div).find(".delete-book-button").click(function () {
            updateDeleteBookModal(id, data);
        })
    }

    function updateSaveBookButton(div, id, data) {
        $(div).find(".save-book-button").click(function () {
            $.ajax({
                    url: 'book/' + id,
                    data: editInputsToJson(div),
                    type: "PUT"})
                    .done(function (data) {
                        console.log("success - updateSaveBookButton()");
                        info.empty();
                        successloadSingleBookInfo(data);
                        updateClickableRow(id, data);
                    })
                    .fail(function (data) {
                        console.log("error - updateSaveBookButton(). data: " + data['responseText']);
                        showEditErrors(data, div);
                    })
                    .always(function () {
                        console.log("complete - updateSaveBookButton()");
                    })
        });

        function editInputsToJson(div) {
            data = {};
            $.each($(div).find(".book-edit-cell > input"), function() {
                let name = $(this).attr("name");
                let value = $(this).val();
                data[name] = value;
            });
            data['genre'] = $('select[name="genre"]').val();
            return data;
        }

        function updateClickableRow(id, data) {
            let selector = ".clickable-row[data-bookid='" + id + "']";
            let mainTr = $(selector);
            mainTr.children().eq(0).text(data.author);
            mainTr.children().eq(1).text(data.title);
        }

        function showEditErrors(data, div) {
            $.each(div.find('input, select'), function() {
                $(this).removeClass('is-invalid');
            });

            let errors = $.parseJSON(data['responseText']);
            $.each(errors, function(key, values) {
                let failedElement = $('input[name="' + key + '"], select[name="' + key + '"]');
                let errorInfo = $("<small class='text-danger'>" +  "Must be 8-20 characters long." + "</small>");
                console.log(failedElement);
                failedElement.addClass('is-invalid');
                failedElement.tooltip({title: values.join(". ")});
                failedElement.tooltip('show');
            });
        }
    }

}


function getSingleBookInfoDiv(data) {

    function genreFromNumbers(num) {
        return genres.hasOwnProperty(num) ? genres[num] : null;
    }

    function generateGenreOptions(num) {
        let rv = "";
        $.each(genres, function(genreNum, genreName) {
            rv += "<option value='" + genreNum + "'";
            if (genreNum == num) rv += "selected";
            rv += ">" + genreName + "</option>";
        });
        return rv;
    }

    return $("<table class='table mb-2 book-info-table'>" +
                "<tr class='bg-light'>" +
                    "<td> author: </td>" +
                    "<td class='book-info-cell' >" + data.author + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='author' placeholder='Author' type='text' value='" + data.author + "'></td>" +
                "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> title: </td>" +
                    "<td class='book-info-cell' >" + data.title + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='title' placeholder='Title' type='text' value='" + data.title + "'></td>" +
                "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> publisher: </td>" +
                "<td class='book-info-cell' >" + data.publisher + "</td>" +
                "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' maxlength='200' name='publisher' type='text' placeholder='Publisher' value='" + data.publisher + "'></td>" +
                "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> genre: </td>" +
                    "<td class='book-info-cell' >" + genreFromNumbers(data.genre) + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><select class='form-control' name='genre'>" + generateGenreOptions(data.genre) + "</select></td>" +
                    "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> isbn: </td>" +
                    "<td class='book-info-cell' >" + data.isbn + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input maxlength='17' class='form-control' name='isbn' placeholder='ISBN' type='text' value='" + data.isbn + "'></td>" +
                    "</tr>" +
            "</table>" +
            "<div class='s-book-buttons'>" +
                "<div class=''>" +
                    "<button type='button' class='btn btn-info mx-2 edit-book-button'>Edit</button>" +
                    "<button type='button' class='btn btn-danger mx-2 delete-book-button' data-toggle='modal' data-target='#confirmBookRemoveModal'>Delete</button>" +
                "</div>" +
                "<div class='d-none'>" +
                    "<button type='button' class='btn btn-info mx-2 save-book-button'>Save</button>" +
                    "<button type='button' class='btn btn-secondary mx-2 cancel-edit-book-button'>Cancel</button>" +
                "</div>" +
            "</div>"
    )
}


function confirmedDeleteBookButtonAction() {

    // http://webroxtar.com/2011/10/solution-jquery-click-event-gets-called-twice-fires-twice/
    $('#deleteBookConfirmed').unbind('click').click(function () {
        let id = $(this).attr("data-bookid");
        $.ajax({
                url: 'book/' + id,
                data: {},
                type: "DELETE",
                dataType: "json",
                success: function (data) {
                    console.log("success - confirmedDeleteBookButtonAction()");
                    $('#confirmBookRemoveModal').modal('hide');
                    deleteBookTrs(id);
                },
                error: function () {
                    console.log("error - confirmedDeleteBookButtonAction()");
                },
                complete: function () {
                    console.log("complete - confirmedDeleteBookButtonAction()");
                }
        });
    });

    function deleteBookTrs(id) {
        let selector = ".clickable-row[data-bookid='" + id + "']";
        let mainTr = $(selector);
        mainTr.next().next().remove();
        mainTr.next().remove();
        mainTr.remove();
    }

}

function addNewBookRow() {
    let tbody = $('#booksTable > tbody');
    let titleAuthorRow = $(
        "<tr class='clickable-row bg-primary text-light text-center' data-bookId='-1'>" +
            "<td colspan='2'> ADD NEW BOOK </td>" +
        "</tr>"
    );

    let contentRow = $(
        "<tr class='bg-light d-none'>" +
            "<td class='book-info container' colspan=2>" +
            "</td>" +
        "</tr>"
    );

    let emptyRow = $("<tr style='display:none;'></tr>");

    tbody.append([titleAuthorRow, contentRow, emptyRow]);
}