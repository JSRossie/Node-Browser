#!/bin/zsh

# Script to send embedded JSON data to a specified endpoint using curl.

# JSON data embedded directly into the script
jsonData='[
    {
        "url": "http://192.168.30.30:3000/",
        "duration": 0
    }
]'

# Endpoint URL
url="http://192.168.92.101:5001/set_urls"

# Use curl to send the JSON data as a POST request to the endpoint
curl -X POST "$url" \
     -H "Content-Type: application/json" \
     -d "$jsonData"

# End of script