$(document).ready(function () {
    
});

function canRun() {
    if ($('input.is-invalid').length > 0) {
        return false;
    }

    return true;

}

function run() {
    $('#runButton')[0].innerHTML = '<i class="fa fa-spinner fa-spin"></i> Optimerar...';
    $('#runButton').removeClass('shaker');

    
}