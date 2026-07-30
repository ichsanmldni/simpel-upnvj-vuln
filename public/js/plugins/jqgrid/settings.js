var jqRowList = [15, 20, 30, 40, 50, 100, 250, 500, 1000];
//($)
var jqGridParamsToken = {};
jqGridParamsToken[upntoken.name] = upntoken.value;
jQuery.extend(jQuery.jgrid.defaults, {
    altRows: true,
    rowList: jqRowList,
    rowNum: limit_perpage,
    toppager: true,
    sortorder: "",
    sortname: "",
    altclass: 'alt',
    styleUI: 'Bootstrap',
    datatype: "local",
    mtype: "POST",
    height: 'auto',
    autowidth: true,
    width: null,
    shrinkToFit: false,
    viewrecords: true,
    pager: "#jqpager",
    rownumbers: true,
    multiselect: true,
    multiselectWidth: 30,
    rownumWidth: 40,
    postData: jqGridParamsToken,
    jsonReader: {
        repeatitems: false,
        root: "rows",
        page: "page",
        records: "records",
        total: "total"
    },
    resizeStop: function () {
//        jqGridresizeColumnHeader.call(this);
//        jqGridfixPositionsOfFrozenDivs.call(this);
//        jqGridfixGboxHeight.call(this);
    },
    ajaxGridOptions: {
        beforeSend: function () {
            $.LoadingOverlay("show", {
                fade: [1000, 500]
            });
        }
    },
    loadComplete: function () {
        $.LoadingOverlay("hide");
    },
    columnChooser: function (opts) {
        var self = this;
        if ($("#colchooser_" + $.jgrid.jqID(self[0].p.id)).length) {
            return;
        }
        var selector = $('<div id="colchooser_' + self[0].p.id + '" style="position:relative;overflow:hidden"><div><select multiple="multiple"></select></div></div>');
        var select = $('select', selector);
        var parent_selector = $('#colchooser_' + self[0].p.id).parent();
        function insert(perm, i, v) {
            if (i >= 0) {
                var a = perm.slice();
                var b = a.splice(i, Math.max(perm.length - i, i));
                if (i > perm.length) {
                    i = perm.length;
                }
                a[i] = v;
                return a.concat(b);
            }
        }
        opts = $.extend({
            "width": 420,
            "height": 240,
            "classname": null,
            "done": function (perm) {
                if (perm) {
                    self.jqGrid("remapColumns", perm, true);
                }
            },
            /* msel is either the name of a ui widget class that
             extends a multiselect, or a function that supports
             creating a multiselect object (with no argument,
             or when passed an object), and destroying it (when
             passed the string "destroy"). */
            "msel": "multiselect",
            /* "msel_opts" : {}, */

            /* dlog is either the name of a ui widget class that
             behaves in a dialog-like way, or a function, that
             supports creating a dialog (when passed dlog_opts)
             or destroying a dialog (when passed the string
             "destroy")
             */
            "dlog": "dialog",
            /* dlog_opts is either an option object to be passed
             to "dlog", or (more likely) a function that creates
             the options object.
             The default produces a suitable options object for
             ui.dialog */
            "dlog_opts": function (opts) {
                var buttons = {};
                buttons[opts.bSubmit] = function () {
                    opts.apply_perm();
                    opts.cleanup(false);
                };
                buttons[opts.bCancel] = function () {
                    opts.cleanup(true);
                };
                return $.extend(true, {
                    "buttons": buttons,
                    "close": function () {
                        opts.cleanup(true);
                    },
                    "modal": opts.modal ? opts.modal : false,
                    "resizable": opts.resizable ? opts.resizable : true,
                    "width": opts.width + 20,
                    resize: function (e, ui) {
                        var $container = $(this).find('>div>div.ui-multiselect'),
                                containerWidth = $container.width(),
                                containerHeight = $container.height(),
                                $selectedContainer = $container.find('>div.selected'),
                                $availableContainer = $container.find('>div.available'),
                                $selectedActions = $selectedContainer.find('>div.actions'),
                                $availableActions = $availableContainer.find('>div.actions'),
                                $selectedList = $selectedContainer.find('>ul.connected-list'),
                                $availableList = $availableContainer.find('>ul.connected-list'),
                                dividerLocation = opts.msel_opts.dividerLocation || $.ui.multiselect.defaults.dividerLocation;

                        $container.width(containerWidth); // to fix width like 398.96px
                        $availableContainer.width(Math.floor(containerWidth * (1 - dividerLocation)));
                        $selectedContainer.width(containerWidth - $availableContainer.outerWidth() - ($.browser.webkit ? 1 : 0));

                        $availableContainer.height(containerHeight);
                        $selectedContainer.height(containerHeight);
                        $selectedList.height(Math.max(containerHeight - $selectedActions.outerHeight() - 1, 1));
                        $availableList.height(Math.max(containerHeight - $availableActions.outerHeight() - 1, 1));
                    }
                }, opts.dialog_opts || {});
            },
            /* Function to get the permutation array, and pass it to the
             "done" function */
            "apply_perm": function () {
                $('option', select).each(function (i) {
                    if (this.selected) {
                        self.jqGrid("showCol", colModel[this.value].name);
                    } else {
                        self.jqGrid("hideCol", colModel[this.value].name);
                    }
                });

                var perm = [];
                //fixedCols.slice(0);
                $('option:selected', select).each(function () {
                    perm.push(parseInt(this.value, 10));
                });
                $.each(perm, function () {
                    delete colMap[colModel[parseInt(this, 10)].name];
                });
                $.each(colMap, function () {
                    var ti = parseInt(this, 10);
                    perm = insert(perm, ti, ti);
                });
                if (opts.done) {
                    opts.done.call(self, perm);
                }
            },
            /* Function to cleanup the dialog, and select. Also calls the
             done function with no permutation (to indicate that the
             columnChooser was aborted */
            "cleanup": function (calldone) {
                call(opts.dlog, selector, 'destroy');
                call(opts.msel, select, 'destroy');
                selector.remove();
                if (calldone && opts.done) {
                    opts.done.call(self);
                }
            },
            "msel_opts": {}
        }, $.jgrid.col, opts || {});
        if ($.ui) {
            if ($.ui.multiselect) {
                if (opts.msel == "multiselect") {
                    if (!$.jgrid._multiselect) {
                        // should be in language file
                        alert("Multiselect plugin loaded after jqGrid. Please load the plugin before the jqGrid!");
                        return;
                    }
                    opts.msel_opts = $.extend($.ui.multiselect.defaults, opts.msel_opts);
                }
            }
        }

        if (opts.caption) {
            selector.attr("title", opts.caption);
        }
        if (opts.classname) {
            selector.addClass(opts.classname);
            select.addClass(opts.classname);
        }
        if (opts.width) {
            $(">div", selector).css({
                "width": opts.width,
                "margin": "0 auto"
            });
            select.css("width", opts.width);
        }
        if (opts.height) {
            $(">div", selector).css("height", opts.height);
            select.css("height", opts.height - 10);
        }
        parent_selector.css("zIndex", 1000);
        var colModel = self.jqGrid("getGridParam", "colModel");
        var colNames = self.jqGrid("getGridParam", "colNames");
        var colMap = {}, fixedCols = [];
        select.empty();
        $.each(colModel, function (i) {
            colMap[this.name] = i;
            if (this.hidedlg) {
                if (!this.hidden) {
                    fixedCols.push(i);
                }
                return;
            }

            select.append("<option value='" + i + "' " +
                    (this.hidden ? "" : "selected='selected'") + ">" + colNames[i] + "</option>");
        });
        function call(fn, obj) {
            if (!fn) {
                return;
            }
            if (typeof fn == 'string') {
                if ($.fn[fn]) {
                    $.fn[fn].apply(obj, $.makeArray(arguments).slice(2));
                }
            } else if ($.isFunction(fn)) {
                fn.apply(obj, $.makeArray(arguments).slice(2));
            }
        }

        var dopts = $.isFunction(opts.dlog_opts) ? opts.dlog_opts.call(self, opts) : opts.dlog_opts;
        call(opts.dlog, selector, dopts);
        var mopts = $.isFunction(opts.msel_opts) ? opts.msel_opts.call(self, opts) : opts.msel_opts;
        call(opts.msel, select, mopts);
        // fix height of elements of the multiselect widget
        var resizeSel = "#colchooser_" + $.jgrid.jqID(self[0].p.id),
                $container = $(resizeSel + '>div>div.ui-multiselect'),
                $selectedContainer = $(resizeSel + '>div>div.ui-multiselect>div.selected'),
                $availableContainer = $(resizeSel + '>div>div.ui-multiselect>div.available'),
                containerHeight = $container.height(),
                $selectedActions = $selectedContainer.find('>div.actions'),
                $availableActions = $availableContainer.find('>div.actions'),
                $selectedList = $selectedContainer.find('>ul.connected-list'),
                $availableList = $availableContainer.find('>ul.connected-list');
        $container.height($container.parent().height()); // increase the container height
        containerHeight = $container.height();
        $selectedContainer.height(containerHeight);
        $availableContainer.height(containerHeight);
        $selectedList.height(Math.max(containerHeight - $selectedActions.outerHeight() - 1, 1));
        $availableList.height(Math.max(containerHeight - $availableActions.outerHeight() - 1, 1));
        // extend the list of components which will be also-resized
        selector.data('dialog').uiDialog.resizable("option", "alsoResize",
                resizeSel + ',' + resizeSel + '>div' + ',' + resizeSel + '>div>div.ui-multiselect');
    },
    loadError: function (jqXHR, textStatus, errorThrown) {
//        if (jqXHR.status == 401) {
//            upn.confirm({
//                    message: 'Sesi anda sudah habis, harap untuk login kembali ke sistem!', 
//                    url: SITE_URL, 
//                    useAjax: false
//            });
//        }else{
//            
//        }
        
//        if (jqXHR.status == 401) {
//            alert('Sesi anda sudah habis, harap untuk login kembali ke sistem!');
//            location.href = SITE_URL + 'login';
//        }else{
//            alert('HTTP status code: ' + jqXHR.status + '\n' +
//              'textStatus: ' + textStatus + '\n' +
//              'errorThrown: ' + errorThrown);
//            alert('HTTP message body (jqXHR.responseText): ' + '\n' + jqXHR.responseText); 
//        }

    }
});

