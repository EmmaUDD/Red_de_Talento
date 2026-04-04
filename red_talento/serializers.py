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
)


class TokenRole(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'email']

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

class OfertaLaboralSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfertaLaboral
        fields = '__all__'
        read_only_fields = ['empresa']

class PublicacionFeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicacionesFeed
        fields = '__all__'
        read_only_fields = ['autor', 'fecha']

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = '__all__'
        read_only_fields = ['reportado_por', 'fecha']

class PostulacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Postulacion
        fields = '__all__'
        read_only_fields = ['estudiante']
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
        usuario = Usuario.objects.create_user(**validated_data, role='estudiante')
        PerfilEstudiante.objects.create(usuario=usuario, especialidad=especialidad, grado=grado)
        return usuario

class PerfilEstudianteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer() 
    habilidades_aprobadas = serializers.SerializerMethodField()
    disponibilidad_perfil = serializers.SerializerMethodField()
    class Meta:
        model = PerfilEstudiante
        fields = '__all__'

    def get_habilidades_aprobadas(self, obj):
        habilidades = obj.habilidades_set.filter(estado='Aprobado')
        return HabilidadSerializer(habilidades, many=True).data
    def get_disponibilidad_perfil(self, obj):
        disponibilidad = obj.disponibilidad_set.all()
        return DisponibilidadSerializer(disponibilidad, many=True).data


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
    class Meta:
        model = PerfilDocente
        fields = '__all__'

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
    usuario = UsuarioSerializer() 
    ofertas_laboral = serializers.SerializerMethodField()
    class Meta:
        model = PerfilEmpresa
        fields = '__all__'

    def get_ofertas_laboral(self, obj):
        ofertas = obj.ofertalaboral_set.filter(activa=True)
        return OfertaLaboralSerializer(ofertas, many=True).data
