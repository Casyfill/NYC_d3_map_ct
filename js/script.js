if ($(window).width() >= 770) {
    width = $(window).width() * 0.666;
} else {
    width = $(window).width()
}
var height = $(window).height()




var formatPercent = d3.format(".0%");

let vizState = { "partition":{"other":0.8, "hover":1, "standart":1},
                 "points":{"other":.6, "hover":.8, "standart":.8, "points":.6},
                 "heat1":{"other":.6, "hover":1, "standart":1, "points":.4},
                 "heat2":{"other":.6, "hover":1, "standart":1, "points":.4}
               }
//  MAP
var projection = d3.geoMercator()
    .center([-74.00, 40.72])
    .scale(Math.min(height * 90, width*74))
    .translate([(width) / 2, (height) / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#svg-container")
    .append("svg")
    .attr("class", "map");

var base = d3.select("#svg-container");
var chart = base.append("canvas")
              .attr("width", width)
              .attr("height", height)
              .style("position", "absolute")
              .style("left", "0px")
              .style("top", "0px")
              .style("z-index", "1000")
              .style("visibility", "hidden");
var upoints;
var context = chart.node().getContext("2d");

// var scatter;
var dd = d3.select('#myDropdown');
var dv = d3.select('#vizMode');

var gradient = d3.scaleThreshold().domain([.1,.25, .56,.65]).range(['#b2db6b',
                                                                     '#cfdb6b',
                                                                     '#f7e99d',
                                                                     '#f6bc64',
                                                                     '#fc5f3d']);


var legend = colorbar();

var hist_height = ((document.getElementById('infocolumn').clientHeight - 60)*.52 - 5 - 24)/4 - 5 - 18 - 10;
var hist_width = d3.select('#plots_container').node().getBoundingClientRect()['width'];
// console.log('hist heights', hist_height );

var hist1 = d3.select("#income_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + 'px')

var hist2 = d3.select("#owners_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + 'px')

var hist3 = d3.select("#commute_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + 'px')

var hist4 = d3.select("#age_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", hist_height + 'px')

let histograms = [hist1, hist2, hist3, hist4];
let h_means = []
for (i = 0; i < histograms.length; i++) {
      let m = histograms[i].append("text")
                           .style("font-size", "9px")
                           .attr("transform", "translate(14,15)")
                           .text("Median: NA")
                           .raise()
      h_means.push(m);
    }

var y = d3.scaleLinear()
    .domain([0, .3])
    .range([hist_height - 20, 0]);


var x1 = d3.scaleLinear()
    .domain([0, 100000])
    .rangeRound([10, hist_width - 20]);

var x2 = d3.scaleLinear()
    .domain([0, 1.0])
    .rangeRound([10, hist_width - 20]);

var x3 = d3.scaleLinear()
    .domain([0, 50])
    .rangeRound([10, hist_width - 20]);


var x4 = d3.scaleLinear()
    .domain([0, 50])
    .rangeRound([10, hist_width - 20]);


var hist_income = d3.histogram()
    .domain(x1.domain())
    .value(function(d) {
        return d.median_income
    });

let hist_properties = ["median_income", "owner_occupied_housing_units", "mean_commute_minutes", "age"];
var hist_owners = d3.histogram()
    .domain(x2.domain())
    .value(function(d) {
        return d.owner_occupied_housing_units
    });

var hist_comm = d3.histogram()
    .domain(x3.domain())
    .value(function(d) {
        return d.mean_commute_minutes
    });

var hist_age = d3.histogram()
    .domain(x3.domain())
    .value(function(d) {
        return d.age
    });


function update_histograms(comm) {

    new_bins1 = hist_income(comm);
    new_bins2 = hist_owners(comm);
    new_bins3 = hist_comm(comm);
    new_bins4 = hist_age(comm);

    for (i = 0; i < hist_properties.length; i++) {
      let M = d3.mean(comm, function(d){return d[hist_properties[i]]});
      h_means[i].text("Median: " + ff(M))
    }

    myHist1.data(new_bins1)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x1(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });

    myHist2.data(new_bins2)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x2(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });

    myHist3.data(new_bins3)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x3(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });

    myHist4.data(new_bins4)
        .transition()
        .attr("transform", function(d) {
            return "translate(" + x4(d.x0) + "," + y(d.length / comm.length) + ")";
        })
        .attr("height", function(d) {
            return hist_height - 20 - y(d.length / comm.length);
        });
}
// geography
var cts = svg.append("g").attr('id', 'cts');

var t = textures.lines()
    .size(3)
    .strokeWidth(.5)
    .stroke("white")
    .background("grey");

svg.call(t);

// next time need to use state object
var MODE = 'part_all_';
var vMODE = 'partition';
var comm_stats, all_comm_stats, data;

var ordinalScale = d3.scaleOrdinal()
                     .domain([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24])
                     .range(['#022864', "#e8b245", "#85c43c", '#E94FB5',
                             '#01679E', '#00AEFF','#3DE8DF', '#732AFF',
                             '#EDBFA5', '#E0E572', '#23E280', '#CEF4FF',
                             "#7fefc4", "#539ca5", "#d67966", "#7bb3ce",
                             "#56ce6c", '#2f87f0', "#184478", "#f07dff",
                             "#fa745c", '#ffea2b', "#a62929", "#4e1955"]);

// color for communities, NA texture elsewise
get_color = function(d, mode) {
    if (!isNaN(d.properties[mode])) {
        return ordinalScale(d.properties[mode])
    } else {
        return t.url()
    }
}



//  Right Side
var card = d3.select("#infocard")

// CT table
var ct_table = d3.select("#infocard")
    .append('table')
    .attr('class', 'fixed')
    .attr('id', 'ct_table');

var ct_tbody = ct_table.append('tbody');

// Community tab;e
var cm_table = d3.select("#stats_container")
    .append('table')
    .attr('class', 'fixed')
    .attr('id', 'cm_table');

var cm_tbody = cm_table.append('tbody');


function handleMouseOver(d, i) {
    // Add interactivity
    d3.select(this).raise();
    // console.log(MODE);
    if (!isNaN(d.properties[MODE])) {
        decolorize_other_communities(d, i, MODE);
        populate_ct_table(d, i, MODE);
        populate_cm_table(get_community_datas(d.properties[MODE], all_comm_stats[MODE]),i, MODE);
        update_histograms(data.filter(function(dd) {
            return dd[MODE] == d.properties[MODE]
        }))
    }
}


function handleMouseOut(d, i) {
    empty_table(null_ct, ct_tbody);

    if(MODE == 'part_user'){
        empty_table(null_cm_users, cm_tbody);
    } else {
        empty_table(null_cm, cm_tbody);
    }

    colorize_back();
    update_histograms(data);
}

var files = ["data/geo/ct2010s.json", "data/communities/2017_10_15_combined_data.csv",
             "data/communities_stats/communities_stats5.json", 'data/users/2017_11_12_users.csv'];

//  LOAD DATA
d3.queue(4)
    .defer(d3.json, files[0])
    .defer(d3.csv, files[1])
    .defer(d3.json, files[2])
    .defer(d3.csv, files[3])
    .await(ready);


function ready(error, nyc, csv_data, comm_properties, users) {
    if (error) throw error;
    populate_empty_table(null_ct, ct_tbody);
    populate_empty_table(null_cm, cm_tbody);

    data = csv_data;
    upoints = users;
    data['part_user_h'] = data['part_user'];
    comm_properties['part_user_h'] = comm_properties['part_user'];
    all_comm_stats = get_all_community_stats(data, comm_properties);
    var fresh_ctss = topojson.feature(nyc, nyc.objects.ct2010).features;

    var csv = {};
    data.forEach(function(d, i) {
        csv[d.geoid] = d
    })

    fresh_ctss.forEach(function(e, j) {
        e.properties.part_all_ = Math.round(parseFloat(csv[e.properties.geoid]['part_all_']))
        e.properties.part_hidden_ = Math.round(parseFloat(csv[e.properties.geoid]['part_hidden_']))
        e.properties.part_recipr_ = Math.round(parseFloat(csv[e.properties.geoid]['part_recipr_']))
        e.properties.part_user = Math.round(parseFloat(csv[e.properties.geoid]['part_user']))
        e.properties.part_user_h = e.properties.part_user
        e.properties.population = parseInt(csv[e.properties.geoid].population)
        e.properties.income = parseInt(csv[e.properties.geoid].median_income)
        e.properties.own_occupied = parseFloat(csv[e.properties.geoid].owner_occupied_housing_units)
        e.properties.age = parseFloat(csv[e.properties.geoid].age)
        e.properties.commute = parseFloat(csv[e.properties.geoid].mean_commute_minutes)
    })

    cts.selectAll(".tract")
        .data(fresh_ctss)
        .enter()
        .append("path")
        .attr("class", "tract")
        .attr("d", path)
        .attr("id", function(d) {
            return d.properties.geoid;
        })
        .attr("nhd_name", function(d) {
            return d.properties.NTAName;
        })
        .style('opacity', 0.9)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .style('fill', function(d) {
            return get_color(d, MODE)
        })

    // filtered_data = data.filter(function(d){ return $.isNumeric(d.median_income)})
    // console.log(filtered_data);
    bins1 = hist_income(data);
    bins2 = hist_owners(data);
    bins3 = hist_comm(data);
    bins4 = hist_age(data);

    // console.log('Histogram', bins.map(function(d){ return d.length/data.length}));
    myHist1 = hist1.selectAll("rect")
        .data(bins1)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x1(d.x0)) + "," + (hist_height - 20 - y(d.length / data.length)) + ")";
        })
        .attr("width", function(d) {
            return x1(d.x1) - x1(d.x0);
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist1.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x1))

    myHist2 = hist2.selectAll("rect")
        .data(bins2)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x2(d.x0)) + "," + (hist_height - 20 - y(d.length / data.length)) + ")";
        })
        .attr("width", function(d) {
            return x2(d.x1) - x2(d.x0);
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist2.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x2)
            .tickFormat(formatPercent));

    myHist3 = hist3.selectAll("rect")
        .data(bins3)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x3(d.x0)) + "," + (hist_height - 20 - y(d.length / data.length)) + ")";
        })
        .attr("width", function(d) {
            return x3(d.x1) - x3(d.x0);
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist3.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x3))


    myHist4 = hist4.selectAll("rect")
        .data(bins4)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("transform", function(d) {
            return "translate(" + (x4(d.x0)) + "," + (hist_height - y(d.length / data.length) - 20) + ")";
        })
        .attr("width", function(d) {
            return x4(d.x1) - x4(d.x0) - 1;
        })
        .attr("height", function(d) {
            return y(d.length / data.length);
        })
        .style("fill", t.url());

    hist4.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (hist_height - 17) + ")")
        .call(d3.axisBottom(x4))

    for (i = 0; i < hist_properties.length; i++) {
        let M = d3.mean(data, function(d){return d[hist_properties[i]]});
        // var format = [fv, formatPercent, f, f][i];
        h_means[i].text("Median: " + ff(M)).raise()
    }
}

