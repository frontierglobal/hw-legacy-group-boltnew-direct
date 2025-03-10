import subprocess
import sys
import time

def main():
    print("Starting Supabase MCP Server Demo")
    
    # Path to the Supabase MCP server executable
    server_path = r"C:\Users\PaulHenderson\AppData\Roaming\Python\Python312\Scripts\supabase-mcp-server.exe"
    
    try:
        # Start the server process
        print("Starting Supabase MCP server...")
        server_process = subprocess.Popen(
            [server_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Give the server some time to start
        time.sleep(2)
        
        # Check if the server is running
        if server_process.poll() is not None:
            # Server has exited
            stdout, stderr = server_process.communicate()
            print("Server failed to start:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return
        
        print("Supabase MCP server is running!")
        print("Server capabilities:")
        print("- Database query tools")
        print("  - get_db_schemas: Lists all database schemas with their sizes and table counts")
        print("  - get_tables: Lists all tables in a schema with their sizes, row counts, and metadata")
        print("  - get_table_schema: Gets detailed table structure including columns, keys, and relationships")
        print("  - execute_sql_query: Executes raw SQL queries with comprehensive support for all PostgreSQL operations")
        print("- Management API tools")
        print("  - send_management_api_request: Send arbitrary requests to Supabase Management API")
        print("  - get_management_api_spec: Get the enriched API specification with safety information")
        print("  - get_management_api_safety_rules: Get all safety rules including blocked and unsafe operations")
        print("  - live_dangerously: Switch between safe and unsafe modes")
        print("- Auth Admin tools")
        print("  - get_auth_admin_methods_spec: Retrieve documentation for all available Auth Admin methods")
        print("  - call_auth_admin_method: Directly invoke Auth Admin methods with proper parameter handling")
        
        # Keep the server running for a while
        print("\nServer is running. Press Ctrl+C to stop...")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        # Make sure to terminate the server process
        if 'server_process' in locals() and server_process.poll() is None:
            server_process.terminate()
            server_process.wait()
            print("Server stopped.")

if __name__ == "__main__":
    main()
