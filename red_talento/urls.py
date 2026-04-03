from django.urls import path
from .views import (
    RegistroEstudianteView, 
    RegistroDocenteView, 
    RegistroEmpresaView,
    ActivarEstudianteView,
    PerfilEstudianteView,
    PerfilDocenteView,
    PerfilEmpresaView,
    HabilidadesView,
    EvidenciasView,
    OfertaLaboralView,
    PostulacionView,
    
)


urlpatterns = [
    path('registro/estudiante/', RegistroEstudianteView.as_view(), name='registro_estudiante'),
    path('registro/docente/', RegistroDocenteView.as_view(), name='registro_docente'),
    path('registro/empresa/', RegistroEmpresaView.as_view(), name='registro_empresa'),
    path('estudiantes/<int:id>/activar/', ActivarEstudianteView.as_view(), name='activar_estudiante'),
    path('perfil/estudiante/<int:id>/', PerfilEstudianteView.as_view(), name='perfil_estudiante'),
    path('perfil/docente/<int:id>/', PerfilDocenteView.as_view(), name='perfil_docente'),
    path('perfil/empresa/<int:id>/', PerfilEmpresaView.as_view(), name='perfil_empresa'),
    path('habilidades/', HabilidadesView.as_view(), name='registro_habilidad'),
    path('habilidades/<int:id>/validar/', HabilidadesView.as_view(), name='validar_habilidad'),
    path('evidencias/', EvidenciasView.as_view(), name='registrar_evidencia'),
    path('evidencias/estudiante/<int:id>/', EvidenciasView.as_view(), name='ver_evidencias'),
    path('ofertas/', OfertaLaboralView.as_view(), name='ver_ofertas'),
    path('postulaciones/', PostulacionView.as_view(), name='postulaciones'),
    path('postulaciones/oferta/<int:id>/', PostulacionView.as_view(), name='postulacion_oferta'),
    path('postulaciones/<int:id>/', PostulacionView.as_view(), name='estado_postulacion'),
]