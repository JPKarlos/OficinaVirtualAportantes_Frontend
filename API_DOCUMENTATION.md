# 📋 API Tutelas - Documentación para Consumo

API REST para la gestión de juzgados, municipios y departamentos del sistema de tutelas.

## 🚀 Información General

- **Versión**: 0.0.1
- **Base URL**: `http://localhost:3000/api`
- **Tecnología**: NestJS + TypeORM + SQL Server
- **Base de Datos**: SIRIS_EPS
- **Última Actualización**: 01 Ago 2025

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT excepto el login.

```bash
# Header requerido en todas las requests (excepto login)
Authorization: Bearer <JWT_TOKEN>
```

### Obtener Token de Acceso

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "tu_usuario",
  "password": "tu_contraseña"
}
```

**Respuesta:**
```json
{
  "user": {
    "id": "user-id",
    "userName": "tu_usuario",
    "email": "email@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📍 Endpoints de Juzgados

### 1. Crear Juzgado

```bash
POST /api/juzgados
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nombre": "Juzgado Primero Civil de Bogotá",
  "municipioIde": 15,
  "direccion": "Calle 12 #34-56",
  "telefono": "601-2345678",
  "fax": "601-2345679",
  "correo": "juzgado1civil@ramajudicial.gov.co"
}
```

**Respuesta (201):**
```json
{
  "juzgadoId": 1,
  "nombre": "Juzgado Primero Civil de Bogotá",
  "municipioIde": 15,
  "direccion": "Calle 12 #34-56",
  "telefono": "601-2345678",
  "fax": "601-2345679",
  "correo": "juzgado1civil@ramajudicial.gov.co"
}
```

### 2. Listar Juzgados

```bash
GET /api/juzgados
Authorization: Bearer <TOKEN>

# Con filtros opcionales
GET /api/juzgados?nombre=civil&municipioIde=15&page=1&limit=10
```

**Parámetros de consulta:**
- `nombre`: Filtro por nombre (búsqueda parcial)
- `municipioIde`: Filtro por ID de municipio
- `direccion`: Filtro por dirección (búsqueda parcial)
- `telefono`: Filtro por teléfono (búsqueda parcial)
- `correo`: Filtro por correo (búsqueda parcial)
- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 10)

**Respuesta (200):**
```json
{
  "data": [
    {
      "juzgadoId": 1,
      "nombre": "Juzgado Primero Civil de Bogotá",
      "municipioIde": 15,
      "direccion": "Calle 12 #34-56",
      "telefono": "601-2345678",
      "fax": "601-2345679",
      "correo": "juzgado1civil@ramajudicial.gov.co",
      "municipio": {
        "municipioIde": 15,
        "codigo": "001",
        "descripcion": "Bogotá D.C.",
        "departamentoIde": 11,
        "zeDispGeo": 1,
        "departamento": {
          "departamentoIde": 11,
          "codigo": "11",
          "descripcion": "Cundinamarca"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 3. Obtener Juzgado por ID

```bash
GET /api/juzgados/{juzgadoId}
Authorization: Bearer <TOKEN>
```

**Respuesta (200):**
```json
{
  "juzgadoId": 1,
  "nombre": "Juzgado Primero Civil de Bogotá",
  "municipioIde": 15,
  "direccion": "Calle 12 #34-56",
  "telefono": "601-2345678",
  "fax": "601-2345679",
  "correo": "juzgado1civil@ramajudicial.gov.co",
  "municipio": {
    "municipioIde": 15,
    "codigo": "001",
    "descripcion": "Bogotá D.C.",
    "departamentoIde": 11,
    "zeDispGeo": 1,
    "departamento": {
      "departamentoIde": 11,
      "codigo": "11",
      "descripcion": "Cundinamarca"
    }
  }
}
```

### 4. Actualizar Juzgado

```bash
PATCH /api/juzgados/{juzgadoId}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "telefono": "601-9876543",
  "correo": "nuevo_correo@ramajudicial.gov.co"
}
```

**Respuesta (200):** Juzgado actualizado con los nuevos datos.

### 5. Eliminar Juzgado

```bash
DELETE /api/juzgados/{juzgadoId}
Authorization: Bearer <TOKEN>
```

**Respuesta (200):**
```json
{
  "message": "Juzgado {nombre} eliminado correctamente"
}
```

### 6. Exportar Juzgados a Excel

```bash
GET /api/juzgados/export/excel
Authorization: Bearer <TOKEN>

# Con filtros opcionales
GET /api/juzgados/export/excel?nombre=civil&municipioIde=15
```

**Parámetros de consulta (opcionales):**
- `nombre`: Filtro por nombre (búsqueda parcial)
- `municipioIde`: Filtro por ID de municipio
- `direccion`: Filtro por dirección (búsqueda parcial)
- `telefono`: Filtro por teléfono (búsqueda parcial)
- `correo`: Filtro por correo (búsqueda parcial)

**Respuesta (200):**
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="juzgados_YYYY-MM-DDTHH-MM-SS.xlsx"`
- **Body**: Archivo Excel (.xlsx) con los datos de juzgados

