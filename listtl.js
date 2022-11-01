/* Contain JSon data
*/
let listOfJapaneseTL;
let listOfChineseTL;

let arr_filterdropdown = ["synthlist", "singerlist", "producerlist", "circlelist"];

/* Represent Tabulator elements
*/
let data_table = {
    cntl:{},
    jptl:{}
}

/* Contain summary data
*/
let list_contributors;

/* Control website display
*/
let isTableDisplayedInEnglish = true;
let mode_ActiveTable = "cntl";

/* Load Json to table
*/
async function loadJSon() {
    //fetch("listofjapanesetl.json")
    await fetch("listofjapanesetl.json")
        .then(response => {
            return response.json();
        })
        .then(data => {
            listOfJapaneseTL = data;
            //console.log(data);
        });
    await fetch("listofchinesetl.json")
        .then(response => {
            return response.json();
        })
        .then(data => {
            listOfChineseTL = data;
            //console.log(data);
        });
}

function toggleLanguage() {

    $("#togglelocalize").toggleClass("loading");

    table = data_table[mode_ActiveTable];
    let arr_toggle_columns = ["engtitle", "title", "vocals", "circle", "producer"];
    let arr_alwaysshow_columns = ["id", "year"];

    setTimeout(function(){
        
        arr_alwaysshow_columns.forEach( (item) => {
            table.showColumn(item);
        })
        if (isTableDisplayedInEnglish) {
            arr_toggle_columns.forEach( (item) => {
                table.hideColumn(item + "_loc");
                table.showColumn(item);
            });    
        }
        else {
            arr_toggle_columns.forEach( (item) => {
                table.hideColumn(item);
                table.showColumn(item + "_loc");
            });
        }
        table.redraw();
        
        isTableDisplayedInEnglish = !isTableDisplayedInEnglish;
        if (isTableDisplayedInEnglish) {
            loadalldropdown(list_contributors, mode_ActiveTable, true);
            $("#togglelocalize").html("Show title & names in the original language script");
        }
        else {
            loadalldropdown(list_contributors, mode_ActiveTable, false);
            $("#togglelocalize").html("Show title & names in Latin script/English");
        }

        $("#togglelocalize").toggleClass("loading");
    
    }, 10);
};

function toggleTab(input_mode_ActiveTable) {

    function redrawTable(table) {
        let arr_toggle_columns = ["engtitle", "title", "vocals", "circle", "producer"];
        let arr_alwaysshow_columns = ["id", "year"];
        /*
        console.log("LOG:");
        table.getColumns().forEach( column => {
            console.log(column.getField());
            column.hide();
        })
        */
        arr_alwaysshow_columns.forEach( (item) => {
            table.showColumn(item);
            //console.log("Showed: " + table.getColumn(item).getField());
        })
        if (isTableDisplayedInEnglish) {
            arr_toggle_columns.forEach( item => {
                table.hideColumn(item);
                table.showColumn(item + "_loc");
                //console.log("Hid: " + table.getColumn(item).getField());
                //console.log("Showed: " + table.getColumn(item + "_loc").getField());
            });    
        }
        else {
            arr_toggle_columns.forEach( item => {
                table.hideColumn(item + "_loc");
                table.showColumn(item);
                //console.log("Hid: " + table.getColumn(item + "_loc").getField());
                //console.log("Showed: " + table.getColumn(item).getField());
            });
        }
        table.clearFilter();
        arr_filterdropdown.forEach(item => {
            $("#" + item).dropdown("restore defaults");
        });
        //table.redraw();
    }

    if (mode_ActiveTable !== input_mode_ActiveTable) {
        redrawTable(data_table[input_mode_ActiveTable]);
        //console.log("Redrawn " + input_mode_ActiveTable);
    };
    mode_ActiveTable = input_mode_ActiveTable;
    loadalldropdown(list_contributors, mode_ActiveTable, isTableDisplayedInEnglish);
}

