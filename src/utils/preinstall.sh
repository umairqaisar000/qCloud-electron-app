#!/bin/bash

if ! command -v docker > /dev/null 2>&1; then
  echo "Docker is not installed on your system."
  echo "Please install Docker by running:"
  echo "sudo apt-get update"
  echo "sudo apt-get install docker.io"
fi

if ! command -v ngrok > /dev/null 2>&1; then
  echo "Ngrok is not installed on your system."
  echo "Please install Ngrok by visiting https://ngrok.com/download and following the installation instructions."
fi
