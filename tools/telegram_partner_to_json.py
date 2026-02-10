#!/usr/bin/env python3
"""
Convert Telegram partner application text into a JSON block.

Usage examples:
  # 1) Generate JSON block only (for manual insert):
  python3 tools/telegram_partner_to_json.py --message "Новая заявка партнера RemCard: ..."

  # 2) Paste message via stdin and append to confirmed-partners.json:
  python3 tools/telegram_partner_to_json.py --append

  # 3) One-command publish (append + git add/commit/push current branch):
  python3 tools/telegram_partner_to_json.py --append --publish
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path
from typing import Dict, Iterable, List


DEFAULT_JSON_PATH = Path("confirmed-partners.json")
DEFAULT_STATUS = "Подтверждено"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create partner JSON block from Telegram message text."
    )
    parser.add_argument(
        "--message",
        help="Telegram message text with partner application fields.",
    )
    parser.add_argument(
        "--input-file",
        type=Path,
        help="Path to a text file with Telegram message content.",
    )
    parser.add_argument(
        "--json-file",
        type=Path,
        default=DEFAULT_JSON_PATH,
        help=f"Target JSON file (default: {DEFAULT_JSON_PATH}).",
    )
    parser.add_argument(
        "--status",
        default=DEFAULT_STATUS,
        help=f"Partner status for output item (default: {DEFAULT_STATUS}).",
    )
    parser.add_argument(
        "--source",
        default="Telegram",
        help="Source label used in note/meta (default: Telegram).",
    )
    parser.add_argument(
        "--append",
        action="store_true",
        help="Append generated item into --json-file and update updatedAt.",
    )
    parser.add_argument(
        "--publish",
        action="store_true",
        help="After append: git add/commit/push current branch (implies --append).",
    )
    parser.add_argument(
        "--prepend",
        action="store_true",
        help="When appending, insert new item at top of list.",
    )
    return parser.parse_args()


def read_message_text(args: argparse.Namespace) -> str:
    if args.message and args.input_file:
        raise SystemExit("Use either --message or --input-file, not both.")

    if args.input_file:
        return args.input_file.read_text(encoding="utf-8")

    if args.message:
        return args.message

    if sys.stdin.isatty():
        print("Вставьте текст заявки из Telegram и нажмите Ctrl+D (Linux/macOS) или Ctrl+Z Enter (Windows):")
    return sys.stdin.read()


def clean_value(value: str) -> str:
    value = value.strip()
    if not value or value == "-":
        return ""
    return value


def parse_key_values(raw_text: str) -> Dict[str, str]:
    data: Dict[str, str] = {}
    for raw_line in raw_text.splitlines():
        line = raw_line.strip()
        if not line or ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = clean_value(value)
    return data


def first_non_empty(fields: Dict[str, str], keys: Iterable[str]) -> str:
    for key in keys:
        value = clean_value(fields.get(key, ""))
        if value:
            return value
    return ""


def unique_non_empty(items: Iterable[str], limit: int = 4) -> List[str]:
    result: List[str] = []
    for item in items:
        value = clean_value(item)
        if not value:
            continue
        if value in result:
            continue
        result.append(value)
        if len(result) >= limit:
            break
    return result


def split_to_tags(value: str) -> List[str]:
    if not value:
        return []
    parts = re.split(r"[•,;/|]", value)
    return [clean_value(part) for part in parts if clean_value(part)]


def build_item(raw_text: str, status: str, default_source: str) -> Dict[str, object]:
    fields = parse_key_values(raw_text)

    source = first_non_empty(fields, ["Источник"]) or default_source
    contact = first_non_empty(fields, ["Контактное лицо", "Имя"])
    business = first_non_empty(fields, ["Компания / бренд", "Компания / специализация"])
    city = first_non_empty(fields, ["Город"])
    partner_type = first_non_empty(fields, ["Тип партнера", "Тип партнёра"])
    offerings = first_non_empty(fields, ["Услуги / товары", "Компания / специализация"])
    comment = first_non_empty(fields, ["Комментарий"])
    experience = first_non_empty(fields, ["Опыт"])

    if business and contact:
        title = f"{business} — {contact}"
    elif business:
        title = business
    elif contact:
        title = contact
    else:
        title = "Новый партнёр RemCard"

    description_parts: List[str] = []
    if offerings:
        description_parts.append(f"Заявка на подключение: {offerings}")
    elif comment:
        description_parts.append(f"Заявка на подключение: {comment}")
    else:
        description_parts.append("Заявка на подключение партнёра в проект RemCard")

    if city:
        description_parts.append(f"Город: {city}")
    if partner_type:
        description_parts.append(f"Формат: {partner_type}")
    description = ". ".join(description_parts).strip() + "."

    tag_candidates: List[str] = []
    if partner_type:
        tag_candidates.append(partner_type)
    if city:
        tag_candidates.append(city)
    tag_candidates.extend(split_to_tags(offerings))
    tags = unique_non_empty(tag_candidates, limit=5) or ["Без тега"]

    note_parts = [f"Источник: {source}. Статус заявки: подтверждена."]
    if experience:
        note_parts.append(f"Опыт: {experience}.")
    note = " ".join(note_parts)

    return {
        "title": title,
        "description": description,
        "status": status,
        "tags": tags,
        "note": note,
    }


def load_json(path: Path) -> Dict[str, object]:
    if not path.exists():
        return {"source": "Telegram", "updatedAt": date.today().isoformat(), "items": []}
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f"{path} must contain JSON object.")
    if not isinstance(data.get("items"), list):
        data["items"] = []
    return data


def save_json(path: Path, data: Dict[str, object]) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def run_checked(command: List[str]) -> str:
    completed = subprocess.run(
        command, check=True, text=True, capture_output=True
    )
    return completed.stdout.strip()


def git_publish(json_path: Path, item_title: str) -> None:
    branch = run_checked(["git", "branch", "--show-current"])
    if not branch:
        raise RuntimeError("Unable to detect current git branch.")

    run_checked(["git", "add", str(json_path)])
    short_title = item_title[:64]
    commit_message = f"Publish confirmed partner request: {short_title}"
    run_checked(["git", "commit", "-m", commit_message])
    run_checked(["git", "push", "-u", "origin", branch])


def main() -> None:
    args = parse_args()
    raw_text = read_message_text(args).strip()
    if not raw_text:
        raise SystemExit("Empty input: provide Telegram message via --message, --input-file or stdin.")

    if args.publish:
        args.append = True

    item = build_item(raw_text, status=args.status, default_source=args.source)

    print("Generated JSON block:")
    print(json.dumps(item, ensure_ascii=False, indent=2))

    if not args.append:
        return

    json_path = args.json_file
    data = load_json(json_path)
    items = data.get("items", [])
    if not isinstance(items, list):
        items = []

    if args.prepend:
        items.insert(0, item)
    else:
        items.append(item)

    data["items"] = items
    data["updatedAt"] = date.today().isoformat()
    if not clean_value(str(data.get("source", ""))):
        data["source"] = args.source

    save_json(json_path, data)
    print(f"\nUpdated file: {json_path} (items: {len(items)})")

    if args.publish:
        git_publish(json_path, str(item.get("title", "partner")))
        print("Published: git add + commit + push completed.")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as err:
        error_output = err.stderr.strip() if err.stderr else str(err)
        print(f"Command failed: {error_output}", file=sys.stderr)
        sys.exit(1)
    except Exception as err:  # pylint: disable=broad-exception-caught
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)