function loadalldropdown(datacontainer, mode_ActiveTable, bool_uselocalizedname) {

    switch (mode_ActiveTable) {
        case "cntl":
            datacontainer = datacontainer.cn;
            break;
        case "jptl":
            datacontainer = datacontainer.jp;
            break;
    };

    arr_synths_sorted = datacontainer[0][1].sort(function(a, b){
        return b.count - a.count;
    });
    arr_singers_sorted = datacontainer[1][1].sort(function(a, b){
        return b.count - a.count;
    });
    arr_producers_sorted = datacontainer[2][1].sort(function(a, b){
        return b.count - a.count;
    });
    arr_circles_sorted = datacontainer[3][1].sort(function(a, b){
        return b.count - a.count;
    });

    function loadsingledrowpdown(dropdownelement, plcmessage, arrData, bool_uselocalizedname) {
        let strHTML = "";
        strHTML += "<div class=\"text\" style=\"color:#cfd4c5;\">" + plcmessage 
        strHTML += "<i class=\"dropdown icon\"></i></div>"
        strHTML += "<div class=\"menu\">\n";
        for (let i = 0; i < arrData.length; i++) {
            strHTML += "\t\t<div class=\"item\" data-value=\"" + arrData[i].key + "\">";
            if (bool_uselocalizedname) {strHTML += arrData[i].locname;}
            else {strHTML += arrData[i].key};
            strHTML += " (" + arrData[i].count + ")</div>\n";
        };
        strHTML += "</div>";
        dropdownelement.html(strHTML);
    };

    function dropdownonchangeevent(mode_ActiveTable) {
        return function(value, text, $selectedItem) {

            //console.log("Event triggered");
            let activetable = data_table[mode_ActiveTable];

            let data_filter = {
                synth: {
                    value: $("#synthlist").dropdown('get value'),
                    filterfield: "synths",
                    data: []
                },
                singer: {
                    value: $("#singerlist").dropdown('get value'),
                    filterfield: "vocalists",
                    data: []
                },
                producer: {
                    value: $("#producerlist").dropdown('get value'),
                    filterfield: "producer",
                    data: []
                },
                circle: {
                    value: $("#circlelist").dropdown('get value'),
                    filterfield: "circle",
                    data: []
                }
            };
            Object.keys(data_filter).forEach( key => {
                data_filter[key].data = data_filter[key].value.split(",");
            });
            console.log(data_filter);
            
            bFilterSet = (data_filter.synth.value !== "" || data_filter.singer.value !== "" ||data_filter.producer.value !== "" || data_filter.circle.value !== "");

            if (bFilterSet) {
                
                activetable.setFilter(
                    function(data, filterParams){
                        let bool_foundstr = true;
                        let arr_filterField = filterParams.filterField;
                        let arr_filterByString = filterParams.filterByString;
                        
                        for (let i = 0; i < arr_filterByString.length; i++) {
                            filterByString = arr_filterByString[i];
                            filterField = arr_filterField[i];
                            filterByString.forEach ( item => {
                                if (item !== "") {
                                    bool_foundstr = bool_foundstr && data[filterField].includes(item);
                                };
                            });
                        };
                        return bool_foundstr;
                    }, {
                        filterByString:[data_filter.synth.data, data_filter.singer.data, data_filter.producer.data, data_filter.circle.data],
                        filterField:[data_filter.synth.filterfield, data_filter.singer.filterfield, data_filter.producer.filterfield, data_filter.circle.filterfield]
                    }
                );
            }
            else {
                activetable.clearFilter();
            };
            activetable.setPage(1);
        };
    }

    let arr_manipulatedom = [
        {domelname:"synthlist", plcmessage:"Hatsune Miku", data:arr_synths_sorted},
        {domelname:"singerlist", plcmessage:"...", data:arr_singers_sorted},
        {domelname:"producerlist", plcmessage:"...", data:arr_producers_sorted},
        {domelname:"circlelist", plcmessage:"...", data:arr_circles_sorted}
    ];
    arr_manipulatedom.forEach( item => {
        domel = $("#" + item.domelname);
        loadsingledrowpdown(domel, item.plcmessage, item.data, bool_uselocalizedname);
        domel.dropdown({
            onChange: dropdownonchangeevent(mode_ActiveTable)
        });
    });

}

