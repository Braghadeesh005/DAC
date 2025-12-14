#!/bin/bash
PROJECT_HOME="$HOME/dac"
BACKUP_DIR="$PROJECT_HOME/backup"
OUTPUT_DIR="$BACKUP_DIR/output"
LOG_DIR="$PROJECT_HOME/logs/upgrade"
LOG_FILE="$LOG_DIR/upgrade.log"
FILES_LIST="$PROJECT_HOME/data/files.txt"
ZIP_NAME="dac_server.zip"

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo -e "$1"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

create_log_dir() {
    mkdir -p "$LOG_DIR" || exit 1
    touch "$LOG_FILE" || exit 1
}

create_backup_dir() {
    mkdir -p "$BACKUP_DIR" || exit 1
    rm -rf "$OUTPUT_DIR" || exit 1
    mkdir -p "$OUTPUT_DIR" || exit 1
}

clean() {
    if [ -d "$OUTPUT_DIR" ]; then
        rm -rf "$OUTPUT_DIR" || error_exit "Failed to delete output directory"
        log "Cleaned the existing DAC Build from output directory"
    else
        log "Output directory does not exist, nothing to clean"
    fi
}

build_zip() {
    cd "$PROJECT_HOME" || error_exit "Failed to change directory to $PROJECT_HOME"
    [[ ! -f "$FILES_LIST" ]] && error_exit "Files list not found: $FILES_LIST"
    log "Starting upgrade build"
    ZIP_INPUTS=()
    while IFS= read -r item || [[ -n "$item" ]]; do
        [[ -z "$item" ]] && continue
        if [[ ! -e "$item" ]]; then
            error_exit "Missing file or directory: $item"
        fi
        ZIP_INPUTS+=("$item")
    done < "$FILES_LIST"
    log "Creating zip archive: $ZIP_NAME"
    zip -r "$ZIP_NAME" "${ZIP_INPUTS[@]}" >> "$LOG_FILE" 2>&1 || error_exit "Zip creation failed"
    mv "$ZIP_NAME" "$OUTPUT_DIR/" || error_exit "Failed to move zip to output"
    log "Upgrade package created: $OUTPUT_DIR/$ZIP_NAME"
}

main() {
    ACTION="$1"
    create_log_dir
    if [[ "$ACTION" == "build" ]]; then
        create_backup_dir
        build_zip
    elif [[ "$ACTION" == "clean" ]]; then
        clean
    else
        echo "Usage:"
        echo "  ./upgrade.sh build"
        echo "  ./upgrade.sh clean"
        exit 1
    fi
}

main "$@"