jQuery.extend(true, jQuery.ui.multiselect, {
    locale: {
        addAll: 'Make all visible',
        removeAll: 'Hidde All',
        itemsCount: 'Avlialble Columns'
    }
});
jQuery.extend(true, jQuery.jgrid.col, {
    width: 450,
    modal: true,
    msel_opts: {
        dividerLocation: 0.5
    },
    dialog_opts: {
        minWidth: 470,
        show: 'blind',
        hide: 'blind'
    }
});
var jqGridContainerWidth = $('#jqGrid_container').width(),
        jqGridAddNavBackGrid = function (callback, div) {
            div = (div == 'undefined') ? "#jqGridTable_toppager_left" : div;
            $("#jqGridTable_toppager_left").append('<button class="btn btn-default btn-sm" id="btnBackGrid" title="Klik Grid Sebelumnya" style="padding:1px 10px;"><i class="fa fa-fw fa-reply"></i> Kembali</button>');
            $("button#btnBackGrid").click(function () {
                callback && callback();
            });
        },
        jqGridresizeColumnHeader = function () {
            
//                    var rowHight, resizeSpanHeight,
//                        // get the header row which contains
//                        headerRow = $(this).closest("div.ui-jqgrid-view")
//                            .find("table.ui-jqgrid-htable>thead>tr.ui-jqgrid-labels");
//        
//                    // reset column height
//                    headerRow.find("span.ui-jqgrid-resize").each(function () {
//                        this.style.height = '';
//                    });
//        
//                    // increase the height of the resizing span
//                    resizeSpanHeight = 'height: ' + headerRow.height() + 'px !important; cursor: col-resize;';
//                    headerRow.find("span.ui-jqgrid-resize").each(function () {
//                        this.style.cssText = resizeSpanHeight;
//                    });
//        
//                    // set position of the dive with the column header text to the middle
//                    rowHight = headerRow.height();
//                    headerRow.find("div.ui-jqgrid-sortable").each(function () {
//                        var ts = $(this);
//                        ts.css('top', (rowHight - ts.outerHeight()) / 2 + 'px');
//                    });
                    
                    
//            var rowHight, resizeSpanHeight,
//                    // get the header row which contains
//                    headerRow = $(this).closest("div.ui-jqgrid-view")
//                    .find("table.ui-jqgrid-htable>thead>tr.ui-jqgrid-labels");
//
//            // reset column height
//            headerRow.find("span.ui-jqgrid-resize").each(function () {
//                this.style.height = '';
//            });
//
//            // increase the height of the resizing span
//            resizeSpanHeight = 'height: ' + headerRow.height() + 'px !important; cursor: col-resize;';
//            headerRow.find("span.ui-jqgrid-resize").each(function () {
//                this.style.cssText = resizeSpanHeight;
//            });
//
//            // set position of the dive with the column header text to the middle
//            rowHight = headerRow.height();
//            headerRow.find("div.ui-jqgrid-sortable").each(function () {
//                var ts = $(this);
//                ts.css('top', (rowHight - ts.outerHeight()) / 2 + 'px');
//            });
        },
        jqGridfixPositionsOfFrozenDivs = function () {
//            var $rows;
//                    if (typeof this.grid.fbDiv !== "undefined") {
//                        $rows = $('>div>table.ui-jqgrid-btable>tbody>tr', this.grid.bDiv);
//                        $('>table.ui-jqgrid-btable>tbody>tr', this.grid.fbDiv).each(function (i) {
//                            var rowHight = $($rows[i]).height(), rowHightFrozen = $(this).height();
//                            if ($(this).hasClass("jqgrow")) {
//                                $(this).height(rowHight);
//                                rowHightFrozen = $(this).height();
//                                if (rowHight !== rowHightFrozen) {
//                                    $(this).height(rowHight + (rowHight - rowHightFrozen));
//                                }
//                            }
//                        });
//                        $(this.grid.fbDiv).height(this.grid.bDiv.clientHeight);
//                        $(this.grid.fbDiv).css($(this.grid.bDiv).position());
//                    }
//                    if (typeof this.grid.fhDiv !== "undefined") {
//                        $rows = $('>div>table.ui-jqgrid-htable>thead>tr', this.grid.hDiv);
//                        $('>table.ui-jqgrid-htable>thead>tr', this.grid.fhDiv).each(function (i) {
//                            var rowHight = $($rows[i]).height(), rowHightFrozen = $(this).height();
//                            $(this).height(rowHight);
//                            rowHightFrozen = $(this).height();
//                            if (rowHight !== rowHightFrozen) {
//                                $(this).height(rowHight + (rowHight - rowHightFrozen));
//                            }
//                        });
//                        $(this.grid.fhDiv).height(this.grid.hDiv.clientHeight);
//                        $(this.grid.fhDiv).css($(this.grid.hDiv).position());
//                    }
                    
                    
//    if (typeof this.grid.fbDiv !== "undefined") {
//            $(this.grid.fbDiv).css($(this.grid.bDiv).position());
//        }
//        if (typeof this.grid.fhDiv !== "undefined") {
//            $(this.grid.fhDiv).css($(this.grid.hDiv).position());
//        }
//    var $rows;
////    console.log(this.grid);
//    if (typeof this.grid.fbDiv !== "undefined") {
//        $rows = $('>div>table.ui-jqgrid-btable>tbody>tr', this.grid.bDiv);
//        $('>table.ui-jqgrid-btable>tbody>tr', this.grid.fbDiv).each(function (i) {
//            var rowHight = $($rows[i]).height(), rowHightFrozen = $(this).height();
//            if ($(this).hasClass("jqgrow")) {
//                $(this).height(rowHight);
//                rowHightFrozen = $(this).height();
//                if (rowHight !== rowHightFrozen) {
//                    $(this).height(rowHight + (rowHight - rowHightFrozen));
//                }
//            }
//        });
//        $(this.grid.fbDiv).height(this.grid.bDiv.clientHeight);
//        $(this.grid.fbDiv).css($(this.grid.bDiv).position());
//    }
//    if (typeof this.grid.fhDiv !== "undefined") {
//        $rows = $('>div>table.ui-jqgrid-htable>thead>tr', this.grid.hDiv);
//        $('>table.ui-jqgrid-htable>thead>tr', this.grid.fhDiv).each(function (i) {
//            var rowHight = $($rows[i]).height(), rowHightFrozen = $(this).height();
//            $(this).height(rowHight);
//            rowHightFrozen = $(this).height();
//            if (rowHight !== rowHightFrozen) {
//                $(this).height(rowHight + (rowHight - rowHightFrozen));
//            }
//        });
//        $(this.grid.fhDiv).height(this.grid.hDiv.clientHeight);
//        $(this.grid.fhDiv).css($(this.grid.hDiv).position());
//    }
        },
        jqGridfixGboxHeight = function () {
//            var gviewHeight = $("#gview_" + $.jgrid.jqID(this.id)).outerHeight(),
//                        pagerHeight = $(this.p.pager).outerHeight();
//        
//                    $("#gbox_" + $.jgrid.jqID(this.id)).height(gviewHeight + pagerHeight);
//                    gviewHeight = $("#gview_" + $.jgrid.jqID(this.id)).outerHeight();
//                    pagerHeight = $(this.p.pager).outerHeight();
//                    $("#gbox_" + $.jgrid.jqID(this.id)).height(gviewHeight + pagerHeight);
                    
                    
//    var gviewHeight = $("#gview_" + $.jgrid.jqID(this.id)).outerHeight(),
//    pagerHeight = $(this.p.pager).outerHeight();
//        
//    $("#gbox_" + $.jgrid.jqID(this.id)).height(gviewHeight + pagerHeight);
//    gviewHeight = $("#gview_" + $.jgrid.jqID(this.id)).outerHeight();
//    pagerHeight = $(this.p.pager).outerHeight();
//    $("#gbox_" + $.jgrid.jqID(this.id)).height(gviewHeight + pagerHeight);
        },
        jqGridscrolTopToolbar = function (grid) {
            var $gview = grid.closest(".ui-jqgrid-view"),
                    $topToolbar = $gview.find(">.ui-userdata"),
                    $bdiv = grid.closest(".ui-jqgrid-bdiv"),
                    resetTopToolbarHeight = function () {
                        var scrollbarHeight = 18; // some test value
                        $topToolbar.find(">div").height(scrollbarHeight);
                        $topToolbar.css("border-top", "0").css("height", "auto");
                        scrollbarHeight = $topToolbar.height() - scrollbarHeight;
                        $topToolbar.find(">div").height(scrollbarHeight);
                        $topToolbar.height(scrollbarHeight);
                        jqGridfixPositionsOfFrozenDivs.call(grid[0]);
                    };
//        console.log($topToolbar);
            // insert empty div in the top toolbar and make its width
            // the same as the width of the grid
            $topToolbar.css({overflowX: "scroll", overflowY: "hidden"})
                    .append(jQuery("<div>").width(grid.width()));
            ($topToolbar).insertAfter('.ui-jqgrid-toppager');
            // set the height of the div and the height of toolbar
            // based on the height of the horizontal scrollbar
            resetTopToolbarHeight();
            // detect scrolling of topbar
            $topToolbar.scroll(function () {
                // synchronize the srollbar of the grid
                $bdiv.scrollLeft($(this).scrollLeft());
            });
            // detect scrolling of the grid
            $bdiv.scroll(function () {
                // synchronize the srollbar of the toppbar
                $topToolbar.scrollLeft($(this).scrollLeft());
            });
            // detect zoop of the page and adjust the
            jQuery(window).on("resize", function () {
                resetTopToolbarHeight();
                jqGridfixPositionsOfFrozenDivs.call(grid[0]);
            });
        }, formatterLastUpdated = function (cellvalue, options, rowObject) {
    return '<i class="fa fa-user"></i> ' + (rowObject.user_updated ? rowObject.user_updated : "-") + ' | <i class="fa fa-calendar"></i> ' + rowObject.date_updated;
},formatterDateUpdated = function(cellvalue, options, rowObject){
    return '<i class="fa fa-calendar"></i> ' + rowObject.date_updated;
}, formatterUserValidated = function (cellvalue, options, rowObject) {
    return '<i class="fa fa-user"></i> ' + (rowObject.user_validation ? rowObject.user_validation : "-") + ' | <i class="fa fa-calendar"></i> ' + rowObject.date_validation;
}, formatterYesOrNo = function (cellvalue, options, rowObject) {
    var str = "";
    if (cellvalue == 1) {
        str = 'Iya'
    }
    else if (cellvalue == 2) {
        str = 'Tidak'
    }
    else {
        str = ""
    }
    return str;
},formatterN_a = function (cellvalue) {
    var str;
    if (cellvalue == null){
        str = 'N/a';
    }else{
        str = cellvalue;
    }
    return str;
},formatterNull = function (cellvalue) {
    var str;
    if (cellvalue == null){
        str = '-';
    }else{
        str = cellvalue;
    }
    return str;
},formatterPeranKegiatan = function (a,b,c) {
    var _label_class;
    if(c.f_peran_id == 1){ // ketua
        _label_class = 'label-success';
    }else if(c.f_peran_id == 2){ // anggota
        _label_class = 'label-warning';
    }else if(c.f_peran_id == 3){ // individu
        _label_class = 'label-info';
    }
    return '<span class="label '+_label_class+' label-white middle">'+a+'</span>';
},
formatterStatusValidasi = function (a,b,c) {
    var _label_class;
    if ( c.f_status == 5) { // ditolak
        _label_class = 'label-danger' ;
    }else if(c.f_status == 1){ // diterima
        _label_class = 'label-success' ;
    }else if(c.f_status == 4){ // konfirmasi keanggotaan
        _label_class = 'label-purple' ;
    }else if(c.f_status == 3){ // revisi
        _label_class = 'label-danger' ;
    }else if(c.f_status == 2){ // revisi
        _label_class = 'label-info' ;
    }else{ // menunggu atau sedang dalam proses
        _label_class = 'label-warning' ;
    }
    
    return '<span class="label '+_label_class+' arrowed-in">'+a+'</span>';
}, cellAttrVATop = function (rowId, tv, rawObject, cm, rdata) {
    return 'style="vertical-align:top;"';
}, cellAttrWhiteSpace = function (rowId, tv, rawObject, cm, rdata) {
    return 'style="white-space: normal !important;vertical-align:top;"';
},formatteToDateTimeIndo = function (cellvalue) {
    var str;
    if (cellvalue == null){
        str = 'N/a';
    }else{
        str = moment(cellvalue).format("DD/MM/YYYY HH:II");
    }
    return str;
},formatteToDateIndo = function (cellvalue) {
    var str;
    if (cellvalue == null){
        str = 'N/a';
    }else{
        str = moment(cellvalue).format("DD/MM/YYYY");
    }
    return str;
},formatterTanggalIndoBulan = function(value){
    if (value == null)
        return "N/a";
    // Membuat objek Date dari tanggal ISO
    var tanggalObj = new Date(value);
    
    // Array untuk nama-nama bulan dalam Bahasa Indonesia
    var namaBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    // Mengambil informasi tanggal, bulan, dan tahun dari objek Date
    var tanggal = tanggalObj.getDate();
    var bulan = namaBulan[tanggalObj.getMonth()];
    var tahun = tanggalObj.getFullYear();
    
    // Menggabungkan dan mengembalikan hasil dalam format yang diinginkan
    return tanggal + " " + bulan + " " + tahun;
};
$.jgrid.extend({
    setColWidth: function (iCol, newWidth, adjustGridWidth) {
        "use strict";
        return this.each(function () {
            var $self = $(this), grid = this.grid, colName, colModel, i, nCol;
            if (typeof iCol === "string") {
                // the first parametrer is column name instead of index
                colName = iCol;
                colModel = $self.jqGrid("getGridParam", "colModel");
                for (i = 0, nCol = colModel.length; i < nCol; i++) {
                    if (colModel[i].name === colName) {
                        iCol = i;
                        break;
                    }
                }
                if (i >= nCol) {
                    return; // error: non-existing column name specified as the first parameter
                }
            } else if (typeof iCol !== "number") {
                return; // error: wrong parameters
            }
            grid.resizing = {idx: iCol};
            grid.headers[iCol].newWidth = newWidth;
            if (adjustGridWidth !== false) {
                grid.newWidth = grid.width + newWidth - grid.headers[iCol].width;
            }
            grid.dragEnd();   // adjust column width
            if (adjustGridWidth !== false) {
                $self.jqGrid("setGridWidth", grid.newWidth, false); // adjust grid width too
            }
        });
    }
});

        