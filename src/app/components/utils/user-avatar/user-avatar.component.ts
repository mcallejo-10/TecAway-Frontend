import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryTransformPipe } from '../../../pipes/cloudinary-transform.pipe';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, CloudinaryTransformPipe],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent implements OnInit, OnChanges {
  @Input() photo: string | null | undefined = null;
  @Input() name = '';
  @Input() size = 50;

  hasValidPhoto = true;

  ngOnInit() {
    this.checkPhotoValidity();
  }

  ngOnChanges() {
    this.checkPhotoValidity();
  }

  private checkPhotoValidity() {
    this.hasValidPhoto = !!(this.photo &&
      this.photo !== '/assets/img/user_image.png' &&
      this.photo.trim() !== '');
  }

  onImageError() {
    this.hasValidPhoto = false;
  }

  get initials(): string {
    if (!this.name || this.name.trim() === '') {
      return '??';
    }

    const words = this.name.trim().split(' ');
    if (words.length === 1) {
      // Solo un nombre/palabra - tomar las primeras 2 letras
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Múltiples palabras - tomar primera letra de las primeras 2 palabras
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  }

  get fontSize(): number {
    const baseFontSize = this.size * 0.4;
    if (this.size <= 50) {
      return Math.max(baseFontSize, 16);
    } else {
      return Math.max(baseFontSize, 26);
    }
  }
}
