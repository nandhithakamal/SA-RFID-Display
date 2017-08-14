$(document).ready(function(){
    var listItems = "Nothin'yet!";

    $("#count").html("5");
    $("#rightCol").html(listItems);

    loadTags();

    function loadTags(){
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: 'http://localhost:9090/index/data',
            success: function(tags){
                /*if($("#rightCol").html == "--" || $("#rightCol").html === "Nothin' yet!"){
                    $("#rightCol").html(tags + "\n");
                }else{
                    $('#rightCol').append(tags + "\n");
                }*/
                $("#rightCol").append("\n" + tags);
            },

            complete: setTimeout(loadTags, 1000)
        });
    }

})
