var columns = ['key', 'value'];
var f = d3.format(",");
var fv = d3.format("$,");
var ff = d3.format(".2f");
var ffff = d3.format(".4f");
var null_ct = [],
    null_cm_users = [],
    null_cm = [];

['Census Tract', 'Neighborhood', 'Population',
 'Median Income', 'community'].forEach(function(d){null_ct.push({'key':d, 'value':'NA'})});

['Community N', 'Tracts', 'Population',
 'Users', 'Out Connections', 
 'In Connections', 'Internal Connections'].forEach(function(d){null_cm.push({'key':d, 'value':'NA'})});

['Community N', 'Tracts', 'Population', 'Users',
 'Susceptibility, hidden', 'Susceptibility, predicted',
 "Network Closedness", "Spatial Diversity", "Network Density",
"Hashtag Entropy", "Language Entropy"].forEach(function(d){null_cm_users.push({'key':d, 'value':'NA'})});
// console.log('user_comm', null_cm_users);

function replacer(value){
  if (isNaN(value)){return 'NA'} else {return fv(value)}
}

function populate_ct_table(d,i, mode){
    // console.log("population table");
    var new_data = [{'key':'Census Tract', "value":d.properties.geoid},
                {'key':'Neighborhood', "value":d.properties.NTAName},
                {'key':'Population', "value":f(d.properties.population)},                        
                {'key':'Median Income', "value":replacer(d.properties.income)},
                {'key':'community', "value": d.properties[mode]}]

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

function populate_cm_table(d,i, mode){
    

    if(mode == 'part_user'){
      var new_data = [{'key':'Community N', 'value':d.key},
                      {'key':'Tracts', 'value':d.value.tracts},
                      {'key':'Population', 'value':f(d.value.population)},
                      {'key':"Users", 'value':f(d.value.communityUsers)},
                      {'key':"Susceptibility, hidden", 'value':ff(d.value.Susceptibility)},
                      {'key':"Susceptibility, predicted", 'value':ff(d.value.SusceptibilityPred)},
                      {'key':"Network Closedness", "value": ff(d.value.NetworkClosedness)}, 
                      {'key':"Spatial Diversity", "value": ff(d.value.SpatialDiversity)}, 
                      {'key':"Network Density", "value": ff(d.value.NetworkDensity)},
                      {'key':"Hashtag Entropy", "value": ff(d.value.HashtagEntropy)},
                      {'key':"Language Entropy", "value": ff(d.value.LanguageEntropy)}];                      
    } else{
      var new_data = [{'key':'Community N', 'value':d.key},
                      {'key':'Tracts', 'value':d.value.tracts},
                      {'key':'Population', 'value':f(d.value.population)},
                      {'key':"Users", 'value':f(d.value.communityUsers)},
                      {'key':"Out Connections", 'value':f(d.value.communityOutConnections)},
                      {'key':"In Connections", 'value':f(d.value.communityInConnections)},
                      {'key':"Internal Connections", 'value':ff(d.value.communityInternalConnections)}];
    }

    // create a row for each object in the data
    var rows = cm_tbody.selectAll("tr")
                       .data(new_data);
    rows.exit().remove();
    rows.enter().append('tr');

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
  var table = stbody.selectAll("tr")
                  .data(null_data);

  rows = table.enter().append("tr");

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

      // console.log(table);
      // table.exit().remove();
}


function empty_table(null_data, stbody){
    // create a row for each object in the data
    var rows = stbody.selectAll("tr")
                     .data(null_data, function(d) { return d.key });
    
    rows.exit().remove();
    var new_rows = rows.enter().append('tr');

    // create a cell in each row for each column
    
    var cells = new_rows.merge(rows).selectAll('td')
    // console.log(cells);
    cells.data(function(row) { return columns.map(function(column) { return {column: column, value: row[column]};
                      });
                    }).enter().append('td').text(function (d) { return d.value; });
}
