$(document).ready(function () {

    loadBooks();

});


function loadBooks() {
    $.ajax(
    {
        url: 'books/',
        data: {},
        type: "GET",
        dataType: "json",
        success:    booksSucces,
        error:      function () {
            console.log("error");
            errorLoadingBooks();
        },
        complete:   function () {
            console.log("complete");
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
    console.log(data[0]);

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
                "<td colspan=2>" +
                    "<div class='book-info'>" +
                    "</div>" +
                "</td>" +
            "</tr>"
        );

        let emptyRow = $("<tr style='display:none;'></tr>");

        tbody.append([titleAuthorRow, contentRow, emptyRow]);

    });

};

function makeTableClickable() {
    $(".clickable-row").click(function() {
        $(this).next().toggleClass("d-none");
    });

    addPointerToRow();
}

function addPointerToRow() {
    $(".clickable-row").css( 'cursor', 'pointer' )
}