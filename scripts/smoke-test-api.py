#!/usr/bin/env python3
"""Courtly API smoke test — run before production."""
import json, sys, urllib.request, urllib.error

BASE = "https://courtly-api.hyge.web.id"
PASS = 0
FAIL = 0

def req(method, path, body=None, token=None):
    headers = {"Accept": "application/json"}
    if body is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def check(name, ok, detail=""):
    global PASS, FAIL
    if ok:
        PASS += 1
        print(f"  PASS  {name}" + (f" — {detail}" if detail else ""))
    else:
        FAIL += 1
        print(f"  FAIL  {name}" + (f" — {detail}" if detail else ""))

print("\n=== Courtly API Smoke Test ===\n")

# 1. Health
code, _ = req("GET", "/health")
check("GET /health", code == 200, f"status={code}")

# 2. Login
code, data = req("POST", "/v1/auth/login", {"email": "courtly.test.0904@example.com", "password": "Password123!"})
token = data.get("accessToken") if code == 201 else None
check("POST /v1/auth/login", code == 201 and token, f"status={code}")

# 3. Invalid login
code, _ = req("POST", "/v1/auth/login", {"email": "bad@test.com", "password": "wrong"})
check("POST /v1/auth/login (400 invalid)", code == 400, f"status={code}")

# 4. Facilities list + pagination
code, data = req("GET", "/v1/facilities?page=1&limit=5")
check("GET /v1/facilities", code == 200 and len(data.get("data", [])) > 0, f"{len(data.get('data',[]))} items")

code, data = req("GET", "/v1/facilities?page=2&limit=5")
check("GET /v1/facilities?page=2", code == 200 and data["pagination"]["page"] == 2)

# 5. Filters
code, data = req("GET", "/v1/facilities?sport=padel&city=Jakarta%20Selatan")
check("GET /v1/facilities?sport&city", code == 200, f"{data['pagination']['total']} results")

# 6. Lookups
code, data = req("GET", "/v1/sports")
check("GET /v1/sports", code == 200 and len(data.get("data", [])) >= 4)

code, data = req("GET", "/v1/cities")
check("GET /v1/cities", code == 200 and len(data.get("data", [])) >= 4)

# 7. Facility detail
code, list_data = req("GET", "/v1/facilities?limit=1")
fid = list_data["data"][0]["id"]
code, detail = req("GET", f"/v1/facilities/{fid}")
check("GET /v1/facilities/:id", code == 200 and len(detail.get("courts", [])) > 0, detail.get("name"))

# 8. Availability
code, avail = req("GET", f"/v1/facilities/{fid}/availability?date=2026-09-10")
court = avail["courts"][0]
slot = next(s for s in court["slots"] if s["available"])
check("GET /v1/facilities/:id/availability", code == 200 and slot, f"{slot['startTime']}-{slot['endTime']}")

# 9. Create booking
code, booking = req("POST", "/v1/bookings", {
    "courtId": court["id"], "date": "2026-09-10",
    "startTime": slot["startTime"], "endTime": slot["endTime"]
}, token=token)
bid = booking.get("id")
check("POST /v1/bookings", code == 201 and bid, booking.get("bookingReference"))

# 10. Duplicate booking (409)
code, _ = req("POST", "/v1/bookings", {
    "courtId": court["id"], "date": "2026-09-10",
    "startTime": slot["startTime"], "endTime": slot["endTime"]
}, token=token)
check("POST /v1/bookings (409 conflict)", code == 409, f"status={code}")

# 11. List bookings
code, bookings = req("GET", "/v1/bookings?status=UPCOMING", token=token)
check("GET /v1/bookings?status=UPCOMING", code == 200 and any(b["id"] == bid for b in bookings.get("data", [])))

# 12. Booking detail
code, detail_b = req("GET", f"/v1/bookings/{bid}", token=token)
check("GET /v1/bookings/:id", code == 200 and detail_b["status"] == "CONFIRMED")

# 13. Cancel
code, cancelled = req("DELETE", f"/v1/bookings/{bid}", token=token)
check("DELETE /v1/bookings/:id", code == 200 and cancelled["status"] == "CANCELLED")

# 14. Cancel again (409)
code, _ = req("DELETE", f"/v1/bookings/{bid}", token=token)
check("DELETE /v1/bookings/:id (409)", code == 409, f"status={code}")

# 15. Unauthorized
code, _ = req("GET", "/v1/bookings")
check("GET /v1/bookings (401 no token)", code == 401, f"status={code}")

print(f"\n=== Results: {PASS} passed, {FAIL} failed ===\n")
sys.exit(1 if FAIL else 0)