function populateScatter(upoint, visMode){
  context.globalAlpha = vizState[visMode]['points'];
  console.log("Scatter", visMode);
  context.clearRect(0, 0, width, height);
  upoints.forEach(function(d, i) {
      var p = projection([d['lon'], d['lat']]);
      if( visMode == 'points'){
        color = ordinalScale(d['Community'])
        color = tinycolor(color).darken(20).toString();
      } else {color = 'white'};
      context.beginPath();
      context.rect(p[0], p[1], 1, 1);
      context.fillStyle = color;
      context.fill();
      context.closePath();
  });
  console.log(color);
}

// RESIZE
d3.select(window).on('resize', MapSizeChange);

function MapSizeChange() {

    console.log('resizing!')
    if ($(window).width() >= 770) {
        width = $(window).width() * 0.666;
    } else {
        width = $(window).width()
    }
    var height = $(window).height()

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(Math.min(height * 90, width*74));

    // resize the map
    cts.selectAll(".tract").attr('d', path);
    populateScatter(upoints, vMODE);

    hist_height = ((document.getElementById('infocolumn').clientHeight - 60)*.52 - 5 - 24)/4 - 5 - 18 - 10;

    var ar = [hist1, hist2, hist3, hist4];

    for (i = 0; i < ar.length; i++) {
        ar[i].attr("height", hist_height + 'px');
        ar[i].select(".axis")
             .transition()
             .attr("transform", "translate(0," + (hist_height - 17) + ")");
    }
    update_histograms(data);
}


