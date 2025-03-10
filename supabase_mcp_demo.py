import os
import sys
import json
import asyncio
from mcp.server import Server
from mcp.types import ListToolsRequest, CallToolRequest

class SupabaseMCPDemo:
    def __init__(self):
        self.server = Server(
            {
                "name": "supabase-mcp-demo",
                "version": "0.1.0",
            },
            {
                "capabilities": {
                    "tools": {},
                },
            }
        )
        
        self.setup_tool_handlers()
        
        # Error handling
        self.server.onerror = lambda error: print(f"[MCP Error] {error}", file=sys.stderr)
        
    def setup_tool_handlers(self):
        self.server.set_request_handler(ListToolsRequest, self.handle_list_tools)
        self.server.set_request_handler(CallToolRequest, self.handle_call_tool)
        
    async def handle_list_tools(self, request):
        return {
            "tools": [
                {
                    "name": "supabase_demo",
                    "description": "A simple demonstration of the Supabase MCP server",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "type": "string",
                                "description": "A message to echo back",
                            },
                        },
                        "required": ["message"],
                    },
                },
            ],
        }
        
    async def handle_call_tool(self, request):
        if request.params.name != "supabase_demo":
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Unknown tool: {request.params.name}",
                    },
                ],
                "isError": True,
            }
            
        message = request.params.arguments.get("message", "No message provided")
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Supabase MCP Demo: {message}",
                },
            ],
        }
        
    async def run(self):
        # Use stdio for communication
        stdin = asyncio.StreamReader()
        stdout = asyncio.StreamWriter(sys.stdout.buffer, None)
        
        # Set up protocol
        await self.server.connect({
            "reader": stdin,
            "writer": stdout,
        })
        
        print("Supabase MCP Demo server running on stdio", file=sys.stderr)
        
if __name__ == "__main__":
    demo = SupabaseMCPDemo()
    asyncio.run(demo.run())
