import os
import sys
import json
import re
from datetime import datetime, timezone

WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOGS_DIR = os.path.join(WORKSPACE_DIR, ".agent-logs")
BRAIN_DIR = os.path.expandvars(r"%USERPROFILE%\.gemini\antigravity-ide\brain")

DEFAULT_AUTHOR = "shkkhizar27"
DEFAULT_PROJECT = "fathom"
DEFAULT_TOOL = "antigravity-ide"
DEFAULT_MODEL = "gemini-3.8-flash"

def format_iso_timestamp(ts_str):
    if not ts_str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    if re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$", ts_str):
        if not ts_str.endswith("Z"):
            ts_str += "Z"
        if "." not in ts_str:
            ts_str = ts_str.replace("Z", ".000Z")
        return ts_str
    return ts_str

def parse_transcript(transcript_path):
    if not os.path.exists(transcript_path):
        return []

    entries = []
    with open(transcript_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except Exception:
                continue

    turns = []
    current_prompt = None

    for entry in entries:
        etype = entry.get("type")
        if etype == "USER_INPUT":
            if current_prompt:
                turns.append(current_prompt)
            raw_content = entry.get("content", "")
            
            # Extract prompt from <USER_REQUEST> if present
            match = re.search(r"<USER_REQUEST>(.*?)</USER_REQUEST>", raw_content, re.DOTALL)
            if match:
                prompt_text = match.group(1).strip()
            else:
                prompt_text = raw_content.strip()

            created_at = format_iso_timestamp(entry.get("created_at"))
            current_prompt = {
                "prompt": prompt_text,
                "prompt_time": created_at,
                "response": None,
                "response_time": None
            }
        elif etype == "PLANNER_RESPONSE":
            if current_prompt is not None:
                tool_calls = entry.get("tool_calls")
                content = entry.get("content")
                # When final response is sent, tool_calls is empty and content is non-empty
                if not tool_calls and content and content.strip():
                    current_prompt["response"] = content.strip()
                    current_prompt["response_time"] = format_iso_timestamp(entry.get("created_at"))

    if current_prompt:
        turns.append(current_prompt)

    return turns

def generate_session_markdown(session_id, turns):
    if not turns:
        return None

    short_id = session_id[:8]
    first_time = turns[0]["prompt_time"]
    last_time = turns[-1]["prompt_time"]
    
    # Parse date from first_time: e.g. 2026-09-13
    date_part = first_time.split("T")[0]
    
    # Calculate total exchanges
    total_exchanges = len(turns)

    lines = []
    lines.append("---")
    lines.append(f"session_id: {session_id}")
    lines.append(f"date: {date_part}")
    lines.append(f"author: {DEFAULT_AUTHOR}")
    lines.append(f"model: {DEFAULT_MODEL}")
    lines.append(f"tool: {DEFAULT_TOOL}")
    lines.append(f"project: {DEFAULT_PROJECT}")
    lines.append(f"total_exchanges: {total_exchanges}")
    lines.append(f"first_prompt_time: {first_time}")
    lines.append(f"last_prompt_time: {last_time}")
    lines.append("---")
    lines.append("")
    lines.append(f"# Session Log - {date_part}")
    lines.append("")
    lines.append(f"Session: `{short_id}` | Project: `{DEFAULT_PROJECT}` | Author: `{DEFAULT_AUTHOR}`")
    lines.append("")
    lines.append("---")
    lines.append("")

    for i, turn in enumerate(turns, 1):
        lines.append(f"[LOG_ENTRY type=PROMPT num={i} session={short_id}]")
        lines.append(f"timestamp: {turn['prompt_time']}")
        lines.append(f"model: {DEFAULT_MODEL}")
        lines.append("")
        lines.append(turn["prompt"])
        lines.append("")
        lines.append("")

        if turn.get("response"):
            lines.append(f"[LOG_ENTRY type=RESPONSE num={i} session={short_id}]")
            lines.append(f"timestamp: {turn['response_time']}")
            lines.append(f"model: {DEFAULT_MODEL}")
            lines.append("")
            lines.append(turn["response"])
            lines.append("")
            lines.append("")

    return "\n".join(lines).rstrip() + "\n"

def process_session(session_id, transcript_path):
    turns = parse_transcript(transcript_path)
    if not turns:
        return None

    md_content = generate_session_markdown(session_id, turns)
    if not md_content:
        return None

    os.makedirs(LOGS_DIR, exist_ok=True)
    
    # Build filename: YYYY-MM-DD_HH-MM-SS_<session-id>.md
    first_time = turns[0]["prompt_time"]
    m = re.match(r"^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})", first_time)
    if m:
        ts_prefix = f"{m.group(1)}_{m.group(2)}-{m.group(3)}-{m.group(4)}"
    else:
        ts_prefix = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")

    log_filename = f"{ts_prefix}_{session_id}.md"
    log_filepath = os.path.join(LOGS_DIR, log_filename)

    with open(log_filepath, "w", encoding="utf-8") as f:
        f.write(md_content)

    return log_filepath

def check_session_belongs_to_workspace(session_dir, workspace_path):
    transcript_path = os.path.join(session_dir, ".system_generated", "logs", "transcript_full.jsonl")
    if not os.path.exists(transcript_path):
        return False, None

    ws_norm = os.path.normpath(workspace_path).lower()
    ws_name = os.path.basename(workspace_path).lower()

    try:
        with open(transcript_path, "r", encoding="utf-8", errors="replace") as f:
            sample = f.read(100000)
            if ws_norm in sample.lower() or ws_name in sample.lower() or "8x assignment" in sample.lower():
                return True, transcript_path
    except Exception:
        pass

    return False, None

def scan_all_sessions():
    if not os.path.exists(BRAIN_DIR):
        return []

    updated = []
    for item in os.listdir(BRAIN_DIR):
        item_path = os.path.join(BRAIN_DIR, item)
        if os.path.isdir(item_path):
            belongs, tpath = check_session_belongs_to_workspace(item_path, WORKSPACE_DIR)
            if belongs and tpath:
                out_path = process_session(item, tpath)
                if out_path:
                    updated.append(out_path)
    return updated

if __name__ == "__main__":
    if "--hook" in sys.argv:
        try:
            stdin_data = sys.stdin.read()
            if stdin_data.strip():
                payload = json.loads(stdin_data)
                conv_id = payload.get("conversationId")
                transcript_path = payload.get("transcriptPath")
                if conv_id:
                    if not transcript_path or not os.path.exists(transcript_path):
                        transcript_path = os.path.join(BRAIN_DIR, conv_id, ".system_generated", "logs", "transcript_full.jsonl")
                    else:
                        dir_part = os.path.dirname(transcript_path)
                        full_p = os.path.join(dir_part, "transcript_full.jsonl")
                        if os.path.exists(full_p):
                            transcript_path = full_p
                    process_session(conv_id, transcript_path)
        except Exception:
            pass

    updated_files = scan_all_sessions()
    print(json.dumps({"decision": "allow", "injectSteps": []}))
