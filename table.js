
function populate_empty_table(){
  console.log("empty table");

  var columns = ['key', 'value'];
  var data = [{'key':'Census Tract N', "value":"NA"},
              {'key':'Neighborhood', "value":"NA"},
              {'key':'Population', "value":"NA"},
              {'key':'Borough', "value": "NA"},
              {'key':'community', "value": "NA"}];


  // create a row for each object in the data
  var rows = tbody.selectAll("tr")
                  .data(data)
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

function populate_table(d,i){
    // console.log("population table");
    var columns = ['key', 'value'];
    var new_data = [{'key':'Census Tract N', "value":d.properties.BoroCT2010},
                {'key':'Neighborhood', "value":d.properties.NTAName},
                {'key':'Population', "value":1200},                             // to change!
                {'key':'Borough', "value": d.properties.BoroName},
                {'key':'community', "value":d.properties.community}];
    // console.log(new_data[0]);

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
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
