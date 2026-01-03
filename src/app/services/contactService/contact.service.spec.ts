/* eslint-disable */ 

import { TestBed } from '@angular/core/testing';
import { ContactService } from './contact.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MessageData } from '../../interfaces/messageData';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  const mockMessageData: MessageData = {
    senderName: 'Test User',
    senderEmail: 'test@example.com',
    message: 'This is a test message from the contact form',
    userId: 123
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ContactService
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ContactService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send message successfully', () => {
    const mockResponse = {
      code: 200,
      message: 'Mensaje enviado correctamente',
      data: {
        messageId: 'msg_123456',
        sentAt: '2025-08-09T10:30:00Z'
      }
    };

    service.sendMessage(mockMessageData).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
      expect(response.code).toBe(200);
      expect(response.message).toContain('correctamente');
      expect(response.data.messageId).toBeDefined();
    });

    const req = httpMock.expectOne('https://api.tecaway.es/api/contact/send-message');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockMessageData);

    req.flush(mockResponse);
  });

  it('should handle send message error', () => {
    const mockError = {
      status: 400,
      statusText: 'Bad Request',
      error: {
        code: 400,
        message: 'Datos del mensaje inválidos',
        errors: {
          senderEmail: 'Email no válido',
          message: 'Mensaje demasiado corto'
        }
      }
    };

    service.sendMessage(mockMessageData).subscribe({
      next: () => {
        fail('Should have failed with 400 error');
      },
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
        expect(error.error.code).toBe(400);
      }
    });

    const req = httpMock.expectOne('https://api.tecaway.es/api/contact/send-message');
    expect(req.request.method).toBe('POST');

    req.flush(mockError.error, {
      status: mockError.status,
      statusText: mockError.statusText
    });
  });
});
