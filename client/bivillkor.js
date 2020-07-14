var boatParams = [];
  
if (localStorage.getItem('boatParams') !== null) {
    boatParams = JSON.parse(localStorage.getItem('boatParams'));
  
    $('#noBoats').val(boatParams[0]);
    $('#minCrew').val(boatParams[1]);
    $('#maxCrew').val(boatParams[2]);
    $('#useAllBoats')[0].selectedIndex = boatParams[3] == false ? 0 : 1;

    checkValidBoats();

} 

function saveBoatParams() {
    boatParams[0] = $('#noBoats').val();
    boatParams[1] = $('#minCrew').val();
    boatParams[2] = $('#maxCrew').val();
    boatParams[3] = $('#useAllBoats')[0].selectedIndex != 0;


    localStorage.setItem('boatParams', JSON.stringify(boatParams));           
}

$( document ).ready(function() {
    $("#noBoats").change(function() {
        if ($("#noBoats").val() < 0) {
            $("#noBoats").val(0);
        }

        if (!Number.isInteger($("#noBoats").val())) {
            $("#noBoats").val(Math.floor($("#noBoats").val()));
        }

        checkValidBoats();
    });

    $("#minCrew").change(function() {
        if ($("#minCrew").val() < 0) {
            $("#minCrew").val(0);
        }

        if (!Number.isInteger($("#minCrew").val())) {
            $("#minCrew").val(Math.floor($("#minCrew").val()));
        }

        checkValidBoats();
    });

    $("#maxCrew").change(function() {
        if ($("#maxCrew").val() < 0) {
            $("#maxCrew").val(0);
        }

        if (!Number.isInteger($("#maxCrew").val())) {
            $("#maxCrew").val(Math.floor($("#maxCrew").val()));
        }

        checkValidBoats();
    });

});

function checkValidBoats() {
    let ids = ['#noBoats', '#minCrew', '#maxCrew'];
    let data = getBoatNumbers();
    let noJuniors = $("#noJuniors")[0].value;

    ids.forEach(function(id) {
        $(id)[0].classList.remove('is-invalid');
        $(id)[0].classList.remove('is-valid');
    });

    //För få platser
    if (data["noBoats"] !== "" && data["maxCrew"] !== "") {
        if (data["noBoats"] * data["maxCrew"] < noJuniors) {
            $('#noBoats').addClass('is-invalid');
            $('#maxCrew').addClass('is-invalid');
            $('#noBoatsFeedback')[0].innerHTML = 'För få platser! Öka antal båtar eller maximal besättning!';
            $('#maxCrewFeedback')[0].innerHTML = 'För få platser! Öka antal båtar eller maximal besättning!';
        }
    }
    
    

    //Konstiga intervall
    if (data["minCrew"] !== "" && data["maxCrew"] !== "") {
        if (data["minCrew"] > data["maxCrew"]) {
            $('#minCrew').addClass('is-invalid');
            $('#maxCrew').addClass('is-invalid');
            $('#minCrewFeedback')[0].innerHTML = "Minsta besättning måste vara mindre än största!";
            $('#maxCrewFeedback')[0].innerHTML = "Största besättning måste vara större än minsta!";
        }
    }
    

    ids.forEach(function(id) {
        if (!$(id).hasClass('is-invalid') && data[id.substr(1)] !== "") {
            $(id).addClass('is-valid');
        }

    });

    saveBoatParams();
    
}

function getBoatNumbers() {
    let data = [];
    data["noBoats"] = $("#noBoats")[0].value;
    data["minCrew"] = $("#minCrew")[0].value;
    data["maxCrew"] = $("#maxCrew")[0].value;

    return data;
}
function addMoreBV() {
    let n = $("#bvContainer div.row").length - 1;
  
  
      $('#bvContainer').append('' + 
        '<div class="row" style="margin-top: 1em">' +
        '<div class="col-md-4">' +
            '<input type="Text" class="form-control" id="bv' + n + '-name1" placeholder="Namn" >' +
            '<div class="invalid-feedback" id="bv' + n + '-name1-feedback"></div>' +
        '</div>' +
        '<div class="col-md-4">' +
            '<select id="bv1-type" class="form-control">' +
                '<option selected>Måste segla med</option>' +
                '<option>Får inte segla med</option>' +
              '</select>' +
        '</div>' +
        '<div class="col-md-4">' +
            '<input type="Text" class="form-control" id="bv' + n + '-name2" placeholder="Namn" >' +
            '<div class="invalid-feedback" id="bv' + n + '-name2-feedback"></div>' +
        '</div>' +
    '</div>');
}