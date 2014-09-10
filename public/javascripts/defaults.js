// defaults.js

var zoom = 0;

$.fn.exists = function () {
  return this.length !== 0;
}

var ajax_error = function(xhr, status, error) {
  console.log ("Ajax error, status: " + status);
}

var set_thumbnail_size = function() {
  $('.thumbnail').css('width', zoom+"px");
  $('.thumbnail').css('height', zoom+"px");
};

// feed window size change back to application
var log_size = function(with_redraw) {
  var ordnung_middle_w = $( '#ordnung_middle' ).width();
  var ordnung_middle_h = $(window).height() - $('#navbar').height();
//  console.log((with_redraw?"redraw!":"") + " W "+ ordnung_middle_w + " H " + ordnung_middle_h );
  uri = "/resize/" + ordnung_middle_w + "/" + ordnung_middle_h + "/" + zoom;
  if (with_redraw) {
    $.ajax(uri, {
      success: redraw_dashboard
    });
  }
  else {
    $.ajax(uri);
  };
};

var start_edit_mode = function() {
    // change mouse cursor over thumbnails
    $('.thumbnail').hover(
      function() { // enter
        $('html,body').css('cursor', 'crosshair');
      },
      function() { // leave
        $('html,body').css('cursor', 'default');
      }
    ).unbind('click').click(function(event) {
      console.log("Add tag to " + this.id);
      $.ajax("/tag/item/" + this.id);
    });
};

var end_edit_mode = function() {
  $('.thumbnail').unbind('mouseenter mouseleave click').click(function(event) {
    console.log("Show thumbnail");
  });
}

// fill dashboard content
var fill_dashboard = function(data) {
  if (data) {
    $('#dashboard_content').html(data);
  }
  else {
    console.log("Dashboard unchanged");
  }
  if ($('.edit-mode').exists()) {
    start_edit_mode();
  }
  else {
    end_edit_mode();
  }
  set_thumbnail_size();
}

// redraw dashboard content
var redraw_dashboard = function(data) {
  zoom = data.zoom;
  $.ajax('/dashboard/redraw', {
    success: fill_dashboard
  });
}

// handle resize events (throttled)
var doit;
$( window ).resize(function() {
  // throttle resize events
  clearTimeout(doit);
  doit = setTimeout(function() {
    log_size(true);
  }, 250);
});

// start app
$( window ).ready(function() {
  // change mouse cursor over zoom elements
  $('.glyphicon').hover(
    function() { // enter
      $('html,body').css('cursor', 'pointer');
    },
    function() { // leave
      $('html,body').css('cursor', 'default');
    }
  );
  // make page elements clickable
  $('#page_first').click(function() {
    $.ajax('/dashboard/first_page', {
      success: fill_dashboard
    });
  });
  $('#page_previous').click(function() {
    $.ajax('/dashboard/previous_page', {
      success: fill_dashboard
    });
  });
  $('#page_next').click(function() {
    $.ajax('/dashboard/next_page', {
      success: fill_dashboard
    });
  });
  $('#page_last').click(function() {
    $.ajax('/dashboard/last_page', {
      success: fill_dashboard
    });
  });
  // make zoom elements clickable
  $('#zoom_in').click(function() {
    if (zoom < 300) {
      zoom += 10;
      log_size(true);
    }
  });
  $('#zoom_out').click(function() {
    if (zoom > 0) {
      zoom -= 10;
      log_size(true);
    }
  });
  var define_tag_functions = function() {
    // make tags clickable
    $('.tag').click(function() {
      if ($(this).hasClass('active-tag')) {
        $(this).removeClass('active-tag');
        $.ajax("/tag/deactivate/"+$(this).text());
      }
      else {
        $(this).addClass('active-tag');
        $.ajax("/tag/activate/"+$(this).text());
      }
    });
    // change mouse cursor over tags
    $('.tag').hover(
      function() { // enter
        $('html,body').css('cursor', 'pointer');
      },
      function() { // leave
        $('html,body').css('cursor', 'default');
      }
    );
  };
  define_tag_functions();
  $('#tag_add').click(function() {
    $('.new-tag').css('display', 'block');
    $('#new-tag-input').val("")
  });
  var show_added_tag = function(data) {
    if (data.html) {
      $('.new-tag').after(data.html);
      define_tag_functions();
    }
  }
  $('#new-tag-input').keydown(function(e) {
    if (e.keyCode == 13) {
      $.ajax("/tag/add/" + $(this).val(), {
        success: show_added_tag
      });
      $('.new-tag').css('display', 'none');
    }
  });
  $('#tag_edit').click(function() {
    edit_mode = $('.edit-mode')
    if (edit_mode.exists()) {
      edit_mode.removeClass('edit-mode');
      end_edit_mode();
    }
    else {
      $(this).addClass('edit-mode');
      start_edit_mode();
    }
  });
  var remove_active_tag = function() {
    $('.active-tag').remove();
    log_size(true);
  }
  $('#tag_remove').click(function() {
    active = $('.active-tag').text();
    console.log("Remove " + active);
    $.ajax("/tag/remove/"+active, {
      success: remove_active_tag
    });
  });
  // feed window size back to app
  log_size(true);
});