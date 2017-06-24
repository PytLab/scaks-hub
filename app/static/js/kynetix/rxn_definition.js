/* Author: ShaoZhengjiang <shaozhengjiang@gmail.com> */

;(function($) {
    "use restrice";
    /* Reaction definition modal */

    // Open rxn definition modal.
    $('.open-rxn-definition').each(function() {

        $(this).on('click.kyn', function(event) {
            event.preventDefault();

            // Hide modify button and add add button
            $('#modify-rxn-definition').css('display', 'none');
            $('#add-to-rxn-table').css('display', 'inline');

            var options = {backdrop: 'static', show: true};
            $('#rxn-definition').modal(options);

            var $ts = $('#rxn-definition input[name=TS]');
            var $Ga = $('#rxn-definition input[name=Ga]');

            if (this.id == 'no-barrier') {
                $ts.attr('disabled', true);
                $Ga.attr('disabled', true).val('0.0');
            } else if (this.id == 'with-barrier') {
                if ($ts.attr('disabled')) {
                    $ts.removeAttr('disabled');
                }
                if ($Ga.attr('disabled')) {
                    $Ga.removeAttr('disabled').val('');
                }
            }
        });
    });

    var clearRxnDefinition = function() {
        $('#rxn-definition form input').val('');
        // Remove all form statu info.
        $('#rxn-definition form .input-group').each(function() {
            $(this).form_status({ remove: true });
        });
    };

    /* Close rxn info modal */
    $('.close-rxn-definition').each(function() {
        $(this).on('click.kyn', function() {
            // Close modal.
            $('#rxn-definition').modal('toggle');

            // Clear all inputs.
            clearRxnDefinition();
        });
    });

    /* Reset rxn definition form fields */
    $('#reset-rxn-definition').on('click.kyn', clearRxnDefinition);

    /* Reaction and energy check */
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
                if (tsExp == undefined) {
                    var $inputs = $('#IS-input, #FS-input');
                } else {
                    var $inputs = $('#IS-input, #TS-input, #FS-input');
                }
                $inputs.each(function() {
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

    var checkRxnEnergy = function() {
        var $Ga = $('#rxn-definition #Ga-input > input');
        var Ga = $Ga.attr('disabled') ? undefined : $Ga.val();
        var dG = $('#rxn-definition #dG-input > input').val();

        // Check empty energies.
        if (Ga != undefined) {
            if (Ga == '') {
                $('#Ga-input').form_status({
                    show: true,
                    status: 'warning',
                    msg: 'Please enter the activation energy !'
                });
                return false;
            } else if (isNaN(Ga)) {
                $('#Ga-input').form_status({
                    show: true,
                    status: 'error',
                    msg: '<span style="font-family: Courier New, consola">'
                         + Ga + '</span>'
                         + ' is not a number !'
                });
                return false;
            } else {
                $('#Ga-input').form_status({
                    show: true,
                    status: 'success',
                    msg: ''
                });
            }
        }

        if (dG == '') {
            $('#dG-input').form_status({
                show: true,
                status: 'warning',
                msg: 'Please enter the reaction energy !'
            });
            return false;
        } else if (isNaN(dG)) {
            $('#dG-input').form_status({
                show: true,
                status: 'error',
                msg: '<span style="font-family: Courier New, consola">'
                     + dG + '</span>'
                     + ' is not a number!'
            });
            return false;
        } else {
            $('#dG-input').form_status({
                show: true,
                status: 'success',
                msg: ''
            });
        }

        // Check energies validity.
        if (Ga != undefined && parseFloat(Ga) <= parseFloat(dG)) {
            $('#Ga-input, #dG-input').each(function() {
                $(this).form_status({
                    show: true,
                    status: 'error',
                    msg: 'Invalid energies'
                         + '<span style="font-family: Courier New, consola">'
                         + '(' + Ga + ', ' + dG + ')'
                         + '</span> !'
                });
            });
            return false;
        }

        $('#Ga-input, #dG-input').each(function() {
            $(this).form_status({
                show: true,
                status: 'success',
                msg: ''
            });
        });
        return true;
    };

    // Binding blur callback function to energy inputs.
    $('#rxn-definition input.rxn-energy').each(function () {
        $(this).on('blur.kyn', checkRxnEnergy);
    });

    /* Add elementary rxn to rxn table. */
    var addAlertInfo = function(selector, dismiss_time) {
        $element = $(selector);
        $alert = $('<div class="alert alert-danger"></div>')
            .append('<p><b>Please enter valid reaction definition !</b></p>');
        $element.before($alert);

        var dismiss_time = dismiss_time || 3000;
        window.setTimeout(function() {
            $element.prev().remove();
        }, dismiss_time);
    };

    /* Get a row jquery object in rxn table */
    var getRxnTableRow = function(is, ts, fs, Ga, dG) {
        var $row = $('<tr></tr>')
        var $checkbox = $('<td><input type="checkbox"></td>');
        $row.append($checkbox);

        // rxn expression
        var $expression = $('<td class="rxn-expression"></td>')
        if (ts) {
            $row.attr('data-rxn-type', 'with-barrier');
            $expression.attr('data-is', is)
            .attr('data-ts', ts)
            .attr('data-fs', fs)
            .text(is + ' <-> ' + ts + ' -> ' + fs);
        } else {
            $row.attr('data-rxn-type', 'no-barrier');
            $expression.attr('data-is', is)
            .attr('data-fs', fs)
            .text(is + ' -> ' + fs);
        }
        $row.append($expression);

        var $energies = $('<td class="rxn-energies">('
                          + Ga + ', ' + dG + ')</td>');
        $energies.attr('data-Ga', Ga).attr('data-dG', dG);
        $row.append($energies);
        return $row;
    };

    // Edit a rxn definition.
    $('#edit-rxn').on('click.kyn', function() {
        // Hide add button and display modify button.
        $('#rxn-definition #modify-rxn-definition').css('display', 'inline');
        $('#rxn-definition #add-to-rxn-table').css('display', 'none');

        var options = {backdrop: 'static', show: true};
        $('#rxn-definition').modal(options);

        var $is = $('#rxn-definition input[name=IS]');
        var $ts = $('#rxn-definition input[name=TS]');
        var $fs = $('#rxn-definition input[name=FS]');
        var $Ga = $('#rxn-definition input[name=Ga]');
        var $dG = $('#rxn-definition input[name=dG]');

        $tr = $('#rxn-table input:checkbox:checked:first').parents('tr');
        if ($tr.data('rxn-type') == 'no-barrier') {
            $ts.attr('disabled', true);
            $Ga.attr('disabled', true).val('0.0');

            // Fill fields.
            var $expr = $tr.children('td.rxn-expression');
            $is.val($expr.data('is'));
            $fs.val($expr.data('fs'));
            var $energies = $tr.children('td.rxn-energies');
            $dG.val($energies.data('dg'));
        } else if ($tr.data('rxn-type') == 'with-barrier') {
            if ($ts.attr('disabled')) {
                $ts.removeAttr('disabled');
            }
            if ($Ga.attr('disabled')) {
                $Ga.removeAttr('disabled').val('');
            }

            // Fill fields.
            var $expr = $tr.children('td.rxn-expression');
            $is.val($expr.data('is'));
            $ts.val($expr.data('ts'));
            $fs.val($expr.data('fs'));
            var $energies = $tr.children('td.rxn-energies');
            $Ga.val($energies.data('ga'));
            $dG.val($energies.data('dg'));
        }
    });

    $('#modify-rxn-definition').on('click.kyn', function() {
        // Check inputs firstly.
        if (!(checkRxnEquation() && checkRxnEnergy())) {
            addAlertInfo('#rxn-definition form');
            return false;
        }

        // Reaction expression.
        var is = $('#rxn-definition form input[name=IS]').val();
        var fs = $('#rxn-definition form input[name=FS]').val();
        var ts = $('#rxn-definition form input[name=TS]').val();
        var Ga = $('#rxn-definition form input[name=Ga]').val();
        var dG = $('#rxn-definition form input[name=dG]').val();

        var $newRow = getRxnTableRow(is, ts, fs, Ga, dG);

        $('#rxn-table input:checkbox:checked:first')
            .parents('tr')
            .replaceWith($newRow);

        // Remove modal.
        $('#rxn-definition').modal('hide');

        clearRxnDefinition();

        // Hide modify button.
        $('#modify-rxn-definition').css('display', 'none');
    });

    $('#add-to-rxn-table').on('click.kyn', function() {
        // Check inputs firstly.
        if (!(checkRxnEquation() && checkRxnEnergy())) {
            addAlertInfo('#rxn-definition form');
            return false;
        }

        // Reaction expression.
        var is = $('#rxn-definition form input[name=IS]').val();
        var fs = $('#rxn-definition form input[name=FS]').val();
        var ts = $('#rxn-definition form input[name=TS]').val();
        var Ga = $('#rxn-definition form input[name=Ga]').val();
        var dG = $('#rxn-definition form input[name=dG]').val();

        var $row = getRxnTableRow(is, ts, fs, Ga, dG);

        // Hide information well and show table header.
        if ($('#no-rxns').css('display') != 'none') {
            $('#no-rxns').css('display', 'none');
        }
        if ($('#rxn-table').css('display') == 'none') {
            $('#rxn-table').css('display', 'block');
        }

        $('#rxn-table tbody').append($row);
        $('#rxn-definition').modal('hide');
        clearRxnDefinition();

        $('add-to-rxn-table').css('display', 'none');
    });
})(jQuery);

