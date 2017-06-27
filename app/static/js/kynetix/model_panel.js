;(function($){
    /* Load species information form */
    var getPressureInput = function(gas) {
        var inputHtml = ''
            + '<div class="pressure-input input-group with-margin-bottom">'
            + '<span class="input-group-addon">P<sub>(' + gas + ')</sub></span>'
            + '<input type="text" name="' + gas + '" class="form-control"'
            + 'placeholder="' + gas + ' pressure">'
            + '<span class="input-group-addon">bar</span>'
            + '</div>';
        $inputHtml = $(inputHtml);
        return $inputHtml;
    };

    var getTotalCvgInput = function(site) {
        var inputHtml = ''
            + '<div class="site-cvg-input input-group with-margin-bottom">'
            + '<span class="input-group-addon">Total &theta;<sub>(' + site + ')</sub></span>'
            + '<input type="text" name="' + site + '" class="form-control"'
            + 'placeholder="' + site + ' total coverage">'
            + '</div>';
        $inputHtml = $(inputHtml);
        $inputHtml.children('input').val('1.0');
        return $inputHtml;
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

    /* Extract all gas and site name from rxn lists */
    var extractGasSite = function(rxns) {
        var gasNames = [];
        var siteNames = [];
        for (var i = 0; i < rxns.length; i++) {
            var rxn = new RxnEquation(rxns[i]);
            var formulaList = rxn.toFormulaList();
            for (var j = 0; j < formulaList.length; j++) {
               var formulas = formulaList[j];
               for (var k = 0; k < formulas.length; k++) {
                   var sp = formulas[k];
                   if (sp.type() == 'gas'
                            && gasNames.indexOf(sp.species_site) == -1) {
                        gasNames.push(sp.species_site);
                   }
                   if (sp.type() == 'site'
                            && siteNames.indexOf(sp.species_site) == -1) {
                        siteNames.push(sp.species_site);
                   }
               }
            }
        }

        return {'gasNames': gasNames, siteNames: siteNames}
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

        // Load species form
        $('#species-form').empty();
        var rxns = [];
        $rows.find('.rxn-expression').each(function() {
            rxns.push($(this).text());
        });
        var gasAndSite = extractGasSite(rxns);
        var gasNames = gasAndSite.gasNames;
        for (var i = 0; i < gasNames.length; i++) {
            var $pressureInput = getPressureInput(gasNames[i]);
            $('#species-form').append($pressureInput);
        }

        var siteNames = gasAndSite.siteNames;
        for (var i = 0; i < siteNames.length; i++) {
            var $totalCvgInput = getTotalCvgInput(siteNames[i]);
            $('#species-form').append($totalCvgInput);
        }

        $('#species-form').css('display', 'block');

        // Bind check functions to inputs.
        $('#species-form input').each(function() {
            $(this).on('blur.kyn', checkSpeciesInput);
        });
    });

    /* Species form check function binding callback */
    var checkSpeciesInput = function() {
        $this = $(this);
        $inputGroup = $this.parent('.input-group');
        $inputGroup.form_status({ remove: true });
        var value = $this.val();

        // Check if there is no value input
        if (!value) {
            $inputGroup.form_status({
                show: true,
                status: 'warning',
                msg: 'Please input your data !'
            });
            return false;
        }

        // Check value validity
        if (isNaN(value) || parseFloat(value) <= 0.0) {
            $inputGroup.form_status({
                show: true,
                status: 'error',
                msg: ''
                    + '<span style="font-family: Courier New, Consolas">'
                    + value + '</span> is not a valid data !'
            });
            return false;
        }

        if ($inputGroup.hasClass('site-cvg-input')) {
            if (parseFloat(value) > 1.0) {
                $inputGroup.form_status({
                    show: true,
                    status: 'error',
                    msg: ''
                        + 'Coverage out of range '
                        + '<span style="font-family: Courier New, Consolas">'
                        + '[0.0 ~ 1.0]</span> !'
                });
                return false;
            }
        }

        $inputGroup.form_status({
            show: true,
            status: 'success',
            msg: ''
        });

        return true;
    }

    var checkAllSpeciesInputs = function() {
        $speciesInputs = $('#species-form input');
        for (var i = 0; i < $speciesInputs.length; i++) {
            if (!checkSpeciesInput.call($speciesInputs[i])) {
                return false;
            }
        }
        return true;
    };

    /* Check model parameter form */

    /* Check temperature input */
    var checkTemperature = function() {
        // Here this should be the temperature input element.
        $temperature = $('#model-param-form input[name=temperature]');
        $inputGroup = $temperature.parent('.input-group');
        $inputGroup.form_status({ remove: true });
        var value = $temperature.val();
        if (!value) {
            $inputGroup.form_status({
                show: true,
                status: 'warning',
                msg: 'Please enter a temperature'
            });
            return false;
        } else if (isNaN(value)) {
            $inputGroup.form_status({
                show: true,
                status: 'error',
                msg: ''
                    + '<span style="font-family: Courier New, Consolas">'
                    + value + '</span>'
                    + ' is not a number !'
            });
            return false;
        } else if (value < -273.15) {
            $inputGroup.form_status({
                show: true,
                status: 'error',
                msg: ''
                    + '<span style="font-family: Courier New, Consolas">'
                    + value + '</span>'
                    + ' out of range '
                    + '<span style="font-family: Courier New, Consolas">'
                    + '[-273.15, &infin;)</span> !'
            });
            return false;
        } else {
            $inputGroup.form_status({
                show: true,
                status: 'success',
                msg: ''
            });

            return true;
        }
    };
    $('#model-param-form input[name=temperature]').on('blur.kyn', checkTemperature);

    /* Check max iteration */
    var checkMaxIteration = function() {
        $maxIter = $('#model-param-form input[name=max-iteration]');
        $inputGroup = $maxIter.parent('.input-group');
        value = $maxIter.val();
        if (!value) {
            $inputGroup.form_status({
                show: true,
                status: 'warning',
                msg: 'Please enter the max iteration step'
            });
            return false;
        } else if (isNaN(value) || value.indexOf('.') != -1 || value <= 0) {
            $inputGroup.form_status({
                show: true,
                status: 'error',
                msg: ''
                    + '<span style="font-family: Courier New, Consolas">'
                    + value + '</span>'
                    + ' is not an positive integer!'
            });
            return false;
        } else {
            $inputGroup.form_status({
                show: true,
                status: 'success',
                msg: ''
            });

            return true;
        }
    };
    $('#model-param-form input[name=max-iteration]').on('blur.kyn', checkMaxIteration);

    /* Check tolerance */
    var checkTolerance = function() {
        $tolerance = $('#model-param-form input[name=tolerance]');
        $inputGroup = $tolerance.parent('.input-group');
        value = $tolerance.val();

        if (!value) {
            $inputGroup.form_status({
                show: true,
                status: 'warning',
                msg: 'Please enter the convergence criterion'
            });
            return false;
        } else if (isNaN(value)) {
            $inputGroup.form_status({
                show: true,
                status: 'error',
                msg: ''
                    + '<span style="font-family: Courier New, Consolas">'
                    + value + '</span>'
                    + ' is not an number !'
            });
            return false;
        } else if (value > 1e-5) {
            $inputGroup.form_status({
                show: true,
                status: 'error',
                msg: ''
                    + 'tolerance should be smaller than '
                    + '<span style="font-family: Courier New, Consolas">'
                    + '1e-5</span> !'
            });
        } else {
            $inputGroup.form_status({
                show: true,
                status: 'success',
                msg: ''
            });

            return true;
        }
    };
    $('#model-param-form input[name=tolerance]').on('blur.kyn', checkTolerance);

    /* Reset all fields */
    var clearModelForm = function() {
        $('#model-form input').each(function() {
            $(this).parent('.input-group').form_status({ remove: true });
            $(this).val('');

            // Select fields.
            $('#model-form select[name=rate-algo]').val('TST');
            $('#model-form select[name=root-finding]').val('MDNewton');
        });
    };
    $('#reset-model').on('click.kyn', clearModelForm);

    /* Save the model */
    $('#save-model').on('click.kyn', function() {
        $('#model-btns img').css('display', 'inline');
        if (!(checkTemperature()
                && checkTolerance()
                && checkMaxIteration()
                && checkAllSpeciesInputs())) {
            showAlertInfo('Please input valid model paramters !', 'danger');
            $('#model-btns img').css('display', 'none');
            return false;
        }

        // Collect data in form
        $pressure = $('#species-form .pressure-input input');
        var pressures = [];
        $pressure.each(function() {
            pressures.push({
                name: $(this).attr('name'),
                pressure: $(this).val()
            });
        });

        $coverages = $('#species-form .site-cvg-input input');
        var coverages = [];
        $coverages.each(function() {
            coverages.push({
                name: $(this).attr('name'),
                coverage: $(this).val()
            });
        });

        var modelData = new Object();
        modelData.pressures = pressures;
        modelData.total_cvgs = coverages;
        modelData.temperature = $('#model-param-form input[name=temperature]').val();
        modelData.max_iteration = $('#model-param-form input[name=max-iteration]').val();
        modelData.tolerance = $('#model-param-form input[name=tolerance]').val();
        modelData.rate_algo = $('#model-param-form select[name=rate-algo]').val();
        modelData.root_finding = $('#model-param-form select[name=root-finding]').val();
        modelData.full_path = $('#full-path').data('full-path');

        // Send data using ajax
        $.ajax({
            url: '/model/save_model/',
            type: 'POST',
            data: JSON.stringify(modelData),
            success: function(data, textStatus) {
                showAlertInfo('Model has been saved in current directory', 'success');
            },
            error: function(XMLHttpRequest, textStatus) {
                showAlertInfo(textStatus);
            }
        });
        $('#model-btns img').css('display', 'none');
    });

    // Load species form automatically.
    var $availRxns = $('#rxn-table tbody > tr').not('.disabled');
    if ($availRxns.length > 0) {
        $('#load-species-form').trigger('click.kyn');
    }
})(jQuery);
