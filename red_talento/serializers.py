from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from .models import (
    Usuario,
    PerfilEstudiante,
    PerfilDocente,
    PerfilEmpresa,
    Habilidades,
    Evidencia,
    OfertaLaboral,
    Postulacion,
    PublicacionesFeed,
    Reporte,
    Disponibilidad,
    HabilidadRequerida,
    Insignias,
    InsigniaEstudiante,
    Curso,
    CursoCompletado,
)


class TokenRole(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user.esta_suspendido:
            fecha = user.suspendido_hasta.strftime("%d/%m/%Y %H:%M")
            raise AuthenticationFailed(
                f"Tu cuenta está suspendida hasta el {fecha}. Contacta al administrador del Liceo."
            )
        return data

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'email', 'is_active', 'date_joined']

class HabilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidades
        fields = '__all__'
        read_only_fields = ['estudiante']

class DisponibilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilidad
        fields = '__all__'
        read_only_fields = ['estudiante']

class EvidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidencia
        fields = '__all__'
        read_only_fields = ['estudiante']

class HabilidadRequeridaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabilidadRequerida
        fields = '__all__'
        read_only_fields = ['oferta']

class OfertaLaboralSerializer(serializers.ModelSerializer):
    habilidades_requeridas = HabilidadRequeridaSerializer(many=True, read_only=True)
    ya_postule = serializers.SerializerMethodField()
    postulaciones_count = serializers.SerializerMethodField()
    empresa_nombre = serializers.SerializerMethodField()

    class Meta:
        model = OfertaLaboral
        fields = '__all__'
        read_only_fields = ['empresa']

    def get_ya_postule(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        try:
            return Postulacion.objects.filter(
                estudiante=request.user.perfil_estudiante,
                oferta=obj
            ).exists()
        except Exception:
            return False

    def get_postulaciones_count(self, obj):
        return obj.postulacion_set.count()

    def get_empresa_nombre(self, obj):
        try:
            return obj.empresa.nombre_empresa
        except Exception:
            return ''

class PublicacionFeedSerializer(serializers.ModelSerializer):
    autor_username = serializers.SerializerMethodField()
    autor_role = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()
    autor_perfil_id = serializers.SerializerMethodField()
    autor_foto_url = serializers.SerializerMethodField()

    class Meta:
        model = PublicacionesFeed
        fields = '__all__'
        read_only_fields = ['autor', 'fecha']

    def get_autor_username(self, obj):
        return obj.autor.get_full_name() or obj.autor.username

    def get_autor_role(self, obj):
        role_map = {'estudiante': 'student', 'docente': 'teacher', 'empresa': 'company'}
        return role_map.get(obj.autor.role, obj.autor.role)

    def get_imagen_url(self, obj):
        if not obj.imagen:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.imagen.url)
        return obj.imagen.url

    def get_autor_perfil_id(self, obj):
        try:
            role = obj.autor.role
            if role == 'estudiante':
                return obj.autor.perfil_estudiante.id
            elif role == 'docente':
                return obj.autor.perfil_docente.id
            elif role == 'empresa':
                return obj.autor.perfil_empresa.id
        except Exception:
            pass
        return None

    def get_autor_foto_url(self, obj):
        request = self.context.get('request')
        try:
            role = obj.autor.role
            if role == 'estudiante':
                foto = obj.autor.perfil_estudiante.foto_perfil
            elif role == 'docente':
                foto = obj.autor.perfil_docente.foto_perfil
            elif role == 'empresa':
                foto = obj.autor.perfil_empresa.foto_perfil
            else:
                return None
            if foto and request:
                return request.build_absolute_uri(foto.url)
        except Exception:
            pass
        return None

class ReporteSerializer(serializers.ModelSerializer):
    reportado_por_nombre = serializers.SerializerMethodField()
    usuario_reportado_nombre = serializers.SerializerMethodField()
    publicacion_data = serializers.SerializerMethodField()

    class Meta:
        model = Reporte
        fields = '__all__'
        read_only_fields = ['reportado_por', 'fecha']

    def get_reportado_por_nombre(self, obj):
        try:
            u = obj.reportado_por
            return f"{u.first_name} {u.last_name}".strip() or u.username
        except Exception:
            return ""

    def get_usuario_reportado_nombre(self, obj):
        try:
            u = obj.usuario_reportado
            return f"{u.first_name} {u.last_name}".strip() or u.username
        except Exception:
            return ""

    def get_publicacion_data(self, obj):
        if not obj.publicacion:
            return None
        pub = obj.publicacion
        request = self.context.get('request')
        imagen_url = None
        if pub.imagen:
            imagen_url = request.build_absolute_uri(pub.imagen.url) if request else pub.imagen.url
        autor = pub.autor
        autor_nombre = f"{autor.first_name} {autor.last_name}".strip() or autor.username
        return {
            'id': pub.id,
            'contenido': pub.contenido,
            'imagen_url': imagen_url,
            'autor_nombre': autor_nombre,
            'fecha': pub.fecha.isoformat() if pub.fecha else None,
        }

