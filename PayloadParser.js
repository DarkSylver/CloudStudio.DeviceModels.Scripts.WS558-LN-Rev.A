// Test:  08310001 058164 07C90200 0374B208 068301000000 048001000000
// https://github.com/Milesight-IoT/SensorDecoders/tree/main/WS_Series/WS558

function parseUplink(device, payload) {

    var payloadb = payload.asBytes();
    var decoded = Decoder(payloadb, payload.port)
    env.log(decoded);

    // Store voltage
    if (decoded.voltage != null) {
        var sensor1 = device.endpoints.byAddress("1");

        if (sensor1 != null)
            sensor1.updateVoltageSensorStatus(decoded.voltage);
    };

    // Store Active Power
    if (decoded.active_power != null) {
        var sensor2 = device.endpoints.byAddress("2");

        if (sensor2 != null)
            sensor2.updateActivePowerSensorStatus(decoded.active_power);
    };

    // Store Pressure
    if (decoded.power_factor != null) {
        var sensor3 = device.endpoints.byAddress("3");

        if (sensor3 != null)
            sensor3.updateCosPhiSensorStatus(decoded.power_factor);
    };

    // Store Power Consumption
    if (decoded.power_consumption != null) {
        var sensor4 = device.endpoints.byAddress("4");

        if (sensor4 != null)
            sensor4.updateEnergySensorValueSummation(decoded.power_consumption, 0);
    };
    
    // Store Total Current
    if (decoded.total_current != null) {
        var sensor5 = device.endpoints.byAddress("5");

        if (sensor5 != null)
            sensor5.updateCurrentSensorStatus(decoded.total_current);
    };
}

/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2023 Milesight IoT
 *
 * @product WS558
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // VOLTAGE
        if (channel_id === 0x03 && channel_type === 0x74) {
            decoded.voltage = readUInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // ACTIVE POWER
        else if (channel_id === 0x04 && channel_type === 0x80) {
            decoded.active_power = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // POWER FACTOR
        else if (channel_id === 0x05 && channel_type === 0x81) {
            decoded.power_factor = bytes[i];
            i += 1;
        }
        // POWER CONSUMPTION
        else if (channel_id === 0x06 && channel_type === 0x83) {
            decoded.power_consumption = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // TOTAL CURRENT
        else if (channel_id === 0x07 && channel_type === 0xc9) {
            decoded.total_current = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // SWITCH STATUS
        else if (channel_id === 0xff && channel_type === 0x31) {
            var switchFlags = bytes[i + 1];

            // output all switch status
            for (var idx = 0; idx < 8; idx++) {
                var switchTag = "switch_" + (idx + 1);
                decoded[switchTag] = (switchFlags >> idx) & (1 === 1) ? "on" : "off";
            }

            i += 2;
        } else {
            break;
        }
    }

    return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}