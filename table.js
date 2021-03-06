var columns = ['key', 'value'];
var f = d3.format(",");
var fv = d3.format("$,");
var ff = d3.format(".2f");
var null_ct = [{'key':'Census Tract', "value":"NA"},
              {'key':'Neighborhood', "value":"NA"},
              {'key':'Population', "value":"NA"},
              {'key':'Median Income', "value":"NA"},
              {'key':'community', "value": "NA"}];

var null_cm = [{'key':'Community N', 'value':'NA'},
               {'key':'Tracts', 'value':'NA'},
               {'key':'Population', 'value':'NA'},
               {'key':"Users", 'value':'NA'},
               {'key':"Out Connections", 'value':'NA'},
               {'key':"In Connections", 'value':'NA'},
               {'key':"Internal Connections", 'value':'NA'}];


function replacer(value){
  if (isNaN(value)){return 'NA'} else {return fv(value)}
}

function populate_ct_table(d,i, mode){
    // console.log("population table");
    var new_data = [{'key':'Census Tract', "value":d.properties.geoid},
                {'key':'Neighborhood', "value":d.properties.NTAName},
                {'key':'Population', "value":f(d.properties.population)},                             // to change!
                {'key':'Median Income', "value":replacer(d.properties.income)},
                {'key':'community', "value": d.properties[mode]}]
    // console.log(new_data[0]);

    // create a row for each object in the data
    var rows = ct_tbody.selectAll("tr")
                       .data(new_data);

    // create a cell in each row for each column
    var cells = rows.selectAll("td");
    cells.data(function(row) {
                    return columns.map(function(column) {
                        return {column: column, value: row[column]};
                      });
                    })
                .html(function(d) { return d.value; })
                ;

    }

function populate_cm_table(d,i){
    // console.log("population table");
    var new_data = [{'key':'Community N', 'value':d.key},
                    {'key':'Tracts', 'value':d.value.tracts},
                    {'key':'Population', 'value':f(d.value.population)},
                    {'key':"Users", 'value':f(d.value.communityUsers)},
                    {'key':"Out Connections", 'value':f(d.value.communityOutConnections)},
                    {'key':"In Connections", 'value':f(d.value.communityInConnections)},
                    {'key':"Internal Connections", 'value':ff(d.value.communityInternalConnections)}];
    // console.log(new_data[0]);

    // create a row for each object in the data
    var rows = cm_tbody.selectAll("tr")
                       .data(new_data);

    // create a cell in each row for each column
    var cells = rows.selectAll("td");
    cells.data(function(row) {
                    return columns.map(function(column) {
                        return {column: column, value: row[column]};
                      });
                    })
                .html(function(d) { return d.value; })
                ;

    }


function populate_empty_table(null_data, stbody){


  // create a row for each object in the data
  var rows = stbody.selectAll("tr")
                  .data(null_data)
                  .enter()
                  .append("tr");

  // create a cell in each row for each column
  var cells = rows.selectAll("td")
                  .data(function(row) {
                      return columns.map(function(column) {
                        return {column: column, value: row[column]};
                      });
                  })
                  .enter()
                  .append("td")
                  .html(function(d) { return d.value; });

}


function empty_table(null_data, stbody){
    // create a row for each object in the data
    var rows = stbody.selectAll("tr")
                       .data(null_data);

    // create a cell in each row for each column
    var cells = rows.selectAll("td");
    cells.data(function(row) {
                    return columns.map(function(column) {
                        return {column: column, value: row[column]};
                      });
                    })
                .html(function(d) { return d.value; });
}
