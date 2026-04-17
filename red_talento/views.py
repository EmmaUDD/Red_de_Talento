from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status
from django.db import IntegrityError
from django.db.models import Q, Value
from django.db.models.functions import Concat
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
    InsigniaEstudianteSerializer,
    CursoSerializer,
    CursoCompletadoSerializer,
    CursoCompletadoDocenteSerializer,
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
    InsigniaEstudiante,
    Curso,
    CursoCompletado,
)
from .permissions import EsDocente, EsDocenteAdmin, EsEstudiante, EsEmpresa
from rest_framework.permissions import IsAuthenticated
from .utils import score
from django.utils import timezone
from datetime import timedelta
import qrcode
import io


class LoginView(TokenObtainPairView):
    serializer_class = TokenRole


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        ROLE_MAP = {'estudiante': 'student', 'docente': 'teacher', 'empresa': 'company'}
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': ROLE_MAP.get(user.role, user.role),
            'profile_id': None,
        }
        def foto_url(perfil):
            if perfil.foto_perfil:
                return request.build_absolute_uri(perfil.foto_perfil.url)
            return None

        if user.role == 'estudiante':
            try:
                p = user.perfil_estudiante
                data.update({
                    'profile_id': p.id,
                    'especialidad': p.especialidad,
                    'curso': p.grado,
                    'validado': user.is_active,
                    'bio': p.bio or '',
                    'video_pitch': p.video_pitch or '',
                    'foto_perfil': foto_url(p),
                })
            except Exception:
                pass
        elif user.role == 'docente':
            try:
                p = user.perfil_docente
                data.update({
                    'profile_id': p.id,
                    'departamento': p.departamento,
                    'bio': p.bio or '',
                    'es_admin': p.es_admin,
                    'foto_perfil': foto_url(p),
                })
            except Exception:
                pass
        elif user.role == 'empresa':
            try:
                p = user.perfil_empresa
                data.update({
                    'profile_id': p.id,
                    'nombre_empresa': p.nombre_empresa,
                    'industria': p.industria,
                    'foto_perfil': foto_url(p),
                    'descripcion': p.descripcion or '',
                    'ubicacion': p.ubicacion or '',
                    'horario': p.horario or '',
                    'que_buscamos': p.que_buscamos or '',
                })
            except Exception:
                pass
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        for field in ['first_name', 'last_name', 'email']:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        if user.role == 'docente':
            try:
                p = user.perfil_docente
                for field in ['bio', 'departamento']:
                    if field in request.data:
                        setattr(p, field, request.data[field])
                if 'foto_perfil' in request.FILES:
                    p.foto_perfil = request.FILES['foto_perfil']
                p.save()
            except Exception:
                pass
        elif user.role == 'estudiante':
            try:
                p = user.perfil_estudiante
                if 'bio' in request.data:
                    p.bio = request.data['bio'] or None
                if 'video_pitch' in request.data:
                    p.video_pitch = request.data['video_pitch'] or None
                if 'foto_perfil' in request.FILES:
                    p.foto_perfil = request.FILES['foto_perfil']
                p.save()
            except Exception:
                pass
        elif user.role == 'empresa':
            try:
                p = user.perfil_empresa
                for field in ['nombre_empresa', 'industria', 'descripcion', 'ubicacion', 'horario', 'que_buscamos']:
                    if field in request.data:
                        setattr(p, field, request.data[field] or None)
                if 'foto_perfil' in request.FILES:
                    p.foto_perfil = request.FILES['foto_perfil']
                p.save()
            except Exception:
                pass
        return self.get(request)


