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

}

function displayAddModal() {
  $("#newJuniorFormNameContainer").html('<h4 class="text-secondary mb-0">Namn</h4>' +
        '<input type="text" class="form-control" id="newJuniorFormName" placeholder="Namn"></input>');
  $("#newJuniorModal").modal();
}

function displayChangeModal(name) {
  $("#changeJuniorModal").modal();
  $("#changeJuniorFormName")[0].value = name;

  for (let i = 0; i < $("#newJuniorFormWishfields div.col").length; i ++) {
    let input = $("#juniorPref" + i);

    if (juniorList.some(j => j.name == input[0].value)) {

    }
  }

}

function removeJunior() {
  juniorList = juniorList.filter(function(e) { return e.name !== $("#changeJuniorFormName")[0].value })

}


function addMoreWishFields() {
    let length = $("#newJuniorFormWishfields div.col").length


    $("#newJuniorFormWishfields").append('<div class="form-row" style="margin-top: 1em">' + 
    '<div class="col">' +
        '<input type="text" class="form-control" id="juniorPref' + (length + 1) + '" placeholder="Önskemål">' +
    '</div>' + 
    '<div class="col">' + 
        '<input type="text" class="form-control" id="juniorPref' + (length + 2) + '" placeholder="Önskemål">' + 
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