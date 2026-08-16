#!/usr/bin/env python3
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


DEFAULT_BASE_URL = "https://api.neuroa.me/v1"
DEFAULT_MODEL = "sd-3.5-large"
DEFAULT_USER_AGENT = "Mozilla/5.0 (Codex Neuroa Skill)"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate an image with the Neuroa image API and save it locally."
    )
    parser.add_argument("--prompt", required=True, help="Prompt text to send to the API.")
    parser.add_argument(
        "--out",
        required=True,
        help="Destination image path. Parent directories are created automatically.",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Image model to use.")
    parser.add_argument("--size", help="Optional size such as 1024x1024.")
    parser.add_argument("--n", type=int, default=1, help="Number of images to request.")
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help="Neuroa API base URL without a trailing slash.",
    )
    parser.add_argument(
        "--api-key-env",
        default="NEUROA_API_KEY",
        help="Environment variable that stores the Neuroa API key.",
    )
    parser.add_argument(
        "--print-json",
        action="store_true",
        help="Print the raw JSON response after download.",
    )
    return parser.parse_args()


def read_api_key(env_name: str) -> str:
    api_key = os.environ.get(env_name)
    if api_key:
        return api_key
    raise SystemExit(f"Missing API key. Set the {env_name} environment variable first.")


def post_json(url: str, api_key: str, payload: dict) -> dict:
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": DEFAULT_USER_AGENT,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = None
        if (
            exc.code == 500
            and isinstance(parsed, dict)
            and "5007: No such model" in str(parsed.get("message", ""))
        ):
            raise SystemExit(
                "Neuroa listed this model in /v1/models, but the generation provider rejected it "
                f"for model '{payload.get('model')}'. This appears to be a provider-side mismatch. "
                f"Raw response: {body}"
            ) from exc
        raise SystemExit(f"Neuroa API request failed with HTTP {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Failed to reach Neuroa API: {exc}") from exc


def download_file(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(
        url,
        headers={"User-Agent": DEFAULT_USER_AGENT},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response, destination.open("wb") as output:
            output.write(response.read())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Image download failed with HTTP {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Failed to download generated image: {exc}") from exc


def main() -> int:
    args = parse_args()
    api_key = read_api_key(args.api_key_env)

    payload = {
        "model": args.model,
        "prompt": args.prompt,
        "n": args.n,
    }
    if args.size:
        payload["size"] = args.size

    response = post_json(f"{args.base_url.rstrip('/')}/images/generations", api_key, payload)

    if not isinstance(response, dict) or not response.get("data"):
        raise SystemExit(f"Unexpected Neuroa API response: {json.dumps(response, indent=2)}")

    first_item = response["data"][0]
    image_url = first_item.get("url")
    if not image_url:
        raise SystemExit(f"Response did not include an image URL: {json.dumps(response, indent=2)}")

    output_path = Path(args.out)
    download_file(image_url, output_path)

    print(f"Saved image to {output_path}")
    if args.print_json:
        print(json.dumps(response, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