function toggle_subs() {
    let is_ToggledOn = document.getElementById("sublink").checked;
    Object.keys(data_table).forEach( key => {
        table = data_table[key];
        if (is_ToggledOn) {table.showColumn("suburl");}
        else {table.hideColumn("suburl")};
        table.redraw();
    })
    document.getElementById("sublink_label").innerHTML = is_ToggledOn ? "Hide English sub links" : "Show English sub links";
}

function reset_filter() {
    $('#clearfilter').toggleClass("loading");
    setTimeout(function(){
        Object.keys(data_table).forEach( key => {
            table = data_table[key];
            table.clearFilter();
            table.setSort("id", "desc");
        })
        arr_filterdropdown.forEach(item => {
            $("#" + item).dropdown("restore defaults");
        });
        $('#sortchrono').val(false); 
        $('#sortchrono').html("Newest → Oldest");
        $('#clearfilter').toggleClass("loading");
    }, 10);
}

async function createtables() {

    function createTable(jsondata, nametable) {

        let func_formathtmlwrap = function(cell, formatterParams, onRendered) {
            cell.getElement().style.whiteSpace = "pre-wrap";
            function emptyToSpace(value) {
                return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
            }
            return emptyToSpace("<div>" + cell.getValue() + "</div>");
        }
        let func_formatlistwrap = function(cell, formatterParams, onRendered) {
            listincell = cell.getValue();
            joinedlist = listincell.join(", ");
            cell.getElement().style.whiteSpace = "pre-wrap";
            function emptyToSpace(value) {
                return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
            }
            function sanitizeHTML(value) {
                if (value) {
                  var entityMap = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;',
                    '/': '&#x2F;',
                    '`': '&#x60;',
                    '=': '&#x3D;'
                  };
                  return String(value).replace(/[&<>"'`=/]/g, function (s) {
                    return entityMap[s];
                  });
                } else { return value; }
            }
            return this.emptyToSpace(this.sanitizeHTML(joinedlist));
        }
    
        let func_sortstring = function(a, b, aRow, bRow, column, dir, params) {
            let alignEmptyValues = params.alignEmptyValues;
            let emptyAlign = 0;
            let locale; //handle empty values
            let comparefield = params.comparefield;
            
            let aRowData = aRow.getData();
            let bRowData = bRow.getData();
            a = aRowData[comparefield];
            b = bRowData[comparefield];
            if (typeof a !== "string" && Array.isArray(a)) {
                a = a.join(", ");
            }
            if (typeof b !== "string" && Array.isArray(b)) {
                b = b.join(", ");
            }
    
            if (!a) {emptyAlign = !b ? 0 : -1;} 
            else if (!b) {emptyAlign = 1;} 
            else {
                //compare valid values
                switch (typeof params.locale) {
                    case "boolean":
                    if (params.locale) {
                        locale = this.langLocale();
                    }
    
                    break;
    
                    case "string":
                    locale = params.locale;
                    break;
                }
    
                return String(a).toLowerCase().localeCompare(String(b).toLowerCase(), locale);
            } //fix empty values in position
    
    
            if (alignEmptyValues === "top" && dir === "desc" || alignEmptyValues === "bottom" && dir === "asc") {
            emptyAlign *= -1;
            }
    
            return emptyAlign;
        };
    
        let func_mutator_ogtitle_dispeng = function(value, data){
            let [orgtitle, romtitle] = [data.originaltitle, data.romanizedtitle];
            let title = orgtitle
            if (romtitle !== orgtitle) {title += " (" + romtitle + ")";}
            return title
        };
        let func_mutator_ogtitle_dispog = function(value, data){
            let [orgtitle, romtitle, pageurl] = [data.originaltitle, data.romanizedtitle, data.pageurl];
            let title = "<a href=\"" + pageurl + "\" target=\"_blank\">" + orgtitle + "</a>";
            if (romtitle !== orgtitle) {title += " (" + romtitle + ")";}
            return title
        };
        
        let func_mutator_engtitle_dispeng = function(value, data){
            let [engtitle, pageurl] = [data.englishtitle, data.pageurl];
            let title = "<a href=\"" + pageurl + "\" target=\"_blank\">" + engtitle + "</a>";
            return title
        };
        let func_mutator_engtitle_dispog = function(value, data){
            return data.englishtitle
        };
    
        let table = new Tabulator("#" + nametable, {
            data:jsondata,
    
            //layout:"fitData",
            layout:"fitColumns",
            tooltips:false, 
    
            pagination:"local",
            paginationSize:50,
            paginationCounter:"rows",
            initialSort:[
                {column:"id", dir:"asc"},
            ],
            autoColumnsDefinitions:function(definitions){
                definitions.forEach((column) => {
                    column.headerFilter = true;
                });
                return definitions;
            },
            columns:[
                {title:"No", field:"id", sorter:"number", hozAlign:"left", vertAlign:"middle", width:60},
                {title:"Original Title", field:"title", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, visible:false, 
                    mutator:func_mutator_ogtitle_dispog,
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"romanizedtitle"
                    },
                    formatter:func_formathtmlwrap
                },
                {title:"English Title", field:"engtitle", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, visible:false,
                    mutator:func_mutator_engtitle_dispog,
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"englishtitle"
                    },
                    formatter:func_formathtmlwrap
                },
                {title:"English Title", field:"engtitle_loc", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    mutator:func_mutator_engtitle_dispeng,
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"englishtitle"
                    },
                    formatter:func_formathtmlwrap
                },
                {title:"Original Title", field:"title_loc", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    mutator:func_mutator_ogtitle_dispeng,
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"romanizedtitle"
                    },
                    formatter:func_formathtmlwrap
                },
                {title:"Featuring Vocals", field:"vocals", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, visible:false, 
                    mutator:function(value, data){
                        let vocals = [];
                        ["synths", "vocalists"].forEach((item) => {
                            vocals.push(...data[item]);
                        });
                        return vocals;
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"vocals_loc"
                    },
                    formatter:func_formatlistwrap
                },
                {title:"Featuring Vocals", field:"vocals_loc", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    mutator:function(value, data){
                        let vocals = [];
                        ["synths", "vocalists"].forEach((item) => {
                            vocals.push(...data[item + "_loc"]);
                        });
                        return vocals;
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"vocals_loc"
                    },
                    formatter:func_formatlistwrap
                },
                {title:"Producers", field:"producer", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, visible:false, 
                    mutator:function(value, data){
                        let producer = new Set();
                        ["composer", "lyricist", "tuner"].forEach((item) => {
                            if (data[item].length) {producer.add(...data[item]);};
                        });
                        return [...producer];
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"producer"
                    },
                    formatter:func_formatlistwrap
                },
                {title:"Producers", field:"producer_loc", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    mutator:function(value, data){
                        let producer = new Set();
                        ["composer", "lyricist", "tuner"].forEach((item) => {
                            if (data[item + "_loc"].length) {producer.add(...data[item + "_loc"]);};
                        });
                        return [...producer];
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"producer_loc"
                    },               
                    formatter:func_formatlistwrap
                },
                {title:"Circle", field:"circle", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, visible:false, 
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"circle"
                    },
                    formatter:func_formatlistwrap
                },
                {title:"Circle", field:"circle_loc", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"circle_loc"
                    },
                    formatter:func_formatlistwrap
                },
                {title:"Year", field:"year", sorter:"number", hozAlign:"left", vertAlign:"middle", width:80, resizable:true},
                {title:"Subbed", field:"suburl", hozAlign:"left", vertAlign:"middle", width:200, resizable:true, visible:false,
                    mutator:function(value, data) {
                        if (value.length == 0) {return ""};
                        let str_sublink = "";
                        let list_regex = {
                            "YouTube": new RegExp(/https?:\/\/www\.youtube\.com\/watch\?v=.*/),
                            "Nekocap": new RegExp(/https?:\/\/nekocap\.com\/view\/.*/)
                        }
                        let [url, site] = ["", ""]; 
                        value.forEach( item => {
                            arr_split = item.split("|");
                            switch (arr_split.length) {
                                case 1:
                                    url = item;
                                    site = "";
                                    Object.keys(list_regex).forEach( key => {
                                        if (url.match(list_regex[key])) {site = key};
                                    })
                                    str_sublink += "<a href=\"" + url + "\" target=\"_blank\">[" + site + "]</a>\n";
                                    break;
                                case 2:
                                    url = arr_split[1];
                                    site = "";
                                    Object.keys(list_regex).forEach( key => {
                                        if (url.match(list_regex[key])) {site = key};
                                    })
                                    str_sublink += "<a href=\"" + url + "\" target=\"_blank\">[" + site + "] <sub>(" + arr_split[0] + ")</sub></a>\n";
                                    break;
                                default:
                                    console.error("Invalid input for subbed video links");
                            };
                        });
                        return str_sublink.trim();
                    },
                    sorter:"string",
                    sorterParams:{
                        alignEmptyValues:"bottom"
                    },
                    formatter: func_formathtmlwrap
                }
                //{title:"Series", field:"series", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, formatter:"textarea"}
            ],
            initialSort:[
                {column:"id", dir:"desc"}
            ]
        });

        table.on("headerClick", function(e, column){
            if (column.getField() == "id") {
                console.log("ASD");
                sort_chronological();
            }
        });
    
        isTableDisplayedInEnglish = true;
    
        return table;
    
    }

    await loadJSon();

    list_contributors = {
        cn:[],
        jp:[],
    }
    list_contributors.cn = getListOfSynthAndProducer(listOfChineseTL);
    list_contributors.jp = getListOfSynthAndProducer(listOfJapaneseTL);

    loadalldropdown(list_contributors, "cntl", true);

    data_table["cntl"] = createTable(listOfChineseTL, "listcntl-table");
    data_table["jptl"] = createTable(listOfJapaneseTL, "listjptl-table");
}

