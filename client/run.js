function canRun() {
    if ($('input.is-invalid').length > 0) {
        return false;
    }

    return true;

}

function optimize() {
    if (!canRun()) {
        
        $('#runButton').removeClass('shaker');
        $('#runButton').addClass('btn-danger');
        $('#runButton')[0].innerHTML = 'Kan inte köras...';
        setTimeout(function() {
            $('#runButton').removeClass('btn-danger');
            $('#runButton')[0].innerHTML = 'Optimera';
            $('#runButton').addClass('shaker');
        }, 1000);
        return 0;

    }

    setTimeout(function() {
        
    }, 2000);

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
            $('#runButton')[0].innerHTML = '<i class="fa fa-check"></i> Klar!';
            setTimeout(function() {
                $('#runButton').addClass('shaker');
                $('#runButton')[0].innerHTML = 'Kör igen!';
            }, 10000);
            
        }
    });
   

    
}