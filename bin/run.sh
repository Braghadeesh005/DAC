#!/bin/bash
PROJECT_HOME="$HOME/dac"
SERVER_HOME="$PROJECT_HOME/server"
CLIENT_HOME="$SERVER_HOME/client/dac"
SERVER_SCRIPT="dac-index.js"
SERVER_SCRIPT_FULL_PATH="$SERVER_HOME/$SERVER_SCRIPT"
LOG_DIR="$PROJECT_HOME/logs"
LOG_FILE="$LOG_DIR/startup.log"
DATA_FILE="$PROJECT_HOME/data/dacdb.xml"
ENV_FILE="$SERVER_HOME/config-properties.env"
PROTOCOL="http"

createLogDirectory() {
    mkdir -p "$LOG_DIR"
    log "Log dir is created"
}

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

consoleLog() {
    log "$1"
    echo -e "$1"
}

error_exit() {
    consoleLog "ERROR: $1"
    exit 1
}

populate_env_vars() {
    [[ ! -f "$ENV_FILE" ]] && error_exit "Env file not found: $ENV_FILE"
    DB_NAME=$(grep -E '^DB_NAME=' "$ENV_FILE" | cut -d '=' -f2)
    DB_USER=$(grep -E '^DB_USER=' "$ENV_FILE" | cut -d '=' -f2)
    DB_PASS=$(grep -E '^DB_PASS=' "$ENV_FILE" | cut -d '=' -f2)
    SERVER_PORT=$(grep -E '^SERVER_PORT=' "$ENV_FILE" | cut -d '=' -f2)
    MACHINE_IP=$(grep -E '^MACHINE_IP=' "$ENV_FILE" | cut -d '=' -f2)
    PRODUCTION=$(grep -E '^PRODUCTION=' "$ENV_FILE" | cut -d '=' -f2)
    [[ -z "$DB_NAME" || -z "$DB_USER" || -z "$DB_PASS" || -z "$SERVER_PORT" ]] && error_exit "Missing mandatory env values"
    [[ "$PRODUCTION" == "true" ]] && PROTOCOL="https"
    export MYSQL_PWD="$DB_PASS"
    log "Env loaded successfully"
}

check_existing_process() {
    ABSOLUTE_SCRIPT_PATH="$(realpath "$SERVER_SCRIPT_FULL_PATH")"
    PID=$(ps aux | grep "node" | grep "$ABSOLUTE_SCRIPT_PATH" | grep -v grep | awk '{print $2}')
    [[ -n "$PID" ]] && error_exit "Server already running (PID: $PID)"
    if netstat -tuln | grep -q ":$SERVER_PORT "; then
        error_exit "Port $SERVER_PORT already in use"
    fi
}

check_npm() {
    command -v npm >/dev/null 2>&1 || error_exit "npm not installed"
}

create_db() {
    log "Ensuring DB exists: $DB_NAME"
    mysql -u"$DB_USER" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" || error_exit "DB creation failed"
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

client_build() {
    cd "$CLIENT_HOME" || error_exit "Client dir missing"
    export VITE_API_URL="${PROTOCOL}://$MACHINE_IP:$SERVER_PORT"
    log "VITE_API_URL=$VITE_API_URL"
    npm install || error_exit "npm install failed (client)"
    npm run build || error_exit "client build failed"
    [[ -d dist ]] || error_exit "dist directory not generated"
    rm -rf build
    mv dist build
    consoleLog "Client built Successfully"
}

install_server_packages() {
    cd "$SERVER_HOME" || error_exit "Server dir missing"
    npm install || error_exit "npm install failed (server)"
}

start_server() {
    cd "$SERVER_HOME" || error_exit "Server dir missing"
    npm start >> "$LOG_FILE" 2>&1 &
    sleep 2
    PID=$(pgrep -f "$SERVER_SCRIPT" | head -n 1)
    [[ -z "$PID" ]] && error_exit "Server failed to start"
    consoleLog "Server started successfully (PID: $PID)"
}

cold_start() {
    consoleLog "Cold start initiated"
    client_build
    create_db
    populate_tables
    install_server_packages
    start_server
}

warm_start() {
    consoleLog "Warm start initiated"
    [[ ! -d "$SERVER_HOME/node_modules" ]] && error_exit "node_modules missing, run cold start"
    start_server
}

bundle_only() {
    consoleLog "Client bundling initiated"
    client_build
}

main() {
    ACTION="$1"
    FLAG="$2"
    createLogDirectory
    populate_env_vars
    check_npm
    if [[ "$ACTION" == "start" ]]; then
        check_existing_process
        [[ "$FLAG" == "true" ]] && cold_start || warm_start
    elif [[ "$ACTION" == "bundle" ]]; then
        bundle_only
    else
        echo "Usage:"
        echo "  ./run.sh start [true|false]"
        echo "  ./run.sh bundle"
        exit 1
    fi
}

main "$@"
