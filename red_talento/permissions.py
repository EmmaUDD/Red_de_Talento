from rest_framework.permissions import BasePermission

class EsDocente(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'docente'

class EsDocenteAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'docente' and hasattr(request.user, 'perfil_docente') and request.user.perfil_docente.es_admin

class EsEstudiante(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'estudiante'

class EsEmpresa(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'empresa'


