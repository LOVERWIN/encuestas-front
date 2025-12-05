import apiClient from '../config/axios';

// =======================================================
// === FUNCIONES PARA EL PANEL DE ADMINISTRADOR
// =======================================================

/**
 * Obtiene la lista paginada de todas las encuestas.
 */
export const getEncuestas = (page = 1) => {
  return apiClient.get(`/encuestas?page=${page}`);
};

/**
 * Crea una nueva encuesta.
 * @param {Object} datosEncuesta - { titulo, descripcion, etc. }
 */
export const createEncuesta = (datosEncuesta) => {
  return apiClient.post('/encuestas', datosEncuesta);
};


export const updateEncuesta = (slug, datosEncuesta) => {
  return apiClient.put(`/encuestas/${slug}`, datosEncuesta);
};

/**
 * Elimina una encuesta.
 * @param {number} id - El ID de la encuesta.
 */
export const deleteEncuesta = (slug) => {
  return apiClient.delete(`/encuestas/${slug}`);
};

// --- Funciones para gestionar preguntas (ya las tenías y están bien) ---

export const addPregunta = (encuestaId, preguntaData) => {
  return apiClient.post(`/encuestas/${encuestaId}/preguntas`, preguntaData);
}

export const updatePregunta = (preguntaId, preguntaData) => {
  return apiClient.put(`/preguntas/${preguntaId}`, preguntaData);
}

export const deletePregunta = (preguntaId) => {
  return apiClient.delete(`/preguntas/${preguntaId}`);
}


// =======================================================
// === FUNCIONES PARA EL USUARIO FINAL
// =======================================================

/**
 * Obtiene los datos de una encuesta pública por su slug.
 */
export const getSurveyBySlug = (slug) => {
  return apiClient.get(`/surveys/${slug}`); 
};

/**
 * Envía las respuestas de un usuario para una encuesta.
 */
export const submitSurveyResponse = (slug, respuestas) => {
  const formData = new FormData();
  for (const preguntaId in respuestas) {
    const valor = respuestas[preguntaId];
    if (Array.isArray(valor)) {
      valor.forEach(opcionId => {
        formData.append(`respuestas[${preguntaId}][]`, opcionId);
      });
    } else {
      formData.append(`respuestas[${preguntaId}]`, valor);
    }
  }
  return apiClient.post(`/encuestas/${slug}/responses`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const searchUsers = (query) => {
  return apiClient.get(`/users/search?q=${query}`);
};

export const syncInvitados = (encuestaId, invitadosIds, emailListString) => {
  return apiClient.post(`/encuestas/${encuestaId}/invitados`, { 
    invitados: invitadosIds,
    emails: emailListString,
  })
};


export const getEncuestaForEditor = (slug) => {
  // Llama al endpoint de apiResource, no al público
  return apiClient.get(`/editor/encuestas/${slug}`);
};


