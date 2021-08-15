function canRun() {
    //Inga juniorer --> Kör ej
    if (juniorList.length == 0) {
        return false;
    }

    //Inte fyllt i alla siffror --> Kör ej
    //Kollar bara siffror och inte på useAllBoats
    let data = getBoatNumbers().splice(3);
    if (Object.values(data).some(num => num == '')) {
        return false;
    }

    //Uppdatera is-invalid genom kontroll av rimlighet (finns tillräckligt med platser osv)
    checkValidBoats();
    
    //Är något inputfält rödmarkerat?
    if ($('input.is-invalid').length > 0) {
        return false;
    }

    return true;

}

async function optimize() {
    $('#runButton').removeClass('shaker');

    if (!canRun()) {
        $('#runButton').addClass('btn-danger');
        $('#runButton')[0].innerHTML = 'Det finns problem i din modell...';
        setTimeout(function() {
            $('#runButton').removeClass('btn-danger');
            $('#runButton')[0].innerHTML = 'Optimera!';
            $('#runButton').addClass('shaker');
        }, 3000);
        return 0;

    } else {
        $('#runButton')[0].innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.2em"></i> Optimerar';
        $('#runButton')[0].disabled = true;
    }

    // Calculating iteration timesplit, maximum runtime is 20 seconds (server timeout issues)
    maxTime = $('#maxTimeControl').val()
    let iterations = Math.ceil(maxTime / 20)
    maxTime = maxTime / iterations

    let payload = [];
    payload[0] = juniorList;
    payload[1] = boatParams;
    payload[2] = bivillkor;
    payload[3] = maxTime;

    let response = await do_post(payload)
    var i = 1
    while (true) {
        if (response.status == 'Optimal' || i >= iterations) {
            break;
        }
        payload[4] = response.hints
        response = await do_post(payload)
        i ++
    }
    output_response(response)
    
}

async function do_post(payload) {
    const result = await $.ajax({
        type: 'POST',
        url: window.location.href + 'optimize/',
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (response) {
            return response
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            error_response('Något gick fel... Hör av er till Jonas')
            console.log(XMLHttpRequest)
            console.log(textStatus)
            console.log(errorThrown)
        }
    });

    return result;
}

function error_response(text) {
    $('#runButton')[0].innerHTML = text;
        $('#runButton').addClass('btn-danger');

        setTimeout(function() {
            $('#runButton').removeClass('btn-danger');
            $('#runButton')[0].innerHTML = 'Optimera!';
            $('#runButton').addClass('shaker');
        }, 5000);
}

function output_response(response) {
    $('#runButton')[0].disabled = false;
    if (response.success) {
        $('#runButton')[0].innerHTML = '<i class="fa fa-check"></i> Klar!';

        setTimeout(function() {
            $('#runButton').addClass('shaker');
            $('#runButton')[0].innerHTML = 'Kör igen!';
        }, 10000);

    } else {
        error_response('Problemet saknar lösning!')
        return null
    }

    $('#wishes-fulfilled')[0].innerHTML = response.objective_value + ' uppfyllda önskningar'
    $('#resultDisplay').html('')

    //Hjälpvariabel för utskrift av rätt båtnummer
    let n = 1;
    //För varje båt som skickas i svaret
    for (let i = 0; i < Object.keys(response.boats).length; i++) {
        
        //Om båten inte är tom (kan hända!)
        if (!$.isEmptyObject(response.boats[i])) {
            let boatHTML = '<div class="col-md-6 col-lg-4 mb-5">' +
            '<div class="portfolio-item mx-auto" style="background-color: #a3bfe9; padding-bottom: 1em; cursor: default;">' +
                
                '<h4 class="juniorName">Båt ' +  n + '</h4>';
            n ++

            boatHTML += getPrintoutHTML('Junior', 'Uppfyllda önskningar')
            

            //För varje namn i båten
            for (let j = 0; j < Object.keys(response.boats[i]).length; j ++) {
                let junior = juniorList.find(jun => jun.name == response.boats[i][j])
                let wishes = 0

                //Räknar ut hur många önskemål varje person har fått uppfyllt
                response.boats[i].forEach(element => {
                    if (junior.wishes.includes(element)) {
                        wishes ++
                    }
                });

                boatHTML += getPrintoutHTML(junior.name, wishes)
            }


            $('#resultDisplay').append(boatHTML + '</div></div>') 
            
            
        }

    }
}

function getPrintoutHTML(name, wishes) {
    return '<div class="row">' +
    '<div class="col" style="text-align: center">' +
        '<h5>' + name + '</h5>' +
    '</div>' +
    '<div class="col">' +
        '<h5 style="text-align: center">' + wishes + '</h5>' +
    '</div>' +
    '</div>';
}