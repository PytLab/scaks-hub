;(function($){
    /* Load species information form */
    var getPressureInput = function(gas) {
        var inputHtml = ''
            + '<div class="input-group with-margin-top">'
            + '<span class="input-group-addon">P<sub>' + gas + '</sub></span>'
            + '<input type="text" class="form-control">'
            + '<span class="input-group-addon">bar</span>'
            + '</div>';
        return $(inputHtml);
    };

    var showAlertInfo = function(text, style) {
        var style = style || 'danger';
        $info = $('<div class="alert alert-' + style + ' with-margin-top"></div>');
        $info.html('<b>' + text + '</b>');
        $('#model-form').before($info);
        window.setTimeout(function() {
            $('#model-form').prev().remove();
        }, 5000);
    };

    $('#load-species-form').on('click.kyn', function() {
        $rows = $('#rxn-table tbody > tr').not('.disabled');
        if ($rows.length < 1) {
            showAlertInfo(''
                + 'No selected reaction, '
                + 'please add one in Reaction Definition panel'
                , 'warning');
            return false;
        }
        // Show loading animation
        $('#no-species-form').css('display', 'none');
        $('#loading-species-form').css('display', 'block');
    });
})(jQuery);
