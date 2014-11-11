/**
 * Wizard plugin
 */
(function ($, undefined) {
    'use strict';
    var defaults = {
        commandObj: {},
        commands: [],
        onDone: function (){},
        currentStep: -1
    };
    var methods = {
        init: function (options) {
            var $context = this,
                data = $context.data('chWizard');
            $context.uniqueId();
            if (data) {
                methods.destroy.call($context);
            }

            var settings = $.extend({}, defaults, options),
                commandObj = settings.commandObj,
                doneFn = settings.onDone,
                commands = settings.commands,
                currentStep = settings.currentStep;
            $context.data('chWizard', settings);
            $context.on('next.chWizard', function () {
                currentStep += 1;
                if (commands[currentStep] !== undefined) {
                    var command = commands[currentStep],
                        data = $context.data('chWizard');
                    data.currentStep = currentStep;
                    $context.data('chWizard', data);
                    command.call($context, $context);
                } else {
                    doneFn.call($context, $context);
                    methods.destroy.call($context);
                }
            });
            $context.trigger('next.chWizard');

        },
        destroy: function () {
            this.removeData('chWizard');
            this.off('.chWizard');
        }
    };
    $.fn.chWizard = function (method, options) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.chWizard');
        }
    };

})(jQuery, undefined);