var boatParams = [];
var bivillkor = [];

if (localStorage.getItem('boatParams') !== null) {
    boatParams = JSON.parse(localStorage.getItem('boatParams'));

    $('#noBoats').val(boatParams[0]);
    $('#minCrew').val(boatParams[1]);
    $('#maxCrew').val(boatParams[2]);
    $('#useAllBoats')[0].selectedIndex = boatParams[3] == false ? 0 : 1;

    checkValidBoats();

}

if (localStorage.getItem('bivillkor') !== null) {
    bivillkor = JSON.parse(localStorage.getItem('bivillkor'));

    while (bivillkor.length > $("#bvContainer div.row").length) {
        addMoreBV();
    }

    for (let i = 0; i < bivillkor.length; i++) {
        $('#bv' + i + '-name1').val(bivillkor[i].name1);
        $('#bv' + i + '-name2').val(bivillkor[i].name2);
        $('#bv' + i + '-type')[0].selectedIndex = bivillkor[i].mustSail ? 0 : 1;

        validateBV(i);
    }

}

function saveBoatParams() {
    boatParams[0] = $('#noBoats').val();
    boatParams[1] = $('#minCrew').val();
    boatParams[2] = $('#maxCrew').val();
    boatParams[3] = $('#useAllBoats')[0].selectedIndex != 0;


    localStorage.setItem('boatParams', JSON.stringify(boatParams));
}

function saveBV() {
    bivillkor = [];
    for (let i = 0; i < $("#bvContainer div.row").length; i++) {
        bivillkor[i] = {};
        if ($('#bv' + i + '-name1').val() === "" && $('#bv' + i + '-name2').val() === "") {
            continue;
        }

        
        bivillkor[i].name1 = $('#bv' + i + '-name1').val();
        bivillkor[i].name2 = $('#bv' + i + '-name2').val();
        bivillkor[i].mustSail = $('#bv' + i + '-type')[0].selectedIndex == 0;
    }

    bivillkor = bivillkor.filter(function(e) {
        return Object.keys(e).length != 0;
    })
    localStorage.setItem('bivillkor', JSON.stringify(bivillkor));

}

$(document).ready(function () {
    $("#noBoats").change(function () {
        if ($("#noBoats").val() < 0) {
            $("#noBoats").val(0);
        }

        if (!Number.isInteger($("#noBoats").val())) {
            $("#noBoats").val(Math.floor($("#noBoats").val()));
        }

        checkValidBoats();
    });

    $("#minCrew").change(function () {
        if ($("#minCrew").val() < 0) {
            $("#minCrew").val(0);
        }

        if (!Number.isInteger($("#minCrew").val())) {
            $("#minCrew").val(Math.floor($("#minCrew").val()));
        }

        checkValidBoats();
    });

    $("#maxCrew").change(function () {
        if ($("#maxCrew").val() < 0) {
            $("#maxCrew").val(0);
        }

        if (!Number.isInteger($("#maxCrew").val())) {
            $("#maxCrew").val(Math.floor($("#maxCrew").val()));
        }

        checkValidBoats();
    });

    $('#bv0-name1').change(function () {
        validateBV(0);
        saveBV();
    });

    $('#bv0-name2').change(function () {
        validateBV(0);
        saveBV();
    });

});

function checkValidBoats() {
    let ids = ['#noBoats', '#minCrew', '#maxCrew'];
    let data = getBoatNumbers();
    let noJuniors = $("#noJuniors")[0].value;

    ids.forEach(function (id) {
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


    ids.forEach(function (id) {
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
    let n = $("#bvContainer div.row").length;


    $('#bvContainer').append('' +
        '<div class="row" style="margin-top: 1em">' +
        '<div class="col-md-4">' +
        '<input type="Text" class="form-control" id="bv' + n + '-name1" placeholder="Namn" >' +
        '<div class="invalid-feedback" id="bv' + n + '-name1-feedback"></div>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<select id="bv' + n + '-type" class="form-control">' +
        '<option selected>Måste segla med</option>' +
        '<option>Får inte segla med</option>' +
        '</select>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<input type="Text" class="form-control" id="bv' + n + '-name2" placeholder="Namn" >' +
        '<div class="invalid-feedback" id="bv' + n + '-name2-feedback"></div>' +
        '</div>' +
        '</div>');

    $('#bv' + n + '-name1').change(function () {
        validateBV(n);
        saveBV();
    });

    $('#bv' + n + '-name2').change(function () {
        validateBV(n);
        saveBV();
    });

    $('#bv' + n + '-type').change(function () {
        saveBV();
    });

}

function validateBV(i) {
    let name1 = $('#bv' + i + '-name1');
    let name2 = $('#bv' + i + '-name2');
    name1[0].classList.remove('is-valid', 'is-invalid');
    name2[0].classList.remove('is-valid', 'is-invalid');

    if (name1.val() !== "") {
        if (juniorList.some(j => j.name == name1.val())) {
            name1.addClass('is-valid');
        } else {
            name1.addClass('is-invalid');
            $('#bv' + i + '-name1-feedback')[0].innerHTML = 'Junioren finns inte.'
        }
    } 

    if (name2.val() !== "") {
        if (juniorList.some(j => j.name == name2.val())) {
            name2.addClass('is-valid');
        } else {
            name2.addClass('is-invalid');
            $('#bv' + i + '-name2-feedback')[0].innerHTML = 'Junioren finns inte.'
        }
    }

    if (name1.val() == name2.val() && name1.val() !== "") {
        name1.addClass('is-invalid');
        $('#bv' + i + '-name1-feedback')[0].innerHTML = 'Orimligt bivillkor.'
        name2.addClass('is-invalid');
        $('#bv' + i + '-name2-feedback')[0].innerHTML = 'Orimligt bivillkor.'

    }

    if (name1.val() === "" && name2.val() !== "") {
        name1.addClass('is-invalid');
        $('#bv' + i + '-name1-feedback')[0].innerHTML = 'Får inte vara tom.'
    }

    if (name2.val() === "" && name1.val() !== "") {
        name2.addClass('is-invalid');
        $('#bv' + i + '-name2-feedback')[0].innerHTML = 'Får inte vara tom.'
    }

}