//Min kod överst
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

function removeJunior() {
  juniorList = juniorList.filter(function(e) { return e.name !== $("#changeJuniorFormName")[0].value })

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

  juniorList.push(new Junior(name));
  

  $("#juniorDisplay").prepend('<div class="col-md-6 col-lg-4 mb-5">' +
  '<div class="portfolio-item mx-auto" onclick="displayChangeModal(' + "'" + name + "'" + ')">' +
      '<div class="portfolio-item-caption d-flex align-items-center justify-content-center h-100 w-100">' +
          '<div class="portfolio-item-caption-content text-center text-white"><i class="fas fa-pen fa-2x"></i></div>' +
      '</div>' + 
      '<h4 class="juniorName" id="juniorLabel-' + name + '">' + name + '</h4>' + 
  '</div></div>');

  validateAllWishes();

}

function displayAddModal() {
  $("#newJuniorFormNameContainer").html('<h4 class="text-secondary mb-0">Namn</h4>' +
        '<input type="text" class="form-control" id="newJuniorFormName" placeholder="Namn"></input>');
  $("#newJuniorModal").modal();
}

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

//Körs när man trycker klar
//Validerar och uppdaterar
//Stänger sedan modal
function updateWishes() {
  name = $("#changeJuniorFormName")[0].value;
  validateWishes(name);

  junior = juniorList.filter(function(j) { if (j.name == name) { return j }})[0]

  junior.wishes = [];
  for (let i = 0; i < $("#juniorFormWishfields div.col").length; i ++) {
    let input = $("#juniorPref" + i)[0].value;

    if (input) {
      junior.wishes.push(input)
    }
  }

  

  setTimeout(function() {$("#changeJuniorModal").modal('hide')}, 200); 

}

//Kollar det användaren skrivit in i fälten på changeJuniorModal
//Grön om finns, röd om inte finns
//Gör inget om fältet är tomt
function validateWishes(name) {
  let ok = true;
  junior = juniorList.filter(function(j) { if (j.name == name) { return j }})[0]

  for (let i = 0; i < $("#juniorFormWishfields div.col").length; i ++) {
    let inputField = $("#juniorPref" + i);

    if (inputField[0].value) {
      if (juniorList.some(j => j.name == inputField[0].value)) {
        inputField.addClass('is-valid');
      } else {
        inputField.addClass('is-invalid');
        ok = false;
      }
    }
  }

  if (!ok) {
    $('#juniorLabel-' + name).addClass('invalid-wishes');
  } else if ($('#juniorLabel-' + name)[0].classList.contains('invalid-wishes')) {
      $('#juniorLabel-' + name).removeClass('invalid-wishes');
  }
}

function validateAllWishes() {
  juniorList.forEach(function(j) {
    let ok = true;
    wishes = j.wishes.filter(function(s) { if (s) { return s }})

    for (let i = 0; i < wishes.length; i ++) {
      if (!juniorList.some(j => j.name == wishes[i])) {
        ok = false;
        break;
      }
    }

    if (!ok) {
      $('#juniorLabel-' + j.name).addClass('invalid-wishes');
    } else if ($('#juniorLabel-' + j.name)[0].classList.contains('invalid-wishes')) {
        $('#juniorLabel-' + j.name).removeClass('invalid-wishes');
    }


  })
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







/*!
    * Start Bootstrap - Freelancer v6.0.0 (https://startbootstrap.com/themes/freelancer)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-freelancer/blob/master/LICENSE)
    */
   (function($) {
    "use strict"; // Start of use strict
  
    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          $('html, body').animate({
            scrollTop: (target.offset().top - 71)
          }, 1000, "easeInOutExpo");
          return false;
        }
      }
    });
  
    // Scroll to top button appear
    $(document).scroll(function() {
      var scrollDistance = $(this).scrollTop();
      if (scrollDistance > 100) {
        $('.scroll-to-top').fadeIn();
      } else {
        $('.scroll-to-top').fadeOut();
      }
    });
  
    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function() {
      $('.navbar-collapse').collapse('hide');
    });
  
    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
      target: '#mainNav',
      offset: 80
    });
  
    // Collapse Navbar
    var navbarCollapse = function() {
      if ($("#mainNav").offset().top > 100) {
        $("#mainNav").addClass("navbar-shrink");
      } else {
        $("#mainNav").removeClass("navbar-shrink");
      }
    };
    // Collapse now if page is not at top
    navbarCollapse();
    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse);
  
    // Floating label headings for the contact form
    $(function() {
      $("body").on("input propertychange", ".floating-label-form-group", function(e) {
        $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
      }).on("focus", ".floating-label-form-group", function() {
        $(this).addClass("floating-label-form-group-with-focus");
      }).on("blur", ".floating-label-form-group", function() {
        $(this).removeClass("floating-label-form-group-with-focus");
      });
    });
  
  })(jQuery); // End of use strict