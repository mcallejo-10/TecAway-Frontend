import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cloudinaryTransform',
  standalone: true
})
export class CloudinaryTransformPipe implements PipeTransform {

  transform(imageUrl: string | null | undefined, width?: number, height?: number): string {
    // Si no hay URL, retornar imagen por defecto
    if (!imageUrl) {
      return '/assets/img/user_image.png';
    }

    // Si no es una URL de Cloudinary, retornar tal como está
    if (!imageUrl.includes('cloudinary.com')) {
      return imageUrl;
    }

    try {
      // Extraer la URL base y el public_id de Cloudinary
      const cloudinaryRegex = /https:\/\/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/(.+)/;
      const match = imageUrl.match(cloudinaryRegex);
      
      if (!match) {
        return imageUrl;
      }

      const [, cloudName, publicIdPart] = match;
      
      // Construir transformaciones para compatibilidad cross-browser
      const transformations = [
        'f_auto', // Formato automático (JPG para Chrome, WebP si está soportado)
        'q_auto', // Calidad automática
        width ? `w_${width}` : 'w_400', // Ancho por defecto
        height ? `h_${height}` : 'h_400', // Alto por defecto
        'c_fill', // Crop mode fill
        'g_face' // Gravity face para fotos de perfil
      ].join(',');

      // Construir la nueva URL con transformaciones
      const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicIdPart}`;
      
      console.log('🖼️ Transformando imagen:', {
        original: imageUrl,
        transformed: transformedUrl
      });

      return transformedUrl;
    } catch (error) {
      console.error('Error transformando imagen de Cloudinary:', error);
      return imageUrl;
    }
  }
}