**Estructura del Excel:**
| Columna | Descripción |
|---------|-------------|
| ID Juzgado | Identificador único del juzgado |
| Nombre del Juzgado | Nombre completo del juzgado |
| Dirección | Dirección física |
| Teléfono | Número telefónico |
| Fax | Número de fax |
| Correo Electrónico | Email institucional |
| ID Municipio | ID del municipio |
| Código Municipio | Código DANE del municipio |
| Nombre Municipio | Nombre del municipio |
| ID Departamento | ID del departamento |
| Código Departamento | Código DANE del departamento |
| Nombre Departamento | Nombre del departamento |
| Zona Económica | Zona económica del municipio |

---

## 🏙️ Endpoints de Municipios

### Listar Municipios

```bash
GET /api/juzgados/municipios/list
Authorization: Bearer <TOKEN>

# Con búsqueda
GET /api/juzgados/municipios/list?search=bogot
```

**Respuesta (200):**
```json
[
  {
    "municipioIde": 15,
    "codigo": "001",
    "descripcion": "Bogotá D.C.",
    "departamentoIde": 11,
    "zeDispGeo": 1,
    "departamento": {
      "departamentoIde": 11,
      "codigo": "11",
      "descripcion": "Cundinamarca"
    }
  }
]
```

---

## 🗺️ Endpoints de Departamentos

### Listar Departamentos

```bash
GET /api/juzgados/departamentos/list
Authorization: Bearer <TOKEN>

# Con búsqueda
GET /api/juzgados/departamentos/list?search=cundi
```

**Respuesta (200):**
```json
[
  {
    "departamentoIde": 11,
    "codigo": "11",
    "descripcion": "Cundinamarca"
  },
  {
    "departamentoIde": 5,
    "codigo": "05",
    "descripcion": "Antioquia"
  }
]
```

---

## 📝 Validaciones de Datos

### Juzgado
- `nombre`: Requerido, máximo 500 caracteres
- `municipioIde`: Requerido, número entero positivo
- `direccion`: Opcional, máximo 250 caracteres
- `telefono`: Opcional, máximo 50 caracteres
- `fax`: Opcional, máximo 50 caracteres
- `correo`: Opcional, formato email válido, máximo 256 caracteres

### Restricciones
- No puede haber dos juzgados con el mismo nombre en el mismo municipio
- El municipio debe existir en la base de datos

---

## ❌ Códigos de Error

