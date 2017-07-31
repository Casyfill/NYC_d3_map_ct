if($(window).width() >=770){
  width = $(window).width()*0.666;
} else { width = $(window).width()}
var height = $(window).height()

var formatPercent = d3.format(".0%");

//  MAP
var projection = d3.geoMercator()
  .center([-73.98, 40.72])
  .scale(width*74)
  .translate([(width) / 2, (height) / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#svg-container")
  .append("svg")
  .attr("class", "map");

// svg.append('text')
//    .attr("id", "histtitle")
//    .text("Household Income, Normalized")
//    .attr("transform", 'translate(4,4)');

var hist_height = .05  * $(window).height();
var hist_width = .3 * $(window).width();
var hist1 = d3.select("#income_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", "10vh")

var hist2 = d3.select("#owners_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", "10vh")

var hist3 = d3.select("#commute_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", "10vh")

var hist4 = d3.select("#age_container")
    .append("svg")
    .attr("class", "hist")
    .attr("width", "100%")
    .attr("height", "10vh")

var y = d3.scaleLinear()
          .domain([0,.3])
          .range([hist_height, 0]);


var x1 = d3.scaleLinear()
          .domain([0,100000])
          .rangeRound([3, hist_width-5]);

var x2 = d3.scaleLinear()
          .domain([0,1.0])
          .rangeRound([3, hist_width-5]);

var x3 = d3.scaleLinear()
          .domain([0,50])
          .rangeRound([3, hist_width-5]);


var x4 = d3.scaleLinear()
          .domain([0,50])
          .rangeRound([3, hist_width-5]);


var hist_income = d3.histogram()
    .domain(x1.domain())
    .value(function(d) { return d.median_income });


var hist_owners = d3.histogram()
    .domain(x2.domain())
    .value(function(d) { return d.owner_occupied_housing_units });

var hist_comm = d3.histogram()
    .domain(x3.domain())
    .value(function(d) { return d.mean_commute_minutes });

var hist_age = d3.histogram()
    .domain(x3.domain())
    .value(function(d) { return d.age });


function update_histograms(comm){

    new_bins1 = hist_income(comm);
    new_bins2 = hist_owners(comm);
    new_bins3 = hist_comm(comm);
    new_bins4 = hist_age(comm);

    myHist1.data(new_bins1)
          .transition()
          .attr("transform", function(d) {
                   return "translate(" + x1(d.x0) + "," + y(d.length/comm.length) + ")"; })
          .attr("height", function(d) { return hist_height - y(d.length/comm.length); });

    myHist2.data(new_bins2)
          .transition()
          .attr("transform", function(d) {
                   return "translate(" + x2(d.x0) + "," + y(d.length/comm.length) + ")"; })
          .attr("height", function(d) { return hist_height - y(d.length/comm.length); });

    myHist3.data(new_bins3)
          .transition()
          .attr("transform", function(d) {
                   return "translate(" + x3(d.x0) + "," + y(d.length/comm.length) + ")"; })
          .attr("height", function(d) { return hist_height - y(d.length/comm.length); });

    myHist4.data(new_bins4)
          .transition()
          .attr("transform", function(d) {
                   return "translate(" + x4(d.x0) + "," + y(d.length/comm.length) + ")"; })
          .attr("height", function(d) { return hist_height - y(d.length/comm.length); });
}
// geography

var bs = svg.append("g").attr('id','boros');
var cts = svg.append("g").attr('id','cts');

var t = textures.lines()
          .size(3)
          .strokeWidth(.5)
          .stroke("white")
          .background("grey");

svg.call(t);

var MODE = 'part_all_';
var comm_stats;
var all_comm_stats;
var data;

//  Community colors
var comm_colors = [ "red", "blue", "green", "yellow", "purple",
                    "orange", "teal", "pink", "steelblue", 'magenta',
                    "black", "grey", "darkgreen", "darkred", "darkblue",
                    "lime", "beige", "azure", "aliceblue", 'burlywood',
                    "darkseagreen", 'darkslategray', 'forestgreen', 'khaki','lightsalmon',
                    'mediumturquoise', 'olivedrab', 'plum', 'salmon', 'sandybrown'];




// color for communities, NA texture elsewise
get_color = function(d, mode) {

  if (! isNaN(d.properties[mode])){
    return comm_colors[d.properties[mode]];
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


function handleMouseOver(d, i) {  // Add interactivity
  // console.log(MODE, 'Tract:', d.properties)
  if (! isNaN(d.properties[MODE])) {
    decolorize_other_communities(d,i, MODE);
    populate_ct_table(d,i, MODE);
    populate_cm_table(get_community_datas(d.properties[MODE], all_comm_stats[MODE]));
    update_histograms(data.filter(function(dd){return dd[MODE] == d.properties[MODE]}))

    // div.transition()
    //    .duration(200)
    //    .style("opacity", .9);
    //    .html(formatTime(d.date) + "<br/>"  + d.close)
    //    .style("left", (d3.event.pageX) + "px")
    //    .style("top", (d3.event.pageY - 28) + "px");
       }	
  }


function handleMouseOut(d, i) {
  empty_table(null_ct, ct_tbody);
  empty_table(null_cm, cm_tbody);
  colorize_back();
  update_histograms(data);
  }


//  LOAD DATA
d3.queue(3)
  .defer(d3.json, "data/ct2010s.json")
  .defer(d3.csv, "data/combined_data3.csv")
  .defer(d3.json, "data/communities_stats2.json")
  .await(ready);


function ready(error, nyc, csv_data, comm_properties){
  if (error) throw error;
  populate_empty_table(null_ct, ct_tbody);
  populate_empty_table(null_cm, cm_tbody);

  data = csv_data;
  all_comm_stats = get_all_community_stats(data, comm_properties);
  // console.log(all_comm_stats);
  var fresh_ctss = topojson.feature(nyc, nyc.objects.ct2010).features;

  var csv = {};
  data.forEach(function(d, i){
          csv[d.geoid] = d
  })


  fresh_ctss.forEach(function(e, j) {
        e.properties.part_all_ = Math.round(parseFloat(csv[e.properties.geoid]['part_all_']))
        e.properties.part_hidden_ = Math.round(parseFloat(csv[e.properties.geoid]['part_hidden_']))
        e.properties.part_recipr_ = Math.round(parseFloat(csv[e.properties.geoid]['part_recipr_']))
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
                return d.properties.geoid;})
              .attr("nhd_name", function(d) {
                return d.properties.NTAName;})
              .style('opacity', 0.8)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut)
              .style('fill', function(d) { return get_color(d, MODE)})

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
                   return "translate(" + x1(d.x0) + "," + y(d.length/data.length) + ")"; })
                   .attr("width", function(d) { return x1(d.x1) - x1(d.x0) -1 ; })
                   .attr("height", function(d) { return hist_height - y(d.length/data.length); })
                   .style("fill", t.url());

  hist1.append("g")
      .attr("transform", "translate(0," + hist_height + ")")
      .call(d3.axisBottom(x1))

  myHist2 = hist2.selectAll("rect")
                   .data(bins2)
                   .enter().append("rect")
                   .attr("class", "bar")
                   .attr("x", 1)
                   .attr("transform", function(d) {
                   return "translate(" + x2(d.x0) + "," + y(d.length/data.length) + ")"; })
                   .attr("width", function(d) { return x2(d.x1) - x2(d.x0) -1 ; })
                   .attr("height", function(d) { return hist_height - y(d.length/data.length); })
                   .style("fill", t.url());

  hist2.append("g")
      .attr("transform", "translate(0," + hist_height + ")")
      .call(d3.axisBottom(x2)
              .tickFormat(formatPercent));

  myHist3 = hist3.selectAll("rect")
                   .data(bins3)
                   .enter().append("rect")
                   .attr("class", "bar")
                   .attr("x", 1)
                   .attr("transform", function(d) {
                   return "translate(" + x3(d.x0) + "," + y(d.length/data.length) + ")"; })
                   .attr("width", function(d) { return x3(d.x1) - x3(d.x0) -1 ; })
                   .attr("height", function(d) { return hist_height - y(d.length/data.length); })
                   .style("fill", t.url());

  hist3.append("g")
        .attr("transform", "translate(0," + hist_height + ")")
        .call(d3.axisBottom(x3))
  

  myHist4 = hist4.selectAll("rect")
                   .data(bins4)
                   .enter().append("rect")
                   .attr("class", "bar")
                   .attr("x", 1)
                   .attr("transform", function(d) {
                   return "translate(" + x4(d.x0) + "," + y(d.length/data.length) + ")"; })
                   .attr("width", function(d) { return x4(d.x1) - x4(d.x0) -1 ; })
                   .attr("height", function(d) { return hist_height - y(d.length/data.length); })
                   .style("fill", t.url());

  hist4.append("g")
        .attr("transform", "translate(0," + hist_height + ")")
        .call(d3.axisBottom(x4))

}




// RESIZE
d3.select(window).on('resize', MapSizeChange);

function MapSizeChange() {
      // var ratio  = Math.min($(window).height()/initial_height, $(window).width() / initial_width);
    //   // d3.select("svg").attr("transform", "scale(" + ratio + ")");
    console.log('resizing!')
    if($(window).width() >=770){
        width = $(window).width()*0.666;
    } else { width = $(window).width()}
    var height = $(window).height()

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width*78);

    // resize the map
    cts.selectAll(".tract").attr('d', path);

}


//  DECOLORIZE OTHER COMMUNITIES
function decolorize_other_communities(d,i){

  cts.selectAll(".tract")
       .filter(function(dd) { return dd.properties[MODE] != d.properties[MODE]; })        // <== This line
       .style('opacity', .2 );
}

function colorize_back(d, i){
  cts.selectAll(".tract")
     .style('opacity', 0.8);
}


// RADIO BUTTON SWITCH
$('input[type="radio"]').on('change', function(e) {
    MODE = document.querySelector('input[name="partition"]:checked').value;
    console.log('Mode is:', MODE);
    update_partition(MODE);
});


function update_partition(MODE){
  cts.selectAll(".tract")
     .style('fill', function(d) { return get_color(d, MODE)})

}
