// Includes
var http = require( 'http' )
var async = require( 'async' ) 
var request = require( 'request' )

// Configuration 
var dbAddress = 'localhost' 
var dbPort = '8086' 
var dbName = 'db_test' 
var dbUser = 'root' 
var dbPwd = 'testinflux' 
var itemsToQuery = [ [ 'Conservatory',  'PLA' ],
                     [ 'SensorTest_1',  'Citrus'  ],
                     [ 'LivingRoom',    'Salon'  ],
                     [ 'Office',        'Bureau' ]
                    ] 
var refreshTime = 6*1000    // in ms

// Function to fetch data
function getDataList(url, callback) {
  var data = ""
  
  var req = http.request(url, function(res) { 
//    console.log("Response received " + res.statusCode)
    res.on('data', function(chunk) {
        data += chunk
    })
    res.on('end', function(e) {
//        console.log(data)
        callback(e, data)
    })
  }).end()
}


// TBC - getDataList() can be used
function getData( parameterToRefresh, widgetId, unit, dataName ) {
  var urlToGet = 'http://'+dbAddress+':'+dbPort+'/db/'+dbName+'/series?u=' + dbUser+'&p='+dbPwd+'&q=SELECT%20*%20FROM%20%22/data/'+parameterToRefresh+'%22%20LIMIT%201'
//  console.log( "getData() : " + urlToGet )
  request( urlToGet, function (error, response, body) {
//    console.log( response )
    if (!error && response.statusCode == 200) {
//      	  console.log(Math.round(JSON.parse(body)[0]['points'][0][2]) + unit)

   	  if ( dataName == 'moreinfo') {
      	    send_event( widgetId, { moreinfo: (Math.round(JSON.parse(body)[0]['points'][0][2]) + unit) })
   	  } else {
   	    send_event( widgetId, { value: Math.round(JSON.parse(body)[0]['points'][0][2]*100)/100 })
   	  }
    }
  })
}


function refreshBatteryLevelList( parameterToRefresh, widgetId, unit ) {
  // Variables declaration
  var urls = []
  var itemarray = []
  var average = 0

  // http://stackoverflow.com/questions/6048504/synchronous-request-in-nodejs
  // /!\ - dirty - TBC - "-1" to avoid office error
  for( var i = 0; i < (itemsToQuery.length-1); i++ ) {
    urls.push( encodeURIComponent(itemsToQuery[i][0] ))
  }

  // Map the entire url - TBC - Can be integrated in previous step
  var urls = urls.map(function (url) {
    return 'http://' + dbAddress + ':' + dbPort + '/db/'+dbName+'/series?u=' + dbUser+'&p='+dbPwd+'&q=SELECT%20*%20FROM%20%22/'+parameterToRefresh+'/'+url+'%22%20LIMIT%201'
  })

  // Asynchronous call to get the data
  async.map( urls, getDataList, function( err, result ) {
    console.log( "battery - The result is :" + result )
    // Parse results
    for( var i = 0; i < result.length; i++ ) {
      itemarray[i] = {label: itemsToQuery[i][1], value: (JSON.parse(result[i])[0]['points'][0][2] + unit)}
      average = average + JSON.parse(result[i])[0]['points'][0][2]
    }
    average = Math.round( average/result.length*100 )/100

    var datastruct = {
      items: itemarray,
      hotnessvalue: Math.round(average/20),
      moreinfo: 'Moyenne : ' + average + unit
    }
    send_event( widgetId, datastruct )
  })

}


function humidityColor( value ) {
  switch ( true ) {
    case (value < 30): temp = '70B8FF'; break
    case (value <70):  temp = '00C176'; break
    default:           temp = '660000'
  }
  return temp
}

function insideTemperatureColor( value ) {
  switch ( true ) {
    case (value < 18): temp = '70B8FF'; break
    case (value <24):  temp = '00C176'; break
    default:           temp = '660000'
  }
  return temp
}

function rssiColor( value ) {
  switch ( true ) {
    case (value < -100): temp = '660000'; break
    default:             temp = '00C176'
  }
  return temp
}

function batteryLevelColor( value ) {
  switch ( true ) {
    case (value > 4):   temp = '00C176'; break
    case (value > 3.5): temp = 'FF8533'; break
    default:            temp = '660000'
  }
  return temp
}

