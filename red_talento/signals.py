from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import InsigniaEstudiante, Habilidades, Insignias, Postulacion, CursoCompletado


@receiver(post_save, sender=Habilidades)
def otorgar_insignia_habilidad(sender, instance, **kwargs):
    if instance.estado == 'Aprobado':
        try:
            insignia = Insignias.objects.get(criterio_codigo='habilidad_aprobada')
        except Insignias.DoesNotExist:
            return
        InsigniaEstudiante.objects.get_or_create(
            estudiante=instance.estudiante,
            insignia=insignia
        )


@receiver(post_save, sender=Postulacion)
def otorgar_insignia_postulacion(sender, instance, **kwargs):
    if instance.estado == 'Contratado':
        try:
            insignia = Insignias.objects.get(criterio_codigo='empleo_conseguido')
        except Insignias.DoesNotExist:
            return
        InsigniaEstudiante.objects.get_or_create(
            estudiante=instance.estudiante,
            insignia=insignia
        )


@receiver(post_save, sender=CursoCompletado)
def otorgar_insignia_cursos(sender, instance, **kwargs):
    if instance.estado == 'aprobado':
        total = CursoCompletado.objects.filter(
            estudiante=instance.estudiante,
            estado='aprobado'
        ).count()
        codigos = []
        if total >= 3:
            codigos.append('3_cursos_completados')
        if total >= 5:
            codigos.append('5_cursos_completados')
        if total >= 10:
            codigos.append('10_cursos_completados')
        for codigo in codigos:
            try:
                insignia = Insignias.objects.get(criterio_codigo=codigo)
                InsigniaEstudiante.objects.get_or_create(
                    estudiante=instance.estudiante,
                    insignia=insignia
                )
            except Insignias.DoesNotExist:
                continue
