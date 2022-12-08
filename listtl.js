//Check if site is on mobile
let isMobile = window.matchMedia('only screen and (max-width: 768px)').matches;

/* Contain JSon data
*/
let listOfJapaneseTL;
let listOfChineseTL;

//let githuburl = "https://ccxtwf.github.io/ListTL/";
let filejplisttl = "listjptl.json";
let filecnlisttl = "listcntl.json";

let arr_filterdropdown = ["synthlist", "singerlist", "producerlist", "circlelist"];

let list_regex = {
    "YouTube": new RegExp(/^https?:\/\/www\.youtube\.com\/watch\?v=.*/),
    "Nekocap": new RegExp(/^https?:\/\/nekocap\.com\/view\/.*/),
    "Vocaloid Lyrics Wiki": new RegExp(/^https?:\/\/vocaloidlyrics\.fandom\.com\/wiki\/.*/),
    "Wordpress": new RegExp(/^https?:\/\/coolmikehatsune22\.wordpress\.com\/.*/)
};

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
    //console.log("Fetching...");
    await fetch(filejplisttl)
        .then(response => {
            return response.json();
        })
        .then(data => {
            //console.log("Imported Japanese list");
            listOfJapaneseTL = data;
            //console.log(data);
        });
    await fetch(filecnlisttl)
        .then(response => {
            //console.log("Imported Chinese list");
            return response.json();
        })
        .then(data => {
            listOfChineseTL = data;
            //console.log(data);
        });
}

function toggleLanguage() {

    $("#togglelocalize").toggleClass("loading");

    
    setTimeout(function(){
        
        //Redraw table
        Object.keys(data_table).forEach( table_key => {
            table = data_table[table_key];
            table.updateColumnDefinition("title_1", {
                formatterParams:{
                    bool_displaylatin:!isTableDisplayedInEnglish,
                    bool_showurl:true
                },
                sorterParams:{
                    alignEmptyValues:"bottom",
                    comparefield:isTableDisplayedInEnglish ? "romtitle" : "engtitle"
                },
                title:isTableDisplayedInEnglish ? "Original Title" : "English Title"
            });
            table.updateColumnDefinition("title_2", {
                formatterParams:{
                    bool_displaylatin:isTableDisplayedInEnglish,
                    bool_showurl:false
                },
                sorterParams:{
                    alignEmptyValues:"bottom",
                    comparefield:isTableDisplayedInEnglish ? "engtitle" : "romtitle"
                },
                title:isTableDisplayedInEnglish ? "English Title" : "Original Title"
            });
            table.updateColumnDefinition("vocals", {
                formatterParams:{
                    bool_showlatin:!isTableDisplayedInEnglish,
                    bool_displayroles:false
                }
            });
            table.updateColumnDefinition("producers", {
                formatterParams:{
                    bool_showlatin:!isTableDisplayedInEnglish,
                    bool_displayroles:true
                }
            });
            table.updateColumnDefinition("circles", {
                formatterParams:{
                    bool_showlatin:!isTableDisplayedInEnglish,
                    bool_displayroles:false
                }
            });
        })
        
        //Other DOM elements
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
    if (mode_ActiveTable !== input_mode_ActiveTable) {
        table = data_table[input_mode_ActiveTable];
        table.clearFilter();
        arr_filterdropdown.forEach(item => {
            $("#" + item).dropdown("restore defaults");
        });
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
    arr_titles = datacontainer[4];

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
                    filterfield: "singers",
                    data: []
                },
                producer: {
                    value: $("#producerlist").dropdown('get value'),
                    filterfield: "producers",
                    data: []
                },
                circle: {
                    value: $("#circlelist").dropdown('get value'),
                    filterfield: "circles",
                    data: []
                }
            };
            Object.keys(data_filter).forEach( key => {
                data_filter[key].data = data_filter[key].value.split(",");
            });
            //console.log(data_filter);
            
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
                                    bool_foundstr = bool_foundstr && data[filterField].map( record => {return record.orig}).includes(item);
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

    func_search_title_filter = function(data, filterParams){
        qtitle = filterParams.qtitle;
        //console.log(qtitle);
        bool_exact_match_found = data.title.orig == qtitle || data.title.rom == qtitle || data.title.eng == qtitle;
        if (bool_exact_match_found) {return bool_exact_match_found;};
        str_regex_partial_match = qtitle.replace(/\b(the|a|an)\b\s?/gi, "").trim();
        if (str_regex_partial_match == "") {str_regex_partial_match = qtitle};
        arr_find_match = str_regex_partial_match.split(" ");
        bool_partial_match_found = true;
        arr_find_match.forEach( item => {
            item = item.trim();
            item = "\\b" + item.replace(/[\.\+\*\?\^\$\(\)\[\]\{\}\\]/, /\\\\\1/) + "\\b";
            let regex_item = new RegExp(item, "i");
            bool_partial_match_found = bool_partial_match_found && 
                ( Array.isArray(data.title.orig.match(regex_item)) || 
                Array.isArray(data.title.rom.match(regex_item)) || 
                Array.isArray(data.title.eng.match(regex_item)) )
        });
        return bool_partial_match_found;
    };

    $("#titlesearch").search({source: arr_titles, fullTextSearch: false, 
        onSelect:function(result, response) {
            //Event listener triggered when a search item is selected
            let qtitle = result.title;
            let activetable = data_table[mode_ActiveTable];
            activetable.setFilter(
                func_search_title_filter, {qtitle:qtitle}
            );
        }
    });
    $("#titlesearch").on("change", function(){
        let value = $("#titlesearch").search("get value");
        if (value.trim() == "") {
            //Event listener triggered when the search item string is removed (deselected)
            //console.log("DESELECTED:");
            let activetable = data_table[mode_ActiveTable];
            activetable.clearFilter();
        }
        else {
            //Event listener triggered when a query is input into the search bar
            let activetable = data_table[mode_ActiveTable];
            console.log(value.trim());
            activetable.setFilter(
                func_search_title_filter, {qtitle:value.trim()}
            );
        }
    });

}

function toggleSubs() {
    let is_ToggledOn = document.getElementById("sublink").checked;
    Object.keys(data_table).forEach( key => {
        table = data_table[key];
        if (is_ToggledOn) {table.showColumn("suburl");}
        else {table.hideColumn("suburl")};
        table.redraw();
    })
    document.getElementById("sublink_label").innerHTML = is_ToggledOn ? "Hide English sub links" : "Show English sub links";
};

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
        $('#titlesearch').search("set value", "");
    }, 10);
};

