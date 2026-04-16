from rest_framework_simplejwt.serializers import( 
    TokenObtainPairSerializer,
)
from rest_framework import serializers
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
    Notificacion,
    PostLike,
    PostComentario,
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
        data['role'] = user.role
        data['user_id'] = user.id
        
        user_data = {
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'validado': user.is_active,
            'foto_perfil': user.foto_perfil.url if user.foto_perfil else None,
        }
        
        if user.role == 'estudiante' and hasattr(user, 'perfil_estudiante'):
            user_data['especialidad'] = user.perfil_estudiante.especialidad
            user_data['grado'] = user.perfil_estudiante.grado
        elif user.role == 'docente' and hasattr(user, 'perfil_docente'):
            user_data['departamento'] = user.perfil_docente.departamento
        elif user.role == 'empresa' and hasattr(user, 'perfil_empresa'):
            user_data['nombre_empresa'] = user.perfil_empresa.nombre_empresa
            
        data['user'] = user_data
        return data

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'email', 'foto_perfil', 'is_active']

class HabilidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidades
        fields = '__all__'

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
    class Meta:
        model = OfertaLaboral
        fields = '__all__'
        read_only_fields = ['empresa']

class PublicacionFeedSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_role = serializers.SerializerMethodField()
    autor_foto = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comentarios_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = PublicacionesFeed
        fields = '__all__'
        read_only_fields = ['autor', 'fecha']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comentarios_count(self, obj):
        return obj.comentarios.count()

    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        # Robust check to avoid WSGIRequest/Request attribute errors
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.likes.filter(usuario=request.user).exists()
        return False
        
    def get_autor_nombre(self, obj):
        if obj.autor.role == 'empresa' and hasattr(obj.autor, 'perfil_empresa'):
            return obj.autor.perfil_empresa.nombre_empresa
        nombre_completo = f"{obj.autor.first_name} {obj.autor.last_name}".strip()
        return nombre_completo if nombre_completo else obj.autor.username

    def get_autor_role(self, obj):
        return obj.autor.role

    def get_autor_foto(self, obj):
        return obj.autor.foto_perfil.url if obj.autor.foto_perfil else None

class PostComentarioSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_foto = serializers.SerializerMethodField()

    class Meta:
        model = PostComentario
        fields = ['id', 'usuario', 'publicacion', 'contenido', 'fecha', 'autor_nombre', 'autor_foto']
        read_only_fields = ['usuario', 'fecha', 'publicacion']

    def get_autor_nombre(self, obj):
        if obj.usuario.role == 'empresa' and hasattr(obj.usuario, 'perfil_empresa'):
            return obj.usuario.perfil_empresa.nombre_empresa
        nombre_completo = f"{obj.usuario.first_name} {obj.usuario.last_name}".strip()
        return nombre_completo if nombre_completo else obj.usuario.username

    def get_autor_foto(self, obj):
        return obj.usuario.foto_perfil.url if obj.usuario.foto_perfil else None

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = '__all__'
        read_only_fields = ['reportado_por', 'fecha']

class PostulacionSerializer(serializers.ModelSerializer):
    estudiante_detalle = serializers.SerializerMethodField()
    oferta_detalle = serializers.SerializerMethodField()
    class Meta:
        model = Postulacion
        fields = '__all__'
        read_only_fields = ['estudiante']

    def get_estudiante_detalle(self, obj):
        if not obj.estudiante:
            return None
        return {
            "first_name": obj.estudiante.usuario.first_name,
            "last_name": obj.estudiante.usuario.last_name,
            "especialidad": obj.estudiante.especialidad,
            "grado": obj.estudiante.grado,
            "user_id": obj.estudiante.usuario.id
        }

    def get_oferta_detalle(self, obj):
        if not obj.oferta:
            return None
        return {
            "titulo": obj.oferta.titulo,
            "empresa_nombre": obj.oferta.empresa.nombre_empresa if hasattr(obj.oferta.empresa, 'nombre_empresa') else 'Empresa'
        }

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
    grado = serializers.ChoiceField(choices=['1ro_medio', '2do_medio', '3ro_medio', '4to_medio', 'egresado'], default='4to_medio')

    def create(self, validated_data):
        especialidad = validated_data.pop('especialidad')
        grado = validated_data.pop('grado')
        usuario = Usuario.objects.create_user(**validated_data, role='estudiante')
        PerfilEstudiante.objects.create(usuario=usuario, especialidad=especialidad, grado=grado)
        return usuario

