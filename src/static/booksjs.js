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

    confirmedDeleteBookButtonAction();
}


function makeTableClickable() {
    $(".clickable-row").click(function () {
        $(this).toggleClass("bg-info");
        $(this).next().toggleClass("d-none");
        loadSingleBookInfo($(this).data('bookid'), $(this));
    });

    $(".clickable-row").css('cursor', 'pointer')
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
                    updateEditBookButton(div);
                    updateDeleteBookButton(div, id, data);
                },
                error: function () {
                    console.log("error - loadSingleBookInfo()");
                },
                complete: function () {
                    console.log("complete - loadSingleBookInfo()");
                }
            });
    }

    function updateDeleteBookModal(id, data) {
        let body = $("#confirmBookRemoveModal").find(".modal-body");
        body.html("Do you want to delete book: " + data.author + " - " + data.title + " ?<br>");
        $("#deleteBookConfirmed").attr('data-bookid', id);
    }

    function updateEditBookButton(div) {
        $(div).find(".edit-book-button, .cancel-edit-book-button").click(function () {
            let tableDataToFields = $(div).find(".book-info-cell, .book-edit-cell");
            $.each(tableDataToFields, function () {
                $(this).toggleClass("d-none");
            });
            let buttonDivs = $(div).siblings(".s-book-buttons").children();
            $.each(buttonDivs, function () {
                $(this).toggleClass("d-none");
            })
        });
    }

    function updateDeleteBookButton(div, id, data) {
        $(div).find(".delete-book-button").click(function () {
            updateDeleteBookModal(id, data);
        })
    }

}


function getSingleBookInfoDiv(data) {

    function genreFromNumbers(num) {
        return genres.hasOwnProperty(num) ? genres[num] : null;
    }

    return $("<table class='table mb-2 book-info-table'>" +
                "<tr class='bg-light'>" +
                    "<td> author: </td>" +
                    "<td class='book-info-cell' >" + data.author + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' type='text' value='" + data.author + "'></td>" +
                "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> title: </td>" +
                    "<td class='book-info-cell' >" + data.title + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' type='text' value='" + data.title + "'></td>" +
                "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> publisher: </td>" +
                "<td class='book-info-cell' >" + data.publisher + "</td>" +
                "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' type='text' value='" + data.publisher + "'></td>" +
                "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> genre: </td>" +
                    "<td class='book-info-cell' >" + genreFromNumbers(data.genre) + "</td>" +
                    "</tr>" +
                "<tr class='bg-light'>" +
                    "<td> isbn: </td>" +
                    "<td class='book-info-cell' >" + data.isbn + "</td>" +
                    "<td class='book-edit-cell p-1 align-middle d-none'><input class='form-control' type='text' value='" + data.isbn + "'></td>" +
                    "</tr>" +
            "</table>" +
            "<div class='s-book-buttons'>" +
                "<div class=''>" +
                    "<button type='button' class='btn btn-info mx-2 edit-book-button'>Edit</button>" +
                    "<button type='button' class='btn btn-danger mx-2 delete-book-button' data-toggle='modal' data-target='#confirmBookRemoveModal'>Delete</button>" +
                "</div>" +
                "<div class='d-none'>" +
                    "<button type='button' class='btn btn-info mx-2'>Save</button>" +
                    "<button type='button' class='btn btn-secondary mx-2 cancel-edit-book-button'>Cancel</button>" +
                "</div>" +
            "</div>"
    )
}


function confirmedDeleteBookButtonAction() {

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

