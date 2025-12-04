#!/bin/bash
PROJECT_HOME="$HOME/dac"
SERVER_HOME="$PROJECT_HOME/server"
SERVER_SCRIPT="dac-index.js"
SERVER_SCRIPT_FULL_PATH="$SERVER_HOME/$SERVER_SCRIPT"
LOG_DIR="$PROJECT_HOME/logs"
LOG_FILE="$LOG_DIR/startup.log"
DATA_FILE="$PROJECT_HOME/data/dacdb.xml"
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

populate_env_vars() {
    if [ ! -f "$ENV_FILE" ]; then
        error_exit "ERROR: Environment file $ENV_FILE not found."
    fi
    DB_NAME=$(grep -E '^DB_NAME=' "$ENV_FILE" | cut -d '=' -f2)
    DB_USER=$(grep -E '^DB_USER=' "$ENV_FILE" | cut -d '=' -f2)
    SERVER_PORT=$(grep -E '^SERVER_PORT=' "$ENV_FILE" | cut -d '=' -f2)
    if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$SERVER_PORT" ]; then
        error_exit "ERROR: Missing required environment variables in $ENV_FILE."
    fi
    log "Environment variables populated: DB_NAME=$DB_NAME, DB_USER=$DB_USER, SERVER_PORT=$SERVER_PORT"
}

check_existing_process() {
    ABSOLUTE_SCRIPT_PATH="$(realpath "$SERVER_SCRIPT_FULL_PATH")"
    PID=$(ps aux | grep "node" | grep "$ABSOLUTE_SCRIPT_PATH" | grep -v grep | awk '{print $2}')
    if [ -n "$PID" ]; then
        error_exit "ERROR: $ABSOLUTE_SCRIPT_PATH is already running with PID $PID"
    fi
    if netstat -tuln | grep -q ":$SERVER_PORT[[:space:]]"; then
        error_exit "ERROR: Port $SERVER_PORT is already in use"
    fi
    log "No existing process or port usage detected"
}

check_npm_installed() {
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
    mysql -u"$DB_USER" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" || error_exit "ERROR: Failed to create database."
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
    mysql -u"$DB_USER" -D "$DB_NAME" <<< "$SQL"
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
    mysql -u"$DB_USER" -D "$DB_NAME" <<< "$BATCH_SQL"
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
    populate_env_vars
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
