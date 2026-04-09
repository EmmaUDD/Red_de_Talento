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
    def save(self, *args, **kwargs):
        if self.pk is None and self.role == 'estudiante':
            self.is_active = False
        super().save(*args, **kwargs)

class PerfilEstudiante(models.Model):
    usuario  = models.OneToOneField(Usuario, on_delete=models.CASCADE,  related_name='perfil_estudiante')
    especialidad = models.CharField(max_length=200)
    GRADO = [
        ('4to_medio', '4to_medio'),
        ('egresado' , 'Egresado')
    ]
    grado = models.CharField(choices=GRADO, max_length=15, default='4to_medio')
    video_pitch = models.URLField(blank=True, null=True)
    
    


class PerfilDocente(models.Model):
    usuario  = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_docente')
    departamento = models.CharField(max_length=200)
    bio = models.TextField(blank=True, null=True)
    es_admin = models.BooleanField(default=False)


class PerfilEmpresa(models.Model):
    usuario  = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_empresa')
    nombre_empresa = models.CharField(max_length=200)
    industria  = models.CharField(max_length=200)
    rut = models.CharField(max_length=12, unique=True, null=True, blank=True)

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

class Disponibilidad(models.Model):
    estudiante = models.ForeignKey(PerfilEstudiante, on_delete=models.CASCADE, related_name='disponibilidad')
    DISPONIBILIDAD = [
        ('part_time','Part_Time'),
        ('full_time', 'Full_Time'),
        ('fines_de_semana', 'Fines_de_Semana'),
        ('practicas', 'Practicas'),
    ]
    disponibilidad = models.CharField(choices=DISPONIBILIDAD,
                                      max_length=16,
                                      default='part_time',)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['disponibilidad', 'estudiante'], name='disponibilidad_estudiante')
        ]

    
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
    remuneracion = models.CharField(max_length=15, blank=True, null=True)
    ubicacion = models.CharField(max_length=100, blank=True, null=True)
    modalidad = models.CharField(choices=[('online', 'Online'),
                                          ('presencial', 'Presencial'),
                                          ('semi_presencial', 'Semi-Presencial')],
                                          max_length=20,
                                          default='presencial')
    DISPONIBILIDAD = [
        ('part_time','Part_Time'),
        ('full_time', 'Full_Time'),
        ('fines_de_semana', 'Fines_de_Semana'),
        ('practicas', 'Practicas'),
    ]
    disponibilidad_requerida = models.CharField(choices=DISPONIBILIDAD,
                                      max_length=16,
                                      blank=True, 
                                      null=True)
    GRADO = [
        ('4to_medio', '4to_medio'),
        ('egresado' , 'Egresado')
    ]
    grado_requerido = models.CharField(choices=GRADO, max_length=15, blank=True, null=True)

class HabilidadRequerida(models.Model):
    oferta = models.ForeignKey(OfertaLaboral,  on_delete=models.CASCADE, related_name='habilidades_requeridas')
    habilidad = models.CharField(max_length=20)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['habilidad', 'oferta'], name='habilidad_oferta')
        ]

class Reporte(models.Model):
    reportado_por = models.ForeignKey(Usuario,  on_delete=models.CASCADE, related_name='reportado_por')
    usuario_reportado = models.ForeignKey(Usuario,  on_delete=models.CASCADE, related_name='usuario_reportado')
    motivo = models.CharField(max_length=200)
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    ESTADOS = [('pendiente', 'estado_pendiente'),
               ('resuelto', 'estado_resuelto'),
               ('en_revision', 'estado_en_revision')]
    estado = models.CharField(choices=ESTADOS, default='pendiente', max_length=15)


class Postulacion(models.Model):
    estudiante = models.ForeignKey(PerfilEstudiante,  on_delete=models.CASCADE)
    oferta = models.ForeignKey(OfertaLaboral,  on_delete=models.CASCADE)
    mensaje_estudiante = models.TextField(blank=True, null=True)
    mensaje_empresa = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    ESTADOS = [('Contratado', 'estado_contratado'),
               ('Negado', 'estado_negado'),
               ('Pendiente', 'estado_pendiente')]
    estado = models.CharField(choices=ESTADOS, default='Pendiente', max_length=15)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['estudiante', 'oferta'], name='estudiante_oferta')
        ]

class PublicacionesFeed(models.Model):
    autor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tipo = models.CharField(choices=(('post','Post'), ('empleo', 'Empleo'), ('evento', 'Evento')), default='post', max_length= 6)
    contenido = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

class Insignias(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    icono = models.CharField(max_length=100)  # Por ahora va a ser un icono, emoji algo simple. Hasta que se hagan los diseños finales
    CODIGOS = [
        ('habilidad_aprobada', 'Habilidad_aprobada'),
        ('empleo_conseguido', 'Empleo_conseguido'),
        ('3_cursos_completados', '3_Cursos_Completados'),
        ('5_cursos_completados', '5_Cursos_Completados'),
        ('10_cursos_completados', '10_Cursos_Completados'),
        ('perfil_completo', 'Perfil_Completo')
    ]
    
    criterio_codigo = models.CharField(choices=CODIGOS, max_length=30, blank=True, null=True)


class InsigniaEstudiante(models.Model):
    estudiante = models.ForeignKey(PerfilEstudiante, on_delete=models.CASCADE)
    insignia = models.ForeignKey(Insignias, on_delete=models.CASCADE)
    fecha_obtenida = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['estudiante', 'insignia'], name='estudiante_insignia')
        ]

class Curso(models.Model):
    titulo = models.CharField(max_length=150)
    descripcion = models.TextField()
    url = models.URLField()
    PLATAFORMAS = [
        ('youtube', 'YouTube'),
        ('udemy', 'Udemy'),
        ('otro', 'Otro'),
    ]
    plataforma = models.CharField(choices=PLATAFORMAS, max_length=10, default='otro')
    especialidad = models.CharField(max_length=200)
    NIVELES = [
        ('basico', 'Básico'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    ]
    nivel = models.CharField(choices=NIVELES, max_length=12, default='basico')
    publicado_por = models.ForeignKey(PerfilDocente, on_delete=models.CASCADE, related_name='cursos')
    fecha_publicacion = models.DateTimeField(auto_now_add=True)


class CursoCompletado(models.Model):
    estudiante = models.ForeignKey(PerfilEstudiante, on_delete=models.CASCADE, related_name='cursos_completados')
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='completados')
    fecha_completado = models.DateTimeField(auto_now_add=True)
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]
    estado = models.CharField(choices=ESTADOS, max_length=12, default='pendiente')
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['estudiante', 'curso'], name='estudiante_curso')
        ]