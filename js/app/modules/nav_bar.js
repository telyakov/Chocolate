var navBarModule = (function ($) {
    'use strict';
    var defaults = {
            //type: 'inverse',
            brand: null,
            brandUrl: null,
            //brandOptions: {'class': 'link-profile'},
            //fluid: true,
            //fixed: 'bottom',
            //collapse: false,
            items: []
        },
        _private = {
            create: function (options) {
                var opts = $.extend({}, defaults, options),
                    html = [
                        '<div class="navbar navbar-inverse navbar-fixed-bottom">',
                        '<div class="navbar-inner">',
                        '<div class="container-fluid">'
                    ];
                if (opts.brand !== null) {
                    html.push('<a class="link-profile brand"');
                    if (opts.brandUrl !== null) {
                        html.push(' href="' + opts.brandUrl + '"');
                    }
                    html.push('>');
                    html.push(opts.brand);
                    html.push('</a>');
                }
                html.push('<ul class="nav">');
                if (opts.items) {
                    opts.items.forEach(function (item) {
                        html.push('<li><a');
                        if (item['class']){
                            html.push(' class="' + item['class'] + '"');
                        }
                        if(item.url !== null){
                            html.push(' href="' + item.url + '"');
                        }
                        html.push('>');
                        if(item.label){
                            html.push(item.label);
                        }
                        html.push('</a></li>');
                    });
                }
                html.push('</ul>');
                html.push('</div>');
                html.push('</div>');
                html.push('</div>');
                return html.join('');
            }
        };

    return {
        create: function (options) {
            return _private.create(options);
        }
    };
})
(jQuery);