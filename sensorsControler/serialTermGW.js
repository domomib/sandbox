/*
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
*/
var SerialPort = require("serialport");

const presentation = ['S_DOOR', 'S_MOTION', 'S_SMOKE', 'S_LIGHT-S_BINARY', 'S_DIMMER', 'S_COVER', 'S_TEMP', 'S_HUM', 'S_BARO', 'S_WIND', 'S_RAIN',
 	'S_UV', 'S_WEIGHT', 'S_POWER', 'S_HEATER', 'S_DISTANCE', 'S_LIGHT_LEVEL', 'S_ARDUINO_NODE', 'S_ARDUINO_REPEATER_NODE', 'S_LOCK', 'S_IR', 
 	'S_WATER', 'S_AIR_QUALITY', 'S_CUSTOM', 'S_DUST', 'S_SCENE_CONTROLLER', 'S_RGB_LIGHT', 'S_RGBW_LIGHT', 'S_COLOR_SENSOR', 'S_HVAC', 'S_MULTIMETER',
 	'S_SPRINKLER', 'S_WATER_LEAK', 'S_SOUND', 'S_VIBRATION', 'S_MOISTURE', 'S_INFO', 'S_GAS', 'S_GPS', 'S_WATER_QUALITY'];

const setRequest = ['V_TEMP', 'V_HUM', 'V_STATUS', 'V_LIGHT', 'V_PERCENTAGE', 'V_DIMMER', 'V_PRESSURE', 'V_FORECAST', 'V_RAIN', 'V_RAINRATE', 'V_WIND', 
	'V_GUST', 'V_DIRECTION', 'V_UV', 'V_WEIGHT', 'V_DISTANCE', 'V_IMPEDANCE', 'V_ARMED', 'V_TRIPPED', 'V_WATT', 'V_KWH', 'V_SCENE_ON', 'V_SCENE_OFF', 
	'V_HVAC_FLOW_STATE', 'V_HVAC_SPEED', 'V_LIGHT_LEVEL', 'V_VAR1', 'V_VAR2', 'V_VAR3', 'V_VAR4', 'V_VAR5', 'V_UP', 'V_DOWN', 'V_STOP', 'V_IR_SEND', 
	'V_IR_RECEIVE', 'V_FLOW', 'V_VOLUME', 'V_LOCK_STATUS', 'V_LEVEL', 'V_VOLTAGE', 'V_CURRENT', 'V_RGB', 'V_RGBW', 'V_ID', 'V_UNIT_PREFIX', 
	'V_HVAC_SETPOINT_COOL', 'V_HVAC_SETPOINT_HEAT', 'V_HVAC_FLOW_MODE', 'V_TEXT', 'V_CUSTOM', 'V_POSITION', 'V_IR_RECORD', 'V_PH', 'V_ORP', 'V_EC', 
	'V_VAR', 'V_VA', 'V_POWER_FACTOR' ];

const internal = ['I_BATTERY_LEVEL', 'I_TIME', 'I_VERSION', 'I_ID_REQUEST', 'I_ID_RESPONSE', 'I_INCLUSION_MODE', 'I_CONFIG', 'I_FIND_PARENT', 
	'I_FIND_PARENT_RESPONSE', 'I_LOG_MESSAGE', 'I_CHILDREN', 'I_SKETCH_NAME', 'I_SKETCH_VERSION', 'I_REBOOT', 'I_GATEWAY_READY', 
	'I_REQUEST_SIGNING', 'I_GET_NONCE', 'I_GET_NONCE_RESPONSE', 'I_HEARTBEAT', 'I_PRESENTATION', 'I_DISCOVER', 'I_DISCOVER_RESPONSE', 
	'I_HEARTBEAT_RESPONSE', 'I_LOCKED', 'I_PING', 'I_PONG', 'I_REGISTRATION_REQUEST', 'I_REGISTRATION_RESPONSE', 'I_DEBUG'];

var sp = new SerialPort("/dev/tty.usbmodemFD111", {
	parser: SerialPort.parsers.readline("\n"),
	baudrate: 115200
});

var nodeId = 1;
sp.on("open", function() {
	sp.on('data', function(data, callback) {
		// data = node-id;child-sensor-id;message-type;ack;sub-type;payload
		var donnees = data.split(';');	

		let chaine = 'id : '+ donnees[0] + ' -  ' + donnees[1];
		// message type
		switch ( donnees[2] ){
			case '0': //presentation
				chaine += ' => Presentation - > ' + presentation[donnees[4]] ;
				break;

			case '1': // set
				chaine += ' => Set - ' + setRequest[donnees[4]];
				break;

			case '2':  // req
				chaine += ' => Req. - ' + setRequest[donnees[4]];
				break;

			case '3': // internal
				chaine += ' => ' + internal[donnees[4]];
				// Ajouter proprement une gestion des  nodes avec persistances
				if ( donnees[4] == 3 ){
					//nodeId++; 
					var resp = donnees.slice(0,4).concat(4, nodeId, '\n');

					sp.write( resp.join(';') , function () {
    					sp.drain(callback)
    				});
  					
					console.log('envoi nouvel id pour le noeud' + nodeId + " " + resp.join(';'));
				}
				break;

			case '4': // stream
				chaine += ' => Stream ' ;
				break;

		}
		chaine += ' --> ' + donnees[5];
		console.log(chaine + ' === ' + data	+ ' ===')

	});
});