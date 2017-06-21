/* A Bootstrap plugin for form field check information display
 * Author: PytLab <shaozhengjiang@gmail.com>
 * Date: 2017-06-17
 */
;(function ($) {
    "use restrict";

    /* Define FormStatus class */
    var FormStatus = function (element) {
        this.$element = $(element);
    };

    FormStatus.DEFAULTS = {
        show: true,
        status: 'error',
        msg: null
    };

    // Prototype methods.
    FormStatus.prototype.show = function(option) {
        // Remove old status firstly.
        this.remove();

        var wrapper = '<div class="form-group has-' + option.status + '"></div>';
        this.$element.wrap(wrapper);

        if (option.msg) {
            var msg_element = '<label class="control-label">' + option.msg + '</label>';
            this.$element.before(msg_element);
        }
    };

    FormStatus.prototype.remove = function(option) {
        if (this.$element.parent('.form-group').length != 0) {
            this.$element.unwrap();
        }
        this.$element.prev('label.control-label').remove();
    };

    // New jQuery plugin.
    var old = $.fn.form_status;
    $.fn.form_status = function(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('bs.form_status');

            // Merge options.
            var options = $.extend({}, FormStatus.DEFAULTS, option);

            // Bind FormStatus instance to element.
            if (!data) {
                $this.data('bs.form_status', (data = new FormStatus(this)));
            }

            // Call corresponding prototype methods.
            if (options.remove) {
                data.remove(options);
            } else if (options.show) {
                data.show(options);
            }
        });
    };
    $.fn.form_status.Constructor = FormStatus;

    // No conflict.
    $.fn.form_status.noConflict = function (){
        $.fn.form_status = old;
        return this;
    };
})(window.jQuery)
