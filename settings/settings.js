var language = 'en';
var loading = true;
var batterySettings = {};

const defaultSettings = {
};

//const testDevices = {
//    test: { id: 'test', name: "test some long named device lkfjdh sdlkfjhgsldkfhg lksdjfhslkdh ", zone: "zone", iconObj: { url: "../assets/icon.svg" }},
//    test1: { id: 'test', name: "device 1", zone: "zone" },
//    test2: { id: 'test', name: "device 2", zone: "zone" },
//    test3: { id: 'test', name: "device 3", zone: "zone" },
//    test4: { id: 'test', name: "device 4", zone: "zone" },
//    test5: { id: 'test', name: "device 5", zone: "zone" },
//    test6: { id: 'test', name: "device 6", zone: "zone" },
//    test7: { id: 'test', name: "device 7", zone: "zone" },
//    test8: { id: 'test', name: "device 8", zone: "zone" },
//    test9: { id: 'test', name: "device 9", zone: "zone" },
//    test10: { id: 'test', name: "device 10", zone: "zone" }
//};
//$(document).ready(function () {
//    onHomeyReady({
//        ready: () => { },
//        get: (_, callback) => callback(null, defaultSettings),
//        api: (method, url, _, callback) => {
//            switch (url) {
//                case '/devices':
//                    return setTimeout(() => callback(null, testDevices), 2000);
//                case '/zones':
//                    return callback(null, { zone: { name: 'zone' } });
//                default:
//                    return callback(null, {});
//            }
//        },
//        getLanguage: () => 'en',
//        set: () => 'settings saved',
//        alert: () => alert(...arguments)
//    })
//});

function onHomeyReady(homeyReady){
    Homey = homeyReady;
    
    batterySettings = defaultSettings;
    
    //Homey.get('settings', function (err, savedSettings) {
            
    //    if (err) {
    //        Homey.alert(err);
    //    } else if (savedSettings) {
    //        batterySettings = savedSettings;
    //    }
            
    //    for (let key in defaultSettings) {
    //        if (defaultSettings.hasOwnProperty(key)) {
    //            const el = document.getElementById(key);
    //            if (el) {
    //                switch (typeof defaultSettings[key]) {
    //                    case 'boolean':
    //                        el.checked = batterySettings[key];
    //                        break;
    //                    default:
    //                        el.value = batterySettings[key];
    //                }
    //            }
    //        }
    //    }
    //});
        
    //showTab(1);
    getLanguage();

    new Vue({
        el: '#app',
        data: {
            devices: null,
            zones: {}
        },
        methods: {
            getZones() {
                return Homey.api('GET', '/zones', null, (err, result) => {
                    if (err) {
                        setTimeout(() => this.getZones(), 1000);
                        return;
                    }
                    this.zones = result;
                });
            },
            getDevices() {
                return Homey.api('GET', '/devices', null, (err, result) => {
                    loading = false;
                    if (err) {
                        setTimeout(this.getDevices(), 1000);
                        return;
                    }
                    this.devices = result
                        ? Object.keys(result).map(key => result[key]).filter(d => d && d.capabilitiesObj && d.capabilitiesObj.measure_battery)
                        : [];

                    document.getElementById('devices-list').style.display = 'block';
                });
            },
            getZone: function (device) {
                const zoneId = typeof device.zone === 'object' ? device.zone.id : device.zone;
                const zone = this.zones && this.zones[zoneId];
                return zone && zone.name ? zone.name : 'unknown';
            },
            getIcon: function (device) {
                try {
                    return "<img src=\"" + device.iconObj.url + "\" style=\"width:auto;height:auto;max-width:50px;max-height:30px;\"/>";
                } catch (e) {
                    return "<!-- no device.iconObj.url -->";
                }
            },
            getBattClass: function (capabilitiesObj) {
                // console.log(capabilitiesObj.measure_battery);
                // console.log(capabilitiesObj.measure_battery.value);
                try {
                    waarde = capabilitiesObj.measure_battery.value

                    if ("number" != typeof waarde)
                        waarde = "-",
                            closestClass = "100"
                    else {
                        var s = waarde / 100;
                        s < 1.1 && (closestClass = "100"),
                            s < .9 && (closestClass = "80"),
                            s < .7 && (closestClass = "60"),
                            s < .5 && (closestClass = "40"),
                            s < .3 && (closestClass = "20"),
                            s < .1 && (closestClass = "0"),
                            waarde = waarde + "%";
                    }
                    return "<span class=\"component component-battery charge-" + closestClass + "\">" + waarde + "</span>";
                } catch (e) {
                    return "<!-- no capabilitiesObj.measure_battery.value -->";
                }
            }
        },
        async mounted() {
            await this.getZones();
            await this.getDevices();
        },
        computed: {
            devices() {
                return this.devices;
            },
            zones() {
                return this.zones;
            }
        }
    });

    
}

function showTab(tab){
    $('.tab').removeClass('tab-active');
    $('.tab').addClass('tab-inactive');
    $('#tabb' + tab).removeClass('tab-inactive');
    $('#tabb' + tab).addClass('active');
    $('.panel').hide();
    $('#tab' + tab).show();
}

function getLanguage() {
    try {
        Homey.getLanguage(function (err, language) {
            language = language === 'nl' ? 'nl' : 'en';
            const el = document.getElementById("instructions" + language) || document.getElementById("instructionsen");
            if (el) {
                el.style.display = "inline";
            }
            Homey.ready();
        });
    } catch (e) {
        Homey.alert('Failed to get language: ' + e);
        const el = document.getElementById("instructions" + language) || document.getElementById("instructionsen");
        if (el) {
            el.style.display = "inline";
        }
        Homey.ready();
    }
}

function saveSettings() {

    for (let key in defaultSettings) {
        let el = document.getElementById(key);
        if (el) {
            batterySettings[key] = typeof defaultSettings[key] === 'boolean' ? el.checked : el.value;
        }
    }
    _writeSettings();
}

function _writeSettings(settings) {
    try {
        Homey.set('settings', batterySettings);
        Homey.api('GET', '/settings_changed', null, (err, result) => { });
    } catch (e) {
        Homey.alert('Failed to save settings: ' + e);
    }
}
