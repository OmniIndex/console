

function addStyle(styleString) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
  }

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');


function displayChart() {
    var data = `user_id,session
    5648556569,37
    
    
    `;
    let styleData = ".chart1{background: conic-gradient(";
    let keyData = "<div><ul id='keys' class='key'>";
    let records = data.split("\n");
    let fieldNames = [];
    let colors = [];
    if (records.length > 0 ) {
        fieldNames = records[0].split(",");
        records.shift();//remove the field names;
    }
    let fieldValues = [];
    let totalValues = 0;
    records.forEach(async function(row) {
        if ( row.includes(",") ){
            fieldValues.push([row.split(",")]);
        }
    });
    fieldValues.forEach(async function(value) {
        totalValues = totalValues + parseInt(value[0][1]);
        colors.push(genRanHex(6));
    });    
    
    
    let isFirst = true;
    for ( let iter = 0; iter < colors.length; iter++ ) {
        if ( iter == 0 ) {
            let percentage = Math.round((parseInt(fieldValues[iter][0][1]) / totalValues) * 100)
            styleData += "#" + colors[iter] + " " + percentage + "%";
            keyData += "<li><strong class='percent' style='background: #" + colors[iter] + ";'>" + percentage + "%</strong>";
            keyData += "<span class='choice'>" + fieldValues[iter][0][0] + "</span></li>"
        } else {
            let percentage = Math.round((parseInt(fieldValues[iter][0][1]) / totalValues) * 100)
            styleData += ", #" + colors[iter] + " " + percentage + "%";
            keyData += "<li><strong class='percent' style='background: #" + colors[iter] + ";'>" + percentage + "%</strong>";
            keyData += "<span class='choice'>" + fieldValues[iter][0][0]  + "</span></li>";
        } 
    }
    styleData += ", #" + genRanHex(6) + " 0%";
    styleData += ");\n";
    styleData += "border-radius: 50%;\n";
    styleData += "width: 50%;\n";
    styleData += " height: 0;\n";
    styleData += "padding-top: 50%;\n";
    styleData += "float: left;\n";
    styleData += "padding-right: 20px;\n}"; 
    addStyle(styleData);
    document.getElementById("data").innerHTML = "<div class='chart1'></div>"  
    document.getElementById("keys").innerHTML = keyData
}

displayChart();