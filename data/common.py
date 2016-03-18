import json, re
from PIL import Image

# get a common list of station across records
def getReliableStations (files):
    stationsList = []
    stations = {}
    index = 0
    for filename in files:
        with open(filename) as data_file:    
            data = json.load(data_file)
            if index is 0:
                # Grab the stations of the first record
                stationsList = data.keys()
            else:
                # substract the non present stations on the rest of the records 
                keys = data.keys()
                for key in stationsList:
                    if key not in keys:
                        print key,'is not always present, removing it'
                        stationsList.remove(key)
                        stations.pop(key, None)
                    else:
                        if index is 1:
                            stations[key] = {}
                            stations[key]['name'] = data[key]['name']
                            stations[key]['lng'] = data[key]['lng']
                            stations[key]['lat'] = data[key]['lat']

                    
        index = index + 1;
    return stations

def saveJSON (data, filename):
    # Save the GeoJson into a file
    with open(filename, 'w') as outfile:
        outfile.write(json.dumps(data, outfile, indent=4, separators=(',', ': ')))
    outfile.close()

def makeGeoJSON (list, kind):
    listOrder = []
    GeoJSON = {}
    GeoJSON['type'] = 'FeatureCollection';
    GeoJSON['features'] = [];
    id = 0
    for entry in list:
        point = {}
        point['type'] = 'Feature'
        point['geometry'] = {}
        point['geometry']['type'] = 'Point'
        point['geometry']['coordinates'] = [list[entry]['lng'], list[entry]['lat']]
        point['properties'] = {}
        point['properties']['id'] = id
        point['properties']['name'] = list[entry]['name']
        point['properties']['kind'] = kind
        GeoJSON['features'].append(point)
        listOrder.append(entry)
        id = id + 1
        
    saveJSON(GeoJSON, kind+'s.geojson')

    return listOrder

def getHourlyString (stringtime):
    return re.sub("(\\d*)-(\\d*)-(\\d*)T(\\d*):\\d*:\\d*", "\\1-\\2-\\3-\\4", stringtime)

def getTotalHours (files):
    hours = []
    for filename in files:
        with open(filename) as data_file:    
            data = json.load(data_file)
            for station in data:
                for cycle in data[station]['cycles']:
                    hour = getHourlyString(data[station]['cycles'][cycle]['time'])
                    if hour not in hours:
                        hours.append(hour)

    return sorted(hours)

def getColorFor(data, hour, station):
    if data[station].has_key(hour):
        datum = data[station][hour]
        return (127+int(datum['temp']), int(datum['wind_speed']), int((datum['wind_deg']/360)*255), 255)
    else:
        return None

def makeDataImage (data, hours, stations):
    width = len(hours)
    height = len(stations)
    img = Image.new( 'RGBA', (width,height), "black")
    pixels = img.load()

    for x in range(img.size[0]):    # for every pixel:
        for y in range(img.size[1]):
            color = getColorFor(data,hours[x],stations[y])
            if color is not None:
                pixels[x,y] = color
            elif x is not 0:
                pixels[x,y] = pixels[x-1,y]
            else:
                pixels[x,y] = (255,0,0,0)
    img.save("data.png")


