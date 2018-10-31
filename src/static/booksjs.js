$(document).ready(function () {

    loadBooks();
    deleteBookButton();

});


function loadBooks() {
    $.ajax(
    {
        url: 'book/',
        data: {},
        type: "GET",
        dataType: "json",
        success:    booksSucces,
        error:      function () {
            console.log("error - loadBooks()");
            errorLoadingBooks();
        },
        complete:   function () {
            console.log("complete - loadBooks()");
            makeTableClickable();
        }
    });
}

function errorLoadingBooks() {
    $('#booksTable > tbody').append("<tr>" +
                    "<td colspan=2 class='text-center'> Error loading books </td>" +
                "</tr>")
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

}

function makeTableClickable() {
    $(".clickable-row").click(function() {
        $(this).toggleClass("bg-info");
        $(this).next().toggleClass("d-none");
        loadSingleBookInfo($(this).data('bookid'), $(this));
    });

    addPointerToRow();
}

function addPointerToRow() {
    $(".clickable-row").css( 'cursor', 'pointer' )
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
                    let div = getSingleBookInfoDiv(data);
                    info.append(div);
                    updateDeleteBookModal(data.author + " - " + data.title, data.id);
                },
                error: function () {
                    console.log("error - loadSingleBookInfo()");
                },
                complete: function () {
                    console.log("complete - loadSingleBookInfo()");
                }
            });
    }
}

function getSingleBookInfoDiv(data) {
    return $("<table class='table mb-2'>" +
                "<tr class='bg-light'><td> author: </td>    <td class='book-author'>" + data.author + "</td></tr>" +
                "<tr class='bg-light'><td> title: </td>     <td class='book-title'>" + data.title + "</td></tr>" +
                "<tr class='bg-light'><td> publisher: </td> <td class='book-publisher'>" + data.publisher + "</td></tr>" +
                "<tr class='bg-light'><td> genre: </td>     <td class='book-genre'>" + genreFromNumbers(data.genre) + "</td></tr>" +
                "<tr class='bg-light'><td> isbn: </td>      <td class='book-isbn'>" + data.isbn + "</td></tr>" +
            "</table>" +
            "<div class='single-book-buttons-standard'>" +
                "<button type='button' class='btn btn-info mx-2''>Delete</button>" +
                "<button type='button' class='btn btn-danger mx-2' data-toggle='modal' data-target='#confirmBookRemoveModal'>Delete</button>" +
            "</div>" +
            "<div class='single-book-buttons-save d-none'>" +
                "<button type='button' class='btn btn-info mx-2'>Save</button>" +
                "<button type='button' class='btn btn-secondary mx-2'>Cancel</button>" +
            "</div>"
    )
}

function genreFromNumbers(num) {
    let genres = {
        1: "Romans",
        2: "Obyczajowa",
        3: "Sci-fi i fantasy",
        4: "Literatura faktu",
        5: "Popularnonaukowa",
        6: "Poradnik",
        7: "Kryminał, sensacja"
    };
    return genres.hasOwnProperty(num) ? genres[num] : null;
}

function updateDeleteBookModal(modalBody, id) {
    let body = $("#confirmBookRemoveModal").find(".modal-body");
    body.html("Do you want to delete book: " + modalBody + " ?<br>");
    $("#deleteBookConfirmed").attr('data-bookid', id);
}

function deleteBookButton() {
    $('#deleteBookConfirmed').click(function (e) {
        e.preventDefault();
        let id = $(this).attr("data-bookid");
        $.ajax(
            {
                url: 'book/' + id,
                data: {},
                type: "DELETE",
                dataType: "json",
                success: function (data) {
                    console.log("success - deleteBookButton()");
                    $('#confirmBookRemoveModal').modal('hide');
                    deleteBookTrs(id);
                },
                error: function () {
                    console.log("error - deleteBookButton()");
                },
                complete: function () {
                    console.log("complete - deleteBookButton()");
                }
            });

    });
}

function deleteBookTrs(id) {
    let selector = ".clickable-row[data-bookid='" + id + "']";
    let mainTr = $(selector);
    mainTr.next().next().remove();
    mainTr.next().remove();
    mainTr.remove();
}
