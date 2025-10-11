import apiClient from '../config/axios';

export const getReporte = (slug) => {
  return apiClient.get(`/api/encuestas/${slug}/reporte`);
};

export const getRespuestasAbiertas = (preguntaId, page = 1) => {
  return apiClient.get(`/api/preguntas/${preguntaId}/respuestas?page=${page}`);
};

export const exportReporte = (slug, format) => {
  return apiClient.get(`/api/encuestas/${slug}/export?format=${format}`, {
    responseType: 'blob', // ¡Muy importante! Le dice a Axios que espere un archivo
  });
};