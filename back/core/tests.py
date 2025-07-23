from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from rest_framework import status
from .models import Material
from .models import Favorito
from .models import Comentario
import base64

# Prueba de Registro ---------------------------------------------------------------
User = get_user_model()

class RegistroUsuarioTest(APITestCase):
    def setUp(self):
        self.url = reverse('register')
        self.user_data = {
            "email": "prueba@correo.com",
            "first_name": "Juan",
            "last_name": "Pérez",
            "password": "superclave123",
            "recaptcha_token": "dummy-token"
        }

    @patch('core.serializers.RegisterSerializer.validate_recaptcha_token')
    def test_registro_exitoso(self, mock_captcha):
        mock_captcha.return_value = "dummy-token"

        response = self.client.post(self.url, self.user_data, format='json')
        self.assertEqual(response.status_code, 201)
        # El usuario se crea pero no está verificado aún
        user = User.objects.get(email="prueba@correo.com")
        self.assertEqual(user.first_name, "Juan")
        self.assertFalse(user.is_verified)

        # Que no guarde el password plano
        self.assertNotEqual(user.password, "superclave123")
        self.assertTrue(user.check_password("superclave123"))

        print("Registro de usuario exitoso y mock de reCAPTCHA funcionando")


#Prueba de Login ---------------------------------------------------
class LoginUsuarioTest(APITestCase):
    def setUp(self):
        self.login_url = reverse('login')
        self.password = 'superclave123'
        self.user = User.objects.create_user(
            email='login@correo.com',
            first_name='Mario',
            last_name='López',
            password=self.password
        )

    def test_login_rechazado_no_verificado(self):
        # Por default no está verificado
        response = self.client.post(self.login_url, {
            'email': self.user.email,
            'password': self.password
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Cuenta no verificada', response.data['error'])
        print("Login rechazado para usuario no verificado")

    def test_login_exitoso_verificado(self):
        self.user.is_verified = True
        self.user.save()
        response = self.client.post(self.login_url, {
            'email': self.user.email,
            'password': self.password
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        print("Login exitoso para usuario verificado")


# Prueba para ver perfil de usuarui autentificado -------------------------------
class PerfilUsuarioTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='perfil@correo.com',
            first_name='Luisa',
            last_name='Bravo',
            password='claveperfil',
            is_verified=True
        )
        self.client.force_authenticate(self.user)
        self.url = reverse('profile')

    def test_ver_perfil(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'perfil@correo.com')
        self.assertEqual(response.data['first_name'], 'Luisa')
        print("El usuario autenticado puede ver su perfil.")

    def test_editar_perfil(self):
        response = self.client.patch(self.url, {"first_name": "Lulu", "last_name": "Bravísima"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['first_name'], 'Lulu')
        self.assertEqual(response.data['last_name'], 'Bravísima')
        print("El usuario puede editar su perfil.")


# Peueba con los materiales ---------------------------------

class MaterialPDFTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="blobuser@correo.com", password="claveblob", is_verified=True
        )
        self.other_user = User.objects.create_user(
            email="otro@correo.com", password="claveblob", is_verified=True
        )
        self.client.force_authenticate(self.user)
        self.url = reverse('material-list-create')

        # Un archivo PDF fake en base64
        self.fake_pdf_bytes = b'%PDF-1.4 fake pdf data'
        self.base64_pdf = base64.b64encode(self.fake_pdf_bytes).decode('utf-8')

    def test_crear_material_pdf(self):
        data = {
            "titulo": "Material PDF",
            "descripcion": "PDF de prueba",
            "tipo": "ficha",
            "archivo_blob": self.base64_pdf,
            "archivo_nombre": "test.pdf",
            "archivo_tipo": "application/pdf"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, 201)
        mat = Material.objects.last()
        self.assertEqual(mat.archivo_tipo, "application/pdf")
        self.assertEqual(mat.archivo_nombre, "test.pdf")
        print("Material PDF creado correctamente.")

    def test_listar_mis_materiales_pdf(self):
        Material.objects.create(
            titulo="MíoPDF",
            tipo="ficha",
            usuario=self.user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf",
            archivo_nombre="yo.pdf"
        )
        Material.objects.create(
            titulo="De otro PDF",
            tipo="ficha",
            usuario=self.other_user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf",
            archivo_nombre="otro.pdf"
        )
        response = self.client.get(self.url)
        titulos = [m['titulo'] for m in response.data]
        self.assertIn("MíoPDF", titulos)
        self.assertNotIn("De otro PDF", titulos)
        print("Solo veo mis propios materiales PDF.")

    def test_editar_titulo_material_pdf(self):
        mat = Material.objects.create(
            titulo="PDF antiguo",
            tipo="ficha",
            usuario=self.user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf",
            archivo_nombre="viejo.pdf"
        )
        url = reverse('material-detail', args=[mat.pk])
        response = self.client.patch(url, {
            "titulo": "PDF actualizado"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['titulo'], "PDF actualizado")
        print("Edité el título del material PDF.")

    def test_no_puedo_editar_material_pdf_de_otro(self):
        mat = Material.objects.create(
            titulo="AjenoPDF",
            tipo="ficha",
            usuario=self.other_user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf"
        )
        url = reverse('material-detail', args=[mat.pk])
        response = self.client.patch(url, {
            "titulo": "Hackeado"
        })
        self.assertEqual(response.status_code, 403)
        print("No puedo editar material PDF ajeno (permiso OK).")

    def test_borrar_material_pdf(self):
        mat = Material.objects.create(
            titulo="Borrar PDF",
            tipo="ficha",
            usuario=self.user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf"
        )
        url = reverse('material-detail', args=[mat.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Material.objects.filter(pk=mat.pk).exists())
        print("Material PDF borrado correctamente.")

    def test_no_puedo_borrar_material_pdf_de_otro(self):
        mat = Material.objects.create(
            titulo="No borres PDF",
            tipo="ficha",
            usuario=self.other_user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf"
        )
        url = reverse('material-detail', args=[mat.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)
        print("No puedo borrar material PDF ajeno (permiso OK).")


# PRueba de Descargas -----------------------------------

class MaterialDownloadTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="downuser@correo.com", password="clavedown", is_verified=True
        )
        self.other_user = User.objects.create_user(
            email="other@correo.com", password="clavedown", is_verified=True
        )
        self.client.force_authenticate(self.user)

        self.fake_pdf_bytes = b'%PDF-1.4 fake pdf data'
        self.material = Material.objects.create(
            titulo="Descargable",
            tipo="ficha",
            usuario=self.user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf",
            archivo_nombre="descargar.pdf"
        )
        self.other_material = Material.objects.create(
            titulo="De otro",
            tipo="ficha",
            usuario=self.other_user,
            archivo_blob=b'%PDF-1.4 otro pdf',
            archivo_tipo="application/pdf",
            archivo_nombre="otro.pdf"
        )

    def test_descargar_mi_material(self):
        url = reverse('material-download', args=[self.material.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], "application/pdf")
        self.assertEqual(response['Content-Disposition'], 'attachment; filename="descargar.pdf"')
        self.assertEqual(response.content, self.fake_pdf_bytes)
        print("⬇Descarga correcta de mi propio material.")

    def test_descargar_material_de_otro(self):
        url = reverse('material-download', args=[self.other_material.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200) 
        print("Descarga permitida de material ajeno")

    def test_descargar_material_inexistente(self):
        url = reverse('material-download', args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
        print("Descarga de material inexistente da 404.")

# Prueba de Favoritos ---------------------

class FavoritoTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="favo@correo.com", password="clavefavo", is_verified=True
        )
        self.other_user = User.objects.create_user(
            email="noesyo@correo.com", password="clavefavo", is_verified=True
        )
        self.client.force_authenticate(self.user)
        self.fake_pdf_bytes = b'%PDF-1.4 favorite'
        # Crea 2 materiales, uno propio y otro ajeno
        self.mat_mio = Material.objects.create(
            titulo="MiMaterial", tipo="ficha", usuario=self.user,
            archivo_blob=self.fake_pdf_bytes, archivo_tipo="application/pdf"
        )
        self.mat_ajeno = Material.objects.create(
            titulo="DeOtro", tipo="ficha", usuario=self.other_user,
            archivo_blob=self.fake_pdf_bytes, archivo_tipo="application/pdf"
        )
        self.url = reverse('favorito-list')

    def test_agregar_favorito_propio(self):
        data = {"material": self.mat_mio.pk}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Favorito.objects.filter(usuario=self.user, material=self.mat_mio).exists())
        print("Agregué mi material a favoritos.")

    def test_agregar_favorito_ajeno(self):
        data = {"material": self.mat_ajeno.pk}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Favorito.objects.filter(usuario=self.user, material=self.mat_ajeno).exists())
        print("Puedo agregar material ajeno a favoritos (esto es normal, es tipo like).")

    def test_no_puedo_duplicar_favorito(self):
        Favorito.objects.create(usuario=self.user, material=self.mat_mio)
        data = {"material": self.mat_mio.pk}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("ya está en tus favoritos", str(response.data).lower())
        print("No puedo duplicar un favorito (unicidad protegida, error controlado).")

    def test_listar_solo_mis_favoritos(self):
        f1 = Favorito.objects.create(usuario=self.user, material=self.mat_mio)
        Favorito.objects.create(usuario=self.other_user, material=self.mat_ajeno)
        response = self.client.get(self.url)
        # Verifica que solo aparezcan favoritos del usuario autenticado
        materiales = [fav['material'] for fav in response.data]
        self.assertIn(self.mat_mio.pk, materiales)
        self.assertNotIn(self.mat_ajeno.pk, materiales)
        print("Solo veo mis favoritos.")

    def test_borrar_favorito(self):
        fav = Favorito.objects.create(usuario=self.user, material=self.mat_mio)
        url = reverse('favorito-detail', args=[fav.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Favorito.objects.filter(pk=fav.pk).exists())
        print("Eliminé un favorito correctamente.")

    def test_no_puedo_borrar_favorito_ajeno(self):
        fav = Favorito.objects.create(usuario=self.other_user, material=self.mat_ajeno)
        url = reverse('favorito-detail', args=[fav.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)  
        print("No puedo borrar favorito ajeno (ni lo veo en la lista).")


# Comentarios --------------------------------------

class ComentarioTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="comenta@correo.com", password="clavecom", is_verified=True
        )
        self.other_user = User.objects.create_user(
            email="otrocom@correo.com", password="clavecom", is_verified=True
        )
        self.client.force_authenticate(self.user)
        self.fake_pdf_bytes = b'%PDF-1.4 coment'
        self.material = Material.objects.create(
            titulo="Material Comentado",
            tipo="ficha",
            usuario=self.other_user,
            archivo_blob=self.fake_pdf_bytes,
            archivo_tipo="application/pdf"
        )
        self.url = reverse('comentario-list')

    def test_crear_comentario(self):
        data = {
            "material": self.material.pk,
            "texto": "¡Buen material!",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Comentario.objects.count(), 1)
        self.assertEqual(Comentario.objects.first().usuario, self.user)
        print("Comentario creado correctamente.")

    def test_listar_comentarios_por_material(self):
        c1 = Comentario.objects.create(material=self.material, usuario=self.user, texto="Uno")
        c2 = Comentario.objects.create(material=self.material, usuario=self.other_user, texto="Dos")
        url = self.url + f"?material={self.material.pk}"
        response = self.client.get(url)
        textos = [c['texto'] for c in response.data]
        self.assertIn("Uno", textos)
        self.assertIn("Dos", textos)
        print("Listado de comentarios de un material OK.")

    def test_editar_mi_comentario(self):
        c = Comentario.objects.create(material=self.material, usuario=self.user, texto="Viejo")
        url = reverse('comentario-detail', args=[c.pk])
        response = self.client.patch(url, {"texto": "Actualizado"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['texto'], "Actualizado")
        print("Comentario editado por su autor.")

    def test_no_puedo_editar_comentario_ajeno(self):
        c = Comentario.objects.create(material=self.material, usuario=self.other_user, texto="Ajeno")
        url = reverse('comentario-detail', args=[c.pk])
        response = self.client.patch(url, {"texto": "Hack"})
        self.assertEqual(response.status_code, 403)
        print("No puedo editar comentario ajeno.")

    def test_borrar_mi_comentario(self):
        c = Comentario.objects.create(material=self.material, usuario=self.user, texto="Para borrar")
        url = reverse('comentario-detail', args=[c.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Comentario.objects.filter(pk=c.pk).exists())
        print("Comentario borrado por su autor.")

    def test_no_puedo_borrar_comentario_ajeno(self):
        c = Comentario.objects.create(material=self.material, usuario=self.other_user, texto="No borres")
        url = reverse('comentario-detail', args=[c.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)
        print("No puedo borrar comentario ajeno.")

    def test_comentario_requiere_texto(self):
        data = {"material": self.material.pk}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("texto", response.data)
        print("No se puede crear comentario vacío.")
