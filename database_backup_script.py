import os
import zipfile
import subprocess
from datetime import datetime
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

# Define base directory
base_dir = '/usr/myPi/'

# Create Logs directory if it doesn't exist
logs_dir = os.path.join(base_dir, 'Logs')
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)

# Get current date and time
now = datetime.now()
current_date = now.strftime("%Y-%m-%d")
current_month = now.strftime("%Y%m")

# Log file path
log_file_path = os.path.join(logs_dir, f"{current_month}.txt")

def write_log(message):
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file_path, 'a') as log_file:
        log_file.write(f"{current_time} {message}\n")

# Start logging
write_log(f"Backup for {current_date} ----------------")

# Step 1: Backup the MySQL database
database_name = "giraffe_park"
user = "root"
password = "}Ww]3v2CX<2mSH$7"
backup_file = os.path.join(base_dir, f"{database_name}.sql")

# Create the mysqldump command
mysqldump_cmd = ['mysqldump', '-u', user, f'-p{password}', database_name, '--result-file', backup_file]

write_log("Starting MySQL backup process")
# Using subprocess to run mysqldump
subprocess.run(mysqldump_cmd)
write_log("Completed MySQL backup process")

# Step 2: Zip the backup file
write_log("Starting to zip the backup file")
zip_file = os.path.join(base_dir, f"{database_name}_{current_date}.zip")
with zipfile.ZipFile(zip_file, 'w') as zf:
    zf.write(backup_file, os.path.basename(backup_file))
write_log("Completed zipping the backup file")

# Step 3: Upload to Google Drive
write_log("Starting Google Drive authentication")
# Authenticate and create the PyDrive client
gauth = GoogleAuth()
gauth.settings = {
    'client_config_backend': 'file',
    'client_config_file': os.path.join(base_dir, 'client_secrets.json'),  # Use base_dir
    'save_credentials': True,
    'save_credentials_backend': 'file',
    'save_credentials_file': os.path.join(base_dir, 'credentials.json'),
    'get_refresh_token': True,
    'oauth_scope': ['https://www.googleapis.com/auth/drive'],
}
gauth.CommandLineAuth()  # Authenticate using command-line
drive = GoogleDrive(gauth)
write_log("Completed Google Drive authentication")

# Set the folder ID of the target folder in Google Drive
folder_id = '11gLhbbx2e1rzVaeRPqfxofnu7_Yw7Lyr'  # Replace with your folder ID

write_log("Starting file upload to Google Drive")
# Create and upload file
file_drive = drive.CreateFile({'title': os.path.basename(zip_file), 'parents': [{'id': folder_id}]})
file_drive.SetContentFile(zip_file)
file_drive.Upload()
write_log("Completed file upload to Google Drive")

print("Backup and upload completed successfully.")
write_log("Backup and upload completed successfully")

# Step 4: Remove the sql and zip files after upload
write_log("Starting file cleanup")
os.remove(backup_file)
os.remove(zip_file)
write_log("Completed file cleanup")
print("SQL and Zip files removed successfully.")