async function createtables() {

    function createTable(jsondata, nametable) {

        let func_mutator_title = function(value, data) {
            let [orgtitle, romtitle, engtitle, pageurl] = [data.title.orig, data.title.rom, data.title.eng, data.pageurl];
            return {orgtitle:orgtitle, romtitle:romtitle, engtitle:engtitle, pageurl:pageurl};
        };
        
        let func_formatter_title = function(cell, formatterParams, onRendered) {
        
            let func_wrap_ahref = function(pageurl, text) {
                let site = determineSite(pageurl);
                site = site == "" ? "" : "Go to " + site;
                return "<a href=\"" + pageurl + "\" target=\"_blank\" title=\"" + site + "\">" + text + "</a>";
            }
        
            let cellValue = cell.getValue();
            let [orgtitle, romtitle, engtitle, pageurl] = [cellValue.orgtitle, cellValue.romtitle, cellValue.engtitle, cellValue.pageurl];
            //console.log(orgtitle, romtitle, engtitle);
            //console.log(bool_displaylatin);
            let formatted_data = "";
            if (formatterParams.bool_displaylatin) {
                formatted_data = formatterParams.bool_showurl ? func_wrap_ahref(pageurl, engtitle) : engtitle;
            }
            else {
                formatted_data = formatterParams.bool_showurl ? func_wrap_ahref(pageurl, orgtitle) : orgtitle;
                if (orgtitle !== romtitle) {
                    formatted_data += " (" + romtitle + ")";
                }
            }
        
            cell.getElement().style.whiteSpace = "pre-wrap";
            function emptyToSpace(value) {
                return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
            }
            return emptyToSpace("<div>" + formatted_data + "</div>");
            
        };

        let func_mutator_vocals = function(value, data){
            let list_synths = data.synths;
            let list_singers = data.singers;
            show_list = list_synths.concat(list_singers);
            return show_list;
        };
        
        let func_formatter_credits = function(cell, formatterParams, onRendered) {
                
            //Get list of JSon items in cell
            listincell = cell.getValue();
            qryRecord = formatterParams.bool_showlatin ? "loc" : "orig";
            formatted_list = listincell.map( item => {
                query_item = item[qryRecord];
                if (formatterParams.bool_displayroles) {
                    str_role = item["roles"];
                    query_item = "<span title=\"" + str_role + "\">" + query_item + "</span>";
                }
                return query_item;
            });
        
            //Format HTML with word wrap
            cell.getElement().style.whiteSpace = "pre-wrap";
            function emptyToSpace(value) {
                return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
            }
            return emptyToSpace("<div>" + formatted_list.join(", ") + "</div>");
        };

        let func_formathtmlwrap = function(cell, formatterParams, onRendered) {
            cell.getElement().style.whiteSpace = "pre-wrap";
            function emptyToSpace(value) {
                return value === null || typeof value === "undefined" || value === "" ? "&nbsp;" : value;
            }
            return emptyToSpace("<div>" + cell.getValue() + "</div>");
        }
    
        let func_sortstring = function(a, b, aRow, bRow, column, dir, params) {
            let alignEmptyValues = params.alignEmptyValues;
            let emptyAlign = 0;
            let locale; //handle empty values
            let comparefield = params.comparefield;
            
            let aRowData = aRow.getData();
            let bRowData = bRow.getData();
            switch(comparefield) {
                case "romtitle":
                    a = aRowData.title.rom;
                    b = bRowData.title.rom;
                    break;
                case "engtitle":
                    a = aRowData.title.eng;
                    b = bRowData.title.eng;
                    break;
                case "vocals":
                case "producers":
                case "circles":
                    a = aRowData[comparefield].map( item => {
                        return item.loc;
                    }).join(",")
                    b = bRowData[comparefield].map( item => {
                        return item.loc;
                    }).join(",")
                    break;
            }
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
    
        bool_showlatin = true;

        let table = new Tabulator("#" + nametable + "-table", {
            data:jsondata,
            //ajaxURL:urljsondata, 
            //ajaxProgressiveLoad:"scroll", 
    
            //layout:"fitData",
            layout:"fitColumns",
            //tooltips:false, 
            //Responsive layout doesn't work
            //responsiveLayout:"hide",
    
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
                {title:"No", field:"id", sorter:"number", hozAlign:"left", vertAlign:"middle", width:50, visible:!isMobile},
                {title:"English Title", field:"title_1", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    mutator:func_mutator_title,
                    formatter:func_formatter_title,
                    formatterParams:{
                        bool_displaylatin:true,
                        bool_showurl:true
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"engtitle"
                    },
                },
                {title:"Original Title", field:"title_2", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    visible:!isMobile,
                    mutator:func_mutator_title,
                    formatter:func_formatter_title,
                    formatterParams:{
                        bool_displaylatin:false,
                        bool_showurl:false
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"romtitle"
                    },
                },
                {title:"Featuring Vocals", field:"vocals", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    mutator:func_mutator_vocals,
                    formatter:func_formatter_credits,
                    formatterParams:{
                        bool_showlatin:true,
                        bool_displayroles:false
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"vocals"
                    },
                },
                {title:"Producers", field:"producers", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true, 
                    formatter:func_formatter_credits,
                    formatterParams:{
                        bool_showlatin:true,
                        bool_displayroles:true
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"producers"
                    },
                },
                {title:"Circle", field:"circles", hozAlign:"left", vertAlign:"middle", resizable:true, variableHeight:true,
                    visible:!isMobile,
                    formatter:func_formatter_credits,
                    formatterParams:{
                        bool_showlatin:true,
                        bool_displayroles:false
                    },
                    sorter:func_sortstring,
                    sorterParams:{
                        alignEmptyValues:"bottom",
                        comparefield:"circles"
                    },
                },
                {title:"Year", field:"year", sorter:"number", hozAlign:"left", vertAlign:"middle", width:60, resizable:true},
                {title:"Subbed", field:"suburl", hozAlign:"center", vertAlign:"middle", width:120, resizable:true, visible:false,
                    mutator:function(value, data) {
                        if (value.length == 0) {return ""};
                        let str_sublink = "";
                        let [url, site] = ["", ""]; 
                        value.forEach( item => {
                            arr_split = item.split("|");
                            switch (arr_split.length) {
                                case 1:
                                    url = item;
                                    site = determineSite(url);
                                    str_sublink += "<a href=\"" + url + "\" target=\"_blank\" title='View subs'>[" + site + "]</a>\n";
                                    break;
                                case 2:
                                    url = arr_split[1];
                                    site = determineSite(url);
                                    str_sublink += "<a href=\"" + url + "\" target=\"_blank\" title='" + arr_split[0] + "'>[" + site + "]</a>\n";
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

        table.on("tableBuilt", function(){$("#" + nametable + "-loader").toggleClass("active");});
    
        isTableDisplayedInEnglish = true;
    
        return table;
    
    }

    await loadJSon();

    list_contributors = {
        cn:[],
        jp:[],
    }
    list_contributors.cn = getListOfInfo(listOfChineseTL);
    list_contributors.jp = getListOfInfo(listOfJapaneseTL);

    loadalldropdown(list_contributors, "cntl", true);

    //data_table["cntl"] = createTable(filecnlisttl, "listcntl");
    //data_table["jptl"] = createTable(filejplisttl, "listjptl");
    data_table["cntl"] = createTable(listOfChineseTL, "listcntl");
    data_table["jptl"] = createTable(listOfJapaneseTL, "listjptl");
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
function getListOfInfo(jsondata) {

    [arr_synths_keys, arr_synths] = [[], []];
    [arr_vocalists_keys, arr_vocalists] = [[], []];
    [arr_producers_keys, arr_producers] = [[], []];
    [arr_circles_keys, arr_circles] = [[], []];
    arr_titles = [];

    function write_info_data(arr_keys, arr_values, json_item) {
        readdata = json_item.orig;
        readdata_loc = json_item.loc;
        if (arr_keys.includes(readdata)) {
            index = arr_keys.indexOf(readdata);
            arr_values[index].count++;
        }
        else {
            writerecord = {};
            writerecord.key = readdata;
            writerecord.locname = readdata_loc;
            writerecord.count = 1;
            arr_keys.push(readdata);
            arr_values.push(writerecord);
        };
        return [arr_keys, arr_values];
    }

    jsondata.forEach(record => {
        //Iterate through synths
        record.synths.forEach( item => {
            [arr_synths_keys, arr_synths] = write_info_data(arr_synths_keys, arr_synths, item);
        })
        //Iterate through singers
        record.singers.forEach( item => {
            [arr_vocalists_keys, arr_vocalists] = write_info_data(arr_vocalists_keys, arr_vocalists, item);
        })
        //Iterate through singers, composers, lyricists, and tuners
        record.producers.forEach( item => {
            [arr_producers_keys, arr_producers] = write_info_data(arr_producers_keys, arr_producers, item);
        })
        //Iterate through circles
        record.circles.forEach( item => {
            [arr_circles_keys, arr_circles] = write_info_data(arr_circles_keys, arr_circles, item);
        })
        //Add title data
        let orgtitle = record.title.orig;
        let romtitle = record.title.rom;
        let engtitle = record.title.eng;
        arr_titles.push({title:orgtitle});
        if (romtitle !== orgtitle) {arr_titles.push({title:romtitle});};
        if (engtitle !== orgtitle) {arr_titles.push({title:engtitle});};

    });

    //console.log(arr_titles);

    return [
        [arr_synths_keys, arr_synths],
        [arr_vocalists_keys, arr_vocalists],
        [arr_producers_keys, arr_producers],
        [arr_circles_keys, arr_circles],
        arr_titles
    ];
}

function determineSite(url) {
    let site = "";
    Object.keys(list_regex).forEach( key => {
        if (url.match(list_regex[key])) {site = key};
    });
    return site;
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
        "singers": new Map(),
        "circles": new Map(),  
        "producers": new Map()
    }
    const arrLoopThroughFields = Object.keys(containerSongDetailsData);

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
                        if (!mapField.has(item.orig)) {mapField.set(item.orig, 1);}
                        else {
                            count = mapField.get(item.orig) + 1;
                            mapField.set(item.orig, count);
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

