from django.core.management.base import BaseCommand
from red_talento.models import Insignias

INSIGNIAS = [
    {
        'nombre': 'Primera Habilidad Validada',
        'descripcion': 'Obtuviste tu primera habilidad validada por un docente.',
        'icono': '⭐',
        'criterio_codigo': 'habilidad_aprobada',
    },
    {
        'nombre': 'Primer Empleo',
        'descripcion': 'Conseguiste tu primer empleo a través de Red Talento Caro.',
        'icono': '💼',
        'criterio_codigo': 'empleo_conseguido',
    },
    {
        'nombre': '3 Cursos Completados',
        'descripcion': 'Completaste y validaste 3 cursos.',
        'icono': '📚',
        'criterio_codigo': '3_cursos_completados',
    },
    {
        'nombre': '5 Cursos Completados',
        'descripcion': 'Completaste y validaste 5 cursos.',
        'icono': '🎓',
        'criterio_codigo': '5_cursos_completados',
    },
    {
        'nombre': '10 Cursos Completados',
        'descripcion': 'Completaste y validaste 10 cursos.',
        'icono': '🏆',
        'criterio_codigo': '10_cursos_completados',
    },
    {
        'nombre': 'Perfil Completo',
        'descripcion': 'Completaste todos los campos de tu perfil.',
        'icono': '✅',
        'criterio_codigo': 'perfil_completo',
    },
]


class Command(BaseCommand):
    help = 'Crea las insignias base del sistema'

    def handle(self, *args, **options):
        creadas = 0
        for data in INSIGNIAS:
            obj, created = Insignias.objects.get_or_create(
                criterio_codigo=data['criterio_codigo'],
                defaults={
                    'nombre': data['nombre'],
                    'descripcion': data['descripcion'],
                    'icono': data['icono'],
                },
            )
            if created:
                creadas += 1
                self.stdout.write(f'  + {obj.nombre}')
            else:
                self.stdout.write(f'  = {obj.nombre} (ya existe)')

        self.stdout.write(self.style.SUCCESS(f'\n{creadas} insignias creadas, {len(INSIGNIAS) - creadas} ya existían.'))