//  DECOLORIZE OTHER COMMUNITIES
function decolorize_other_communities(d, i) {
    cts.selectAll(".tract")
        .filter(function(dd) {
            return dd.properties[MODE] != d.properties[MODE];
        }) // <== This line
        .style('opacity', vizState[vMODE]["other"]);
}

function colorize_back(d, i) {
  console.log(vMODE)
    cts.selectAll(".tract")
        .style('opacity', vizState[vMODE]["standart"]);
}


function updateViz(MODE, vMODE){
    console.log("vMODE:", vMODE);

    if (vMODE == 'partition'){
        // scatter.style("visibility", "hidden");
        chart.style("visibility", "hidden");
        legend.style("visibility", "hidden");

        cts.selectAll(".tract")
            .style('fill-opacity', vizState[vMODE]['standart'])
            .style('fill', function(d) {
                return get_color(d, MODE)
            })
    }
    else if(vMODE == 'points'){
        cts.selectAll(".tract")
            .style('fill-opacity', vizState[vMODE]['standart'])
            .style('fill', function(d) {
                return get_color(d, MODE)
            })

        populateScatter(upoints, vMODE);

        chart.style("visibility", 'visible');
        legend.style("visibility", "hidden");

    } else if(vMODE == 'heat1'){
        populateScatter(upoints, vMODE);
        chart.style("visibility", "visible");
        legend.style("visibility", "visible")

        cts.selectAll(".tract")
            .style('fill-opacity', 1)
            .style('fill', function(d) {
                if (!isNaN(d.properties[MODE])) {
                var community = get_community_datas(d.properties['part_user'], all_comm_stats['part_user']);
                return gradient(community["value"]["Susceptibility"]);
                } else {return t.url();}
            })


    } else if(vMODE == 'heat2'){

        // scatter.style("fill", "white").style('fill-opacity', .2);
        // scatter.style("visibility", "visible");
        populateScatter(upoints, vMODE);
        chart.style("visibility", 'visible');
        legend.style("visibility", "visible")

        cts.selectAll(".tract")
            .style('fill-opacity', 1)
            .style('fill', function(d) {
                if (!isNaN(d.properties[MODE])) {
                var community = get_community_datas(d.properties['part_user'], all_comm_stats['part_user']);
                return gradient(community["value"]["SusceptibilityPred"]);
                } else {return t.url();}
            })
    } else if(vMODE){
        console.log('Not implemented !')
    }
}



