#!/bin/bash

set -e 
set -u

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="$PROJECT_ROOT/server/client/dac"
BACKUP_DIR="$PROJECT_ROOT/backup"
LOG_FILE="$PROJECT_ROOT/logs/build.log"

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo -e "$1"
}

error_exit() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo -e "$1"
    exit 1
}

backup_build() {
    if [ -d "build" ]; then
        log "Found existing 'build' directory. Preparing backup..."
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +"%d-%m-%Y_%H_%M")
        ARCHIVE_NAME="build_$TIMESTAMP.tar"
        tar -cf "$BACKUP_DIR/$ARCHIVE_NAME" build || error_exit "Failed to archive build directory."
        log "Backup created at $BACKUP_DIR/$ARCHIVE_NAME"
        rm -rf build || error_exit "Failed to remove old build directory."
        log "Old build directory removed."
    else
        log "'build' directory not found. Skipping backup."
    fi
}

run_build() {
    log "Running 'npm run build'..."
    npm run build || error_exit "Build command failed."
}

rename_dist_to_build() {
    if [ -d "dist" ]; then
        mv dist build || error_exit "Failed to rename 'dist' to 'build'."
        log "Renamed 'dist' to 'build'."
    else
        error_exit "'dist' directory not found after build."
    fi
}

main() {
    cd "$CLIENT_DIR" || error_exit "Cannot navigate to client directory: $CLIENT_DIR"
    log "Current directory: $(pwd)"
    backup_build
    run_build
    rename_dist_to_build
    log "Build process completed successfully."
}

main "$@"