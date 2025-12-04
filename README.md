# 🚀 DAC: Deployment Made Easy

**One-step tool to deploy your application in our premises.**

---

## 🛠️ Setup and Installation Guide

### Pre-requisites

To successfully set up and run DAC, ensure your machine meets the following requirements:

1.  **Operating System:** Should be a Linux Machine (capable of running `bash`/`sh` scripts).
2.  **Database:** A MySQL server must be running on the machine.
3.  **Node.js:** Node Version **20 or above** is required.

### Steps to Run a DAC Setup

Follow these steps for a complete installation and initial run:

1.  **Clone Repository in your Home Directory (`~/`):**
    ```bash
    git clone https://github.com/Braghadeesh005/DAC.git
    ```
    *(Alternatively, download the zip file).*
2.  **Rename to `dac`:**
    ```bash
    mv <CLONED_REPO> ~/dac
    ```
    Rename the cloned directory to `dac`.
3.  **Create Configuration File:**
    Navigate to the `/server` directory and create the environment file `config-properties.env`. Add the following variables:

    | Variable | Description |
    | :--- | :--- |
    | `MACHINE_IP` | The IP address of the machine. (localhost - if Dev Environment) |
    | `DB_USER` | MySQL user for DAC |
    | `DB_PASS` | Password for `DB_USER` |
    | `DB_PORT` | Port on which the MySQL Server will run |
    | `DB_NAME` | Name of the DAC database |
    | `SERVER_PORT` | The port on which the DAC Server will run |
    | `IS_HTTPS` | Controls activation of HTTPS support (Optional) |
4.  **Build the Client:**
    Run the build script to compile the client source code:
    ```bash
    bash ~/dac/bin/build.sh
    ```
5.  **Port Check:**
    Ensure the port defined in **`SERVER_PORT`** of **`config-properties.env`** is free, as DAC will run on this port.
6.  **Cold Start (Initial Setup):**
    Use this command for the **first-time** run, which will create the database and populate initial data. You must provide the **MySQL root user password** as an argument.
    ```bash
    bash ~/dac/bin/run.sh <DB_ROOT_PASSWORD>
    ```
7.  **Verify Logs:**
    Check that the `~/dac/logs` directory has been created. Review `startup.log` and the files in `serverlog/` for any startup or server-related issues.
8.  **Warm Start (Subsequent Runs):**
    For all subsequent runs after the initial cold start:
    ```bash
    bash ~/dac/bin/run.sh
    ```

---

## 💻 Technical Details

### DAC BASE SETUP: Directory Structure

| Path | Description |
| :--- | :--- |
| `DAC/` | Root directory |
| ├── `backup/` | Holds archived client build backups. |
| ├── `bin/` | Shell scripts for operations. |
| │   ├── `run.sh` | Supports both cold and warm starts. |
| │   └── `build.sh` | Builds the client source code. |
| ├── `data/` | Initial data source. |
| │   └── `dacdb.xml` | Data to populate during cold start. |
| ├── `logs/` | Directory for all log files. |
| │   ├── `serverlog/` | Directory for DAC server logs. |
| │   ├── `startup.log` | DAC startup logs. |
| │   └── `build.log` | Client build logs. |
| ├── `server/` | Server-side application code. |
| │   ├── `client/dac/` | Client-side Application code. |
| │   ├── `router/` | Routing configuration for each module. |
| │   ├── `src/dac/authentication/` | Authentication module implementation. |
| │   ├── `src/dac/conf/` | Configuration files. |
| │   ├── `src/dac/db/` | Database operation classes. |
| │   ├── `src/dac/middleware/` | Middleware implementations. |
| │   ├── `src/dac/schedules/` | Scheduled tasks (e.g., SessionInvalidatorSchedule). |
| │   ├── `src/dac/security/` | Security components (e.g., Encryption Algorithms). |
| │   ├── `src/dac/startup/` | Server startup logic. |
| │   └── `dac-index.js` | Main server entry point. |
| └── `.gitignore` | Files ignored by Git. |
