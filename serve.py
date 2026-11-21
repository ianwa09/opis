"""Serve OPIS locally so browser tile requests include an HTTP referrer."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


def main():
    parser = argparse.ArgumentParser(description="Open OPIS through a local web server")
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))

    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        url = f"http://127.0.0.1:{server.server_port}/index.html"
        print(f"OPIS: {url}", flush=True)
        print("Keep this window open while you use OPIS. Press Ctrl+C to stop.", flush=True)
        if not args.no_browser:
            webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
