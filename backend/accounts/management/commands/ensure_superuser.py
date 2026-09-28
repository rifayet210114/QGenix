# =========================================================================================
# accounts/management/commands/ensure_superuser.py
# -----------------------------------------------------------------------------------------
# Bengali Note:
# এই কমান্ডটি Railway deployment-এ প্রতিবার auto-run হবে।
# যদি database-এ কোনো ADMIN role user না থাকে, তাহলে environment variable থেকে
# credentials পড়ে automatically superuser তৈরি করবে।
# =========================================================================================

import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates a superuser with ADMIN role if none exists (for Railway auto-deployment)'

    def handle(self, *args, **options):
        # Read credentials from Railway environment variables
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'Rifayet')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'rifayet210114@diit.edu.bd')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')

        if not password:
            self.stdout.write(
                self.style.WARNING(
                    'DJANGO_SUPERUSER_PASSWORD environment variable not set. Skipping superuser creation.'
                )
            )
            return

        # Check if an ADMIN role user already exists
        if User.objects.filter(role='ADMIN').exists():
            self.stdout.write(
                self.style.SUCCESS('Admin user already exists. Skipping creation.')
            )
            return

        # Check if the username already exists (might need role update)
        existing = User.objects.filter(username=username).first()
        if existing:
            existing.role = 'ADMIN'
            existing.is_staff = True
            existing.is_superuser = True
            existing.set_password(password)
            existing.save()
            self.stdout.write(
                self.style.SUCCESS(f'Updated existing user "{username}" to ADMIN role.')
            )
            return

        # Create brand new superuser with ADMIN role
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        user.role = 'ADMIN'
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Superuser "{username}" created successfully with ADMIN role!'
            )
        )