function sort_chronological() {
    bToSortNewestToOldest = $('#sortchrono').val();
    Object.keys(data_table).forEach( key => {
        data_table[key].setSort("id", bToSortNewestToOldest ? "desc" : "asc");
    });
    $('#sortchrono').val(!bToSortNewestToOldest); 
    $('#sortchrono').html(bToSortNewestToOldest ? "Newest → Oldest" : "Oldest → Newest");
}

/* Get list of synths, producers and circles
   Returns a 3x2 array.
*/
function getListOfSynthAndProducer(jsondata) {
    //arr_jsondata = [listOfChineseTL, listOfJapaneseTL];

    [arr_synths_keys, arr_synths] = [[], []];
    [arr_vocalists_keys, arr_vocalists] = [[], []];
    [arr_producers_keys, arr_producers] = [[], []];
    [arr_circles_keys, arr_circles] = [[], []];

    jsondata.forEach(record => {
        //Iterate through synths
        for (let i = 0; i < record.synths.length; i++) {
            readsynth = record.synths[i];
            readsynth_loc = record.synths_loc[i];
            if (arr_synths_keys.includes(readsynth)) {
                index = arr_synths_keys.indexOf(readsynth);
                arr_synths[index].count++;
            }
            else {
                writerecord = {};
                writerecord.key = readsynth;
                writerecord.locname = readsynth_loc;
                writerecord.count = 1;
                arr_synths_keys.push(readsynth);
                arr_synths.push(writerecord);
            }
        };
        //Iterate through singers
        for (let i = 0; i < record.vocalists.length; i++) {
            readvoc = record.vocalists[i];
            readvoc_loc = record.vocalists_loc[i];
            if (arr_vocalists_keys.includes(readvoc)) {
                index = arr_vocalists_keys.indexOf(readvoc);
                arr_vocalists[index].count++;
            }
            else {
                writerecord = {};
                writerecord.key = readvoc;
                writerecord.locname = readvoc_loc;
                writerecord.count = 1;
                arr_vocalists_keys.push(readvoc);
                arr_vocalists.push(writerecord);
            }
        };
        //Iterate through singers, composers, lyricists, and tuners
        let readproducers = [];
        let readproducers_loc = [];
        ["composer", "lyricist", "tuner"].forEach( item => {
            readrecord = record[item];
            readrecord_loc = record[item + "_loc"];
            for (let i = 0; i < readrecord.length; i++) {
                if (!readproducers.includes(readrecord[i])) {
                    readproducers.push(readrecord[i]);
                    readproducers_loc.push(readrecord_loc[i]);
                };
            };
        });
        for (let i = 0; i < readproducers.length; i++) {
            readproducer = readproducers[i];
            readproducer_loc = readproducers_loc[i];
            if (arr_producers_keys.includes(readproducer)) {
                index = arr_producers_keys.indexOf(readproducer);
                arr_producers[index].count++;
            }
            else {
                writerecord = {};
                writerecord.key = readproducer;
                writerecord.locname = readproducer_loc;
                writerecord.count = 1;
                arr_producers_keys.push(readproducer);
                arr_producers.push(writerecord);
            }
        };
        //Iterate through circles
        for (let i = 0; i < record.circle.length; i++) {
            readcircle = record.circle[i];
            readcircle_loc = record.circle_loc[i];
            if (arr_circles_keys.includes(readcircle)) {
                index = arr_circles_keys.indexOf(readcircle);
                arr_circles[index].count++;
            }
            else {
                writerecord = {};
                writerecord.key = readcircle;
                writerecord.locname = readcircle_loc;
                writerecord.count = 1;
                arr_circles_keys.push(readcircle);
                arr_circles.push(writerecord);
            }
        };
    });

    return [
        [arr_synths_keys, arr_synths],
        [arr_vocalists_keys, arr_vocalists],
        [arr_producers_keys, arr_producers],
        [arr_circles_keys, arr_circles]
    ];
}

