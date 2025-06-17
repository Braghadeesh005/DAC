#!/bin/bash

SERVER_PORT=4000
PROJECT_HOME="$HOME/dac"
SERVER_HOME="$PROJECT_HOME/server"
SERVER_SCRIPT="dac-index.js"
SERVER_SCRIPT_FULL_PATH="$SERVER_HOME/$SERVER_SCRIPT"
LOG_DIR="$PROJECT_HOME/logs"
LOG_FILE="$LOG_DIR/startup.log"
DB_NAME="dacdb"
DB_DUMP="../data/dacdb.xml"
MYSQL_USER="root"

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

consoleLog() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo -e "$1"
}

check_existing_process() {
    log "Checking if $SERVER_SCRIPT_FULL_PATH is already running"
    ABSOLUTE_SCRIPT_PATH="$(realpath "$SERVER_SCRIPT_FULL_PATH")"
    if [ ! -f "$ABSOLUTE_SCRIPT_PATH" ]; then
        consoleLog "ERROR: Script file $ABSOLUTE_SCRIPT_PATH not found."
        exit 1
    fi
    PID=$(ps aux | grep "node" | grep "$ABSOLUTE_SCRIPT_PATH" | grep -v grep | awk '{print $2}')
    if [ -n "$PID" ]; then
        consoleLog "ERROR: $ABSOLUTE_SCRIPT_PATH is already running with PID $PID"
        exit 1
    fi
    log "Checking if port $SERVER_PORT is occupied"
    if netstat -tuln | grep -q ":$SERVER_PORT[[:space:]]"; then
        consoleLog "ERROR: Port $SERVER_PORT is already in use"
        exit 1
    fi
    log "No existing process or port usage detected"
}

check_npm_installed() {
    log "Checking if npm is installed"
    if ! command -v npm > /dev/null 2>&1; then
        consoleLog "ERROR: npm is not installed. Please install Node.js and npm."
        exit 1
    fi
    log "npm is installed"
}

prepare_logs() {
    log "Ensuring log directory and file exist"
    mkdir -p "$LOG_DIR"
    touch "$LOG_FILE"
    log "Log file ready at $LOG_FILE"
}

cold_start() {
    MYSQL_PASSWORD="$1"
    log "Starting cold start"
    # Create DB if not exists
    log "Checking if DB '$DB_NAME' exists"
    EXISTS=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep "$DB_NAME")
    if [ -z "$EXISTS" ]; then
        log "Creating DB '$DB_NAME'"
        mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE $DB_NAME;" || {
            consoleLog "ERROR: Failed to create database."
            exit 1
        }
    fi
    # Extract table names
    TABLE_NAMES=$(xmllint --xpath "//table/@name" "$DB_DUMP" | sed -e 's/name="/\n/g' -e 's/"//g' | grep -v '^$')
    # Iterate all tables 
    for TABLE in $TABLE_NAMES; do
        TABLE_EXISTS=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES LIKE '$TABLE';" 2>/dev/null | grep "$TABLE")
        # Create table if missing
        if [ -z "$TABLE_EXISTS" ]; then
            SQL=$(xmllint --xpath "string(//table[@name='$TABLE']/sql)" "$DB_DUMP")
            log "Creating table $TABLE"
            mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$DB_NAME" -e "$SQL"
        else
            log "Table $TABLE already exists. Skipping creation."
        fi
        # Insert data into table (ALWAYS attempt)
        INSERT_COUNT=$(xmllint --xpath "count(//table[@name='$TABLE']/inserts/insert)" "$DB_DUMP")
        log "Inserting data into table $TABLE (Found $INSERT_COUNT rows)"
        for ((i=1; i<=INSERT_COUNT; i++)); do
            SQL=$(xmllint --xpath "string((//table[@name='$TABLE']/inserts/insert)[$i])" "$DB_DUMP")
            # Naive check to avoid duplicate insert
            if echo "$SQL" | grep -i "insert into" >/dev/null; then
                log "Running insert: $SQL"
                mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$DB_NAME" -e "$SQL"
            fi
        done
    done
    cd "$(dirname "$0")/../server" || {
        consoleLog "ERROR: Failed to change to server directory."
        exit 1
    }
    log "Running npm install"
    npm install >> "$LOG_FILE" 2>&1
    start_server
}

start_server() {
    log "Starting server"
    npm start >> "$LOG_FILE" 2>&1 &
    sleep 2
    PID=$(pgrep -f "$SERVER_SCRIPT" | sed -n '2p')
    if [ -n "$PID" ]; then
        consoleLog "Server started successfully with PID $PID"
    else
        consoleLog "ERROR: Failed to start server."
    fi
}

main() {
    consoleLog "Check with startup.log for more detailed logs"
    check_existing_process
    check_npm_installed
    prepare_logs
    if [ -n "$1" ]; then
        cold_start "$1"
    else
        cd "$(dirname "$0")/../server" || {
            consoleLog "ERROR: Failed to change to server directory."
            exit 1
        }
        if [ ! -d "node_modules" ]; then
            consoleLog "ERROR: node_modules is missing. Please do cold start first."
            exit 1
        fi
        start_server
    fi
}

main "$@"