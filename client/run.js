function canRun() {
    if ($('input.is-invalid').length > 0) {
        return false;
    }

    return true;

}
var resp
function optimize() {
    $('#runButton').removeClass('shaker');

    if (!canRun()) {
        $('#runButton').addClass('btn-danger');
        $('#runButton')[0].innerHTML = 'Kan inte köras...';
        setTimeout(function() {
            $('#runButton').removeClass('btn-danger');
            $('#runButton')[0].innerHTML = 'Optimera';
            $('#runButton').addClass('shaker');
        }, 1000);
        return 0;

    }

    let payload = [];
    payload[0] = juniorList;
    payload[1] = boatParams;
    payload[2] = bivillkor;

    $.ajax({
        type: 'POST',
        url: "http://localhost:5000" + '/optimize/',
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (response) {
            resp = response
            if (response.success) {
                $('#runButton')[0].innerHTML = '<i class="fa fa-check"></i> Klar!';

                setTimeout(function() {
                    $('#runButton').addClass('shaker');
                    $('#runButton')[0].innerHTML = 'Kör igen!';
                }, 10000);

            } else {
                $('#runButton')[0].innerHTML = 'Problemet saknar lösning!';
                $('#runButton').addClass('btn-danger');

                setTimeout(function() {
                    $('#runButton').removeClass('btn-danger');
                    $('#runButton')[0].innerHTML = 'Optimera';
                    $('#runButton').addClass('shaker');
                }, 5000);
                return null
            }

            $('#resultDisplay').html('')
            //För varje båt som skickas i svaret

            //Hjälpvariabel för utskrift av rätt båtnummer
            let n = 1;
            for (let i = 0; i < Object.keys(response.boats).length; i++) {
                
                //Om båten inte är tom (kan hända!)
                if (!$.isEmptyObject(response.boats[i])) {
                    let boatHTML = '<div class="col-md-6 col-lg-4 mb-5">' +
                    '<div class="portfolio-item mx-auto" style="background-color: #a3bfe9; padding-bottom: 1em;">' +
                        
                        '<h4 class="juniorName">Båt ' +  n + '</h4>';
                    n ++
                    

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

                        boatHTML += '<div class="row">' +
                        '<div class="col" style="text-align: center">' +
                            '<h5>' + junior.name + '</h5>' +
                        '</div>' +
                        '<div class="col">' +
                            '<h5 style="text-align: center">' + wishes + '</h5>' +
                        '</div>' +
                    '</div>';
                    }


                    $('#resultDisplay').append(boatHTML + '</div></div>') 
                    
                    
                }

            }            


        }
    });
   

    
}