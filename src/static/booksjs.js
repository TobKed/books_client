$(document).ready(function () {

        $.ajax(
            {
                url: 'book/',
                data: {},
                type: "GET",
                dataType: "json",
                success:    booksSucces,
                error:      function () { console.log("error") },
                complete:   function () { console.log("complete") }
            });

});

function booksSucces(data) {
    console.log(data[0]);

    let tbody = $('#booksTable > tbody');

    $.each(data, function (key, val) {
        let titleAuthorRow = $(
            "<tr data-bookId=" + val.id + ">" +
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
