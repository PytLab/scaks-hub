;(function($) {
    // Ode integration plot
    $.ajax({
        url: '/report/odetraj/',
        type: 'POST',
        data: {
            full_path: $('#full-path').data('full-path')
        },
        dataType: 'json',
        success: function(data, textStatus) {
            if ($.isEmptyObject(data)) {
                $('#ode-traj').remove();
                return false;
            }
            // Get data series
            var series = [];
            for (var i = 0; i < data.adsorbate_names.length; i++) {
                var serie = {};
                serie.name = data.adsorbate_names[i];
                serie.data = [];
                var times = data.times;
                var coverages = data.coverages[i];
                for (var j = 0; j < data.times.length; j++) {
                    var point = {};
                    point.x = times[j];
                    point.y = coverages[j];
                    point.adsorbate = serie.name;
                    serie.data.push(point);
                }
                series.push(serie);
            }
            // Chart options.
            var options = {
                useHTML: true,
                title: {
                    text: 'ODE Integration'
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    title: {
                        text: 'time(s)'
                    },
                    gridLineWidth: 1,
                    crosshair: true
                },
                yAxis: {
                    title: {
                        text: 'Coverages'
                    },
                    crosshair: true,
                    allowDecimals: true,
                    max: 1.0,
                    min: 0.0
                },
                series: series,
                tooltip: {
                    formatter: function() {
                        var content = '<b>Adsorbate: ' + this.point.adsorbate + '</b><br>';
                        content += '<b>Time: ' + this.x.toPrecision(3) + 's</b><br>';
                        content += '<b>Coverage: ' + this.y.toPrecision(3) + '</b>';
                        return content;
                    }
                }
            };
            var chart = new Highcharts.Chart('ode-traj', options);
        },
        error: function() {
            $('#ode-traj').remove();
            return false;
        }
    });

    // Model info show
    $.ajax({
        url: '/report/modelinfo/',
        type: 'POST',
        data: {
            full_path: $('#full-path').data('full-path')
        },
        dataType: 'json',
        success: function(data, textStatus) {
            console.log(data);
            // Steady state coverages
            $('#load-ss-cvgs').css('display', 'none');
            $('#ss-cvgs').css('display', 'block');
            for (var i = 0; i < data.adsorbate_names.length; i++) {
                var $row = $('<tr></tr>');
                var $index = $('<td></td>')
                    .addClass('monospaced')
                    .text(i);
                $row.append($index);
                var $adsorbate = $('<td></td>')
                    .addClass('monospaced')
                    .text(data.adsorbate_names[i]);
                $row.append($adsorbate);
                var $coverage = $('<td></td>')
                    .addClass('monospaced')
                    .text(data.steady_state_coverages[i].toPrecision(3));
                $row.append($coverage);

                $('#ss-cvgs tbody').append($row);
            }

            // TOFs
            $('#load-tofs').css('display', 'none');
            $('#tofs').css('display', 'block');
            for (var i = 0; i < data.gas_names.length; i++) {
                var $row = $('<tr></tr>');
                var $index = $('<td></td>')
                    .addClass('monospaced')
                    .text(i);
                $row.append($index);
                var $gas = $('<td></td>')
                    .addClass('monospaced')
                    .text(data.gas_names[i]);
                $row.append($gas);
                var $tof= $('<td></td>')
                    .addClass('monospaced')
                    .text(data.TOFs[i].toPrecision(3));
                $row.append($tof);

                $('#tofs tbody').append($row);
            }

            // Reversibilities
            $('#load-reversibilities').css('display', 'none');
            $('#reversibilities').css('display', 'block');
            for (var i = 0; i < data.rxn_expressions.length; i++) {
                var $row = $('<tr></tr>');
                var $index = $('<td></td>')
                    .addClass('monospaced')
                    .text(i);
                $row.append($index);
                var $rxn_expression = $('<td></td>')
                    .addClass('monospaced')
                    .text(data.rxn_expressions[i]);
                $row.append($rxn_expression);
                var $reversibility = $('<td></td>')
                    .addClass('monospaced')
                    .text(data.reversibilities[i].toPrecision(3));
                $row.append($reversibility);

                $('#reversibilities tbody').append($row);
            }
        }
    });
})(jQuery);