class ActivarEstudianteView(APIView):
    permission_classes = [IsAuthenticated, EsDocenteAdmin]
    def patch(self, request, id):
        try:
            perfil = PerfilEstudiante.objects.get(id=id)
        except PerfilEstudiante.DoesNotExist:
            return Response({'error': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        perfil.usuario.is_active = True
        perfil.usuario.save()
        return Response({'mensaje': 'Estudiante activado'}, status=status.HTTP_200_OK)


class HabilidadesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if EsEstudiante().has_permission(request, self):
            perfil = request.user.perfil_estudiante
            habilidades = Habilidades.objects.filter(estudiante=perfil)
        elif EsDocente().has_permission(request, self):
            habilidades = Habilidades.objects.filter(estado='Pendiente')
        else:
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        serializer = HabilidadSerializer(habilidades, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        serializer = HabilidadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(estudiante=request.user.perfil_estudiante)
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

    def get(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        perfil = request.user.perfil_estudiante
        disponibilidades = Disponibilidad.objects.filter(estudiante=perfil)
        serializer = DisponibilidadSerializer(disponibilidades, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
        serializer = PublicacionFeedSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(autor=request.user)
            return Response({'mensaje': 'Publicación Creada!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        qs = PublicacionesFeed.objects.order_by('-fecha')
        autor_id = request.query_params.get('autor_id')
        if autor_id:
            qs = qs.filter(autor__id=autor_id)
        serializer = PublicacionFeedSerializer(qs, many=True, context={'request': request})
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
        if not EsDocenteAdmin().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        reportes = Reporte.objects.select_related('reportado_por', 'usuario_reportado', 'publicacion').all()
        serializer = ReporteSerializer(reportes, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        if not EsDocenteAdmin().has_permission(request, self):
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


class GestionUsuarioView(APIView):
    """Permite a docentes-admin suspender o bloquear usuarios."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        if not EsDocenteAdmin().has_permission(request, self):
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        try:
            usuario = Usuario.objects.get(id=id)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        accion = request.data.get('accion')  # 'suspender' | 'bloquear' | 'reactivar'
        dias = request.data.get('dias')       # solo para 'suspender'

        if accion == 'suspender':
            if not dias or int(dias) <= 0:
                return Response({'error': 'Indica los días de suspensión'}, status=status.HTTP_400_BAD_REQUEST)
            usuario.suspendido_hasta = timezone.now() + timedelta(days=int(dias))
            usuario.save()
            return Response({'mensaje': f'Usuario suspendido por {dias} días'}, status=status.HTTP_200_OK)

        elif accion == 'bloquear':
            usuario.is_active = False
            usuario.suspendido_hasta = None
            usuario.save()
            return Response({'mensaje': 'Usuario bloqueado permanentemente'}, status=status.HTTP_200_OK)

        elif accion == 'reactivar':
            usuario.is_active = True
            usuario.suspendido_hasta = None
            usuario.save()
            return Response({'mensaje': 'Usuario reactivado'}, status=status.HTTP_200_OK)

        return Response({'error': 'Acción no válida. Usa: suspender, bloquear, reactivar'}, status=status.HTTP_400_BAD_REQUEST)


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
        mis = request.query_params.get('mis_ofertas')
        if mis and EsEmpresa().has_permission(request, self):
            ofertas = OfertaLaboral.objects.filter(empresa=request.user.perfil_empresa, activa=True)
        else:
            ofertas = OfertaLaboral.objects.filter(activa=True)
        especialidad = request.query_params.get('especialidad_requerida')
        disponibilidad = request.query_params.get('disponibilidad_requerida')
        if especialidad:
           ofertas = ofertas.filter(especialidad_requerida__icontains=especialidad)
        if disponibilidad:
           ofertas = ofertas.filter(disponibilidad_requerida__icontains=disponibilidad)
        serializer = OfertaLaboralSerializer(ofertas, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        try:
            oferta = OfertaLaboral.objects.get(id=id)
        except OfertaLaboral.DoesNotExist:
            return Response({'error': 'Oferta no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if not EsEmpresa().has_permission(request, self):
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        if oferta.empresa.usuario != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        oferta.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

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
    
    def get(self, request, id=None):
        if id is None:
            # Estudiante: ver sus propias postulaciones
            if not EsEstudiante().has_permission(request, self):
                return Response({'error': 'Solo estudiantes pueden ver sus postulaciones'}, status=status.HTTP_403_FORBIDDEN)
            postulaciones = Postulacion.objects.filter(
                estudiante=request.user.perfil_estudiante
            ).select_related('oferta', 'oferta__empresa')
            serializer = PostulacionSerializer(postulaciones, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # Empresa: ver postulaciones de una oferta
        try:
            oferta = OfertaLaboral.objects.get(id=id)
        except OfertaLaboral.DoesNotExist:
            return Response({'error': 'Oferta sin postulaciones'}, status=status.HTTP_404_NOT_FOUND)
        if not EsEmpresa().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        if oferta.empresa != request.user.perfil_empresa:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        postulaciones = oferta.postulacion_set.select_related('estudiante', 'estudiante__usuario').all()
        serializer = PostulacionSerializer(postulaciones, many=True, context={'request': request})
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
                # Post automático del sistema en el feed
                estudiante = postulacion.estudiante
                empresa = postulacion.oferta.empresa
                nombre_estudiante = f"{estudiante.usuario.first_name} {estudiante.usuario.last_name}".strip() or estudiante.usuario.username
                nombre_empresa = empresa.nombre_empresa
                oferta_titulo = postulacion.oferta.titulo
                contenido = (
                    f"🎉 ¡{nombre_estudiante} ha conseguido empleo!\n\n"
                    f"Nos complace anunciar que {nombre_estudiante} ha sido contratado/a por "
                    f"{nombre_empresa} para el puesto de {oferta_titulo}. "
                    f"¡Felicitaciones y mucho éxito en esta nueva etapa!"
                )
                PublicacionesFeed.objects.create(
                    autor=empresa.usuario,
                    tipo='post',
                    contenido=contenido,
                )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BusquedaEstudiantesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        estudiante = PerfilEstudiante.objects.all()
        especialidad = request.query_params.get('especialidad')
        nombre = request.query_params.get('nombre')
        disponibilidad = request.query_params.get('disponibilidad')
        if especialidad:
           estudiante = estudiante.filter(especialidad__icontains=especialidad)
        if nombre:
           estudiante = estudiante.annotate(
               nombre_completo=Concat('usuario__first_name', Value(' '), 'usuario__last_name')
           ).filter(
               Q(usuario__first_name__icontains=nombre) |
               Q(usuario__last_name__icontains=nombre) |
               Q(nombre_completo__icontains=nombre)
           )
        if disponibilidad:
           estudiante = estudiante.filter(disponibilidad__disponibilidad=disponibilidad)
        serializer = PerfilEstudianteSerializer(estudiante, many=True, context={'request': request})
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
            empresa = empresa.filter(nombre_empresa__icontains=nombre_empresa)
        serializer = PerfilEmpresaSerializer(empresa, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class BusquedaDocentesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        docentes = PerfilDocente.objects.all()
        nombre = request.query_params.get('nombre')
        if nombre:
            docentes = docentes.annotate(
                nombre_completo=Concat('usuario__first_name', Value(' '), 'usuario__last_name')
            ).filter(
                Q(usuario__first_name__icontains=nombre) |
                Q(usuario__last_name__icontains=nombre) |
                Q(nombre_completo__icontains=nombre)
            )
        serializer = PerfilDocenteSerializer(docentes, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class RecomendacionesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        if not EsEmpresa().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        try:
            oferta = OfertaLaboral.objects.get(id=id)
        except OfertaLaboral.DoesNotExist:
            return Response({'error': 'Oferta no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if oferta.empresa.usuario != request.user:
            return Response({'error': 'Error de permisos'}, status=status.HTTP_403_FORBIDDEN)
        total_estudiantes = PerfilEstudiante .objects.filter(usuario__is_active=True).prefetch_related('disponibilidad', 'habilidades_set', 'evidencia_set')
        resultados = []
        for estudiante in total_estudiantes:
            data = PerfilEstudianteSerializer(estudiante).data
            data['score'] = score(estudiante, oferta)
            resultados.append(data)
        resultados.sort(key=lambda x: x['score'], reverse=True)
        return Response(resultados, status=status.HTTP_200_OK)


class RecomendacionesEmpresaView(APIView):
    """Recomendaciones de estudiantes para la empresa autenticada, basadas en su oferta más reciente."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not EsEmpresa().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        empresa = request.user.perfil_empresa
        ofertas = OfertaLaboral.objects.filter(empresa=empresa, activa=True).order_by('-fecha_publicacion')
        if not ofertas.exists():
            return Response([], status=status.HTTP_200_OK)
        oferta = ofertas.first()
        estudiantes = PerfilEstudiante.objects.filter(usuario__is_active=True).prefetch_related(
            'disponibilidad', 'habilidades_set'
        )
        resultados = []
        for est in estudiantes:
            data = PerfilEstudianteSerializer(est).data
            data['score'] = score(est, oferta)
            resultados.append(data)
        resultados.sort(key=lambda x: x['score'], reverse=True)
        return Response(resultados[:15], status=status.HTTP_200_OK)


class EstadisticasView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not EsDocente().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        total_estudiantes = Usuario.objects.filter(role='estudiante', is_active=True).count()
        total_empresas = Usuario.objects.filter(role='empresa').count()
        total_habilidades = Habilidades.objects.filter(estado='Aprobado').count()
        total_postulaciones = Postulacion.objects.count()
        total_ofertas = OfertaLaboral.objects.filter(activa=True).count()
        return Response({
            "total_estudiantes": total_estudiantes,
            "estudiantes_validados": total_estudiantes,
            "total_empresas": total_empresas,
            "total_ofertas_activas": total_ofertas,
            "postulaciones_este_mes": total_postulaciones,
            "total_habilidades": total_habilidades,
            "por_especialidad": [],
        }, status=status.HTTP_200_OK)
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
        serializer = PerfilEstudianteSerializer(perfil, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        try:
            perfil = PerfilEstudiante.objects.get(id=id)
        except PerfilEstudiante.DoesNotExist:
            return Response({'error': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PerfilEstudianteSerializer(perfil, data=request.data, partial=True, context={'request': request})
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
        serializer = PerfilDocenteSerializer(perfil, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        try:
            perfil = PerfilDocente.objects.get(id=id)
        except PerfilDocente.DoesNotExist:
            return Response({'error': 'Docente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PerfilDocenteSerializer(perfil, data=request.data, partial=True, context={'request': request})
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
        serializer = PerfilEmpresaSerializer(perfil, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id):
        try:
            perfil = PerfilEmpresa.objects.get(id=id)
        except PerfilEmpresa.DoesNotExist:
            return Response({'error': 'Empresa no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if perfil.usuario != request.user:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PerfilEmpresaSerializer(perfil, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CursoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not EsDocente().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CursoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(publicado_por=request.user.perfil_docente)
            return Response({'mensaje': 'Curso publicado'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        cursos = Curso.objects.select_related('publicado_por__usuario').all()
        especialidad = request.query_params.get('especialidad')
        q = request.query_params.get('q')
        mios = request.query_params.get('mios')
        if especialidad:
            cursos = cursos.filter(especialidad__icontains=especialidad)
        if q:
            cursos = cursos.filter(
                Q(titulo__icontains=q) | Q(descripcion__icontains=q) | Q(especialidad__icontains=q)
            )
        if mios and EsDocente().has_permission(request, self):
            cursos = cursos.filter(publicado_por=request.user.perfil_docente)
        serializer = CursoSerializer(cursos, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CursoCompletadoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Estudiante: ve sus propios cursos inscritos
        if EsEstudiante().has_permission(request, self):
            inscritos = CursoCompletado.objects.filter(
                estudiante=request.user.perfil_estudiante
            ).select_related('curso__publicado_por__usuario')
            serializer = CursoCompletadoSerializer(inscritos, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        # Docente: ve los pendientes de sus cursos
        if EsDocente().has_permission(request, self):
            pendientes = CursoCompletado.objects.filter(
                curso__publicado_por=request.user.perfil_docente,
                estado='pendiente'
            ).select_related('curso', 'estudiante__usuario')
            serializer = CursoCompletadoDocenteSerializer(pendientes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CursoCompletadoSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(estudiante=request.user.perfil_estudiante)
            except IntegrityError:
                return Response({'error': 'Ya estás inscrito en este curso'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'mensaje': 'Inscripción realizada, pendiente de validación'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        if not EsDocente().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        try:
            completado = CursoCompletado.objects.get(id=id)
        except CursoCompletado.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if completado.curso.publicado_por != request.user.perfil_docente:
            return Response({'error': 'Solo el docente dueño del curso puede validarlo'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CursoCompletadoSerializer(completado, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InsigniasEstudianteView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not EsEstudiante().has_permission(request, self):
            return Response({'error': 'Usuario sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        perfil = request.user.perfil_estudiante
        insignias = InsigniaEstudiante.objects.filter(estudiante=perfil)
        serializer = InsigniaEstudianteSerializer(insignias, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)