from rest_framework import permissions

#Solo el duenio del archivo lo puede eliminar
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Leer (GET, HEAD, OPTIONS) siempre permitido
        if request.method in permissions.SAFE_METHODS:
            return True
        # Solo el dueño puede editar/borrar
        return obj.usuario == request.user

#Solo el duenio puede eliminar su comentario
class EsAutorComentario(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.usuario == request.user