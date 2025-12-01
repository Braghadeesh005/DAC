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

1.  **Clone Repository:**
    ```bash
    git clone <Your_Repo_URL>
    ```
    *(Alternatively, download the zip file).*
2.  **Rename and Placement:**
    ```bash
    mv <cloned_repo_dir> ~/dac
    ```
    Rename the cloned directory to `dac` and place it in your **Home Directory (`~/`)**.
3.  **Configure `run.sh` Variables:**
    Review and cross-check the variables inside `~/dac/bin/run.sh` (specifically the database user and database name).
4.  **Create Configuration File:**
    Navigate to the `/server` directory and create the environment file `config-properties.env`. Add the following variables:

    | Variable | Description |
    | :--- | :--- |
    | `MACHINE_IP` | The IP address of the machine. |
    | `DB_USER` | MySQL user for DAC. |
    | `DB_PASS` | Password for `DB_USER`. |
    | `DB_PORT` | MySQL port (default is usually 3306). |
    | `DB_NAME` | Name of the DAC database. |
5.  **Build the Client:**
    Run the build script to compile the client source code:
    ```bash
    bash ~/dac/bin/build.sh
    ```
6.  **Port Check:**
    Ensure that **port 4000** is free, as DAC runs on this port.
7.  **Cold Start (Initial Setup):**
    Use this command for the **first-time** run, which will create the database and populate initial data. You must provide the **MySQL root user password** as an argument.
    ```bash
    bash ~/dac/bin/run.sh <DB_ROOT_PASSWORD>
    ```
8.  **Verify Logs:**
    Check that the `~/dac/logs` directory has been created. Review `startup.log` and the files in `serverlog/` for any startup or server-related issues.
9.  **Warm Start (Subsequent Runs):**
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
| │   ├── `client/dac/build/` | Client production build (after `build.sh`). |
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

### Scripts & Core Functions

#### 1. `run.sh` Script
* **Logging:** All script logs are written to `startup.log`.
* **Pre-checks:** Checks for processes running on the same port (4000) and verifies `npm` installation.
* **Log Preparation:** Ensures the `logs` directory structure is created.
* **Startup Logic:** Detects if a **Cold** or **Warm** start is required.
    * **Cold Start:** Requires the MySQL root password as an argument. Checks for database existence; if not found, it creates the DB, populates data from `dacdb.xml`, and then calls server startup.
    * **Warm Start:** Directly calls the server startup.
* **Server Invocation:** Calls `npm start`, which invokes `dac-index.js`.

#### 2. `build.sh` Script
* **Backup:** If an existing client build is found, it is archived using `tar` and moved to the `/backup` directory.
* **Build:** Runs `npm run build` inside the client directory.
* **Rename:** Renames the resulting build folder (`dist`) to `build`.

#### 3. `dac-index.js` (Server Entry Point)
* **Logging:** Initializes DAC logs via the dedicated logs class.
* **Database:**
    * `DB Connection class`: Provides a function to return the database connection object.
    * `Create DB Class`: Contains methods for all DB operations, leveraging the `DB Connection class`.
* **Startup:** Initializes the `Startup class`, which handles schedules that must run during server startup.
* **Client Rendering:** Renders the React frontend client in the root path (`/`), merging it into the same port (4000).
* **API Routing:** Connects with router pages for each module. All APIs are prefixed with `/api`.

---

## 🌟 Commits History

| ID | Description |
| :--- | :--- |
| **#13-14** | Fixed build.sh related issues. |
| **#10-12** | Fixed Authentication Related Issues. |
| **#8, 9** | Enhanced run.sh and updated dacdb.xml. |
| **#7** | Enhancement in DacLogger - added `className` in the Log and minor fixes. |
| **#6** | Removed `.gitignore` and added `UserSessionInfo` UI Page. |
| **#5** | Removed exposed credentials in code and added them to a separate file (`config-properties.env`). |
| **#4** | Added Frontend UI Components (Layouts, Components, Pages), Login Page UI, API Services, and Authentication Services. |
| **#3** | Bug Fixes and Module Testing - Authentication Module Manual Backend Testing Done. |
| **#2** | Authentication Module - Encryption Algorithms, Middlewares, SessionInvalidatorSchedule, Authentication APIs. |
| **#1** | Base Setup - run.sh, build.sh, server, client, logs. |