#!/bin/zsh

# Script to send embedded JSON data to a specified endpoint using curl.

# JSON data embedded directly into the script
jsonData='[
    {
        "url": "https://aviationweather.gov/gfa/?tab=obs&basemap=esriDark&layers=rad,fltcat&center=30.952, -96.949&zoom=8&gui=0",
        "duration": 10
    },
    {
        "url": "https://aviationweather.gov/gfa/?tab=obs&basemap=esriDark&layers=rad,fltcat&center=38.013, -95.504&zoom=6&tz=local&gui=0",
        "duration": 20
    },
    {
        "url": "https://aviationweather.gov/gfa/?tab=obs&basemap=esriDark&layers=rad,fltcat&center=21.902, -83.013&zoom=4&tz=local&gui=0",
        "duration": 15
    },
    {
        "url": "https://aviationweather.gov/gfa/?tab=obs&basemap=esriDark&layers=rad,fltcat&center=47.695,1.384&zoom=5&tz=local&gui=0",
        "duration": 10
    }
]'

# Endpoint URL
url="http://localhost:5001/set_urls"

# Use curl to send the JSON data as a POST request to the endpoint
curl -X POST "$url" \
     -H "Content-Type: application/json" \
     -d "$jsonData"

# End of script
