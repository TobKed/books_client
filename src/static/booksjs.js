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
                "<td class='book-info' colspan=2>" +
                "</td>" +
            "</tr>"
        );

        let emptyRow = $("<tr style='display:none;'></tr>");

        tbody.append([titleAuthorRow, contentRow, emptyRow]);
    });

};

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
    return $("<div>" +
            "<p> author: " + data.author + "</p>" +
            "<p> title: " + data.title + "</p>" +
            "<p> publisher: " + data.publisher + "</p>" +
            "<p> genre: " + genreFromNumbers(data.genre) + "</p>" +
            "<p> isbn: " + data.isbn + "</p>" +
            "</div>" +
                "<a class='btn btn-info mx-2' href='#'>Update</a>" +
                "<button type='button' class='btn btn-danger mx-2' data-toggle='modal' data-target='#confirmBookRemoveModal'>Delete</button>" +
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
    $("#confirmBookRemoveModal").find("#deleteBookConfirmed").data( "foo", 52 );
}

function deleteBookButton() {
    $('#deleteBookConfirmed').click(function(e){
      e.preventDefault();
      $('#confirmBookRemoveModal').modal('hide')
    });
};