class PerfilEstudianteSerializer(serializers.ModelSerializer):
    user = UsuarioSerializer(source='usuario', read_only=True)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    foto_perfil = serializers.ImageField(write_only=True, required=False)
    habilidades_aprobadas = serializers.SerializerMethodField()
    disponibilidad_perfil = serializers.SerializerMethodField()
    activo = serializers.SerializerMethodField()
    class Meta:
        model = PerfilEstudiante
        fields = '__all__'

    def update(self, instance, validated_data):
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)
        foto_perfil = validated_data.pop('foto_perfil', None)
        
        has_user_changes = False
        if first_name is not None:
            instance.usuario.first_name = first_name
            has_user_changes = True
        if last_name is not None:
            instance.usuario.last_name = last_name
            has_user_changes = True
        if email is not None:
            instance.usuario.email = email
            has_user_changes = True
        if foto_perfil is not None:
            instance.usuario.foto_perfil = foto_perfil
            has_user_changes = True
            
        if has_user_changes:
            instance.usuario.save()
        return super().update(instance, validated_data)

    def get_habilidades_aprobadas(self, obj):
        habilidades = obj.habilidades_set.filter(estado='Aprobado')
        return HabilidadSerializer(habilidades, many=True).data
    def get_disponibilidad_perfil(self, obj):
        disponibilidad = obj.disponibilidad.all()
        return DisponibilidadSerializer(disponibilidad, many=True).data
    def get_activo(self, obj):
        return obj.usuario.is_active


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
    user = UsuarioSerializer(source='usuario', read_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    foto_perfil = serializers.ImageField(write_only=True, required=False)
    activo = serializers.SerializerMethodField()
    class Meta:
        model = PerfilDocente
        fields = '__all__'

    def get_activo(self, obj):
        return obj.usuario.is_active

    def update(self, instance, validated_data):
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)
        foto_perfil = validated_data.pop('foto_perfil', None)
        
        has_user_changes = False
        if first_name is not None:
            instance.usuario.first_name = first_name
            has_user_changes = True
        if last_name is not None:
            instance.usuario.last_name = last_name
            has_user_changes = True
        if email is not None:
            instance.usuario.email = email
            has_user_changes = True
        if foto_perfil is not None:
            instance.usuario.foto_perfil = foto_perfil
            has_user_changes = True
            
        if has_user_changes:
            instance.usuario.save()
        return super().update(instance, validated_data)

# Serializer para empresa
class RegistroEmpresaSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    nombre_empresa = serializers.CharField(required=True)
    industria  = serializers.CharField(required=True)
    rut = serializers.CharField(required=True)

    def create(self, validated_data):
        nombre_empresa = validated_data.pop('nombre_empresa')
        industria = validated_data.pop('industria')
        rut = validated_data.pop('rut')
        usuario = Usuario.objects.create_user(**validated_data, role='empresa')
        PerfilEmpresa.objects.create(usuario=usuario, nombre_empresa=nombre_empresa, industria=industria, rut=rut)
        return usuario

class PerfilEmpresaSerializer(serializers.ModelSerializer):
    user = UsuarioSerializer(source='usuario', read_only=True)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    foto_perfil = serializers.ImageField(write_only=True, required=False)
    ofertas_laboral = serializers.SerializerMethodField()
    class Meta:
        model = PerfilEmpresa
        fields = '__all__'

    def update(self, instance, validated_data):
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        email = validated_data.pop('email', None)
        foto_perfil = validated_data.pop('foto_perfil', None)
        
        has_user_changes = False
        if first_name is not None:
            instance.usuario.first_name = first_name
            has_user_changes = True
        if last_name is not None:
            instance.usuario.last_name = last_name
            has_user_changes = True
        if email is not None:
            instance.usuario.email = email
            has_user_changes = True
        if foto_perfil is not None:
            instance.usuario.foto_perfil = foto_perfil
            has_user_changes = True
            
        if has_user_changes:
            instance.usuario.save()
        return super().update(instance, validated_data)

    def get_ofertas_laboral(self, obj):
        ofertas = obj.ofertalaboral_set.all()
        return OfertaLaboralSerializer(ofertas, many=True).data


class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = '__all__'
