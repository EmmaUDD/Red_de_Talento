import getpass
from django.core.management.base import BaseCommand
from django.db import transaction
from red_talento.models import Usuario, PerfilDocente


class Command(BaseCommand):
    help = 'Crea un usuario docente con permisos de administrador'

    def handle(self, *args, **options):
        self.stdout.write('\n=== Crear docente administrador ===\n')

        username = input('Username: ').strip()
        if not username:
            self.stderr.write('El username no puede estar vacío.')
            return

        if Usuario.objects.filter(username=username).exists():
            self.stderr.write(f'Ya existe un usuario con username "{username}".')
            return

        email = input('Email: ').strip()
        first_name = input('Nombre: ').strip()
        last_name = input('Apellido: ').strip()
        departamento = input('Departamento (ej. Tecnología): ').strip() or 'General'

        while True:
            password = getpass.getpass('Contraseña: ')
            confirm = getpass.getpass('Confirmar contraseña: ')
            if password == confirm:
                break
            self.stderr.write('Las contraseñas no coinciden. Intenta de nuevo.')

        try:
            with transaction.atomic():
                usuario = Usuario.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role='docente',
                    is_active=True,
                )
                PerfilDocente.objects.create(
                    usuario=usuario,
                    departamento=departamento,
                    es_admin=True,
                )

            self.stdout.write(self.style.SUCCESS(
                f'\nDocente admin "{username}" creado correctamente.'
            ))
        except Exception as e:
            self.stderr.write(f'Error al crear el usuario: {e}')
