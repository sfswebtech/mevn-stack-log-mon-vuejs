
(function ($) {
  "use strict";


  /*==================================================================
 [ Focus input ]*/
  $('.input100').each(function () {
    $(this).on('blur', function () {
      if ($(this).val().trim() != "") {
        $(this).addClass('has-val');
      }
      else {
        $(this).removeClass('has-val');
      }
    })
  })


  /*==================================================================
  [ Validate ]*/
  var input = $('.validate-input .input100');

  $('.validate-form').on('submit', function () {
    var check = true;

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }
    }

    return check;
  });


  $('.validate-form .input100').each(function () {
    $(this).focus(function () {
      hideValidate(this);
    });
  });

  function validate(input) {
    if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
      if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
        return false;
      }
    }
    else {
      if ($(input).val().trim() == '') {
        return false;
      }
    }
  }

  function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass('alert-validate');
  }

  function hideValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).removeClass('alert-validate');
  }



})(jQuery);
window.onload = function () {
    //Better to construct options first and then pass it as a parameter
    var options = {
      animationEnabled: true,
      title: {
        text: "compare sales strategy"
      },
      axisY: {
        suffix: "%"
      },
      toolTip: {
        shared: true,
        reversed: true
      },
      legend: {
        reversed: true,
        verticalAlign: "center",
        horizontalAlign: "right"
      },
      data: [
        {
          type: "stackedColumn100",
          name: "WholeSale",
          showInLegend: true,
          yValueFormatString: "#,##0\"%\"",
          dataPoints: [
            { label: "Q1", y: 44 },
            { label: "Q2", y: 88 },
            { label: "Q3", y: 65 },
            { label: "Q4", y: 69 }
          ]
        },
        {
          type: "stackedColumn100",
          name: "Retail",
          showInLegend: true,
          yValueFormatString: "#,##0\"%\"",
          dataPoints: [
            { label: "Q1", y: 48 },
            { label: "Q2", y: 29 },
            { label: "Q3", y: 73 },
            { label: "Q4", y: 99 }
          ]
        },
        {
          type: "stackedColumn100",
          name: "Inside Sales",
          showInLegend: true,
          yValueFormatString: "#,##0\"%\"",
          dataPoints: [
            { label: "Q1", y: 19 },
            { label: "Q2", y: 41 },
            { label: "Q3", y: 5 },
            { label: "Q4", y: 39 }
          ]
        },
        {
          type: "stackedColumn100",
          name: "Mail Order",
          showInLegend: true,
          yValueFormatString: "#,##0\"%\"",
          dataPoints: [
            { label: "Q1", y: 20 },
            { label: "Q2", y: 100 },
            { label: "Q3", y: 7 },
            { label: "Q4", y: 43 }
          ]
        }
      ]
    };

    $("#chartContainerwarning").CanvasJSChart(options);
    $("#chartContainererrors").CanvasJSChart(options);
    $("#chartContainersummary").CanvasJSChart(options);

    $("#chartContainerlogviewer-Errors").CanvasJSChart(options);
    $("#chartContainerlogviewer-Warnings").CanvasJSChart(options);
}

   // datepicker
$( function() {
  var dateFormat = "dd-mm-yy",
    from = $( "#from" ).datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        changeYear: true,
        dateFormat: "dd-mm-yy",
        numberOfMonths: 1
      }).on( "change", function() {
        to.datepicker( "option", "minDate", getDate( this ) );
        console.log(to.datepicker("option"));
      }),
    to = $( "#to" ).datepicker({
      defaultDate: "+1w",
      changeMonth: true,
      changeYear: true,
      dateFormat: "dd-mm-yy",
      numberOfMonths: 1
    })
    .on( "change", function() {
      from.datepicker( "option", "maxDate", getDate( this ) );
    });

  function getDate( element ) {
    var date;
    try {
      date = $.datepicker.parseDate( dateFormat, element.value );
    } catch( error ) {
      date = null;
    }
    return date;
  }
} );

// $( function() {
//   // $("#from").datepicker("option", "showAnim", "slideDown", "getDate");
 
// }, 2000);
$(document).ready(function(){
   $("#from").datepicker("option", "showAnim", "slideDown").datepicker("setDate", new Date())
  $("#to").datepicker("option", "showAnim", "slideDown").datepicker("setDate", new Date());
})

var $fileInput = $('.file-input');
var $droparea = $('.file-drop-area');

// highlight drag area
$fileInput.on('dragenter focus click', function () {
  $(this).parents('.file-drop-area').addClass('is-active');
  // $droparea.addClass('is-active');
});

// back to normal state
$fileInput.on('dragleave blur drop', function () {
  $droparea.removeClass('is-active');
});

// change inner text
$fileInput.on('change', function () {
  var filesCount = $(this)[0].files.length;
  var $textContainer = $(this).prev();

  if (filesCount === 1) {
    // if single file is selected, show file name
    var fileName = $(this).val().split('\\').pop();
    $textContainer.text(fileName);
  } else {
    // otherwise show number of files
    $textContainer.text(filesCount + ' files selected');
  }
});