class PostulacionSerializer(serializers.ModelSerializer):
    oferta_titulo = serializers.SerializerMethodField()
    oferta_empresa_nombre = serializers.SerializerMethodField()
    estudiante_nombre = serializers.SerializerMethodField()
    estudiante_especialidad = serializers.SerializerMethodField()
    estudiante_foto = serializers.SerializerMethodField()
    estudiante_perfil_id = serializers.SerializerMethodField()

    class Meta:
        model = Postulacion
        fields = '__all__'
        read_only_fields = ['estudiante']

    def get_oferta_titulo(self, obj):
        try:
            return obj.oferta.titulo
        except Exception:
            return ''

    def get_oferta_empresa_nombre(self, obj):
        try:
            return obj.oferta.empresa.nombre_empresa
        except Exception:
            return ''

    def get_estudiante_nombre(self, obj):
        try:
            u = obj.estudiante.usuario
            return f"{u.first_name} {u.last_name}".strip() or u.username
        except Exception:
            return ''

    def get_estudiante_especialidad(self, obj):
        try:
            return obj.estudiante.especialidad
        except Exception:
            return ''

    def get_estudiante_foto(self, obj):
        try:
            foto = obj.estudiante.foto_perfil
            if not foto:
                return None
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(foto.url)
            return foto.url
        except Exception:
            return None

    def get_estudiante_perfil_id(self, obj):
        try:
            return obj.estudiante.id
        except Exception:
            return None

    def validate(self, data):
        if self.instance is not None:
            return data
        estudiante = self.context['request'].user.perfil_estudiante
        oferta = data['oferta']
        existe = Postulacion.objects.filter(estudiante=estudiante, oferta=oferta).exists()
        if existe:
            raise serializers.ValidationError('Ya se ha postulado a esta oferta')
        return data

# Serializer para estudiante
class RegistroEstudianteSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    especialidad = serializers.CharField(required=True)
    grado = serializers.ChoiceField(choices=['4to_medio', 'egresado'], default='4to_medio')

    def create(self, validated_data):
        especialidad = validated_data.pop('especialidad')
        grado = validated_data.pop('grado')
        usuario = Usuario.objects.create_user(**validated_data, role='estudiante', is_active=False)
        PerfilEstudiante.objects.create(usuario=usuario, especialidad=especialidad, grado=grado)
        return usuario

class PerfilEstudianteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer()
    habilidades_aprobadas = serializers.SerializerMethodField()
    habilidades_pendientes = serializers.SerializerMethodField()
    disponibilidad_perfil = serializers.SerializerMethodField()
    foto_url = serializers.SerializerMethodField()
    insignias_perfil = serializers.SerializerMethodField()
    evidencias_perfil = serializers.SerializerMethodField()

    class Meta:
        model = PerfilEstudiante
        fields = '__all__'

    def get_habilidades_aprobadas(self, obj):
        habilidades = obj.habilidades_set.filter(estado='Aprobado')
        return HabilidadSerializer(habilidades, many=True).data

    def get_habilidades_pendientes(self, obj):
        habilidades = obj.habilidades_set.filter(estado='Pendiente')
        return HabilidadSerializer(habilidades, many=True).data

    def get_disponibilidad_perfil(self, obj):
        disponibilidad = obj.disponibilidad.all()
        return DisponibilidadSerializer(disponibilidad, many=True).data

    def get_foto_url(self, obj):
        if not obj.foto_perfil:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.foto_perfil.url)
        return obj.foto_perfil.url

    def get_insignias_perfil(self, obj):
        insignias = obj.insigniaestudiante_set.select_related('insignia').all()
        return [{'id': ie.id, 'nombre': ie.insignia.nombre, 'icono': ie.insignia.icono} for ie in insignias]

    def get_evidencias_perfil(self, obj):
        request = self.context.get('request')
        result = []
        for ev in obj.evidencia_set.all():
            img_url = None
            if ev.imagen:
                img_url = request.build_absolute_uri(ev.imagen.url) if request else ev.imagen.url
            result.append({'id': ev.id, 'titulo': ev.titulo, 'descripcion': ev.descripcion, 'imagen': img_url})
        return result


# Serializer para docente
class RegistroDocenteSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    departamento = serializers.CharField(required=True)
    bio  = serializers.CharField(required=False)


    def create(self, validated_data):
        departamento = validated_data.pop('departamento')
        bio = validated_data.pop('bio', None)
        usuario = Usuario.objects.create_user(**validated_data, role='docente')
        PerfilDocente.objects.create(usuario=usuario, departamento=departamento, bio=bio)
        return usuario
    

class PerfilDocenteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer()
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = PerfilDocente
        fields = '__all__'

    def get_foto_url(self, obj):
        if not obj.foto_perfil:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.foto_perfil.url)
        return obj.foto_perfil.url

# ─── Utilidad: validación matemática de RUT chileno ───────────────────────────
def validar_rut_chileno(rut: str) -> bool:
    """
    Valida el dígito verificador de un RUT chileno.
    Acepta formatos: '12345678-9', '12.345.678-9', '123456789' (sin guión).
    """
    rut = rut.strip().replace(".", "").replace(" ", "").upper()
    if "-" in rut:
        cuerpo, dv = rut.split("-", 1)
    else:
        cuerpo, dv = rut[:-1], rut[-1]

    if not cuerpo.isdigit():
        return False

    numero = int(cuerpo)
    suma = 0
    factor = 2
    while numero:
        suma += (numero % 10) * factor
        numero //= 10
        factor = factor % 7 + 2

    resto = 11 - (suma % 11)
    if resto == 11:
        verificador = "0"
    elif resto == 10:
        verificador = "K"
    else:
        verificador = str(resto)

    return dv == verificador


# Serializer para empresa
class RegistroEmpresaSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    nombre_empresa = serializers.CharField(required=True)
    industria  = serializers.CharField(required=True)
    rut = serializers.CharField(required=True)

    def validate_rut(self, value):
        rut_limpio = value.strip().replace(".", "").replace(" ", "").upper()
        if not validar_rut_chileno(rut_limpio):
            raise serializers.ValidationError("El RUT ingresado no es válido.")
        if PerfilEmpresa.objects.filter(rut=rut_limpio).exists():
            raise serializers.ValidationError("Ya existe una empresa registrada con este RUT.")
        return rut_limpio

    def create(self, validated_data):
        nombre_empresa = validated_data.pop('nombre_empresa')
        industria = validated_data.pop('industria')
        rut = validated_data.pop('rut')
        usuario = Usuario.objects.create_user(**validated_data, role='empresa')
        PerfilEmpresa.objects.create(usuario=usuario, nombre_empresa=nombre_empresa, industria=industria, rut=rut)
        return usuario

class PerfilEmpresaSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer()
    ofertas_laboral = serializers.SerializerMethodField()
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = PerfilEmpresa
        fields = '__all__'

    def get_foto_url(self, obj):
        if not obj.foto_perfil:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.foto_perfil.url)
        return obj.foto_perfil.url

    def get_ofertas_laboral(self, obj):
        ofertas = obj.ofertalaboral_set.filter(activa=True)
        return OfertaLaboralSerializer(ofertas, many=True).data


class InsigniaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insignias
        fields = ['id', 'nombre', 'descripcion', 'icono', 'criterio_codigo']

class InsigniaEstudianteSerializer(serializers.ModelSerializer):
    insignia = InsigniaSerializer(read_only=True)
    class Meta:
        model = InsigniaEstudiante
        fields = ['id', 'insignia', 'fecha_obtenida']

class CursoSerializer(serializers.ModelSerializer):
    publicado_por_nombre = serializers.SerializerMethodField()
    ya_inscrito = serializers.SerializerMethodField()

    class Meta:
        model = Curso
        fields = '__all__'
        read_only_fields = ['publicado_por', 'fecha_publicacion']

    def get_publicado_por_nombre(self, obj):
        u = obj.publicado_por.usuario
        return f"{u.first_name} {u.last_name}".strip() or u.username

    def get_ya_inscrito(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'perfil_estudiante'):
            return False
        try:
            return CursoCompletado.objects.filter(
                estudiante=request.user.perfil_estudiante, curso=obj
            ).exists()
        except Exception:
            return False


class CursoCompletadoSerializer(serializers.ModelSerializer):
    curso = CursoSerializer(read_only=True)
    curso_id = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(), source='curso', write_only=True
    )
    class Meta:
        model = CursoCompletado
        fields = ['id', 'curso', 'curso_id', 'estado', 'fecha_completado']
        read_only_fields = ['estudiante', 'fecha_completado']


class CursoCompletadoDocenteSerializer(serializers.ModelSerializer):
    """Serializer para que el docente vea qué estudiantes quieren validar un curso."""
    curso_titulo = serializers.CharField(source='curso.titulo', read_only=True)
    estudiante_nombre = serializers.SerializerMethodField()

    class Meta:
        model = CursoCompletado
        fields = ['id', 'curso_titulo', 'estudiante_nombre', 'estado', 'fecha_completado']
        read_only_fields = ['estudiante', 'curso', 'fecha_completado']

    def get_estudiante_nombre(self, obj):
        u = obj.estudiante.usuario
        return f"{u.first_name} {u.last_name}".strip() or u.username
