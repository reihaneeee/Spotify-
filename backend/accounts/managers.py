from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """Users log in with email; `username` is a system-assigned handle that is
    intentionally different from the user-facing display name (spec 2.1)."""

    use_in_migrations = True

    def _generate_username(self, role):
        role = role or "listener"
        # Not race-condition-proof (fine for a course project); a production
        # system would generate this inside a DB transaction/constraint retry.
        count = self.model.objects.filter(role=role).count()
        candidate = f"{role}_{count + 1}"
        while self.model.objects.filter(username=candidate).exists():
            count += 1
            candidate = f"{role}_{count + 1}"
        return candidate

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", "listener")
        if not extra_fields.get("username"):
            extra_fields["username"] = self._generate_username(extra_fields.get("role"))
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("artist_status", "approved")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)
