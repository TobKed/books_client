$(document).ready(function () {

    loadBooks();

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
                    // "<div class='book-info'>" +
                    // "</div>" +
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
        let url = 'book/' + id;
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
            "<p> genre: " + data.genre + "</p>" +
            "<p> isbn: " + data.isbn + "</p>" +
        "</div>"
    )
}