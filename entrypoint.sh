#!/bin/bash

ollama serve &

sleep 5

ollama run deepseek-r1:1.5b
