class Junior {
    constructor (name) {
      this.name = name;
      this.wishes = [];
    }
  
    setWish(n, name) {
      wishes[n] = name;
    }
  
}

var juniorList = [];
  
  if (localStorage.getItem('juniorList') !== null) {
    juniorList = JSON.parse(localStorage.getItem('juniorList'));
    load();
  } 
  
  function save() {
    localStorage.setItem('juniorList', JSON.stringify(juniorList));           
  }
  
  function load() {
    juniorList.forEach(function(j) {
      $("#juniorDisplay").prepend('<div class="col-md-6 col-lg-4 mb-5" id="juniorContainer-' + j.name + '">' +
        '<div class="portfolio-item mx-auto" onclick="displayChangeModal(' + "'" + j.name + "'" + ')">' +
          '<div class="portfolio-item-caption d-flex align-items-center justify-content-center h-100 w-100">' +
            '<div class="portfolio-item-caption-content text-center text-white"><i class="fas fa-pen fa-2x"></i></div>' +
          '</div>' + 
        '<h4 class="juniorName" id="juniorLabel-' + j.name + '">' + j.name + '</h4>' + 
    '</div></div>');
  
    
    })
    validateAllWishes();
    $("#noJuniors")[0].value = juniorList.length;
  }

  function resetAll() {
    juniorList = [];
    localStorage.setItem('juniorList', JSON.stringify(juniorList));

    boatParams = {};
    localStorage.setItem('boatParams', JSON.stringify(boatParams));

    bivillkor = [];
    localStorage.setItem('bivillkor', JSON.stringify(bivillkor));

    location.reload();
    
    
    
  }
  
  
  
  function removeJunior() {
    let name = $("#changeJuniorFormName")[0].value;
    juniorList = juniorList.filter(function(e) { return e.name !== name });
    $('#juniorContainer-' + name)[0].parentNode.removeChild($('#juniorContainer-' + name)[0])
    $("#changeJuniorModal").modal('hide');
  
    $("#noJuniors")[0].value = juniorList.length;
    validateAllWishes();
    save();
  
  }
  
  function addJunior() {
    let name = $("#newJuniorFormName")[0].value;
  
    if (juniorList.some(j => j.name == name)) {
  
      $("#newJuniorFormNameContainer").html('<h4 class="text-secondary mb-0">Namn</h4>' +
          '<input type="text" class="form-control is-invalid" id="newJuniorFormName" placeholder="Namn"></input>' +
          '<div class="invalid-feedback" id="duplicateNameFeedback">Det finns redan en junior med det här namnet.</div>');
      return 0;
    } else if (name == "") {
      $("#newJuniorFormNameContainer").html('<h4 class="text-secondary mb-0">Namn</h4>' +
          '<input type="text" class="form-control is-invalid" id="newJuniorFormName" placeholder="Namn"></input>' +
          '<div class="invalid-feedback" id="duplicateNameFeedback">Du måste ange ett namn.</div>');
      return 0;
    }
  
    //Om det finns röd text --> ta bort den!
    if ($("#duplicateNameFeedback").length) {
      $("#duplicateNameFeedback")[0].parentNode.removeChild($("#duplicateNameFeedback")[0])
      $("#newJuniorFormName").removeClass('is-invalid');
    }
  
    $("#newJuniorFormName").addClass('is-valid');
    setTimeout(function() {$("#newJuniorModal").modal('hide')}, 200); 
    
  
    $("#juniorDisplay").prepend('<div class="col-md-6 col-lg-4 mb-5" id="juniorContainer-' + name + '">' +
    '<div class="portfolio-item mx-auto" onclick="displayChangeModal(' + "'" + name + "'" + ')">' +
        '<div class="portfolio-item-caption d-flex align-items-center justify-content-center h-100 w-100">' +
            '<div class="portfolio-item-caption-content text-center text-white"><i class="fas fa-pen fa-2x"></i></div>' +
        '</div>' + 
        '<h4 class="juniorName" id="juniorLabel-' + name + '">' + name + '</h4>' + 
    '</div></div>');
  
    juniorList.push(new Junior(name));
    $("#noJuniors")[0].value = juniorList.length;
    validateAllWishes();
    save();
  
  }
  
  function displayAddModal() {
    $("#newJuniorFormNameContainer").html('<h4 class="text-secondary mb-0">Namn</h4>' +
          '<input type="text" class="form-control" id="newJuniorFormName" placeholder="Namn"></input>');
    $("#newJuniorModal").modal();

  }

