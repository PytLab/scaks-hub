/* Author: ShaoZhengjiang <shaozhengjiang@gmail.com> */

;(function($){
    "use restrict";

    /* Panel collapse */
    $(document).on('click.kyn', '[data-toggle=collapse]', function() {
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

    /* Disable reactions */
    $('#disable-rxns').on('click.kyn', function() {
        $('#rxn-table input:checkbox:checked').each(function () {
            $tr = $(this).parents('tr')
            if (!$tr.hasClass('disabled')) {
                $tr.addClass('disabled');
            }
        });
    });

    /* Recover disabled reactions */
    $('#recover-rxns').on('click.kyn', function() {
        $('#rxn-table input:checkbox:checked').each(function() {
            $tr = $(this).parents('tr');
            if ($tr.hasClass('disabled')) {
                $tr.removeClass('disabled');
            }
        });
    });

    /* Save current rxns */
    $('#save-rxns').on('click.kyn', function() {
        $(this).siblings('img').css('display', 'inline');
        if ($('#rxn-table').css('display') == 'none'
                && $('#no-rxns').css('display') == 'block') {
            $warn = $('<div class="alert alert-warning with-margin-top"></div>');
            $warn.html('<b>No reaction can be saved !</b>')
            $('#no-rxns').before($warn);
            window.setTimeout(function() {
                $('#no-rxns').prev().remove();
            }, 5000);
            $(this).siblings('img').css('display', 'none');
        } else {
            var rxn_expressions = [];
            var Gas = [], dGs = [];
            $('#rxn-table tbody > tr').each(function() {
                if (!$(this).hasClass('disabled')) {
                    var expr = $(this).find('td.rxn-expression').text();
                    rxn_expressions.push(expr);
                    var Ga = $(this).find('td.rxn-energies').data('ga');
                    var dG = $(this).find('td.rxn-energies').data('dg');
                    Gas.push(Ga);
                    dGs.push(dG);
                }
            });

            var showErrorInfo = function(text) {
                $error = $('<div class="alert alert-danger with-margin-top"></div>');
                $error.html('<b>' + text + '</b>');
                $('#no-rxns').before($error);
                window.setTimeout(function() {
                    $('#no-rxns').prev().remove();
                }, 5000);
                $('#save-rxns').siblings('img').css('display', 'none');
            };

            if (Gas.length < 1 || dGs.length < 1) {
                showErrorInfo('No reaction is enabled!');
                return false;
            }
            // Post.
            $.ajax({
                url: '/model/save/',
                type: 'POST',
                data: {
                    'rxn_expressions': rxn_expressions.toString(),
                    'Gas': Gas.toString(),
                    'dGs': dGs.toString(),
                    'full_path': $('#full-path').data('full-path')
                },
                success: function(data, textStatus) {
                    $success = $('<div class="alert alert-success with-margin-top"></div>');
                    $success.html('<b>reactions and energies are saved in current directory!</b>')
                    $('#no-rxns').before($success);
                    window.setTimeout(function() {
                        $('#no-rxns').prev().remove();
                    }, 5000);
                    $('#save-rxns').siblings('img').css('display', 'none');
                },
                error: function(XMLHttpRequest, textStatus) {
                    showErrorInfo(textStatus);
                }
            });
        }
    });

    /* Delete selected reactions */
    $('#delete-rxns').on('click.kyn', function() {
        $('#rxn-table input:checkbox:checked').each(function() {
            $(this).parents('tr').remove();
        });
        if ($('#rxn-table').find('tr').length <= 1) {
            $('#rxn-table').css('display', 'none');
            $('#no-rxns').css('display', 'block');
        }
    });

})(jQuery);

