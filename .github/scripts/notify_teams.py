#!/usr/bin/env python3
"""
Post a Teams HTML notification to Platform Pulse after upstream sync.
Usage: notify_teams.py <prev_version> <new_version> <job_status> <run_id>
"""

import json
import sys
from datetime import datetime, timezone

import requests

TEAMS_TEAM_ID = "bad6925f-71c0-4a15-a2ba-479f8739e7b4"
TEAMS_CHANNEL_ID = "19:9f4c57921bdd49ca8ef5deb94ebf5006@thread.tacv2"

# Bot token endpoint — uses TEAMS_BOT_APP_ID + TEAMS_BOT_APP_SECRET env vars
import os

def get_bot_token() -> str:
    app_id = os.environ.get("TEAMS_BOT_APP_ID", "")
    app_secret = os.environ.get("TEAMS_BOT_APP_SECRET", "")
    if not app_id or not app_secret:
        print("Warning: TEAMS_BOT_APP_ID/SECRET not set — skipping Teams notification")
        return ""

    resp = requests.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        data={
            "grant_type": "client_credentials",
            "client_id": app_id,
            "client_secret": app_secret,
            "scope": "https://graph.microsoft.com/.default",
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def main():
    prev_version = sys.argv[1] if len(sys.argv) > 1 else "unknown"
    new_version = sys.argv[2] if len(sys.argv) > 2 else "unknown"
    job_status = sys.argv[3] if len(sys.argv) > 3 else "unknown"
    run_id = sys.argv[4] if len(sys.argv) > 4 else ""

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    status_emoji = "🟢" if job_status.lower() == "success" else "🔴"
    action_text = "deployed to GKE development" if job_status.lower() == "success" else "FAILED"

    run_url = f"https://github.com/Alliance-Strategies/n8n/actions/runs/{run_id}" if run_id else "#"

    msg = f"""<b>🤖 {status_emoji} n8n Alliance Fork — Upstream Sync</b> — {ts}<br><br>
<i>Upstream n8n {prev_version} → {new_version} sync {action_text}.</i><br><br>
<table>
  <tr><th>Field</th><th>Value</th></tr>
  <tr><td>Previous version</td><td>{prev_version}</td></tr>
  <tr><td>New version</td><td>{new_version}</td></tr>
  <tr><td>Job status</td><td>{job_status}</td></tr>
  <tr><td>GitHub Actions run</td><td><a href="{run_url}">View run</a></td></tr>
  <tr><td>Fork repo</td><td><a href="https://github.com/Alliance-Strategies/n8n">Alliance-Strategies/n8n</a></td></tr>
  <tr><td>n8n instance</td><td><a href="https://development.n8n.allianceabroad.com">development.n8n.allianceabroad.com</a></td></tr>
</table><br>
{"<b>✅ Patches applied:</b> license.js, controller.registry.js, license-state.js<br>" if job_status.lower() == "success" else "<b>🚨 Action Required:</b> Check GitHub Actions logs for failure details.<br>"}"""

    token = get_bot_token()
    if not token:
        print("No token — skipping Teams notification")
        return

    resp = requests.post(
        f"https://graph.microsoft.com/v1.0/teams/{TEAMS_TEAM_ID}/channels/{TEAMS_CHANNEL_ID}/messages",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"body": {"contentType": "html", "content": msg}},
        timeout=15,
    )
    if resp.status_code in (200, 201):
        print("Platform Pulse notification sent")
    else:
        print(f"Teams notification failed: {resp.status_code} {resp.text[:200]}")


if __name__ == "__main__":
    main()
