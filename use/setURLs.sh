#!/bin/zsh

# Script to send JSON data to a specified endpoint using curl.
# Usage: ./send_json.sh <URL> <PORT> [<JSON_FILE>]

# Check if the URL and port are provided as arguments
if [[ $# -lt 2 ]] ; then
    echo "Usage: $0 <URL> <PORT> [<JSON_FILE>]"
    exit 1
fi

# Extract URL and port from arguments
url="$1"
port="$2"

# Check if JSON file is provided as argument or via standard input
if [[ $# -eq 3 ]] ; then
    # JSON file provided as argument
    jsonData=$(cat "$3")
elif [ ! -t 0 ]; then
    # JSON data piped to standard input
    jsonData=$(cat)
else
    echo "Error: JSON data not provided."
    exit 1
fi

# Use curl to send the JSON data as a POST request to the endpoint
curl -X POST "http://$url:$port/set_urls" \
     -H "Content-Type: application/json" \
     -d "$jsonData"

# End of script
