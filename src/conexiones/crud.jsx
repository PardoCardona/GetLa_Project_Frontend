import back from "./back";

/**
 * Clase CRUD para manejo genérico de peticiones HTTP (GET, POST, PUT, DELETE)
 * Permite agregar fácilmente headers personalizados en cada llamada.
 */
class crud {
  /**
   * Construye los headers de la petición, mezclando los headers por defecto
   * (incluyendo el token) con los headers personalizados que se pasen por parámetro.
   * @param {object} customHeaders - Headers personalizados (opcional).
   * @returns {object} - Objeto con los headers para fetch.
   */
  _buildHeaders(customHeaders = {}) {
    const token = localStorage.getItem("token");
    // Headers por defecto para todas las peticiones
    const defaultHeaders = {
      "Content-Type": "application/json",
      "x-auth-token": token ? token : "",
    };
    // Mezcla los personalizados, sobrescribiendo los de default si hay conflicto
    return { ...defaultHeaders, ...customHeaders };
  }

  /**
   * Método GET genérico.
   * @param {string} resource - Ruta del recurso (ejemplo: "/api/productos").
   * @param {object} options - Objeto opcional. Puedes enviar headers personalizados así: { headers: {...} }
   * @returns {Promise<object>} - Respuesta del backend en formato JSON.
   */
  async GET(resource, options = {}) {
    const headers = this._buildHeaders(options.headers);

    let url = `${back.api.baseURL}${resource}`;
    // Si necesitas manejar queryParams en el futuro, puedes agregarlos aquí.

    try {
      const resp = await fetch(url, { method: "GET", headers });
      const contentType = resp.headers.get("content-type");
      // Si la respuesta es JSON, la retorna; si no, retorna objeto vacío
      const json =
        contentType && contentType.includes("application/json")
          ? await resp.json()
          : {};
      return json;
    } catch (e) {
      return { ok: false, msg: "Error de red al consultar GET" };
    }
  }

  /**
   * Método POST genérico.
   * @param {string} resource - Ruta del recurso.
   * @param {object} body - Cuerpo de la petición (objeto JS).
   * @param {object} options - Opcional. Puedes enviar headers personalizados así: { headers: {...} }
   * @returns {Promise<object>} - Respuesta del backend en formato JSON.
   */
  async POST(resource, body, options = {}) {
    const headers = this._buildHeaders(options.headers);

    const url = `${back.api.baseURL}${resource}`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers,
      });
      const contentType = resp.headers.get("content-type");
      const json =
        contentType && contentType.includes("application/json")
          ? await resp.json()
          : {};
      return json;
    } catch (e) {
      return { ok: false, msg: "Error de red al crear recurso" };
    }
  }

  /**
   * Método PUT genérico.
   * @param {string} resource - Ruta del recurso.
   * @param {object} body - Cuerpo de la petición (objeto JS).
   * @param {object} options - Opcional. Puedes enviar headers personalizados así: { headers: {...} }
   * @returns {Promise<object>} - Respuesta del backend en formato JSON.
   */
  async PUT(resource, body, options = {}) {
    const headers = this._buildHeaders(options.headers);

    const url = `${back.api.baseURL}${resource}`;
    try {
      const resp = await fetch(url, {
        method: "PUT",
        body: body ? JSON.stringify(body) : null,
        headers,
      });
      const contentType = resp.headers.get("content-type");
      const json =
        contentType && contentType.includes("application/json")
          ? await resp.json()
          : {};
      return json;
    } catch (e) {
      return { ok: false, msg: "Error de red al actualizar recurso" };
    }
  }

  /**
   * Método DELETE genérico.
   * @param {string} resource - Ruta del recurso.
   * @param {object} options - Opcional. Puedes enviar headers personalizados así: { headers: {...} }
   * @returns {Promise<object>} - Respuesta del backend en formato JSON.
   */
  async DELETE(resource, options = {}) {
    const headers = this._buildHeaders(options.headers);

    const url = `${back.api.baseURL}${resource}`;
    try {
      const resp = await fetch(url, { method: "DELETE", headers });
      const contentType = resp.headers.get("content-type");
      const json =
        contentType && contentType.includes("application/json")
          ? await resp.json()
          : {};
      return json;
    } catch (e) {
      return { ok: false, msg: "Error de red al eliminar recurso" };
    }
  }
}

// Exporta la instancia lista para usar en cualquier componente/modulo
export default new crud();