### Errores de Autenticación
```json
// 401 - No autorizado
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Errores de Validación
```json
// 400 - Datos inválidos
{
  "statusCode": 400,
  "message": [
    "nombre should not be empty",
    "municipioIde must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Errores de Negocio
```json
// 400 - Reglas de negocio
{
  "statusCode": 400,
  "message": "Ya existe un juzgado con el nombre \"Juzgado Civil\" en este municipio"
}
```

### Recurso No Encontrado
```json
// 404 - No encontrado
{
  "statusCode": 404,
  "message": "Juzgado con ID 999 no encontrado"
}
```

---

## 🧪 Ejemplos con cURL

### Obtener Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

### Crear Juzgado
```bash
curl -X POST http://localhost:3000/api/juzgados \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juzgado Segundo Civil de Medellín",
    "municipioIde": 45,
    "direccion": "Carrera 45 #67-89",
    "telefono": "604-1234567",
    "correo": "juzgado2civil@ramajudicial.gov.co"
  }'
```

### Listar Juzgados
```bash
curl -X GET "http://localhost:3000/api/juzgados?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener Municipios
```bash
curl -X GET "http://localhost:3000/api/juzgados/municipios/list?search=bogot" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Exportar Juzgados a Excel
```bash
# Exportar todos los juzgados
curl -X GET "http://localhost:3000/api/juzgados/export/excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output juzgados_completos.xlsx

# Exportar juzgados filtrados
curl -X GET "http://localhost:3000/api/juzgados/export/excel?nombre=civil&municipioIde=15" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output juzgados_civiles_bogota.xlsx
```

---

## 🧪 Ejemplos con JavaScript/Fetch

### Configuración Base
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = null;

// Función para hacer requests autenticadas
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
```

### Login
```javascript
async function login(username, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    authToken = response.token;
    return response;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}
```

### Crear Juzgado
```javascript
async function crearJuzgado(juzgado) {
  try {
    const response = await apiRequest('/juzgados', {
      method: 'POST',
      body: JSON.stringify(juzgado)
    });
    
    console.log('Juzgado creado:', response);
    return response;
  } catch (error) {
    console.error('Error al crear juzgado:', error);
    throw error;
  }
}

// Uso
const nuevoJuzgado = {
  nombre: "Juzgado Tercero Civil",
  municipioIde: 15,
  direccion: "Avenida 19 #123-45",
  telefono: "601-5555555",
  correo: "juzgado3civil@ramajudicial.gov.co"
};

crearJuzgado(nuevoJuzgado);
```

### Listar Juzgados
```javascript
async function listarJuzgados(filtros = {}) {
  try {
    const queryParams = new URLSearchParams(filtros).toString();
    const endpoint = `/juzgados${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await apiRequest(endpoint);
    console.log('Juzgados:', response);
    return response;
  } catch (error) {
    console.error('Error al listar juzgados:', error);
    throw error;
  }
}

// Uso
listarJuzgados({ nombre: 'civil', page: 1, limit: 5 });
```

### Obtener Municipios
```javascript
async function obtenerMunicipios(searchTerm = '') {
  try {
    const endpoint = `/juzgados/municipios/list${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`;
    const response = await apiRequest(endpoint);
    console.log('Municipios:', response);
    return response;
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    throw error;
  }
}

// Uso
obtenerMunicipios('bogot');
```

### Exportar Juzgados a Excel
```javascript
async function exportarJuzgados(filtros = {}) {
  try {
    const queryParams = new URLSearchParams(filtros).toString();
    const endpoint = `/juzgados/export/excel${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'juzgados.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('Archivo Excel descargado exitosamente');
  } catch (error) {
    console.error('Error al exportar juzgados:', error);
    throw error;
  }
}

// Uso
exportarJuzgados({ nombre: 'civil', municipioIde: 15 });
```

---

## 🧪 Ejemplos con Python/Requests

### Configuración Base
```python
import requests
import json

API_BASE_URL = 'http://localhost:3000/api'
auth_token = None

def api_request(endpoint, method='GET', data=None, params=None):
    url = f"{API_BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    
    if auth_token:
        headers['Authorization'] = f'Bearer {auth_token}'
    
    response = requests.request(
        method=method,
        url=url,
        headers=headers,
        json=data,
        params=params
    )
    
    response.raise_for_status()
    return response.json()
```

### Login
```python
def login(username, password):
    global auth_token
    try:
        response = api_request('/auth/login', 'POST', {
            'username': username,
            'password': password
        })
        auth_token = response['token']
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error en login: {e}")
        raise
```

### Crear Juzgado
```python
def crear_juzgado(juzgado_data):
    try:
        response = api_request('/juzgados', 'POST', juzgado_data)
        print(f"Juzgado creado: {response}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error al crear juzgado: {e}")
        raise

# Uso
nuevo_juzgado = {
    "nombre": "Juzgado Cuarto Civil",
    "municipioIde": 15,
    "direccion": "Calle 50 #25-30",
    "telefono": "601-7777777",
    "correo": "juzgado4civil@ramajudicial.gov.co"
}

crear_juzgado(nuevo_juzgado)
```

### Listar Juzgados
```python
def listar_juzgados(**filtros):
    try:
        response = api_request('/juzgados', params=filtros)
        print(f"Juzgados encontrados: {len(response['data'])}")
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error al listar juzgados: {e}")
        raise

# Uso
juzgados = listar_juzgados(nombre='civil', page=1, limit=10)
```

### Exportar Juzgados a Excel
```python
def exportar_juzgados_excel(**filtros):
    try:
        response = requests.get(
            f"{API_BASE_URL}/juzgados/export/excel",
            headers={'Authorization': f'Bearer {auth_token}'},
            params=filtros
        )
        
        response.raise_for_status()
        
        # Guardar archivo
        filename = f"juzgados_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        print(f"Archivo Excel guardado como: {filename}")
        return filename
    except requests.exceptions.RequestException as e:
        print(f"Error al exportar juzgados: {e}")
        raise

# Uso
exportar_juzgados_excel(nombre='civil', municipioIde=15)
```

---

## 🚀 Configuración del Entorno de Desarrollo

### Prerrequisitos
- Node.js 18+
- SQL Server
- Base de datos SIRIS_EPS configurada
- Librería xlsx para exportación a Excel

### Variables de Entorno
Crear archivo `.env`:
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=1433
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=SIRIS_EPS

# JWT
JWT_SECRET=tu_jwt_secret

# Servidor
PORT=3000
```

### Instalación y Ejecución
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

---

## 📞 Soporte

- **Proyecto**: API Tutelas
- **Versión**: 0.0.1
- **Última Actualización**: 01 Ago 2025
- **Tecnologías**: NestJS, TypeORM, SQL Server

---

## 📄 Changelog

### v0.0.1 (01 Ago 2025)
- ✅ Módulo de autenticación con JWT
- ✅ CRUD completo de juzgados
- ✅ Consulta de municipios con departamentos
- ✅ Consulta de departamentos
- ✅ Exportación a Excel de juzgados
- ✅ Validaciones de datos
- ✅ Paginación y filtros
- ✅ Manejo de errores
- ✅ Documentación completa de API