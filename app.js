'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('athom-api');

// Services
const Log = require("./Log.js");

class BatteryMonitor extends Homey.App {

    async getApi() {
        if (!this._api) {
            this._api = await HomeyAPI.forCurrentHomey();
        }
        return this._api;
    }
	async onInit() {
        Log.info('Battery monitor is running...');

        //this.settings = Homey.ManagerSettings.get('settings') || {};
        
    }

    async getDevices() {
        const api = await this.getApi();
        return await api.devices.getDevices();
    }

    async getZones() {
        const api = await this.getApi();
        return await api.zones.getZones();
    }

    async settingsChanged() {
        Log.info("Settings changed");
        //this.settings = Homey.ManagerSettings.get('settings') || {};
        //Log.debug(this.settings);
    }
}

module.exports = BatteryMonitor;