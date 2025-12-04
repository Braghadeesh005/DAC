#!/bin/bash

PROJECT_HOME="$HOME/dac"
SERVER_HOME="$PROJECT_HOME/server"
SERVER_SCRIPT="dac-index.js"
SERVER_SCRIPT_FULL_PATH="$SERVER_HOME/$SERVER_SCRIPT"
LOG_DIR="$PROJECT_HOME/logs"
LOG_FILE="$LOG_DIR/startup.log"
DB_NAME="dacdb"
DATA_FILE="$PROJECT_HOME/data/dacdb.xml"
MYSQL_USER="root"
ENV_FILE="$SERVER_HOME/config-properties.env"

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

consoleLog() {
    log "$1"
    echo -e "$1"
}

error_exit() {
    consoleLog "$1"
    exit 1
}

check_existing_process() {
    log "Checking if $SERVER_SCRIPT_FULL_PATH is already running"
    ABSOLUTE_SCRIPT_PATH="$(realpath "$SERVER_SCRIPT_FULL_PATH")"
    PID=$(ps aux | grep "node" | grep "$ABSOLUTE_SCRIPT_PATH" | grep -v grep | awk '{print $2}')
    if [ -n "$PID" ]; then
        error_exit "ERROR: $ABSOLUTE_SCRIPT_PATH is already running with PID $PID"
    fi
    local SERVER_PORT=$(grep -E '^SERVER_PORT=' "$ENV_FILE" | cut -d '=' -f2)
    log "Checking if port $SERVER_PORT is available in env file"
    if [[ -z "$SERVER_PORT" ]]; then
        error_exit "Failed to fetch SERVER_PORT from env file."
    fi
    log "Checking if port $SERVER_PORT is occupied"
    if netstat -tuln | grep -q ":$SERVER_PORT[[:space:]]"; then
        error_exit "ERROR: Port $SERVER_PORT is already in use"
    fi
    log "No existing process or port usage detected"
}

check_npm_installed() {
    log "Checking if npm is installed"
    if ! command -v npm > /dev/null 2>&1; then
        error_exit "ERROR: npm is not installed. Please install Node.js and npm."
    fi
    log "npm is installed"
}

cold_start() {
    local MYSQL_PASSWORD="$1"
    log "Performing Cold Start"
    export MYSQL_PWD="$MYSQL_PASSWORD"
    create_db
    populate_tables
    install_packages
}

create_db() {
    log "Checking and creating DB '$DB_NAME' if missing"
    log "Creating DB '$DB_NAME'"
    mysql -u"$MYSQL_USER" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" || error_exit "ERROR: Failed to create database."
}

populate_tables() {
    TABLE_NAMES=$(xmllint --nocdata --xpath "//table/@name" "$DATA_FILE" | sed -e 's/name="/\n/g' -e 's/"//g' | grep -v '^$')
    for TABLE in $TABLE_NAMES; do
        create_table "$TABLE"
        insert_table "$TABLE"
    done
}

create_table() {
    local TABLE="$1"
    local SQL
    SQL=$(xmllint --nocdata --xpath "string(//table[@name='$TABLE']/sql)" "$DATA_FILE" 2>/dev/null)
    SQL=$(echo "$SQL" | tr -d '\n\r')
    SQL=$(echo "$SQL" | xargs)
    SQL=$(echo "$SQL" | sed -E 's/CREATE[ ]+TABLE[ ]+([^(]+)/CREATE TABLE IF NOT EXISTS \1/i')
    log "Create Table Query for $TABLE Table : $SQL"
    mysql -u"$MYSQL_USER" -D "$DB_NAME" <<< "$SQL"
 }

insert_table() {
    local TABLE="$1"
    local RAW_INSERTS
    RAW_INSERTS=$(xmllint --nocdata --xpath "//table[@name='$TABLE']/inserts/insert" "$DATA_FILE" 2>/dev/null)
    if [[ -z "$RAW_INSERTS" ]]; then
        log "No insert entries for $TABLE"
        return
    fi
    log "Inserting data into $TABLE"
    mapfile -t SQLS < <(xmllint --xpath "//table[@name='$TABLE']/inserts/insert" "$DATA_FILE" 2>/dev/null | sed -n 's|.*<insert>\(.*\)</insert>.*|\1|p')
    local BATCH_SQL=""
    for sql in "${SQLS[@]}"; do
        sql=$(echo "$sql" | xargs)
        [[ -z "$sql" ]] && continue
        sql=$(echo "$sql" | sed "s/\`/'/g")
        sql=$(echo "$sql" | sed -E 's/^INSERT INTO/INSERT IGNORE INTO/i')
        log "Insert Query for $TABLE Table : $sql"
        BATCH_SQL+="$sql;"
        BATCH_SQL+=$'\n'
    done
    mysql -u"$MYSQL_USER" -D "$DB_NAME" <<< "$BATCH_SQL"
}

install_packages() {
    log "Running npm install in $SERVER_HOME"
    npm install >> "$LOG_FILE" 2>&1
}

start_server() {
    log "Starting server"
    npm start >> "$LOG_FILE" 2>&1 &
    sleep 2
    PID=$(pgrep -f "$SERVER_SCRIPT" | head -n 1)
    if [ -n "$PID" ]; then
        consoleLog "Server started successfully with PID $PID"
    else
        error_exit "ERROR: Failed to start server."
    fi
}

main() {
    consoleLog "Check startup.log for detailed logs"
    check_existing_process
    check_npm_installed
    cd "$SERVER_HOME" || {
        error_exit "ERROR: Failed to change to server directory: $SERVER_HOME"
    }
    if [ -n "$1" ]; then
        cold_start "$1"
    elif [ ! -d "node_modules" ]; then
        error_exit "ERROR: node_modules is missing. Run cold start."
    fi
    start_server
}

main "$@"
