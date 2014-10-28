var menuModule = (function () {
    'use strict';
    var _private = {
        init: function (items) {
            var i,
                tree = {},
                hasOwn = Object.prototype.hasOwnProperty,
                subTree = { 0: tree };
            for (i in items) {
                if (hasOwn.call(items, i)) {
                    var row = items[i],
                        id = row.id,
                        label = row.name,
                        parent = row.parentid,
                        view = row.viewname,
                        url;
                    if (view) {
                        view = encodeURI(_private.toXmlExtensionFormat(view));
                        if (view.indexOf('map.xml') !== -1) {
                            url = '/map/index?view=' + view;
                        }
                        else if (view.indexOf('flatsgramm.xml') !== -1) {
                            url = '/canvas/index?view=' + view;
                        } else {
                            url = '/grid/index?view=' + view;
                        }
                    } else {
                        url = '#';
                    }
                    if (!subTree[parent]) {
                        subTree[parent] = {};
                    }
                    var branch = subTree[parent];
                    if (parent === '0') {
                        branch[id] = {'label': label, url: '#', items: {}};
                        if (!subTree[id]) {
                            subTree[id] = branch[id];
                        } else {
                            //fix for safari
                            subTree[id].label = branch[id].label;
                            subTree[id].url = branch[id].url;
                            branch[id] = subTree[id];
                        }
                    } else {
                        if (!branch.items) {
                            branch.items = {};
                        }
                        branch.items[id] = {'label': label, url: url, items: {}};
                        if (url !== '#') {
                            branch.items[id].itemOptions = {'class': 'link-form'};
                        }
                        subTree[id] = branch.items[id];
                    }
                }
            }
            var $menu = $('#gn-menu'), content = [];
            content.push('<li class="gn-trigger">');
            content.push('<a class="gn-icon gn-icon-menu"></a>');
            content.push('<nav class="gn-menu-wrapper">');
            content.push('<div class="gn-scroller">');
            content.push('<ul class="gn-menu">');
            var k;
            for (k in tree) {
                if (hasOwn.call(tree, k)) {
                    content.push(_private.createMenuItem(tree[k]));
                }
            }
            content.push('</ul>');
            content.push('</div>');
            content.push('</nav>');
            content.push('</li>');
            if ($menu.length) {
                $menu.html(content.join(''));
                var menu = new GnMenu($menu.get(0));
            }

        },
        toXmlExtensionFormat: function (name) {
            return name.toLowerCase() + '.xml';
        },
        createSubMenu: function (items) {
            var result = ['<ul class="gn-submenu">'],
                i,
                sort = [],
                hasOwn = Object.prototype.hasOwnProperty;
            for (i in items) {
                if (hasOwn.call(items, i)) {
                    sort.push({
                        id: i,
                        val: items[i].label
                    });
                }
            }
            sort = sort.sort(function (a, b) {
                    if (a.val < b.val){
                        return -1;
                    }
                    if (a.val > b.val){
                        return 1;
                    }
                    return 0;
                }
            );
            sort.forEach(function (item) {
                result.push(_private.createMenuItem(items[item.id]));
            });
            result.push('</ul>');
            return result.join('');

        },
        createMenuItem: function (item) {
            var menuTmpl = '<li><a class="menu-root" href="{*url*}">{*name*}</a>{*submenu*}</li>',
                subMenuTmpl = '<ul><a class="menu-root" href="{*url*}">{*name*}</a>{*submenu*}</ul>',
                name = item.label,
                url = item.url;
            if (Object.keys(item.items).length) {
                return subMenuTmpl
                    .replace('{*url*}', url)
                    .replace('{*name*}', name)
                    .replace('{*submenu*}', _private.createSubMenu(item.items));
            } else {
                return menuTmpl
                    .replace('{*url*}', url)
                    .replace('{*name*}', name)
                    .replace('{*submenu*}', '');
            }

        }
    };
    return {
        init: function (items) {
            _private.init(items);
        }
    };
})();