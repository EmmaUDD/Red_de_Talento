from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Usuario(AbstractUser):
    ROLES = [ 
            ('estudiante', 'Perfil_estudiante'),
            ('docente', 'Perfil_docente'), 
            ('empresa', 'Perfil_empresa')
        ]
    
    role = models.CharField(
                            choices=ROLES,
                            max_length=12,
                            default='estudiante'
                        )


class PerfilEstudiante(models.Model):
    usuario  = models.OneToOneField(Usuario, on_delete=models.CASCADE,  related_name='perfil_estudiante')
    especialidad = models.CharField(max_length=200)
    grado = models.CharField(max_length=100)
    video_pitch = models.URLField(blank=True, null=True)


class PerfilDocente(models.Model):
    usuario  = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_docente')
    departamento = models.CharField(max_length=200)


class PerfilEmpresa(models.Model):
    usuario  = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_empresa')
    nombre_empresa = models.CharField(max_length=200)
    industria  = models.CharField(max_length=200)

class Habilidades(models.Model):
    estudiante = models.ForeignKey(PerfilEstudiante, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=200)
    NIVELES = [('Alto','Nivel_Alto'),
                ('Medio', 'Nivel_Medio'),
                ('Bajo', 'Nivel_Bajo')]
    ESTADOS = [('Pendiente', 'estado_pendiente'),
              ('Aprobado', 'estado_aprobado'),
              ('Rechazado', 'estado_rechazado')]
    
    nivel = models.CharField(choices=NIVELES, 
                             max_length=12,
                             default='Bajo'
                        )
    estado = models.CharField(choices=ESTADOS, 
                             max_length=12,
                             default='Pendiente'
                        )


class Evidencia(models.Model):
    estudiante = models.ForeignKey(PerfilEstudiante, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=150)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to='evidencias/')
    fecha_subida = models.DateTimeField(auto_now_add=True)


class OfertaLaboral(models.Model):
    empresa = models.ForeignKey(PerfilEmpresa, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=150)
    descripcion = models.TextField()
    especialidad_requerida = models.CharField(max_length=150)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=True)

class Reporte(models.Model):
    reportado_por = models.ForeignKey(Usuario,  on_delete=models.CASCADE)
    motivo = models.CharField(max_length=200)
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    ESTADOS = [('pendiente', 'estado_pendiente'),
               ('resuelto', 'estado_resuelto'),
               ('en_revision', 'estado_en_revision')]
    estado = models.CharField(choices=ESTADOS, default='pendiente', max_length=15)
