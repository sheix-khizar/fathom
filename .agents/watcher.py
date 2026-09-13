import time
import os
import sys
import traceback

# Import from capture.py
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
from capture import scan_all_sessions

LOG_FILE = os.path.join(current_dir, "watcher.log")

def log(msg):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")

def run_loop():
    log("Starting agent capture watcher daemon...")
    while True:
        try:
            updated = scan_all_sessions()
            if updated:
                for p in updated:
                    log(f"Updated log: {p}")
        except Exception as e:
            log(f"Error in watcher loop: {traceback.format_exc()}")
        time.sleep(2)

if __name__ == "__main__":
    run_loop()