$('#newJuniorModal').on('shown.bs.modal', function () {
    $('#newJuniorFormName').focus();
});

  
  //Visar ändra junior-modal
  //Resettar allt och sätter namnet till rätt
  //Validerar önskningar
  function displayChangeModal(name) {
    //Resettar så det inte finns input validation
    $("#juniorFormWishfields").html('<div class="form-row">' + 
      '<div class="col">' +
          '<input type="text" class="form-control" id="juniorPref0" placeholder="Önskemål">' +
      '</div>' + 
      '<div class="col">' + 
          '<input type="text" class="form-control" id="juniorPref1" placeholder="Önskemål">' + 
      '</div>' +
      '</div>');
    
    $("#changeJuniorModal").modal();
    $("#changeJuniorFormName")[0].value = name;
  
    junior = juniorList.filter(function(j) { if (j.name == name) { return j }})[0]
  
    while (junior.wishes.length > $("#juniorFormWishfields div.col").length) {
      addMoreWishFields();
    }
  
    wishes = junior.wishes.filter(function(s) { if (s) { return s }})
  
    for (let i = 0; i < wishes.length; i ++) {
      let inputField = $("#juniorPref" + i);
  
      inputField[0].value = wishes[i];
    }
    
    validateWishes(name);


  }

  $('#changeJuniorModal').on('shown.bs.modal', function () {
    $('#juniorPref0').focus();
});
  
  //Körs när man trycker klar
  //Validerar och uppdaterar
  //Stänger sedan modal
  function updateWishes() {
    name = $("#changeJuniorFormName")[0].value;
    
  
    junior = juniorList.filter(function(j) { if (j.name == name) { return j }})[0]
  
    junior.wishes = [];
    for (let i = 0; i < $("#juniorFormWishfields div.col").length; i ++) {
      let input = $("#juniorPref" + i)[0].value;
  
      if (input) {
        junior.wishes.push(input)
      }
    }
  
    
    validateWishes(name);
    setTimeout(function() {$("#changeJuniorModal").modal('hide')}, 200); 
    save();
  }
  
  //Kollar det användaren skrivit in i fälten på changeJuniorModal
  //Grön om finns, röd om inte finns
  //Gör inget om fältet är tomt
  function validateWishes(name = null) {
    if (name === null) {
      name = $("#changeJuniorFormName")[0].value;
    }
  
    let ok = true;
    junior = juniorList.filter(function(j) { if (j.name == name) { return j }})[0]
  
    for (let i = 0; i < $("#juniorFormWishfields div.col").length; i ++) {
      let inputField = $("#juniorPref" + i);
      inputField[0].classList.remove('is-valid', 'is-invalid');
  
      if (inputField[0].value) {
        if (juniorList.some(j => j.name == inputField[0].value) && inputField[0].value !== name) {
          inputField.addClass('is-valid');
        } else {
          inputField.addClass('is-invalid');
          ok = false;
        }
      }
    }
  
    if (!ok) {
      $('#juniorLabel-' + name).addClass('invalid-wishes');
      setJuniorStatus(false);
    } else if ($('#juniorLabel-' + name)[0].classList.contains('invalid-wishes')) {
        $('#juniorLabel-' + name).removeClass('invalid-wishes');
    }
  
    validateAllWishes();
  }
  
  function validateAllWishes() {
    let validStatus = true;
  
    juniorList.forEach(function(j) {
      let ok = true;
      
      wishes = j.wishes.filter(function(s) { if (s) { return s }})
  
      for (let i = 0; i < wishes.length; i ++) {
        if (!juniorList.some(j => j.name == wishes[i])) {
          ok = false;
          validStatus = false;
          break;
        }
      }
  
      if (!ok) {
        $('#juniorLabel-' + j.name).addClass('invalid-wishes');
      } else if ($('#juniorLabel-' + j.name)[0].classList.contains('invalid-wishes')) {
          $('#juniorLabel-' + j.name).removeClass('invalid-wishes');
      }
  
  
    })
    setJuniorStatus(validStatus);
  }
  
  function setJuniorStatus(valid) {
    $("#juniorStatus")[0].classList.remove('is-invalid', 'is-valid');
    if (valid) {
      $("#juniorStatus")[0].value = "Alla önskemål kan kopplas.";
      $("#juniorStatus").addClass('is-valid');
    } else {
      $("#juniorStatus")[0].value = "Minst en junior har ogiltiga önskningar.";
      $("#juniorStatus").addClass('is-invalid');
    }
  
  }
  
  //Lägger till ett par med önskningsfält
  function addMoreWishFields() {
      let length = $("#juniorFormWishfields div.col").length
  
  
      $("#juniorFormWishfields").append('<div class="form-row" style="margin-top: 1em">' + 
      '<div class="col">' +
          '<input type="text" class="form-control" id="juniorPref' + length + '" placeholder="Önskemål">' +
      '</div>' + 
      '<div class="col">' + 
          '<input type="text" class="form-control" id="juniorPref' + (length + 1) + '" placeholder="Önskemål">' + 
      '</div>' +
      '</div>');
  }
  
  
  
  
  
  
  