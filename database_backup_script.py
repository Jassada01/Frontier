import os
import zipfile
import subprocess
from datetime import datetime
import logging
from typing import Optional
import firebase_admin
from firebase_admin import credentials, storage

class DatabaseBackup:
    def __init__(self, base_dir: str, database_name: str, mysql_user: str, mysql_password: str, 
                 firebase_cred_path: str, storage_bucket: str):
        self.base_dir = base_dir
        self.database_name = database_name
        self.mysql_user = mysql_user
        self.mysql_password = mysql_password
        self.firebase_cred_path = firebase_cred_path
        self.storage_bucket = storage_bucket
        
        # Setup paths
        self.logs_dir = os.path.join(base_dir, 'Logs')
        self.backup_file = os.path.join(base_dir, f"{database_name}.sql")
        self.zip_file = os.path.join(base_dir, f"{database_name}.zip")
        
        # Setup logging first before any other operations
        self._setup_logging()
        
        # Initialize Firebase
        self._init_firebase()
        
    def _setup_logging(self) -> None:
        """Configure logging to both file and console with proper permissions."""
        try:
            # Ensure the logs directory exists with proper permissions
            if not os.path.exists(self.logs_dir):
                os.makedirs(self.logs_dir, mode=0o755, exist_ok=True)
                
            current_month = datetime.now().strftime("%Y%m")
            log_file = os.path.join(self.logs_dir, f"{current_month}.txt")
            
            # Remove any existing handlers to avoid duplication
            for handler in logging.root.handlers[:]:
                logging.root.removeHandler(handler)
            
            # Create formatter
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            
            # File handler
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            file_handler.setFormatter(formatter)
            file_handler.setLevel(logging.DEBUG)  # Set to DEBUG to catch all levels
            
            # Console handler
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            console_handler.setLevel(logging.INFO)
            
            # Setup root logger
            logging.root.setLevel(logging.DEBUG)  # Set root logger to lowest level
            logging.root.addHandler(file_handler)
            logging.root.addHandler(console_handler)
            
            # Test logging setup
            logging.debug("Logging setup completed - DEBUG test message")
            logging.info("Logging setup completed - INFO test message")
            
        except Exception as e:
            print(f"Error setting up logging: {str(e)}")  # Print directly since logging might not be working
            raise

    def _check_log_permissions(self) -> None:
        """Check and fix log file permissions if needed."""
        try:
            current_month = datetime.now().strftime("%Y%m")
            log_file = os.path.join(self.logs_dir, f"{current_month}.txt")
            
            if os.path.exists(log_file):
                # Make sure the file is writable
                os.chmod(log_file, 0o666)
                logging.info(f"Log file permissions updated: {log_file}")
        except Exception as e:
            print(f"Error checking log permissions: {str(e)}")

    def _init_firebase(self) -> None:
        """Initialize Firebase Admin SDK."""
        try:
            cred = credentials.Certificate(self.firebase_cred_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred, {
                    'storageBucket': self.storage_bucket
                })
            logging.info("Firebase initialized successfully")
            logging.debug(f"Firebase using credentials from: {self.firebase_cred_path}")
        except Exception as e:
            logging.error(f"Failed to initialize Firebase: {str(e)}")
            raise

    def _create_mysql_backup(self) -> bool:
        """Create MySQL database backup using mysqldump."""
        try:
            logging.info("Starting MySQL backup process")
            logging.debug(f"Creating backup for database: {self.database_name}")
            
            mysqldump_cmd = [
                'mysqldump',
                '-u', self.mysql_user,
                f'-p{self.mysql_password}',
                self.database_name,
                '--result-file', self.backup_file
            ]
            
            logging.debug(f"Running mysqldump command")
            result = subprocess.run(mysqldump_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                logging.error(f"MySQL backup failed: {result.stderr}")
                return False
                
            logging.info("MySQL backup completed successfully")
            logging.debug(f"Backup file created at: {self.backup_file}")
            return True
            
        except Exception as e:
            logging.error(f"Error during MySQL backup: {str(e)}", exc_info=True)
            return False

    def _create_zip(self) -> bool:
        """Zip the SQL backup file."""
        try:
            logging.info("Starting zip creation")
            logging.debug(f"Creating zip file: {self.zip_file}")
            
            with zipfile.ZipFile(self.zip_file, 'w', zipfile.ZIP_DEFLATED) as zf:
                zf.write(self.backup_file, os.path.basename(self.backup_file))
                
            logging.info("Zip file created successfully")
            logging.debug(f"Zip file size: {os.path.getsize(self.zip_file)} bytes")
            return True
            
        except Exception as e:
            logging.error(f"Error creating zip file: {str(e)}", exc_info=True)
            return False

    def _upload_to_firebase(self) -> bool:
        """Upload the zip file to Firebase Storage."""
        try:
            logging.info("Starting Firebase Storage upload")
            
            # Get bucket
            bucket = storage.bucket()
            logging.debug(f"Connected to Firebase bucket: {self.storage_bucket}")
            
            # Generate destination path in Firebase Storage
            current_date = datetime.now().strftime("%Y/%m/%d")
            destination_blob_name = f"backups/{current_date}/{os.path.basename(self.zip_file)}"
            logging.debug(f"Upload destination: {destination_blob_name}")
            
            # Create blob and upload file
            blob = bucket.blob(destination_blob_name)
            blob.upload_from_filename(self.zip_file)
            
            logging.info(f"File uploaded to Firebase Storage at path: {destination_blob_name}")
            return True
            
        except Exception as e:
            logging.error(f"Error uploading to Firebase Storage: {str(e)}", exc_info=True)
            return False

    def _cleanup_files(self) -> None:
        """Remove temporary backup files."""
        try:
            logging.info("Starting file cleanup")
            if os.path.exists(self.backup_file):
                os.remove(self.backup_file)
                logging.debug(f"Removed SQL backup file: {self.backup_file}")
            if os.path.exists(self.zip_file):
                os.remove(self.zip_file)
                logging.debug(f"Removed zip file: {self.zip_file}")
            logging.info("File cleanup completed")
            
        except Exception as e:
            logging.error(f"Error during file cleanup: {str(e)}", exc_info=True)

    def run_backup(self) -> bool:
        """Execute the complete backup process."""
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        try:
            logging.info("="*50)
            logging.info(f"Starting backup process for {current_date}")
            logging.debug(f"Working directory: {self.base_dir}")
            logging.debug(f"Database name: {self.database_name}")
            
            # Check log permissions before proceeding
            self._check_log_permissions()
            
            # Step 1: Create MySQL backup
            if not self._create_mysql_backup():
                logging.error("MySQL backup step failed")
                return False
                
            # Step 2: Create zip file
            if not self._create_zip():
                logging.error("Zip creation step failed")
                return False
                
            # Step 3: Upload to Firebase Storage
            if not self._upload_to_firebase():
                logging.error("Firebase upload step failed")
                return False
                
            # Step 4: Cleanup temporary files
            self._cleanup_files()
            
            logging.info(f"Backup process completed successfully for {current_date}")
            logging.info("="*50)
            return True
            
        except Exception as e:
            logging.critical(f"Critical error in backup process: {str(e)}", exc_info=True)
            return False

def main():
    # Configuration
    BASE_DIR = '/usr/myPi/'
    DATABASE_NAME = 'giraffe_park'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = '}Ww]3v2CX<2mSH$7'
    FIREBASE_CRED_PATH = '/usr/myPi/firebase-credentials.json'
    STORAGE_BUCKET = 'jsolutionsnext-backup.appspot.com'
    
    try:
        # Create and run backup
        backup = DatabaseBackup(
            base_dir=BASE_DIR,
            database_name=DATABASE_NAME,
            mysql_user=MYSQL_USER,
            mysql_password=MYSQL_PASSWORD,
            firebase_cred_path=FIREBASE_CRED_PATH,
            storage_bucket=STORAGE_BUCKET
        )
        
        success = backup.run_backup()
        exit_code = 0 if success else 1
        
        logging.info(f"Backup script completed with exit code: {exit_code}")
        exit(exit_code)
        
    except Exception as e:
        logging.critical(f"Unhandled exception in main: {str(e)}", exc_info=True)
        exit(1)

if __name__ == "__main__":
    main()