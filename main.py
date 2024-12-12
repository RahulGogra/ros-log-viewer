from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from loguru import logger
import datetime
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

LOG_PATTERN = re.compile(r"\[(.*?)\] \[(.*?)\] \[(.*?)\] (.*)")

@app.post("/upload/")
async def upload_log_file(file: UploadFile = File(...)):
    contents = await file.read()
    log_data = parse_logs(contents.decode('utf-8'))
    return {"status": "success", "logs": log_data}

@app.get("/logs/")
def get_logs(severity: str = None, keyword: str = None):
    filtered_logs = [
        log for log in LOG_STORE
        if (severity is None or log['severity'] == severity)
        and (keyword is None or keyword.lower() in log['message'].lower())
    ]
    return {"logs": filtered_logs}

LOG_STORE = []

def parse_logs(log_content: str) -> List[Dict]:
    logs = []
    for line in log_content.split("\n"):
        match = LOG_PATTERN.match(line)
        if match:
            timestamp, severity, node, message = match.groups()
            logs.append({
                "timestamp": timestamp,
                "severity": severity,
                "node": node,
                "message": message
            })
    LOG_STORE.extend(logs)
    return logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
