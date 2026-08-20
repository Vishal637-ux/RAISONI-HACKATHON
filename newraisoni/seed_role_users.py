import urllib.request
import urllib.error
import json
import sys

SUPABASE_URL = "https://jseihmoupjkrptuwydyo.supabase.co"
ANON_KEY = "sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l"

ACCOUNTS = [
    {"email": "student@raisoni.edu", "password": "Password123!", "full_name": "Rahul Sharma (Student)", "role": "student"},
    {"email": "faculty@raisoni.edu", "password": "Password123!", "full_name": "Dr. Ankit Verma (Faculty Mentor)", "role": "faculty"},
    {"email": "company@raisoni.edu", "password": "Password123!", "full_name": "Vikram Mehta (Company Mentor)", "role": "company"},
    {"email": "hod@raisoni.edu", "password": "Password123!", "full_name": "Dr. S. N. Deshmukh (HOD CSE)", "role": "hod"},
    {"email": "tpo@raisoni.edu", "password": "Password123!", "full_name": "Prof. Rajesh Kulkarni (TPO Officer)", "role": "tpo"},
    {"email": "admin@raisoni.edu", "password": "Password123!", "full_name": "System Administrator", "role": "admin"}
]

def create_or_get_user(acc):
    url = f"{SUPABASE_URL}/auth/v1/signup"
    payload = {
        "email": acc["email"],
        "password": acc["password"],
        "data": {"full_name": acc["full_name"], "role": acc["role"]}
    }
    data_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, method='POST')
    req.add_header("apikey", ANON_KEY)
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            user = data.get("user") or data
            user_id = user.get("id")
            print(f"Created Auth User: {acc['email']} -> {user_id}")
            return user_id, data.get("access_token")
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        if "already registered" in body.lower() or "already exists" in body.lower() or e.code == 422:
            return login_user(acc)
        else:
            print(f"Error for {acc['email']}: {body}")
            return None, None
    except Exception as ex:
        print(f"Exception for {acc['email']}: {str(ex)}")
        return None, None

def login_user(acc):
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    payload = {"email": acc["email"], "password": acc["password"]}
    data_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, method='POST')
    req.add_header("apikey", ANON_KEY)
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            user = data.get("user", {})
            user_id = user.get("id")
            print(f"User exists, logged in: {acc['email']} -> {user_id}")
            return user_id, data.get("access_token")
    except Exception as ex:
        print(f"Failed to log in {acc['email']}: {str(ex)}")
        return None, None

def insert_public_user(user_id, token, acc):
    if not user_id or not token:
        return
    url = f"{SUPABASE_URL}/rest/v1/users"
    payload = {
        "id": user_id,
        "email": acc["email"],
        "full_name": acc["full_name"],
        "role": acc["role"],
        "status": "Active"
    }
    data_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, method='POST')
    req.add_header("apikey", ANON_KEY)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "resolution=merge-duplicates")
    
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Upserted public.users for {acc['role']}: {acc['email']}")
    except Exception as ex:
        print(f"Notice public.users: {str(ex)}")

def seed_departments(hod_user_id, token):
    if not hod_user_id or not token:
        return
    url = f"{SUPABASE_URL}/rest/v1/departments"
    payload = [
        {"name": "Computer Science & Engineering", "code": "CSE", "hod_id": hod_user_id},
        {"name": "Information Technology", "code": "IT"},
        {"name": "Electronics & Telecommunication", "code": "ETC"},
        {"name": "Mechanical Engineering", "code": "MECH"},
        {"name": "Civil Engineering", "code": "CIVIL"},
        {"name": "Artificial Intelligence & Data Science", "code": "AIDS"}
    ]
    data_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, method='POST')
    req.add_header("apikey", ANON_KEY)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "resolution=merge-duplicates")
    
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Seeded departments with HOD ID ({hod_user_id})")
    except Exception as ex:
        print(f"Department seed notice: {str(ex)}")

def main():
    print("=== SEEDING INTERTRACK ROLE USERS IN NEWRAISONI ===")
    hod_id = None
    hod_token = None

    for acc in ACCOUNTS:
        uid, token = create_or_get_user(acc)
        if uid and token:
            insert_public_user(uid, token, acc)
            if acc["role"] == "hod":
                hod_id = uid
                hod_token = token
                
    if hod_id and hod_token:
        seed_departments(hod_id, hod_token)

if __name__ == "__main__":
    main()
