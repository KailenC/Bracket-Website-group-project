#!/bin/bash

echo "Resetting database"

#load .env variables
export $(grep -v '^#' .env | xargs)

psql -U $DB_USER -d $DB_NAME -f ./src/config/db.init.sql

echo "Database reset complete"

# On mac make this executable then run to reset the db - ./reset-db.sh