/* Author: ShaoZhengjiang <shaozhengjiang@gmail.com> */

;(function($){
    "use restrict";

    /* Refresh the file table asynchronously */
    $("#refresh-file-table").click(function(){
        // Show loading animation.
        var ajax_load = '<div class="text-center">' +
            '<img src="/static/img/broken-circle.gif" alg="Loading..."/></div>';
        $("#file-table").html(ajax_load);

        // Get new file table using ajax.
        $.get(window.location.pathname, {}, function(data, textStatus){
            var file_table_html = $(data).find("#file-table").html();
            $("#file-table").html(file_table_html);

            // Re-render time stamps using moment api.
            moment.locale("en");

            function flask_moment_render(elem) {
                $(elem).text(eval('moment("' + $(elem).data('timestamp') + '").' +
                                  $(elem).data('format') + ';'));
                $(elem).removeClass('flask-moment').show();
            }

            function flask_moment_render_all() {
                $('.flask-moment').each(function() {
                    flask_moment_render(this);
                    if ($(this).data('refresh')) {
                        (function(elem, interval) {
                            setInterval(function() { flask_moment_render(elem) }, interval);
                        })(this, $(this).data('refresh'));
                    }
                })
            }

            flask_moment_render_all();
        });
    });


    /* Panel collapse */
    $(document).on('click', '[data-toggle=collapse]', function() {
        $this = $(this);
        $i = $this.find('i');

        if ($.support.transition) {
            // When open panel body.
            if ($i.hasClass('rotate-icon') && !$i.hasClass('rotate-anticlockwise')) {
                $i.addClass('rotate-anticlockwise');
            // When close panel body.
            } else if ($i.hasClass('rotate-icon') && $i.hasClass('rotate-anticlockwise')) {
                $i.removeClass('rotate-anticlockwise');
            }
        // For browsers not supporting CSS3
        } else {  
            var down = 'fa-arrow-circle-o-down';
            var right = 'fa-arrow-circle-o-right';

            if ($.hasClass(down)) {
                $i.removeClass(down);
                $i.addClass(right);
            } else {
                $i.removeClass(right);
                $i.addClass(down);
            }
        }
    });

    /* Reaction definition modal */

    // Open rxn definition modal.
    $('.open-rxn-definition').each(function() {
        $(this).on('click.kyn', function(event) {
            event.preventDefault();

            $('#rxn-definition').modal('show');
            if (this.id == 'no-barrier') {
                $('#rxn-definition input[name=TS]').attr('disabled', true);
                $('#rxn-definition input[name=Ga]').val('0.0').attr('disabled', true)
            }
        });
    })

    // Close rxn info modal.
    $('.close-rxn-definition').each(function() {
        $(this).on('click.kyn', function() {
            $('#rxn-definition').modal('toggle');
        });
    });

    // Reset rxn definition form fields.
    $('#reset-rxn-definition').on('click.kyn', function() {
        $('#rxn-definition form input').val('');
    });

    // Add elementary rxn to rxn table.

    $('#add-to-rxn-table').on('click.kyn', function() {
        // Reaction expression.
        var is = $('#rxn-definition form input[name=IS]').val();
        var fs = $('#rxn-definition form input[name=FS]').val();
        var ts = $('#rxn-definition form input[name=TS]').val();
        var Ga = $('#rxn-definition form input[name=Ga]').val();
        var dG = $('#rxn-definition form input[name=dG]').val();

        var $row = (function(is, ts, fs, Ga, dG) {
            var $row = $('<tr></tr>')
            var $checkbox = $('<td><input type="checkbox"></td>');
            $row.append($checkbox);

            if (ts) {
                var expression = is + " <-> " + ts + ' -> ' + fs;
            } else {
                var expression = is + ' -> ' + fs;
            }
            $row.append($('<td>' + expression + '</td>'));

            $row.append($('<td class="rxn-energies">(' + parseFloat(Ga).toFixed(1) +
                          ', ' + parseFloat(dG).toFixed(1) + ')</span>'));
            return $row;
        })(is, ts, fs, Ga, dG);

        $('.rxn-table tbody').append($row);

        $('#rxn-definition').modal('hide');
    })
})(jQuery);

