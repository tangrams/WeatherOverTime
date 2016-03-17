#!/usr/bin/env python

import glob, os, json
from common import getReliableStations, getTotalHours, getHourlyString, saveJSON, makeGeoJSON, makeDataImage

# All daily records
files = sorted(glob.glob('????-??-??-*.json'), key=os.path.getmtime)

# get a common list of station across daily records
stations = getReliableStations(files)

# make a GeoJSON of it
stationsList = makeGeoJSON(stations,'station')

hoursList = getTotalHours(files)

saveJSON(hoursList,"hours.json")

database = {}
for filename in files:
    with open(filename) as data_file:    
        data = json.load(data_file)
        for station in stationsList:
            if station not in database:
                database[station] = {}
            for cycle in data[station]['cycles']:
                hour = getHourlyString(data[station]['cycles'][cycle]['time'])
                if hour not in database[station]:
                    database[station][hour] = {}
                    database[station][hour]['temp'] = data[station]['cycles'][cycle]['temp']
                    database[station][hour]['wind_speed'] = data[station]['cycles'][cycle]['wind_speed']
                    database[station][hour]['wind_deg'] = data[station]['cycles'][cycle]['wind_deg']

makeDataImage(database, hoursList, stationsList)

os.system('git add data/*.json')
os.system('git commit -am "' + str(datetime.date.today()) + '-' + str(datetime.datetime.now().hour) + '"')




