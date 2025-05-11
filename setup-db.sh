#!/bin/bash
# Script to initialize the RDS database with required tables and initial data

# Check for MySQL client
if ! command -v mysql &> /dev/null; then
    echo "MySQL client not found. Please install it first."
    exit 1
fi

# Input parameters
if [ "$#" -lt 4 ]; then
    echo "Usage: $0 <rds-endpoint> <db-name> <db-user> <db-password>"
    exit 1
fi

RDS_ENDPOINT=$1
DB_NAME=$2
DB_USER=$3
DB_PASSWORD=$4

echo "Connecting to RDS database at $RDS_ENDPOINT..."
echo "Using database $DB_NAME with user $DB_USER"

# Execute the setup SQL file
mysql -h "$RDS_ENDPOINT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < Server/setup.sql

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo "Database setup completed successfully!"
else
    echo "Error: Database setup failed."
    exit 1
fi

# Display table information
echo "Verifying database tables..."
mysql -h "$RDS_ENDPOINT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" 

echo "Setup complete!"
