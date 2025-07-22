import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UploadCloud, FileText, Video, Image, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { uploadMaterial } from "../api/materials"; 

const MATERIAL_TYPES = [
  { value: "ficha", icon: FileText, label: "materials.worksheet" },
  { value: "presentacion", icon: Image, label: "materials.presentation" },
  { value: "video", icon: Video, label: "materials.video" },
];

const MaterialUpload: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "ficha",
    archivo: null as File | null,
    video_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      tipo: value,
      archivo: null,
      video_url: "",
    }));
    // Limpia el input file si está presente
    const fileInput = document.querySelector('input[name="archivo"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    // Validación explícita
    if (form.tipo === "video" && !form.video_url) {
      setError(t("materials.videoUrlRequired"));
      return;
    }
    if (form.tipo !== "video" && !form.archivo) {
      setError(t("materials.fileRequired"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await uploadMaterial(
        {
          titulo: form.titulo,
          descripcion: form.descripcion,
          tipo: form.tipo,
          archivo: form.tipo !== "video" ? form.archivo! : undefined,
          video_url: form.tipo === "video" ? form.video_url : undefined,
        },
        token
      );
      navigate("/my-materials");
    } catch (err: any) {
      setError(err.message || t("materials.loadingError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "archivo") {
      setForm((prev) => ({ ...prev, archivo: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center">
            <UploadCloud className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
          {t("materials.uploadNewTitle")}
        </h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          {t("materials.uploadDescription")}
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
              {t("materials.title")}
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              value={form.titulo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder={t("materials.titlePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              {t("materials.description")}
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              required
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder={t("materials.descriptionPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
              {t("materials.selectType")}
            </label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleTypeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {MATERIAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Campo condicional para archivo o URL de video */}
          {form.tipo === "video" ? (
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                {t("materials.videoUrl")}
              </label>
              <input
                id="video_url"
                name="video_url"
                type="url"
                value={form.video_url}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="archivo" className="block text-sm font-medium text-gray-700">
                {t("materials.selectFile")}
              </label>
              <input
                id="archivo"
                name="archivo"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.jpeg"
                onChange={handleChange}
                className="mt-1 block w-full text-gray-700"
                required={form.tipo !== "video"}
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
              ) : (
                <UploadCloud className="w-5 h-5 mr-2" />
              )}
              {t("common.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialUpload;
