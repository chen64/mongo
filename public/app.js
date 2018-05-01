$(document).on("click", "p", function() {
    $("#note").empty();
    var thisId = $(this).attr("data-id");  
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
        .then(function(data) {
            console.log(data);
            $("#note").append("<textarea id='bodyinput' name='body'></textarea>");
            $("#note").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
            if (data.note) {
                $("#titleinput").val(data.note.title);
                $("#bodyinput").val(data.note.body);
            }
      });
  });
  
$(document).on("click", "#savenote", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
        }
    })
    .then(function(data) {
        console.log(data);
        $("#notes").empty();
    });
  
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  