from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, PerfilEstudiante, PerfilDocente, PerfilEmpresa

class UsuarioAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Rol', {'fields': ('role',)}),
    )

admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(PerfilEstudiante)
admin.site.register(PerfilDocente)
admin.site.register(PerfilEmpresa)