/* Summarize data from JSon 
   Parameters:
        modechecktable:     1: List of Chinese TL
                            2: List of Japanese TL
                            all: All lists
        bool_showcount:     Boolean
*/
async function summarizeAllData(modechecktable, bool_showcount) {

    let containerSongDetailsData = {
        "synths": new Map(),
        "vocalists": new Map(),
        "circle": new Map(),  
        "composer": new Map(), 
        "lyricist": new Map(), 
        "tuner": new Map(),
        "series": new Map()
    }
    const arrLoopThroughFields = ["synths", "vocalists", "circle", "composer", "lyricist", "tuner", "series"];

    await loadJSon();

    function summarizeList(jsondata) {
    
        let arrData = [];
        let mapField;
        let count = 0;
        jsondata.forEach( record => {
            arrLoopThroughFields.forEach( field => {
                //console.log(JSON.stringify(record));
                //console.log(field);
                mapField = containerSongDetailsData[field];
                arrData = record[field];
                if (Array.isArray(arrData) && arrData.length) {
                    arrData.forEach( item => {
                        if (!mapField.has(item)) {mapField.set(item, 1);}
                        else {
                            count = mapField.get(item) + 1;
                            mapField.set(item, count);
                        };
                    });
                };
            });
        });
    }

    switch(modechecktable) {
        case 1:
            summarizeList(listOfChineseTL);
            break;
        case 2:
            summarizeList(listOfJapaneseTL);
            break;
        case "all":
            summarizeList(listOfChineseTL);
            summarizeList(listOfJapaneseTL);
            break;
    }

    let mapField = new Map();
    arrLoopThroughFields.forEach( field => {
        mapField = containerSongDetailsData[field];
        document.write(field + ": <br>");
        mapField.forEach((count, item) => {
            if (bool_showcount) {document.write(item + " (" + count + ")<br>");}
            else {document.write(item+"<br>");};
        })
        document.write("<br><hr>");
    });
}

