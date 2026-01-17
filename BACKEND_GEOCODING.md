# 🗺️ Implementación de Geocodificación en Backend (Node.js + Express)

## 📦 1. Instalación de Dependencias

```bash
npm install node-fetch@2
# O si usas ES modules:
npm install node-fetch@3
```

## 🔧 2. Servicio de Geocodificación (Backend)

Crea `services/geocoding.service.js`:

```javascript
// services/geocoding.service.js
const fetch = require('node-fetch'); // node-fetch@2
// O para ES modules: import fetch from 'node-fetch';

class GeocodingService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
    this.userAgent = 'TecAway-Backend/1.0 (contact@tecaway.com)'; // ⚠️ IMPORTANTE: Cambiar email
    this.cache = new Map(); // Cache simple en memoria
  }

  /**
   * Geocodifica una ciudad a coordenadas
   * @param {string} town - Nombre de la ciudad
   * @param {string} country - Código del país (ES, AR, etc.)
   * @returns {Promise<{latitude: number, longitude: number} | null>}
   */
  async geocodeTown(town, country = '') {
    // Verificar cache
    const cacheKey = `${town}_${country}`;
    if (this.cache.has(cacheKey)) {
      console.log(`📍 Cache hit for: ${cacheKey}`);
      return this.cache.get(cacheKey);
    }

    try {
      // Respetar límite de 1 request/segundo
      await this.rateLimit();

      const query = country ? `${town}, ${country}` : town;
      const url = `${this.baseUrl}/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json` +
        `&limit=1` +
        `&addressdetails=1`;

      console.log(`🌍 Geocoding: ${query}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };

        // Guardar en cache
        this.cache.set(cacheKey, result);
        
        return result;
      }

      console.warn(`⚠️ No results for: ${query}`);
      return null;

    } catch (error) {
      console.error('❌ Geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Rate limiting: espera 1 segundo entre requests
   */
  async rateLimit() {
    const now = Date.now();
    const lastRequest = this.lastRequestTime || 0;
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < 1000) {
      const waitTime = 1000 - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Geocodifica múltiples ciudades respetando rate limit
   * @param {Array<{town: string, country?: string}>} locations
   * @returns {Promise<Array<{town: string, coordinates: object | null}>>}
   */
  async geocodeBatch(locations) {
    const results = [];

    for (const location of locations) {
      const coordinates = await this.geocodeTown(location.town, location.country);
      results.push({
        town: location.town,
        country: location.country,
        coordinates
      });
    }

    return results;
  }
}

module.exports = new GeocodingService();
// O para ES modules: export default new GeocodingService();
```

## 🛣️ 3. Rutas de API (Express)

Crea `routes/geocoding.routes.js`:

```javascript
// routes/geocoding.routes.js
const express = require('express');
const router = express.Router();
const geocodingService = require('../services/geocoding.service');

/**
 * POST /api/geocode
 * Geocodifica una ciudad
 * 
 * Body: { town: "Madrid", country: "ES" }
 * Response: { latitude: 40.4168, longitude: -3.7038 }
 */
router.post('/geocode', async (req, res) => {
  try {
    const { town, country } = req.body;

    if (!town) {
      return res.status(400).json({ 
        error: 'Town is required' 
      });
    }

    const coordinates = await geocodingService.geocodeTown(town, country);

    if (!coordinates) {
      return res.status(404).json({ 
        error: 'Location not found' 
      });
    }

    res.json(coordinates);

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
```

Registra las rutas en `app.js`:

```javascript
// app.js
const geocodingRoutes = require('./routes/geocoding.routes');

app.use('/api', geocodingRoutes);
```

## 📝 4. Actualizar Modelo de Usuario

Actualiza tu modelo de usuario para incluir coordenadas:

```javascript
// models/user.model.js
const userSchema = new Schema({
  // ... campos existentes
  town: { type: String },
  
  // NUEVOS CAMPOS
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String },
  postal_code: { type: String }
});
```

## 🔄 5. Middleware para Geocodificar Automáticamente

```javascript
// middleware/geocode.middleware.js
const geocodingService = require('../services/geocoding.service');

/**
 * Middleware que geocodifica automáticamente cuando se crea/actualiza usuario
 */
async function geocodeUserLocation(req, res, next) {
  try {
    // Solo geocodificar si hay town y NO hay coordenadas
    if (req.body.town && (!req.body.latitude || !req.body.longitude)) {
      console.log('🗺️ Auto-geocoding user location...');
      
      // Detectar país basado en algún campo (o usar valor por defecto)
      const country = req.body.country || 'ES'; // Por defecto España
      
      const coordinates = await geocodingService.geocodeTown(
        req.body.town, 
        country
      );

      if (coordinates) {
        req.body.latitude = coordinates.latitude;
        req.body.longitude = coordinates.longitude;
        console.log(`✅ Geocoded: ${req.body.town} -> ${coordinates.latitude}, ${coordinates.longitude}`);
      } else {
        console.warn(`⚠️ Could not geocode: ${req.body.town}`);
      }
    }

    next();
  } catch (error) {
    console.error('Geocoding middleware error:', error);
    next(); // Continuar aunque falle el geocoding
  }
}

module.exports = geocodeUserLocation;
```

Úsalo en tus rutas:

```javascript
// routes/user.routes.js
const geocodeMiddleware = require('../middleware/geocode.middleware');

// Al crear usuario
router.post('/register', 
  geocodeMiddleware,  // 👈 Geocodifica automáticamente
  userController.register
);

// Al actualizar perfil
router.put('/profile/:id', 
  authMiddleware,
  geocodeMiddleware,  // 👈 Geocodifica automáticamente
  userController.updateProfile
);
```

## 🔄 6. Script de Migración para Usuarios Existentes

Crea `scripts/migrate-geocode-users.js`:

```javascript
// scripts/migrate-geocode-users.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const geocodingService = require('../services/geocoding.service');

async function migrateUsers() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Buscar usuarios SIN coordenadas pero CON ciudad
    const usersToGeocode = await User.find({
      town: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { latitude: { $exists: false } },
        { latitude: null },
        { longitude: { $exists: false } },
        { longitude: null }
      ]
    });

    console.log(`📊 Found ${usersToGeocode.length} users to geocode`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < usersToGeocode.length; i++) {
      const user = usersToGeocode[i];
      
      console.log(`\n[${i + 1}/${usersToGeocode.length}] Processing: ${user.town}`);

      // Detectar país (puedes mejorarlo con lógica más sofisticada)
      const country = detectCountry(user.town);
      
      const coordinates = await geocodingService.geocodeTown(user.town, country);

      if (coordinates) {
        user.latitude = coordinates.latitude;
        user.longitude = coordinates.longitude;
        await user.save();
        
        console.log(`✅ Geocoded: ${user.town} (${country}) -> ${coordinates.latitude}, ${coordinates.longitude}`);
        successCount++;
      } else {
        console.warn(`❌ Failed to geocode: ${user.town}`);
        failCount++;
      }

      // Progreso
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${usersToGeocode.length}`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Geocoded: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
}

/**
 * Detecta el país basado en la ciudad
 * Puedes mejorarlo con una lista de ciudades conocidas
 */
function detectCountry(town) {
  const townLower = town.toLowerCase();
  
  // Ciudades españolas conocidas
  const spanishCities = ['madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza', 'málaga', 'murcia', 'palma', 'bilbao'];
  if (spanishCities.some(city => townLower.includes(city))) {
    return 'ES';
  }
  
  // Ciudades argentinas conocidas
  const argentinianCities = ['buenos aires', 'córdoba', 'rosario', 'mendoza', 'tucumán', 'la plata'];
  if (argentinianCities.some(city => townLower.includes(city))) {
    return 'AR';
  }
  
  // Por defecto, España (o puedes dejarlo vacío)
  return 'ES';
}

// Ejecutar migración
migrateUsers();
```

Ejecuta el script:

```bash
node scripts/migrate-geocode-users.js
```

## 📋 7. Recomendaciones Importantes

### ⚠️ Límites de Nominatim
- **1 request por segundo** (respetado en el código)
- Para producción con mucho tráfico, considera cachear
- Lee los [términos de uso](https://operations.osmfoundation.org/policies/nominatim/)

### 💾 Cache
- El código incluye cache en memoria
- Para producción, usa Redis o similar
- Cachea ciudades geocodificadas permanentemente

### 🌍 Detección de País
- Mejora `detectCountry()` con tu lógica de negocio
- Puedes pedir el país al usuario en el registro
- O usar algún servicio de detección de IP

### 🔒 User-Agent
- **OBLIGATORIO**: Cambia el email en `userAgent`
- Nominatim bloquea requests sin User-Agent válido

## 🧪 8. Testing

```javascript
// Test en Postman o curl
curl -X POST http://localhost:3000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"town": "Madrid", "country": "ES"}'

// Respuesta esperada:
// {
//   "latitude": 40.4168,
//   "longitude": -3.7038
// }
```

## 🎯 Siguiente Paso

Una vez implementado esto en backend, el frontend puede:
1. Confiar en que los usuarios nuevos ya tienen coordenadas
2. Usar `LocationService.calculateDistance()` para filtrar
3. Mostrar distancias en las tarjetas de técnicos

¿Necesitas ayuda con algún paso específico?
