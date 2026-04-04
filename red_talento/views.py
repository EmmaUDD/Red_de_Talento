from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status
from django.db import IntegrityError
from .serializers import (
    RegistroEstudianteSerializer, 
    RegistroEmpresaSerializer, 
    RegistroDocenteSerializer, 
    TokenRole,
    PerfilEstudianteSerializer,
    PerfilDocenteSerializer,
    PerfilEmpresaSerializer,
    HabilidadSerializer,
    EvidenciaSerializer,
    OfertaLaboralSerializer,
    PostulacionSerializer,
    PublicacionFeedSerializer,
    ReporteSerializer,
    DisponibilidadSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import (
    Usuario, 
    PerfilEstudiante, 
    PerfilDocente, 
    PerfilEmpresa,
    Habilidades, 
    OfertaLaboral, 
    Evidencia, 
    Postulacion, 
    PublicacionesFeed, 
    Reporte,
    Disponibilidad,
)
from .permissions import EsDocente, EsEstudiante, EsEmpresa
from rest_framework.permissions import IsAuthenticated
import qrcode
import io


class LoginView(TokenObtainPairView):
    serializer_class = TokenRole

class ActivarEstudianteView(APIView):
    permission_classes = [IsAuthenticated, EsDocente]
    def patch(self, request, id):
        try:
            usuario = Usuario.objects.get(id=id, role='estudiante')
        except Usuario.DoesNotExist:
            return Response({'error': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        usuario.is_active = True
        usuario.save()
        return Response({'mensaje': 'Estudiante activado'}, status=status.HTTP_200_OK)


class HabilidadesView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        serializer = HabilidadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Habilidad Registrada - Validacion Pendiente'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        if not EsDocente().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        try:
            habilidad = Habilidades.objects.get(id=id)
        except Habilidades.DoesNotExist:
            return Response({'error': 'Habilidad no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        serializer = HabilidadSerializer(habilidad, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Habilidad validada'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DisponibilidadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        serializer = DisponibilidadSerializer(data=request.data)
        if serializer.is_valid():
            perfil = request.user.perfil_estudiante
            try:
                serializer.save(estudiante=perfil)
            except IntegrityError:
                return Response({'error': 'Ya tienes esta disponibilidad registrada'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'mensaje': 'Disponibilidad Registrada'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try: 
            disponibilidad = Disponibilidad.objects.get(id=id)
        except Disponibilidad.DoesNotExist:
            return Response({'error': 'No encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if not disponibilidad.estudiante == request.user.perfil_estudiante:
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        disponibilidad.delete()
        return Response("Borrada",status=status.HTTP_204_NO_CONTENT)


class EvidenciasView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permiso'}, status=status.HTTP_403_FORBIDDEN)
        serializer = EvidenciaSerializer(data=request.data)
        if serializer.is_valid():
            perfil = request.user.perfil_estudiante
            serializer.save(estudiante=perfil)
            return Response({'mensaje': 'Evidencia Registrada'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, id):
        try:
            perfil = PerfilEstudiante.objects.get(id=id)
        except PerfilEstudiante.DoesNotExist:
            return Response({'error': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        evidencia = perfil.evidencia_set.all()
        serializer = EvidenciaSerializer(evidencia, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PublicacionFeedView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PublicacionFeedSerializer(data=request.data)
        if serializer.is_valid():
            autor = request.user
            serializer.save(autor=autor)
            return Response({'mensaje': 'Publicación Creada!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        publicacion = PublicacionesFeed.objects.order_by('-fecha')
        serializer = PublicacionFeedSerializer(publicacion, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, id):
        try: 
            publicacion = PublicacionesFeed.objects.get(id=id)
        except PublicacionesFeed.DoesNotExist:
            return Response({'error': 'La publicación no existe'}, status=status.HTTP_404_NOT_FOUND)
        if not publicacion.autor == request.user:
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        publicacion.delete()
        return Response("Publicación Borrada",status=status.HTTP_204_NO_CONTENT)


class ReporteView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ReporteSerializer(data=request.data)
        if serializer.is_valid():
            reportado_por = request.user
            serializer.save(reportado_por=reportado_por)
            return Response({'mensaje': 'Reporte Creado'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        if not EsDocente().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        reportes = Reporte.objects.all()
        serializer = ReporteSerializer(reportes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, id):
        if not EsDocente().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        try:
            reporte = Reporte.objects.get(id=id)
        except Reporte.DoesNotExist:
            return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReporteSerializer(reporte, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OfertaLaboralView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not EsEmpresa().has_permission(request, self):
            return Response({'error': 'Usuario sin permiso'}, status=status.HTTP_403_FORBIDDEN)
        serializer = OfertaLaboralSerializer(data=request.data)
        if serializer.is_valid():
            perfil = request.user.perfil_empresa
            serializer.save(empresa=perfil)
            return Response({'mensaje': 'Oferta Laboral Publicada'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        ofertas = OfertaLaboral.objects.filter(activa=True)
        serializer = OfertaLaboralSerializer(ofertas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class PostulacionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PostulacionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(estudiante=request.user.perfil_estudiante)
            return Response({'mensaje': 'Postulacion Enviada'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, id):
        try:
            oferta = OfertaLaboral.objects.get(id=id)
        except OfertaLaboral.DoesNotExist:
            return Response({'error': 'Oferta sin postulaciones'}, status=status.HTTP_404_NOT_FOUND)
        if not EsEmpresa().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        if oferta.empresa != request.user.perfil_empresa:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        postulaciones = oferta.postulacion_set.all()
        serializer = PostulacionSerializer(postulaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        try:
            postulacion = Postulacion.objects.get(id=id)
        except Postulacion.DoesNotExist:
            return Response({'error': 'No exista la postulacion'}, status=status.HTTP_404_NOT_FOUND)
        if not EsEmpresa().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        if postulacion.oferta.empresa != request.user.perfil_empresa:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PostulacionSerializer(postulacion ,data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            serializer.save()
            if serializer.instance.estado == 'Contratado':
                postulacion.oferta.activa = False
                postulacion.oferta.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BusquedaEstudiantesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        estudiante = PerfilEstudiante.objects.all()
        especialidad = request.query_params.get('especialidad')
        nombre = request.query_params.get('nombre')
        if especialidad:
           estudiante = estudiante.filter(especialidad=especialidad)
        if nombre:
           estudiante = estudiante.filter(usuario__first_name=nombre)
        serializer = PerfilEstudianteSerializer(estudiante, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BusquedaEmpresasView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        empresa = PerfilEmpresa.objects.all()
        industria = request.query_params.get('industria')
        con_ofertas = request.query_params.get('con_ofertas')
        nombre_empresa = request.query_params.get('nombre_empresa')
        if industria:
           empresa = empresa.filter(industria=industria)
        if con_ofertas:
           empresa = empresa.filter(ofertalaboral__activa=True).distinct()
        if nombre_empresa:
            empresa = empresa.filter(nombre_empresa=nombre_empresa)
        serializer = PerfilEmpresaSerializer(empresa, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EstadisticasView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not EsDocente().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        total_estudiantes = Usuario.objects.filter(role='estudiante', is_active=True).count()
        totale_empresas = Usuario.objects.filter(role='empresa').count()
        total_habilidades = Habilidades.objects.filter(estado='Aprobado').count()
        total_postulaciones = Postulacion.objects.count()
        return Response({"estudiantes_reg" : total_estudiantes,
                         "empresas_reg" : totale_empresas,
                         "habilidades_all":total_habilidades,
                         "postulaciones_all" : total_postulaciones}, status=status.HTTP_200_OK)
class QRView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:
            perfil = PerfilEstudiante.objects.get(id=id)
        except PerfilEstudiante.DoesNotExist:
            return Response({'error': 'Estudiante no registrado'}, status=status.HTTP_404_NOT_FOUND)
        qr = qrcode.make(f"http://localhost:3000/perfil/estudiante/{perfil.id}")
        buffer = io.BytesIO()
        qr.save(buffer, format='PNG')
        buffer.seek(0)
        return HttpResponse(buffer.getvalue(), content_type='image/png')


        
# Create your views here.
class RegistroEstudianteView(APIView):
    def post(self, request):
        serializer = RegistroEstudianteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Estudiante registrado'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PerfilEstudianteView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:
            perfil = PerfilEstudiante.objects.get(id=id)
        except PerfilEstudiante.DoesNotExist:
            return Response({'error': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PerfilEstudianteSerializer(perfil)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        try:
            perfil = PerfilEstudiante.objects.get(id=id)
        except PerfilEstudiante.DoesNotExist:
            return Response({'error': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)  
        if perfil.usuario != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PerfilEstudianteSerializer(perfil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class RegistroDocenteView(APIView):
    def post(self, request):
        serializer = RegistroDocenteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Docente registrado'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PerfilDocenteView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:
            perfil = PerfilDocente.objects.get(id=id)
        except PerfilDocente.DoesNotExist:
            return Response({'error': 'Docente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PerfilDocenteSerializer(perfil)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        try:
            perfil = PerfilDocente.objects.get(id=id)
        except PerfilDocente.DoesNotExist:
            return Response({'error': 'Docente no encontrado'}, status=status.HTTP_404_NOT_FOUND)  
        if perfil.usuario != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PerfilDocenteSerializer(perfil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class RegistroEmpresaView(APIView):
    def post(self, request):
        serializer = RegistroEmpresaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje': 'Empresa registrada'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PerfilEmpresaView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        try:
            perfil = PerfilEmpresa.objects.get(id=id)
        except PerfilEmpresa.DoesNotExist:
            return Response({'error': 'Empresa no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PerfilEmpresaSerializer(perfil)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        try:
            perfil = PerfilEmpresa.objects.get(id=id)
        except PerfilEmpresa.DoesNotExist:
            return Response({'error': 'Empresa no encontrada'}, status=status.HTTP_404_NOT_FOUND)  
        if perfil.usuario != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PerfilEmpresaSerializer(perfil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)