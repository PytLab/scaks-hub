;(function($){
    /* Load species information form */
    var getPressureInput = function(gas) {
        var inputHtml = ''
            + '<div class="pressure-input input-group with-margin-bottom">'
            + '<span class="input-group-addon">P<sub>(' + gas + ')</sub></span>'
            + '<input type="text" class="form-control"'
            + 'placeholder="' + gas + ' pressure">'
            + '<span class="input-group-addon">bar</span>'
            + '</div>';
        return $(inputHtml);
    };

    var getTotalCvgInput = function(site) {
        var inputHtml = ''
            + '<div class="site-cvg-input input-group with-margin-bottom">'
            + '<span class="input-group-addon">Total &theta;<sub>(' + site + ')</sub></span>'
            + '<input type="text" class="form-control"'
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
        bindCheckFunc.call($('#species-form input'));
    });

    /* Species form check function binding callback */
    var bindCheckFunc = function() {
        this.each(function() {
            $(this).on('blur.kyn', function() {
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
            });
        });
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

})(jQuery);
