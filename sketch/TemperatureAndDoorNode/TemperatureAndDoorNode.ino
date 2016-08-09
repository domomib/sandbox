/**
 * The MySensors Arduino library handles the wireless radio link and protocol
 * between your home built sensors/actuators and HA controller of choice.
 * The sensors forms a self healing radio network with optional repeaters. Each
 * repeater and gateway builds a routing tables in EEPROM which keeps track of the
 * network topology allowing messages to be routed to nodes.
 *
 * Created by Henrik Ekblad <henrik.ekblad@mysensors.org>
 * Copyright (C) 2013-2015 Sensnology AB
 * Full contributor list: https://github.com/mysensors/Arduino/graphs/contributors
 *
 * Documentation: http://www.mysensors.org
 * Support Forum: http://forum.mysensors.org
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 *******************************
 *
 * DESCRIPTION
 *
 * Example sketch showing how to send in DS1820B OneWire temperature readings back to the controller
 * http://www.mysensors.org/build/temp
 */

// Enable debug prints to serial monitor
#define MY_DEBUG

// Enable and select radio type attached
#define MY_RADIO_NRF24

// Define this variabe if you use only a gareway without controler
#define MY_NODE_ID AUTO

#include <MySensors.h>
#include <SPI.h>
#include <DallasTemperature.h>
#include <OneWire.h>

// Door contact definition
#define PRIMARY_BUTTON_PIN 2   // Arduino Digital I/O pin for button/reed switch

// Dallas definition
#define COMPARE_TEMP 1 // Send temperature only if changed? 1 = Yes 0 = No
#define ONE_WIRE_BUS 3 // Pin where dallase sensor is connected, here PD3
#define MAX_ATTACHED_DS18B20 2

unsigned long SLEEP_TIME = 30000; // Sleep time between reads (in milliseconds)
float lastTemperature[MAX_ATTACHED_DS18B20];
int numSensors = 0;
boolean receivedConfig = false;

boolean isMetric = true;

OneWire oneWireBus(ONE_WIRE_BUS); // Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
DallasTemperature sensors(&oneWireBus); // Pass the oneWire reference to Dallas Temperature.

// Initialize temperature message
MyMessage msgTemp(0, V_TEMP);

// Initialize door message
MyMessage msgDoor(5, V_TRIPPED);

void setup()
{
  // Startup up the OneWire library
  sensors.begin();

  // requestTemperatures() will not block current thread
  sensors.setWaitForConversion(false);

  // Fetch the number of attached temperature sensors
  numSensors = sensors.getDeviceCount();

  // Update sensor door 
  msgDoor.setSensor(numSensors);
  
  // Setup the buttons
  pinMode(PRIMARY_BUTTON_PIN, INPUT);
    
  // Activate internal pull-ups
  digitalWrite(PRIMARY_BUTTON_PIN, HIGH);

  // metric value
  isMetric =  getConfig().isMetric;
}


void presentation ()
{
  // Send the sketch version information to the gateway and Controller
  sendSketchInfo("Temperature and door", "1.0.0");

  // Present all temperature sensors to controller
  for (int i = 0; i < numSensors && i < MAX_ATTACHED_DS18B20; i++)
  {
    present(i, S_TEMP);
  }
  present ( numSensors, S_DOOR);
}

void loop()
{

  uint8_t valueDoor;
  static uint8_t sentValueDoor = 2;

  // Fetch temperatures from Dallas sensors
  sensors.requestTemperatures();

  // Read temperatures and send them to controller
  for (int i = 0; i < numSensors && i < MAX_ATTACHED_DS18B20; i++)
  {

    // Fetch and round temperature to one decimal
    float temperature = static_cast<float>(static_cast<int>((isMetric ? sensors.getTempCByIndex(i) : sensors.getTempFByIndex(i)) * 10.)) / 10.;

    // Only send data if temperature has changed and no error
#if COMPARE_TEMP == 1
    if (lastTemperature[i] != temperature && temperature != -127.00 && temperature != 85.00)
#else
    if (temperature != -127.00 && temperature != 85.00)
#endif
    {
      // Send in the new temperature
      send(msgTemp.setSensor(i).set(temperature, 1));

      // Save new temperatures for next compare
      lastTemperature[i] = temperature;
    }
  }
  
  valueDoor = digitalRead(PRIMARY_BUTTON_PIN);

  if (valueDoor != sentValueDoor)
  {
    // Value has changed from last transmission, send the updated value
    send(msgDoor.set(valueDoor == HIGH ? 1 : 0));
    sentValueDoor = valueDoor;
  }

  // Sleep until something happens with the sensor
  sleep(PRIMARY_BUTTON_PIN - 2, CHANGE, SLEEP_TIME);
}