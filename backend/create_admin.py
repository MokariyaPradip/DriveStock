import sys
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User

def create_admin(email, password):
    db = SessionLocal()
    try:
        # Check if user already exists
        email_clean = email.strip().lower()
        user = db.query(User).filter(User.email == email_clean).first()
        if user:
            print(f"User with email {email} already exists. Updating role to admin...")
            user.role = "admin"
            db.commit()
            print("Successfully updated role to admin.")
            return
        
        # Create new admin user
        admin = User(
            email=email_clean,
            hashed_password=hash_password(password),
            role="admin"
        )
        db.add(admin)
        db.commit()
        print(f"Successfully created admin user: {email}")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_admin(email, password)
