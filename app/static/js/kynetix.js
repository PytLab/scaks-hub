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

            var options = {backdrop: 'static', show: true};
            $('#rxn-definition').modal(options);

            var $ts = $('#rxn-definition input[name=TS]');
            var $Ga = $('#rxn-definition input[name=Ga]');

            if (this.id == 'no-barrier') {
                if ($ts.attr('disabled') == undefined) {
                    $ts.attr('disabled', true);
                }
                if ($Ga.attr('disabled') == undefined) {
                    $Ga.val('0.0').attr('disabled', true)
                }
            } else if (this.id == 'with-barrier') {
                if ($ts.attr('disabled')) {
                    $ts.removeAttr('disabled');
                }
                if ($Ga.attr('disabled')) {
                    $Ga.removeAttr('disabled').val('');
                }
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

    // Reaction definition check.
    var checkRxnEquation = function() {
        // Get IS expression.
        var isExp = $('#rxn-definition #IS-input > input').val();
        var fsExp = $('#rxn-definition #FS-input > input').val();
        var $ts = $('#rxn-definition #TS-input > input');
        if ($ts.attr('disabled')) {
            var tsExp = undefined;
        } else {
            var tsExp = $ts.val();
        }

        // Check initial state.
        if (isExp == '') {
            $('#IS-input').form_status({
                show: true,
                status: 'warning',
                msg: 'Please enter the initial state expression!',
            });
            return false;
        } else {
            $('#IS-input').form_status({
                remove: true
            });
        }

        try {
            var is = new ChemState(isExp);
            $('#IS-input').form_status({
                show: true,
                status: 'success',
                msg: ''
            })
        } catch(e) {
            if (e.name == 'RxnEquationError') {
                $('#IS-input') .form_status({
                    show: true,
                    status: 'error',
                    msg: e.htmlMsg
                });
                return false;
            }
        }

        // Check transition state.
        if (tsExp != undefined) {
            if(tsExp == '') {
                $('#TS-input').form_status({
                    show: true,
                    status: 'warning',
                    msg: 'Please enter the transition state expression!',
                });
                return false;
            } else {
                $('#TS-input').form_status({
                    show: true,
                    status: 'success',
                    msg: ''
                });
            }

            try {
                var ts = new ChemState(tsExp);
                $('#TS-input').form_status({
                    show: true,
                    status: 'success',
                    msg: ''
                });
            } catch(e) {
                if (e.name == 'RxnEquationError') {
                    $('#TS-input').form_status({
                        show: true,
                        status: 'error',
                        msg: e.htmlMsg
                    });
                    return false;
                }
            }
        }

        // Check final state.
        if (fsExp == '') {
            $('#FS-input').form_status({
                show: true,
                status: 'warning',
                msg: 'Please enter the final state expression!',
            });
            return false;
        } else {
            $('#FS-input').form_status({
                show: true,
                status: 'success',
                msg: ''
            });
        }

        try {
            var fs = new ChemState(fsExp);
            $('#FS-input').form_status({
                show: true,
                status: 'warning',
                msg: ''
            });
        } catch(e) {
            if (e.name == 'RxnEquationError') {
                $('#FS-input').form_status({
                    show: true,
                    status: 'error',
                    msg: e.htmlMsg
                });
                return false;
            }
        }

        // Check reaction equation conservation using interfaces of rxn-parser.js
        var rxnEquation = tsExp == undefined ?
                          isExp + ' -> ' + fsExp :
                          isExp + ' <-> ' + tsExp + ' -> ' + fsExp;
        var equation = new RxnEquation(rxnEquation);

        try {
            equation.checkConservation();
            $('#IS-input, #TS-input, #FS-input').each(function() {
                $(this).form_status({
                    show: true,
                    status: 'success',
                    msg: ''
                });
            });
        } catch(e) {
            if (e.name == 'RxnEquationError') {
                $('#IS-input, #TS-input, #FS-input').each(function() {
                    $(this).form_status({
                        show: true,
                        status: 'error',
                        msg: e.htmlMsg
                    });
                });
                return false;
            }
        }

        return true;
    };

    // Binding blur callback to inputs.
    $('#rxn-definition input.rxn-equation').each(function() {
        $(this).on('blur.kyn', checkRxnEquation);
    });
})(jQuery);
