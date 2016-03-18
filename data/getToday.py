#!/usr/bin/env python

import glob, re, json, os, datetime
from metar import Metar

def conversion(old):
    if (len(old)>3):
        direction = {'N':1, 'S':-1, 'E': 1, 'W':-1}
        new_dir = old[-1:]
        new = old[:-1]
        new = new.split('-')
        new.extend([0,0,0])
        return (int(new[0])+int(new[1])/60.0+int(new[2])/3600.0) * direction[new_dir]
    else:
        return 0

class station:
  """An object representing a weather station."""
  
  def __init__( self, id, city=None, state=None, country=None, latitude=None, longitude=None):
    self.id = id
    self.city = city
    self.state = state
    self.country = country
    self.lat = conversion(latitude)
    self.lng = conversion(longitude)
    if self.state:
      self.name = "%s, %s" % (self.city, self.state)
    else:
      self.name = self.city
    
station_file_name = "nsd_cccc.txt"
stations = {}

fh = open(station_file_name,'r')
for line in fh:
  f = line.strip().split(";")
  stations[f[0]] = station(f[0],f[3],f[4],f[5],f[7],f[8])
fh.close()

os.system("./getcycle -a")

database = {}
for filename in glob.glob('*.TXT'):
    with open(filename, 'r') as file:
        cycle = re.search("-(\\d\\d)Z", filename, re.S | re.M)

        for line in file:
            line = line.rstrip()
            try:
                obs = Metar.Metar(line)
                data = {}
                if obs.time and obs.temp and obs.wind_dir and obs.wind_speed and (obs.station_id in stations) and stations[obs.station_id].country == 'United States':
                    data['time'] = obs.time.isoformat()
                    data['temp'] = obs.temp.value("C")
                    data['wind_speed'] = obs.wind_speed.value("KMH")
                    data['wind_deg'] = obs.wind_dir.value()

                    if not obs.station_id in database:
                        database[obs.station_id] = {}
                        database[obs.station_id]['name'] = stations[obs.station_id].name
                        database[obs.station_id]['lat'] = stations[obs.station_id].lat
                        database[obs.station_id]['lng'] = stations[obs.station_id].lng
                        database[obs.station_id]['cycles'] = {}

                    database[obs.station_id]['cycles'][cycle.group(1)] = data
                    # print "Adding ",stations[obs.station_id].name

            except Metar.ParserError, err:
                print "Fail to parse METAR: ",line
    #         break
    #     break
    # break
# print database

print 'Total entries', len(database)

with open(str(datetime.date.today()) + '-' + str(datetime.datetime.now().hour)+'.json', 'w') as outfile:
    outfile.write(json.dumps(database, outfile, indent=4, separators=(',', ': ')))
outfile.close()

os.system("rm *.TXT")

