# db.py
import os
import mysql.connector.pooling

dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "1234"),
    "database": os.getenv("DB_NAME", "mealPlanner")
}

try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=5,
        pool_reset_session=True,
        **dbconfig
    )
except mysql.connector.Error as err:
    print(f"Error creating connection pool: {err}")
    raise

def get_connection():
    """Retrieve a pooled MySQL connection."""
    return connection_pool.get_connection()