// Inspired from
// http://stackoverflow.com/questions/6048504/synchronous-request-in-nodejs
function refreshDataList( parameterToRefresh, widgetId, unit ) {
  // Variables declaration
  var urls = []
  var itemarray = []
  var average = 0

  // Set url regarding unit
  switch( unit ) {
    case ' %': urlPrefix = 'data/'; urlSuffix = '/'+parameterToRefresh; break
    case '°C': urlPrefix = 'data/'; urlSuffix = '/'+parameterToRefresh; break
    default:   urlPrefix = parameterToRefresh+'/'; urlSuffix = ''; break
  }
  
    // /!\ - Dirty fix for the office with no RSSI nor battery level
  switch( parameterToRefresh ) {
    case 'rssi':
    case 'batteryLevel':
      var itemsMax = itemsToQuery.length-1; break
    default:
      var itemsMax = itemsToQuery.length;
  }  
  for( var i = 0; i < itemsMax; i++ ) {
    urls.push( 'http://'+dbAddress+':'+dbPort+'/db/'+dbName+'/series?u='+dbUser+'&p='+dbPwd+'&q=SELECT%20*%20FROM%20%22/'+urlPrefix+ encodeURIComponent(itemsToQuery[i][0])+urlSuffix+'%22%20LIMIT%201')
  }

  // Asynchronous call to get the data
  async.map( urls, getDataList, function( err, result ) {    
// console.log( result );

    // Parse results
    for( var i = 0; i < result.length; i++ ) {
      itemarray[i] = {label: itemsToQuery[i][1], value: (JSON.parse(result[i])[0]['points'][0][2] + unit)}
      average = average + JSON.parse(result[i])[0]['points'][0][2]
    }
    average = Math.round( average/result.length*100 )/100
    
    // Select color and 'moreinfo' message regarding data type and average value
    switch( unit ) {
      case ' %':
        backGroundColor = humidityColor( average )
        moreinfo = 'Moyenne : ' + average + unit; break
      case '°C':
        backGroundColor = insideTemperatureColor( average );
        moreinfo = 'Moyenne : ' + average + unit; break
      case ' V': 
        mini = Math.min.apply(Math, result.map(function(table) { return JSON.parse(table)[0]['points'][0][2] }))
        backGroundColor = batteryLevelColor( mini )
        moreinfo = 'Minimum : ' + mini + unit; break
      case ' dB': 
        mini = Math.min.apply(Math, result.map(function(table) { return JSON.parse(table)[0]['points'][0][2] }))
        backGroundColor = rssiColor( mini )
        moreinfo = 'Minimum : ' + mini + unit; break
      default:
        backGroundColor = '55555'
    }
  
    // Prepare structure to send    
    var datastruct = {
      items: itemarray,
      backGroundColor: backGroundColor,
      moreinfo:  moreinfo
    }
    send_event( widgetId, datastruct )
  })
}




// Set data on startup
refreshDataList( 'Humidity', 'humidityList', ' %' )
refreshDataList( 'Temperature', 'temperatureList', '°C' )
getData( 'Outside/Humidity', 'humidityOutside', ' %', 'value' )
getData( 'Outside/Temperature', 'temperatureOutside', '°C', 'value' )
refreshDataList( 'batteryLevel', 'batteryList', ' V' )
refreshDataList( 'rssi', 'rssiList', ' dB' )
getData( 'Outside/Pressure', 'outsideText', ' mbara', 'moreinfo' )



// Refresh data every refreshTime
setInterval( function() { refreshDataList( 'Humidity', 'humidityList', ' %' ) }, refreshTime )
setInterval( function() { refreshDataList( 'Temperature', 'temperatureList', '°C' ) }, refreshTime )
setInterval( function() { getData( 'Outside/Humidity', 'humidityOutside', ' %', 'value' ) }, refreshTime )
setInterval( function() { getData( 'Outside/Temperature', 'temperatureOutside', '°C', 'value' ) }, refreshTime )
setInterval( function() { refreshDataList( 'batteryLevel', 'batteryList', ' V' ) }, refreshTime )
setInterval( function() { refreshDataList( 'rssi', 'rssiList', ' dB' ) }, refreshTime )
setInterval( function() { getData( 'Outside/Pressure', 'outsideText', ' mbara', 'moreinfo' ) }, refreshTime )