function update_partition(MODE) {
    console.log(MODE, vMODE);
    if (MODE === "part_user") {
        if(vMODE == 'partition'){
            dv.select("button").attr('disabled', null);
            vMODE = 'points';
            dv.select("button").text('Subcommunity');
        }

        updateViz(MODE, vMODE)
        empty_table(null_cm_users, cm_tbody);

    } else {
        dv.select("button").attr('disabled', '');
        dv.select("button").text('Disabled');
        vMODE = 'partition';
        updateViz(MODE, vMODE)
        empty_table(null_cm, cm_tbody);
    }
}


$('#myDropdown > .dropdown-menu a').click(function(d) {
        g = this;
        dd.select("button").text(g.text) // switch header

        MODE = g.getAttribute("value");
        update_partition(MODE);

    });

$('#vizMode > .dropdown-menu a').click(function(d) {
        g = this;
        dv.select("button").text(g.text) // switch header
        vMODE = g.getAttribute("value");
        console.log('now vMode is', g.getAttribute("value"));
        update_partition(MODE);

    });


$('.btn').button();
$("#download_btn").click(function(d) {
    console.log('downoload!', MODE);
    download_comm(MODE);
});


function colorbar(){
      var key = svg.append('g')
                   .attr("id", "legend")
                   .attr("width", 120).attr("height", 300)
                   .attr("transform", "translate(12,100)");

      var legend = key.append("defs").append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("y1", "100%").attr("x1", "0%")
        .attr("y2", "0%").attr("x2", "0%")
        .attr("spreadMethod", "pad");

      legend.append("stop").attr("offset", "0%")
        .attr("stop-color", '#b2db6b')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "50%")
        .attr("stop-color", '#f7e99d')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "100%")
        .attr("stop-color", '#fc5f3d')
        .attr("stop-opacity", 1);

      key.append("rect")
         .attr("width", 10)
         .attr("height", 300)
         .style("fill", "url(#gradient)")

      var y = d3.scaleLinear().range([0, 300]).domain([1, 0]);
      var yAxis = d3.axisRight(y)
                    .tickValues([0, 0.5, 1,0])
                    .tickFormat(ff);

      key.append("g")
         .attr("class", "y axis")
         .call(yAxis)
         .attr("transform", "translate(15, 0)");

      key.append("g")
         .attr("class", 'legend name')
         .append("text")
         .attr("transform", "translate(0, -15)")
         .style("text-anchor", "start")
         .text('Susceptibility');

      key.style("visibility", "hidden");
      return key;
}
