;(function($) {
    $.ajax({
        url: '/report/odetraj/',
        type: 'POST',
        data: {
            full_path: $('#full-path').data('full-path')
        },
        dataType: 'json',
        success: function(data, textStatus) {
            console.log(data);
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
    });
})(jQuery);
