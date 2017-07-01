/* Author: ShaoZhengjiang <shaozhengjiang@gmail.com> */
;(function($){
    var getCodeLine = function(lineNumber, language, code) {
        var language = language || 'text';
        $row = $('<tr></tr>').addClass('line').addClass('line-' + lineNumber);
        $number = $('<td class="line-number"></td>').attr('data-line-number', lineNumber);
        $code = $('<td class="line-code"></td>');
        $codeContent = $('<code class="rainbow"></code>')
            .attr('data-language', language)
            .text(code);
        $code.append($codeContent);
        $row.append($number).append($code);

        return $row;
    };

    var getCodeBlock = function(language, codeLines) {
        var $codeBlock = $('<pre></pre>').addClass('file-content')
            .attr('data-trimmed', 'true');
        var $table = $('<table></table>').addClass('rainbow')
            .attr('data-language', language);
        var $tbody = $('<tbody></tbody>');
        // Append code lines
        for (var i = 0; i < codeLines.length; i++) {
            var $row = getCodeLine(i+1, 'python', codeLines[i]);
            $tbody.append($row);
        }
        $table.append($tbody);
        $codeBlock.append($table);

        return $codeBlock;
    }

    var queryLogContent = function() {
        $.ajax({
            url: '/running/log/',
            type: 'POST',
            data: {
                full_path: $('#full-path').data('full-path')
            },
            dataType: 'json',
            success: function(data, textStatus) {
                var contentLines = data.content_lines;
                // Create code block.
                $codeBlock = getCodeBlock('python', contentLines);
                $('#running-log').children('pre').remove()
                $('#running-log').append($codeBlock);
                $('#running-log img').css('display', 'none');

                // Check if stop query
                if (data.stop) {
                    window.clearInterval(logQuery);
                    if (data.success) {
                        $('#running-status').removeClass('alert-warning')
                            .addClass('alert-success');
                        $('#running').css('display', 'none');
                        $('#run-success').css('display', 'inline');
                        $('#run-time').css('display', 'inline').text(data.duration);
                    } else {
                        $('#running-status').removeClass('alert-warning')
                            .addClass('alert-danger');
                        $('#job-logo img').css('display', 'none');
                        $('#run-failure').css('display', 'inline');
                        $('#run-time').css('display', 'inline').text(data.duration);
                    }
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                $('#running-log').children('pre').remove();
                $('#running-log img').css('display', 'none');
                $('#running').css('display', 'none');
                $('#run-failure').css('display', 'inline');
                $('#running-status').removeClass('alert-warning')
                    .addClass('alert-danger');
                $('#running-status #run-failure').text(errorThrown);
                window.clearInterval(logQuery);
            }
        });
    };

    queryLogContent();
    var logQuery = window.setInterval(queryLogContent, 3000);

})(jQuery);
