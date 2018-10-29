$(document).ready(function () {

    $('#populate').on('click', function () {
        $(this).remove();

        $.ajax(
            {
                url: 'book/',
                data: {},
                type: "GET",
                dataType: "json",
                success: booksSucces,
                error: function () {
                },
                complete: function () {
                }
            });
    });


});

function booksSucces(data) {
    console.log(data);

    $.each(data, function (key, val) {
        $('#booksTable').append("<tr height='100' class='book-row' data-id=" + val.id + ">" +
            "<td>" + val.id + "</td>" +
            "<td>" + val.author + "</td>" +
            "<td>" + val.title + "</td>" +
            "</tr>");

    });

    $.each($('.book-row'), function () {
        $(this).hover(function () {
                let bookId = $(this).data('id');
                $.ajax(
                    {
                        url: 'book/' + bookId,
                        data: {},
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            $("table").find("[data-id='" + bookId + "']").append("<td class = 'info'>" + data.isbn + "</td>" +
                                                                                 "<td class = 'info'>" + data.publisher + "</td>");
                        },
                    });
            }
        , function () {
            $(this).find('.info').remove();
            }
        )
    })
}
